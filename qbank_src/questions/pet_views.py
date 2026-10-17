"""宠物养成 + 星星商店：页面与 API 视图。

星星复用 K8s 学习中心的 K8sProgress.stars（答题获得），这里作为可消费货币。
所有涉及扣星的写操作都走 transaction.atomic + select_for_update，避免并发双花。

养成规则：
- 龟龄 = 用户访问网站的累计时长（前端心跳上报秒数，落库为 Pet.age_seconds）
- 龟粮 / 玩具只加经验
- 每升 1 级获得自由点数，可自由投入血量或武力
"""
import json
import random
from functools import wraps

from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import F
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from questions.models import InventoryItem, K8sProgress, Pet, StarLedger
from questions.pet_shop import (
    BALL_KICK_COOLDOWN, BALL_KICK_EXP, CATEGORY_LABELS, EXP_PER_LEVEL, HP_PER_POINT,
    MAX_LEVEL, PET_SPECIES, PK_DAILY_LIMIT, PK_REFRESH_LIMIT, PK_WIN_EXP, PK_WIN_STARS,
    POINTS_PER_LEVEL, POW_PER_POINT, SHOP_ITEMS, get_item, get_species, level_from_exp, pet_stats,
)


def _api_login_required(view_func):
    """API 统一要求登录：未登录返回 401 JSON，避免被重定向到登录页。"""
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'login required'}, status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped


def _body(request):
    try:
        return json.loads(request.body or b'{}')
    except (ValueError, TypeError):
        return {}


def _stars_of(user):
    return K8sProgress.objects.get_or_create(user=user)[0]


def _age_text(seconds):
    """龟龄文案：以小时为单位、精确到分钟。"""
    total_min = max(0, int(seconds or 0)) // 60
    h, m = total_min // 60, total_min % 60
    if h <= 0:
        return '%d 分钟' % m
    return '%d 小时 %d 分' % (h, m)


def _species_payload(s):
    return {k: s[k] for k in ('id', 'name', 'sprite', 'price', 'desc', 'hp0', 'pow0')}


def _item_payload(it, owned=0):
    d = {k: it[k] for k in ('id', 'name', 'category', 'price', 'icon', 'desc')}
    d['category_label'] = CATEGORY_LABELS.get(it['category'], it['category'])
    d['owned'] = owned
    d['refund'] = int(it['price']) // 2          # 出售回收价：一半星星
    d['unique'] = it['category'] in ('decor', 'accessory', 'weapon', 'armor')   # 装备型道具只能拥有一件
    return d


def _inventory_map(user):
    return {row.item_id: row.quantity for row in InventoryItem.objects.filter(user=user)}


def _split_ids(raw):
    """把逗号分隔的道具ID串解析成列表。"""
    return [d for d in (raw or '').split(',') if d]


def _decor_list(pet):
    """已布置的布景装饰ID列表（Pet.decor）。"""
    return _split_ids(pet.decor)


def _accessory_list(pet):
    """已佩戴的外饰ID列表（Pet.accessory）。"""
    return _split_ids(getattr(pet, 'accessory', ''))


def _pk_left(pet):
    """今日剩余挑战次数（跨天自动重置计数）。"""
    if pet is None:
        return 0
    used = int(pet.pk_count or 0) if pet.pk_date == timezone.localdate() else 0
    return max(0, PK_DAILY_LIMIT - used)


def _refresh_left(pet):
    """今日剩余刷新对手次数（跨天自动重置计数）。"""
    if pet is None:
        return 0
    used = int(pet.pk_refresh_count or 0) if pet.pk_refresh_date == timezone.localdate() else 0
    return max(0, PK_REFRESH_LIMIT - used)


