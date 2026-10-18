"""宠物养成 + 星星商店：配置常量与纯函数。

星星（K8sProgress.stars）在学习中心答题获得，这里作为可消费货币使用。
品种 / 商品用代码常量维护，避免额外建表；如需后台可视化配置再落库。
"""

# ---------------- 宠物品种 ----------------
# sprite 对应 static/turtle-pets/<sprite>.png
# hp0 / pow0：1 级时的初始血量与武力值（不同品种差异化，鳄龟更耐打）
PET_SPECIES = [
    {"id": "cao",       "name": "中华草龟",   "sprite": "1-cao",       "price": 0,   "desc": "皮实好养的入门龟", "hp0": 80,  "pow0": 8},
    {"id": "huangyuan", "name": "黄缘闭壳龟", "sprite": "2-huangyuan", "price": 20,  "desc": "会闭壳，性格温和", "hp0": 95,  "pow0": 10},
    {"id": "eyu",       "name": "鳄龟",       "sprite": "3-eyu",       "price": 45,  "desc": "霸气凶猛，成长快", "hp0": 140, "pow0": 20},
    {"id": "xiaoqing",  "name": "小青",       "sprite": "4-xiaoqing",  "price": 70,  "desc": "青绿观赏龟，颜值高", "hp0": 90,  "pow0": 9},
    {"id": "brazil",    "name": "巴西龟",     "sprite": "5-brazil",    "price": 100, "desc": "最活泼好动，爱互动", "hp0": 100, "pow0": 12},
]

# ---------------- 商店商品 ----------------
# category: food(食物) / toy(玩具) / decor(装饰) / accessory(外饰) / weapon(武器) / armor(防具)
# 龟粮只加经验（原来的饱食度已换成龟龄，不再由喂食补充）
SHOP_ITEMS = [
    {"id": "food_basic",   "name": "普通龟粮", "category": "food",  "price": 5,  "icon": "\U0001F96C", "desc": "经验 +5",          "effect": {"exp": 5}},
    {"id": "food_premium", "name": "高级龟粮", "category": "food",  "price": 12, "icon": "\U0001F364", "desc": "经验 +15",         "effect": {"exp": 15}},
    {"id": "toy_ball",     "name": "逗龟小球", "category": "toy",   "price": 8,  "icon": "\u26BD",     "desc": "可重复使用；放出来给龟踢，每被踢一下经验 +1", "effect": {}, "reusable": True},
    {"id": "decor_pool",   "name": "迷你水池", "category": "decor", "price": 35, "icon": "\U0001F3CA", "desc": "装饰，喂食经验 +20%", "effect": {"exp_bonus": 0.2}},
    {"id": "decor_lamp",   "name": "晒背灯",   "category": "decor", "price": 60, "icon": "\U0001F4A1", "desc": "装饰，喂食经验 +40%", "effect": {"exp_bonus": 0.4}},
    {"id": "acc_santa",    "name": "圣诞帽",   "category": "accessory", "price": 40, "icon": "\U0001F385", "desc": "外饰，可戴在乌龟头上", "effect": {}},
    {"id": "acc_crown",    "name": "黄金王冠", "category": "accessory", "price": 88, "icon": "\U0001F451", "desc": "外饰·纯装饰，王者气度不解释", "effect": {}},
    {"id": "acc_bamboo",   "name": "江湖斗笠", "category": "accessory", "price": 35, "icon": "\U0001F9B2", "desc": "外饰·纯装饰，侠客行的洒脱", "effect": {}},
    {"id": "acc_wizard",   "name": "星辰巫师帽", "category": "accessory", "price": 66, "icon": "\U0001F9D9", "desc": "外饰·纯装饰，帽尖缀满魔法星尘", "effect": {}},
    {"id": "acc_glasses",  "name": "黑超墨镜", "category": "accessory", "price": 30, "icon": "\U0001F576", "desc": "外饰·纯装饰，龟中大哥大的气场", "effect": {}},
    {"id": "acc_scarf",    "name": "针织围巾", "category": "accessory", "price": 28, "icon": "\U0001F9E3", "desc": "外饰·纯装饰，冬日里的一抹暖", "effect": {}},
    {"id": "acc_cape",     "name": "英雄红披风", "category": "accessory", "price": 78, "icon": "\U0001F9B8", "desc": "外饰·纯装饰，披风一甩谁与争锋", "effect": {}},
    {"id": "acc_boots",    "name": "小皮靴",   "category": "accessory", "price": 45, "icon": "\U0001F462", "desc": "外饰·纯装饰，四只脚都安排上", "effect": {}},
    {"id": "wpn_laser",    "name": "激光剑",   "category": "weapon", "price": 50, "icon": "\u2694\uFE0F", "desc": "武器，武力 +15，出手快（每 0.9 秒一击）",  "effect": {"pow": 15, "atk_interval": 0.9}},
    {"id": "wpn_cleaver",  "name": "大砍刀",   "category": "weapon", "price": 70, "icon": "\U0001FA93", "desc": "武器，武力 +30，招式重（每 1.7 秒一击）", "effect": {"pow": 30, "atk_interval": 1.7}},
    {"id": "arm_samurai",  "name": "武士甲胄", "category": "armor",  "price": 80, "icon": "\U0001F6E1", "desc": "防具，穿上后乌龟直立战斗，护甲 +40（受击先扣护甲再扣血）", "effect": {"armor": 40}},
]