def _pet_payload(pet):
    if pet is None:
        return None
    sp = get_species(pet.species)
    lvl = level_from_exp(pet.exp)
    st = pet_stats(pet)
    secs = int(pet.age_seconds or 0)
    return {
        'species': pet.species,
        'species_name': sp['name'] if sp else pet.species,
        'sprite': sp['sprite'] if sp else '',
        'name': pet.name,
        'level': lvl,
        'exp': pet.exp,
        'exp_into_level': (pet.exp % EXP_PER_LEVEL) if lvl < MAX_LEVEL else EXP_PER_LEVEL,
        'exp_per_level': EXP_PER_LEVEL,
        'max_level': MAX_LEVEL,
        # 龟龄
        'age_seconds': secs,
        'age_text': _age_text(secs),
        # 血量 / 武力值 + 加点
        'hp': st['hp'],
        'power': st['power'],
        'hp_base': st['hp_base'],
        'pow_base': st['pow_base'],
        'hp_add': st['hp_add'],
        'pow_add': st['pow_add'],
        'points': st['points'],
        'hp_per_point': HP_PER_POINT,
        'pow_per_point': POW_PER_POINT,
        'points_per_level': POINTS_PER_LEVEL,
        'decors': _decor_list(pet),          # 已布置的布景装饰ID列表（可同时布置多件）
        'accessories': _accessory_list(pet), # 已佩戴在身上的外饰ID列表
        'ball_out': bool(getattr(pet, 'ball_out', False)),   # 逗龟小球是否已放出（刷新后仍在场上）
        # 武器与出手节奏（影响对战）
        'weapon': getattr(pet, 'weapon', '') or '',
        'weapon_name': (get_item(getattr(pet, 'weapon', '') or '') or {}).get('name', ''),
        'atk_interval': st['atk_interval'],
        'pow_bonus': st['pow_bonus'],
        # 防具与护甲值（对战中先扣护甲再扣血）
        'armor': getattr(pet, 'armor', '') or '',
        'armor_name': (get_item(getattr(pet, 'armor', '') or '') or {}).get('name', ''),
        'armor_base': st['armor_base'],
        'armor_bonus': st['armor_bonus'],
        'armor_max': st['armor'],
        # 对战次数
        'pk_left': _pk_left(pet),
        'pk_limit': PK_DAILY_LIMIT,
        'pk_refresh_left': _refresh_left(pet),
        'pk_refresh_limit': PK_REFRESH_LIMIT,
        'created_at': pet.created_at.isoformat(),
    }


# ---------------- 页面 ----------------
@login_required
def pet_page(request):
    return render(request, 'questions/pet.html')


@login_required
def shop_page(request):
    return render(request, 'questions/shop.html')


# ---------------- 宠物 API ----------------
@csrf_exempt
@_api_login_required
def api_pet_status(request):
    prog = _stars_of(request.user)
    pet = Pet.objects.filter(user=request.user).first()
    inv = _inventory_map(request.user)
    return JsonResponse({
        'stars': prog.stars,
        'pet': _pet_payload(pet),
        'species': [_species_payload(s) for s in PET_SPECIES],
        'shop': [_item_payload(it, inv.get(it['id'], 0)) for it in SHOP_ITEMS],
        'inventory': [{'item_id': k, 'quantity': v} for k, v in inv.items()],
    })


@csrf_exempt
@_api_login_required
def api_pet_adopt(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    if Pet.objects.filter(user=request.user).exists():
        return JsonResponse({'error': '你已经有一只宠物了'}, status=400)
    body = _body(request)
    species_id = str(body.get('species_id') or '').strip()
    name = str(body.get('name') or '').strip()[:32] or '小龟'
    sp = get_species(species_id)
    if sp is None:
        return JsonResponse({'error': '未知品种'}, status=400)

    price = int(sp.get('price', 0) or 0)
    with transaction.atomic():
        prog = K8sProgress.objects.select_for_update().get_or_create(user=request.user)[0]
        if prog.stars < price:
            return JsonResponse({'success': False, 'reason': 'stars', 'error': '星星不足', 'stars': prog.stars})
        if price > 0:
            prog.stars -= price
            prog.save(update_fields=['stars', 'updated_at'])
            StarLedger.objects.create(user=request.user, delta=-price, balance=prog.stars, reason='adopt', ref=species_id)
        pet = Pet.objects.create(user=request.user, species=species_id, name=name)
    return JsonResponse({'success': True, 'stars': prog.stars, 'pet': _pet_payload(pet)})


@csrf_exempt
@_api_login_required
def api_pet_feed(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    return _consume_for_pet(request, expect='food')


@csrf_exempt
@_api_login_required
def api_pet_play(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    return _consume_for_pet(request, expect='toy')


def _consume_for_pet(request, expect):
    item_id = str(_body(request).get('item_id') or '').strip()
    item = get_item(item_id)
    if item is None or item['category'] != expect:
        return JsonResponse({'error': '道具不可用'}, status=400)

    with transaction.atomic():
        pet = Pet.objects.select_for_update().filter(user=request.user).first()
        if pet is None:
            return JsonResponse({'error': '你还没有宠物，先去领养一只'}, status=400)
        inv = InventoryItem.objects.select_for_update().filter(user=request.user, item_id=item_id).first()
        if inv is None or inv.quantity <= 0:
            return JsonResponse({'error': '背包里没有这个道具'}, status=400)
        # 可重复使用的玩具（如逗龟小球）不消耗库存；其余道具用一次少一个
        if not item.get('reusable'):
            inv.quantity -= 1
            if inv.quantity <= 0:
                inv.delete()
            else:
                inv.save(update_fields=['quantity'])

        effect = item.get('effect') or {}
        pet.exp += int(effect.get('exp', 0))
        fields = ['exp']
        # 使用逗龟小球 → 标记为已放出，刷新页面后小球仍在场上
        if item_id == 'toy_ball':
            pet.ball_out = True
            fields.append('ball_out')
        pet.save(update_fields=fields)

    return JsonResponse({
        'success': True,
        'pet': _pet_payload(pet),
        'stars': _stars_of(request.user).stars,
    })


@csrf_exempt
@_api_login_required
def api_pet_ball_kick(request):
    """逗龟小球被踢一下：给宠物加一点经验（带冷却，避免连续碰撞刷经验）。"""
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)

    with transaction.atomic():
        pet = Pet.objects.select_for_update().filter(user=request.user).first()
        if pet is None:
            return JsonResponse({'success': False, 'error': '你还没有宠物'}, status=400)
        # 必须拥有逗龟小球（可重复使用）才能踢球加经验
        if not InventoryItem.objects.filter(
                user=request.user, item_id='toy_ball', quantity__gt=0).exists():
            return JsonResponse({'success': False, 'reason': 'no_ball', 'error': '没有逗龟小球'})

        now = timezone.now()
        if pet.ball_kick_at and (now - pet.ball_kick_at).total_seconds() < BALL_KICK_COOLDOWN:
            return JsonResponse({'success': True, 'credited': False, 'pet': _pet_payload(pet)})
        pet.ball_kick_at = now
        pet.exp += BALL_KICK_EXP
        pet.save(update_fields=['exp', 'ball_kick_at'])

    return JsonResponse({'success': True, 'credited': True, 'gain': BALL_KICK_EXP,
                         'pet': _pet_payload(pet)})


@csrf_exempt
@_api_login_required
def api_pet_alloc(request):
    """升级加点：把 1 个自由点投入血量或武力。"""
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    stat = str(_body(request).get('stat') or '').strip()
    if stat not in ('hp', 'power'):
        return JsonResponse({'error': '加点目标不合法'}, status=400)

    with transaction.atomic():
        pet = Pet.objects.select_for_update().filter(user=request.user).first()
        if pet is None:
            return JsonResponse({'error': '你还没有宠物'}, status=400)
        if pet_stats(pet)['points'] <= 0:
            return JsonResponse({'success': False, 'reason': 'points', 'error': '没有可分配的点数'})
        if stat == 'hp':
            pet.hp_add = int(pet.hp_add or 0) + 1
            pet.save(update_fields=['hp_add'])
        else:
            pet.pow_add = int(pet.pow_add or 0) + 1
            pet.save(update_fields=['pow_add'])

    return JsonResponse({'success': True, 'pet': _pet_payload(pet)})


@csrf_exempt
@_api_login_required
def api_pet_tick(request):
    """龟龄心跳：上报本段在网站上的停留秒数，累加到 Pet.age_seconds。"""
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    try:
        secs = int(_body(request).get('seconds') or 0)
    except (TypeError, ValueError):
        secs = 0
    secs = max(0, min(secs, 600))          # 单次最多累计 10 分钟，防灌水
    if secs > 0:
        Pet.objects.filter(user=request.user).update(age_seconds=F('age_seconds') + secs)
    pet = Pet.objects.filter(user=request.user).first()
    return JsonResponse({'success': True, 'age_seconds': int(pet.age_seconds or 0) if pet else 0})


@csrf_exempt
@_api_login_required
def api_pet_equip(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    item_id = str(_body(request).get('item_id') or '').strip()
    item = get_item(item_id)
    if item is None or item['category'] not in ('decor', 'accessory', 'weapon', 'armor'):
        return JsonResponse({'error': '只能装备装饰、外饰、武器或防具'}, status=400)
    pet = Pet.objects.filter(user=request.user).first()
    if pet is None:
        return JsonResponse({'error': '先去领养一只宠物'}, status=400)
    if not InventoryItem.objects.filter(user=request.user, item_id=item_id).exists():
        return JsonResponse({'error': '你还没有这件道具，先去商店购买'}, status=400)

    # 武器 / 防具 → 单件槽位，装备新的会替换旧的，再点一次即卸下
    if item['category'] in ('weapon', 'armor'):
        field = 'weapon' if item['category'] == 'weapon' else 'armor'
        if (getattr(pet, field, '') or '') == item_id:
            setattr(pet, field, '')
            action = 'removed'
        else:
            setattr(pet, field, item_id)
            action = 'added'
        pet.save(update_fields=[field])
        return JsonResponse({'success': True, 'action': action, 'pet': _pet_payload(pet)})

    # 布景装饰 → Pet.decor；头上外饰 → Pet.accessory；都是“再点一次即取下”的开关
    field = 'decor' if item['category'] == 'decor' else 'accessory'
    active = _split_ids(getattr(pet, field))
    if item_id in active:
        active.remove(item_id)
        action = 'removed'
    else:
        active.append(item_id)
        action = 'added'
    setattr(pet, field, ','.join(active))
    pet.save(update_fields=[field])
    return JsonResponse({'success': True, 'action': action, 'pet': _pet_payload(pet)})


# ---------------- 商店 API ----------------
@csrf_exempt
@_api_login_required
def api_shop_items(request):
    prog = _stars_of(request.user)
    inv = _inventory_map(request.user)
    catalog = [_item_payload(it, inv.get(it['id'], 0)) for it in SHOP_ITEMS]
    owned = [_item_payload(it, inv[it['id']]) for it in SHOP_ITEMS if inv.get(it['id'], 0) > 0]
    return JsonResponse({'stars': prog.stars, 'catalog': catalog, 'owned': owned})


@csrf_exempt
@_api_login_required
def api_shop_buy(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    body = _body(request)
    item_id = str(body.get('item_id') or '').strip()
    try:
        qty = int(body.get('qty') or 1)
    except (TypeError, ValueError):
        qty = 1
    qty = max(1, min(qty, 99))
    item = get_item(item_id)
    if item is None:
        return JsonResponse({'error': '商品不存在'}, status=400)
    cost = int(item['price']) * qty

    with transaction.atomic():
        row, _ = InventoryItem.objects.select_for_update().get_or_create(
            user=request.user, item_id=item_id, defaults={'quantity': 0})
        # 布景装饰 / 外饰这类“装备型”道具只能拥有一件，不能重复购买
        if item['category'] in ('decor', 'accessory'):
            if row.quantity >= 1:
                return JsonResponse({'success': False, 'reason': 'owned',
                                     'error': '这件道具已经拥有了，不能重复购买'})
            qty = 1
            cost = int(item['price'])
        prog = K8sProgress.objects.select_for_update().get_or_create(user=request.user)[0]
        if prog.stars < cost:
            return JsonResponse({'success': False, 'reason': 'stars', 'error': '星星不足', 'stars': prog.stars})
        prog.stars -= cost
        prog.save(update_fields=['stars', 'updated_at'])
        row.quantity += qty
        row.save(update_fields=['quantity'])
        StarLedger.objects.create(user=request.user, delta=-cost, balance=prog.stars, reason='buy', ref=item_id)
        owned_now = row.quantity

        # 装饰类商品买下即摆进布景（可同时布置多件）
        if item['category'] == 'decor':
            pet = Pet.objects.select_for_update().filter(user=request.user).first()
            if pet is not None:
                active = _decor_list(pet)
                if item_id not in active:
                    active.append(item_id)
                    pet.decor = ','.join(active)
                    pet.save(update_fields=['decor'])

    return JsonResponse({'success': True, 'stars': prog.stars, 'item_id': item_id, 'owned': owned_now})


@csrf_exempt
@_api_login_required
def api_shop_sell(request):
    """出售已拥有的商品，返还一半星星（向下取整）。"""
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    item_id = str(_body(request).get('item_id') or '').strip()
    item = get_item(item_id)
    if item is None:
        return JsonResponse({'error': '商品不存在'}, status=400)
    refund = int(item['price']) // 2

    with transaction.atomic():
        inv = InventoryItem.objects.select_for_update().filter(
            user=request.user, item_id=item_id).first()
        if inv is None or inv.quantity <= 0:
            return JsonResponse({'success': False, 'error': '背包里没有这个商品'})
        qty_after = inv.quantity - 1
        if qty_after <= 0:
            inv.delete()
        else:
            inv.quantity = qty_after
            inv.save(update_fields=['quantity'])

        # 逗龟小球卖光后，场上那只球也一并收走
        if item_id == 'toy_ball' and qty_after <= 0:
            Pet.objects.filter(user=request.user).update(ball_out=False)

        # 卖掉布景装饰 / 外饰时，同步从布景或身上取下
        if item['category'] in ('decor', 'accessory'):
            pet = Pet.objects.select_for_update().filter(user=request.user).first()
            if pet is not None:
                field = 'decor' if item['category'] == 'decor' else 'accessory'
                active = _split_ids(getattr(pet, field))
                if item_id in active:
                    active.remove(item_id)
                    setattr(pet, field, ','.join(active))
                    pet.save(update_fields=[field])

        # 卖掉武器 / 防具且已装备的是它 → 一并卸下
        if item['category'] in ('weapon', 'armor'):
            field = 'weapon' if item['category'] == 'weapon' else 'armor'
            Pet.objects.filter(user=request.user, **{field: item_id}).update(**{field: ''})

        prog = K8sProgress.objects.select_for_update().get_or_create(user=request.user)[0]
        prog.stars += refund
        prog.save(update_fields=['stars', 'updated_at'])
        StarLedger.objects.create(user=request.user, delta=refund, balance=prog.stars, reason='sell', ref=item_id)

    return JsonResponse({'success': True, 'stars': prog.stars, 'item_id': item_id,
                         'refund': refund, 'owned': max(0, qty_after)})


# ---------------- 对战 API ----------------
def _simulate_battle(me, opp):
    """两只乌龟互相攻击的时间线模拟（服务端结算，避免前端作弊）。

    me / opp: {'hp', 'power', 'atk_interval', 'armor'}
    受击规则：先扣护甲，护甲归零后溢出的伤害才扣血量。
    返回 (events, winner, me_hp, opp_hp, me_armor, opp_armor)。
    """
    me_hp, opp_hp = me['hp'], opp['hp']
    me_armor, opp_armor = int(me.get('armor', 0) or 0), int(opp.get('armor', 0) or 0)
    me_next, opp_next = me['atk_interval'], opp['atk_interval']
    events = []
    guard = 0

    def apply_dmg(target_armor, target_hp, dmg):
        absorbed = min(target_armor, dmg)
        new_armor = target_armor - absorbed
        overflow = dmg - absorbed
        new_hp = max(0, target_hp - overflow)
        return new_armor, new_hp, absorbed, overflow

    while me_hp > 0 and opp_hp > 0 and guard < 400:
        guard += 1
        if me_next <= opp_next:
            t = me_next
            me_next += me['atk_interval']
            dmg = max(1, int(round(me['power'] * random.uniform(0.85, 1.15))))
            opp_armor, opp_hp, arm_abs, hp_dmg = apply_dmg(opp_armor, opp_hp, dmg)
            events.append({'t': round(t, 3), 'who': 'me', 'dmg': dmg,
                           'armor_dmg': arm_abs, 'hp_dmg': hp_dmg,
                           'me_hp': me_hp, 'opp_hp': opp_hp,
                           'me_armor': me_armor, 'opp_armor': opp_armor})
        else:
            t = opp_next
            opp_next += opp['atk_interval']
            dmg = max(1, int(round(opp['power'] * random.uniform(0.85, 1.15))))
            me_armor, me_hp, arm_abs, hp_dmg = apply_dmg(me_armor, me_hp, dmg)
            events.append({'t': round(t, 3), 'who': 'opp', 'dmg': dmg,
                           'armor_dmg': arm_abs, 'hp_dmg': hp_dmg,
                           'me_hp': me_hp, 'opp_hp': opp_hp,
                           'me_armor': me_armor, 'opp_armor': opp_armor})
    if me_hp <= 0 and opp_hp <= 0:
        winner = 'draw'
    elif opp_hp <= 0:
        winner = 'me'
    elif me_hp <= 0:
        winner = 'opp'
    else:
        winner = 'me' if me_hp >= opp_hp else 'opp'   # 超时：血多者判胜
    return events, winner, me_hp, opp_hp, me_armor, opp_armor


def _fighter(pet, st):
    sp = get_species(pet.species)
    wpn = get_item(getattr(pet, 'weapon', '') or '')
    arm = get_item(getattr(pet, 'armor', '') or '')
    return {
        'id': pet.id,
        'name': pet.name,
        'owner': pet.user.username,
        'species': pet.species,
        'species_name': sp['name'] if sp else pet.species,
        'level': level_from_exp(pet.exp),
        'hp': st['hp'],
        'power': st['power'],
        'weapon': getattr(pet, 'weapon', '') or '',
        'weapon_name': wpn['name'] if wpn else '',
        'armor': getattr(pet, 'armor', '') or '',
        'armor_name': arm['name'] if arm else '',
        'armor_max': st['armor'],                # 本场对战护甲上限
        'accessories': _accessory_list(pet),   # 已佩戴外饰，供对战绘制对手外观用
        'atk_interval': st['atk_interval'],
    }


@csrf_exempt
@_api_login_required
def api_pet_pk_opponents(request):
    """对战列表：随机展示 5 位等级差不超过 1 级的其它玩家；可刷新（每日最多 3 次）。"""
    pet = Pet.objects.filter(user=request.user).first()
    if pet is None:
        return JsonResponse({'has_pet': False, 'opponents': [],
                             'pk_left': 0, 'pk_limit': PK_DAILY_LIMIT,
                             'refresh_left': PK_REFRESH_LIMIT, 'refresh_limit': PK_REFRESH_LIMIT})

    want_refresh = request.GET.get('refresh') in ('1', 'true', 'yes')
    today = timezone.localdate()

    # 刷新计数：跨天重置，每天最多 PK_REFRESH_LIMIT 次
    if pet.pk_refresh_date != today:
        pet.pk_refresh_count = 0
        pet.pk_refresh_date = today
    if want_refresh and int(pet.pk_refresh_count or 0) < PK_REFRESH_LIMIT:
        pet.pk_refresh_count = int(pet.pk_refresh_count or 0) + 1
        pet.save(update_fields=['pk_refresh_count', 'pk_refresh_date'])
    elif want_refresh:
        # 刷新次数耗尽：仍返回当前列表，但告知前端
        pass

    my_level = level_from_exp(pet.exp)
    # 筛选等级差 ≤ 1 的其它玩家宠物
    eligible = []
    for p in Pet.objects.select_related('user').exclude(user=request.user):
        if abs(level_from_exp(p.exp) - my_level) <= 1:
            d = _fighter(p, pet_stats(p))
            d['has_pet'] = True
            eligible.append(d)

    random.shuffle(eligible)
    opps = eligible[:5]
    refresh_left = max(0, PK_REFRESH_LIMIT - int(pet.pk_refresh_count or 0))

    return JsonResponse({'has_pet': True, 'opponents': opps,
                         'pk_left': _pk_left(pet), 'pk_limit': PK_DAILY_LIMIT,
                         'refresh_left': refresh_left, 'refresh_limit': PK_REFRESH_LIMIT,
                         'my_level': my_level})


@csrf_exempt
@_api_login_required
def api_pet_pk(request):
    """发起挑战：服务端结算胜负，胜者获得星星与经验；每天最多 2 次。"""
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    body = _body(request)
    try:
        opp_id = int(body.get('opponent_id') or 0)
    except (TypeError, ValueError):
        opp_id = 0

    with transaction.atomic():
        pet = Pet.objects.select_for_update().select_related('user').filter(user=request.user).first()
        if pet is None:
            return JsonResponse({'success': False, 'reason': 'no_pet', 'error': '尚未领养宠物龟'})
        opp = Pet.objects.select_related('user').filter(id=opp_id).exclude(user=request.user).first()
        if opp is None:
            return JsonResponse({'success': False, 'reason': 'no_opponent', 'error': '找不到这位对手'})

        today = timezone.localdate()
        if pet.pk_date != today:
            pet.pk_count = 0
            pet.pk_date = today
        if int(pet.pk_count or 0) >= PK_DAILY_LIMIT:
            return JsonResponse({'success': False, 'reason': 'limit', 'pk_left': 0,
                                 'error': '今天已经挑战 %d 次了，明天再来' % PK_DAILY_LIMIT})

        me_st = pet_stats(pet)
        op_st = pet_stats(opp)
        events, winner, _, _, _, _ = _simulate_battle(
            {'hp': me_st['hp'], 'power': me_st['power'], 'atk_interval': me_st['atk_interval'],
             'armor': me_st['armor']},
            {'hp': op_st['hp'], 'power': op_st['power'], 'atk_interval': op_st['atk_interval'],
             'armor': op_st['armor']})

        pet.pk_count = int(pet.pk_count or 0) + 1
        fields = ['pk_count', 'pk_date']
        rewards = None
        if winner == 'me':
            pet.exp += PK_WIN_EXP
            fields.append('exp')
            prog = K8sProgress.objects.select_for_update().get_or_create(user=request.user)[0]
            prog.stars += PK_WIN_STARS
            prog.save(update_fields=['stars', 'updated_at'])
            StarLedger.objects.create(user=request.user, delta=PK_WIN_STARS,
                                      balance=prog.stars, reason='pk_win', ref=str(opp.id))
            rewards = {'stars': PK_WIN_STARS, 'exp': PK_WIN_EXP}
        pet.save(update_fields=fields)
        stars_now = _stars_of(request.user).stars
        pk_left = max(0, PK_DAILY_LIMIT - int(pet.pk_count))

    return JsonResponse({
        'success': True,
        'winner': winner,
        'timeline': events,
        'rewards': rewards,
        'pk_left': pk_left,
        'pk_limit': PK_DAILY_LIMIT,
        'stars': stars_now,
        'pet': _pet_payload(pet),
        'me': _fighter(pet, me_st),
        'opp': _fighter(opp, op_st),
    })