CATEGORY_LABELS = {"food": "食物", "toy": "玩具", "decor": "装饰", "accessory": "外饰", "weapon": "武器", "armor": "防具"}

# 逗龟小球：被踢一下的经验奖励与冷却（同一只宠物两次奖励的最短间隔，秒）
BALL_KICK_EXP = 1
BALL_KICK_COOLDOWN = 2.0

# 未持武器时的基础出手间隔（秒）
BASE_ATK_INTERVAL = 1.3

# 对战：每日挑战次数上限与胜场奖励
PK_DAILY_LIMIT = 2
PK_WIN_STARS = 5
PK_WIN_EXP = 5
# 对战：每日刷新对手次数上限
PK_REFRESH_LIMIT = 3

EXP_PER_LEVEL = 100
MAX_LEVEL = 30

# 升级加点：每升 1 级获得 POINTS_PER_LEVEL 点自由点数，可投入血量或武力
POINTS_PER_LEVEL = 3
HP_PER_POINT = 10   # 每点血量加点 → 血量 +10
POW_PER_POINT = 2   # 每点武力加点 → 武力 +2



def get_species(species_id):
    for s in PET_SPECIES:
        if s["id"] == species_id:
            return s
    return None


def get_item(item_id):
    for it in SHOP_ITEMS:
        if it["id"] == item_id:
            return it
    return None


def level_from_exp(exp):
    return min(MAX_LEVEL, 1 + max(0, int(exp or 0)) // EXP_PER_LEVEL)


def earned_points(level):
    """到当前等级为止累计获得的自由点数。"""
    return max(0, int(level) - 1) * POINTS_PER_LEVEL


def pet_stats(pet):
    """按品种基础值 + 已分配加点 + 已装备武器/防具，算出当前血量 / 武力 / 护甲 / 出手间隔。"""
    sp = get_species(pet.species) or {}
    lvl = level_from_exp(pet.exp)
    hp_add = int(getattr(pet, "hp_add", 0) or 0)
    pow_add = int(getattr(pet, "pow_add", 0) or 0)
    hp0 = int(sp.get("hp0", 0) or 0)
    pow0 = int(sp.get("pow0", 0) or 0)
    wpn = get_item(getattr(pet, "weapon", "") or "") or {}
    weff = wpn.get("effect") or {}
    pow_bonus = int(weff.get("pow", 0) or 0)
    arm = get_item(getattr(pet, "armor", "") or "") or {}
    arm_eff = arm.get("effect") or {}
    armor_bonus = int(arm_eff.get("armor", 0) or 0)
    return {
        "hp_base": hp0,
        "pow_base": pow0,
        "hp": hp0 + hp_add * HP_PER_POINT,
        "power": pow0 + pow_add * POW_PER_POINT + pow_bonus,
        "hp_add": hp_add,
        "pow_add": pow_add,
        "pow_bonus": pow_bonus,
        "armor_base": 0,                          # 护甲初始值为 0，只能通过装备防具获得
        "armor": armor_bonus,                     # 当前护甲值（=护甲上限，对战中会被消耗）
        "armor_bonus": armor_bonus,
        "atk_interval": float(weff.get("atk_interval", BASE_ATK_INTERVAL) or BASE_ATK_INTERVAL),
        "points": max(0, earned_points(lvl) - hp_add - pow_add),
    }
