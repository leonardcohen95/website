/* 宠物养成 + 星星商店 前端交互（/pet/ 与 /shop/ 共用） */
(function () {
  'use strict';
  var SPRITE_BASE = '/static/turtle-pets/';
  var SPRITE_V = '?v=20261017d';

  function toast(msg, type) {
    var color = type === 'error' ? '#dc3545' : '#198754';
    var div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:' + color +
      ';color:#fff;padding:10px 22px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:2000;font-weight:600;';
    document.body.appendChild(div);
    setTimeout(function () {
      div.style.opacity = '0'; div.style.transition = 'opacity .4s';
      setTimeout(function () { div.remove(); }, 400);
    }, 2000);
  }

  function api(path, method, body) {
    var opt = { method: method || 'GET', headers: {} };
    if (body) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(path, opt).then(function (res) {
      if (res.status === 401) {
        location.href = '/login/?next=' + encodeURIComponent(location.pathname);
        return null;
      }
      return res.json();
    }).catch(function () { return { error: '网络错误' }; });
  }

  /* ---------------- 宠物页 ---------------- */
  var petState = null;   // 最近一次 /api/pet/status 返回的数据

  function renderPet() {
    var root = document.getElementById('pet-root');
    api('/api/pet/status').then(function (data) {
      if (!data) return;
      if (!data.pet) { petState = null; renderAdopt(root, data); return; }
      petState = data;
      // 画布已存在时只刷新信息/背包，避免乌龟被重建后瞬移
      if (roaming && document.getElementById('pet-canvas')) refreshPetPanels();
      else buildPetCard(root, data);
    });
  }

  function renderAdopt(root, data) {
    var cards = data.species.map(function (s) {
      return '<div class="col-6 col-md-4 mb-3"><div class="card h-100 pet-pick" data-id="' + s.id + '" style="cursor:pointer;">' +
        '<div class="card-body text-center"><img src="' + SPRITE_BASE + s.sprite + '.png' + SPRITE_V + '" alt="' + s.name + '" style="height:64px;">' +
        '<div class="fw-bold mt-2">' + s.name + '</div><div class="small text-muted">' + s.desc + '</div>' +
        '<div class="small text-muted mt-1">❤️ ' + s.hp0 + ' &nbsp; ⚔️ ' + s.pow0 + '</div>' +
        '<div class="mt-2 badge ' + (s.price === 0 ? 'bg-success' : 'bg-warning text-dark') + '">' +
        (s.price === 0 ? '免费' : '⭐ ' + s.price) + '</div></div></div></div>';
    }).join('');
    root.innerHTML = '<div class="text-center mb-3"><h5 class="mb-1">领养一只电子乌龟</h5>' +
      '<div class="text-muted small">当前星星：<span class="fw-bold text-warning">⭐ ' + data.stars + '</span></div></div>' +
      '<div class="row">' + cards + '</div>' +
      '<div class="mt-3"><label class="form-label small text-muted">给它取个名字</label>' +
      '<input id="adopt-name" class="form-control mb-3" maxlength="16" placeholder="例如：龟仙人">' +
      '<button id="adopt-btn" class="btn btn-primary w-100 rounded-pill" disabled>请先选择品种</button></div>';

    var picked = null;
    root.querySelectorAll('.pet-pick').forEach(function (c) {
      c.addEventListener('click', function () {
        root.querySelectorAll('.pet-pick').forEach(function (x) { x.classList.remove('border-primary', 'border-3'); });
        c.classList.add('border-primary', 'border-3');
        picked = c.dataset.id;
        var btn = document.getElementById('adopt-btn');
        btn.disabled = false; btn.textContent = '领养它！';
      });
    });
    document.getElementById('adopt-btn').addEventListener('click', function () {
      if (!picked) return;
      var name = document.getElementById('adopt-name').value.trim();
      api('/api/pet/adopt', 'POST', { species_id: picked, name: name }).then(function (r) {
        if (!r) return;
        if (r.success) { toast('领养成功！'); renderPet(); } else { toast(r.error || '领养失败', 'error'); }
      });
    });
  }

  function statLine(label, value, extra) {
    return '<div class="d-flex justify-content-between align-items-center small mb-2">' +
      '<span class="text-muted">' + label + '</span>' +
      '<span class="d-flex align-items-center"><span class="fw-bold">' + value + '</span>' + (extra || '') + '</span></div>';
  }

  function buildPetCard(root, data) {
    var p = data.pet;
    root.innerHTML =
      '<div class="row align-items-center">' +
        '<div class="col-md-4 mb-3 mb-md-0">' +
          '<div id="pet-pen" style="position:relative;height:200px;background:linear-gradient(180deg,#e8f5e9 0%,#c8e6c9 100%);border-radius:14px;overflow:hidden;border:2px solid #a5d6a7;">' +
            '<div id="pet-pen-floor" style="position:absolute;left:0;right:0;bottom:0;height:46px;background:repeating-linear-gradient(90deg,#aed581 0 26px,#9ccc65 26px 52px);opacity:.45;"></div>' +
            '<canvas id="pet-canvas" style="position:absolute;left:0;top:0;width:100%;height:100%;"></canvas>' +
          '</div>' +
          '<div class="text-center mt-2">' +
            '<span class="fw-bold fs-5">' + p.name + '</span>' +
            '<span class="small text-muted ms-2">' + p.species_name + '</span>' +
            '<span class="badge bg-primary ms-2" id="pet-level">Lv.' + p.level + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="col-md-8" id="pet-info"></div>' +
      '</div>' +
      '<hr>' +
      '<h6>🎒 背包</h6><div id="pet-bag"></div>' +
      '<div class="mt-4 d-flex justify-content-center" style="gap:22px;">' +
        '<button id="pet-pk-btn" class="btn btn-danger rounded-pill px-4">⚔️ 发起对战</button>' +
        '<a href="/shop/" class="btn btn-warning rounded-pill px-4">🛒 去星星商店</a></div>';

    startRoaming(document.getElementById('pet-canvas'), document.getElementById('pet-pen'), p);
    var pkBtn = document.getElementById('pet-pk-btn');
    if (pkBtn) pkBtn.addEventListener('click', openBattle);
    refreshPetPanels();
  }

  function refreshPetPanels() {
    if (!petState) return;
    // 等级可能因对战获胜而提升 → 同步体型缩放基准
    if (roaming && petState.pet) roaming.level = petState.pet.level;
    fillPetInfo(petState);
    fillBackpack(petState);
  }

  function fillPetInfo(data) {
    var el = document.getElementById('pet-info');
    if (!el) return;
    var p = data.pet;
    var lvlEl = document.getElementById('pet-level');
    if (lvlEl) lvlEl.textContent = 'Lv.' + p.level;

    var items = {}; data.shop.forEach(function (it) { items[it.id] = it; });
    var nameOf = function (ids) {
      return (ids && ids.length)
        ? ids.map(function (d) { return items[d] ? (items[d].icon + ' ' + items[d].name) : d; }).join('、')
        : '暂无';
    };
    var decorTxt = nameOf(p.decors);
    var accTxt = nameOf(p.accessories);
    var wpnTxt = p.weapon_name
      ? (items[p.weapon] ? items[p.weapon].icon + ' ' + p.weapon_name : p.weapon_name) +
        '（武力 +' + p.pow_bonus + '，每 ' + p.atk_interval + ' 秒一击）'
      : '暂无（赤手空拳）';
    var armTxt = p.armor_name
      ? (items[p.armor] ? items[p.armor].icon + ' ' + p.armor_name : p.armor_name) +
        '（护甲 +' + p.armor_bonus + '）'
      : '暂无（无护甲）';
    var sizeTxt = Math.round(Math.min(1, 0.5 + 0.05 * (p.level - 1)) * 100);
    var canAdd = p.points > 0;
    var plus = function (stat) {
      return canAdd ? '<button class="btn btn-sm btn-success rounded-circle alloc ms-2" data-stat="' + stat +
        '" title="加 1 点" style="width:26px;height:26px;padding:0;line-height:1;font-weight:700;">+</button>' : '';
    };
    // 武力值 / 护甲值：显示基础值（品种+加点），装备加值用括号标出
    var powBase = (p.power || 0) - (p.pow_bonus || 0);
    var powTxt = powBase + (p.pow_bonus ? ' <span class="text-success">(+' + p.pow_bonus + ')</span>' : '');
    var armBase = p.armor_base != null ? p.armor_base : 0;
    var armValTxt = armBase + (p.armor_bonus ? ' <span class="text-info">(+' + p.armor_bonus + ')</span>' : '');

    el.innerHTML =
      statLine('📈 经验', p.exp_into_level + ' / ' + p.exp_per_level, '') +
      statLine('🕰️ 龟龄', p.age_text, '') +
      statLine('❤️ 血量', p.hp, plus('hp')) +
      statLine('⚔️ 武力值', powTxt, plus('power')) +
      statLine('🛡 护甲值', armValTxt, '') +
      (p.points > 0 ? '<div class="small text-success mb-2">可分配点数：<span class="fw-bold">' + p.points +
        '</span>（每点：血量 +' + p.hp_per_point + ' / 武力 +' + p.pow_per_point + '）</div>' : '') +
      '<div class="mt-2 small">装备装饰：<span class="fw-bold">' + decorTxt + '</span></div>' +
      '<div class="mt-1 small">头上外饰：<span class="fw-bold">' + accTxt + '</span></div>' +
      '<div class="mt-1 small">手持武器：<span class="fw-bold">' + wpnTxt + '</span></div>' +
      '<div class="mt-1 small">身披防具：<span class="fw-bold">' + armTxt + '</span></div>' +
      '<div class="mt-1 small">体型：<span class="fw-bold">' + sizeTxt + '%</span>' +
        '<span class="text-muted">（初始 50%，每升 1 级 +5%，上限 100%）</span></div>' +
      '<div class="mt-1 small">⚔️ 今日对战：<span class="fw-bold">' + (p.pk_limit - p.pk_left) + ' / ' + p.pk_limit +
        '</span><span class="text-muted">（剩余 ' + p.pk_left + ' 次）</span></div>' +
      '<div class="mt-2 small text-muted">星星余额：<span class="fw-bold text-warning">⭐ ' + data.stars + '</span></div>';

    el.querySelectorAll('.alloc').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!petState || petState.pet.points <= 0) { toast('没有可分配的点数', 'error'); return; }
        api('/api/pet/alloc', 'POST', { stat: b.dataset.stat }).then(function (r) {
          if (!r) return;
          if (r.success) { petState.pet = r.pet; fillPetInfo(petState); toast('加点成功！'); }
          else { toast(r.error || '加点失败', 'error'); }
        });
      });
    });
  }

  function fillBackpack(data) {
    var el = document.getElementById('pet-bag');
    if (!el) return;
    var owned = data.shop.filter(function (it) { return it.owned > 0; });
    if (!owned.length) {
      el.innerHTML = '<div class="text-muted small">背包空空的，去商店买点龟粮、玩具、装饰、外饰、武器或防具吧</div>';
      return;
    }
    var labels = { food: '🍖 食物', toy: '⚽ 玩具', decor: '🪴 装饰', accessory: '👒 外饰', weapon: '⚔️ 武器', armor: '🛡 防具' };
    var cats = ['food', 'toy', 'decor', 'accessory', 'weapon', 'armor'];
    var html = '';
    cats.forEach(function (cat) {
      var list = owned.filter(function (it) { return it.category === cat; });
      if (!list.length) return;
      html += '<div class="mb-2">' +
        '<button class="btn btn-sm btn-outline-secondary w-100 text-start bag-cat" data-cat="' + cat + '" ' +
        'style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span>' + (labels[cat] || cat) + '</span>' +
        '<span class="text-muted" style="font-size:.78rem;">' + list.length + ' 件 ▾</span></button>' +
        '<div class="bag-items" data-cat="' + cat + '" style="display:none;margin-top:8px;">' +
        list.map(function (it) {
          return '<button class="btn btn-sm btn-outline-primary me-2 mb-2 use" data-id="' + it.id +
            '" data-cat="' + it.category + '" data-name="' + it.name + '">' +
            '<span style="font-size:.78rem;line-height:1;margin-right:.15rem;">' + it.icon + '</span>' + it.name +
            ' <span class="badge bg-secondary">' + it.owned + '</span></button>';
        }).join('') +
        '</div></div>';
    });
    el.innerHTML = html;

    // 分类折叠：点开才看具体商品
    el.querySelectorAll('.bag-cat').forEach(function (b) {
      b.addEventListener('click', function () {
        var items = el.querySelector('.bag-items[data-cat="' + b.dataset.cat + '"]');
        if (!items) return;
        var open = items.style.display !== 'none';
        items.style.display = open ? 'none' : 'block';
        b.querySelector('.text-muted').textContent = open
          ? (items.children.length + ' 件 ▾') : (items.children.length + ' 件 ▴');
      });
    });

    el.querySelectorAll('.use').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.id, cat = b.dataset.cat, name = b.dataset.name;
        if (busyUsing()) { toast('乌龟正在吃东西，稍等一下~', 'error'); return; }
        var equipped = isEquipped(id);
        var hint = cat === 'food' ? '喂食后乌龟会爬过去把它吃掉'
          : (cat === 'toy' ? (id === 'toy_ball' ? '把小球放到地上给乌龟踢，每踢一下经验 +1' : '陪乌龟玩一会儿，增加经验')
            : cat === 'accessory' ? (equipped ? '把这件外饰从乌龟身上摘下来' : '把这件外饰戴到乌龟身上')
              : cat === 'weapon' ? (equipped ? '把武器从乌龟手里卸下来' : '把武器装备到乌龟的一只前脚上，可提升武力、加快出手')
                : cat === 'armor' ? (equipped ? '脱下这身防具' : '穿上防具，乌龟会直立战斗并获得护甲值')
                  : (equipped ? '把这件装饰从布景里收起来' : '把这件装饰摆进布景里'));
        confirmUse(name, hint, function () { useItem(id, cat); });
      });
    });
  }

  function busyUsing() {
    return !!(roaming && (roaming.state === 'eat' || roaming.eatReady));
  }

  // 某件道具当前是否已装备（布景装饰 / 身上外饰 / 武器 / 防具）
  function isEquipped(id) {
    if (!petState || !petState.pet) return false;
    var p = petState.pet;
    return (p.decors || []).indexOf(id) >= 0 || (p.accessories || []).indexOf(id) >= 0 ||
           p.weapon === id || p.armor === id;
  }

  /* 通用确认弹窗 */
  function confirmBox(o, onYes) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2100;display:flex;align-items:center;justify-content:center;';
    ov.innerHTML = '<div style="background:#fff;border-radius:16px;padding:22px;max-width:320px;width:86%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.3);">' +
      '<div style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">' + o.title + '</div>' +
      '<div style="color:#444;font-size:.95rem;margin-bottom:4px;">' + o.name + '</div>' +
      '<div style="color:#999;font-size:.82rem;margin-bottom:18px;">' + o.hint + '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
        '<button class="btn btn-outline-secondary rounded-pill px-4" data-x="no">取消</button>' +
        '<button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + ' rounded-pill px-4" data-x="yes">' + o.yes + '</button>' +
      '</div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      var x = e.target && e.target.getAttribute && e.target.getAttribute('data-x');
      if (x === 'yes') { ov.remove(); onYes(); }
      else if (x === 'no' || e.target === ov) { ov.remove(); }
    });
  }

  /* 使用道具前的确认弹窗 */
  function confirmUse(name, hint, onYes) {
    confirmBox({ title: '确认使用道具', name: name, hint: hint, yes: '确认使用' }, onYes);
  }

  /* 出售前的确认弹窗 */
  function confirmSell(name, refund, onYes) {
    confirmBox({ title: '确认出售', name: name, hint: '出售后回收 ⭐ ' + refund + '（原价的一半）',
                 yes: '确认出售', danger: true }, onYes);
  }

  function useItem(id, cat) {
    if (cat === 'food') {
      api('/api/pet/feed', 'POST', { item_id: id }).then(function (r) {
        if (!r) return;
        if (!r.success) { toast(r.error || '喂食失败', 'error'); return; }
        toast('开饭啦！');
        // 道具在 5 秒进食动画结束后才从背包消失
        if (roaming && roaming.feed) roaming.feed(5, function () { renderPet(); });
        else renderPet();
      });
    } else if (cat === 'toy') {
      api('/api/pet/play', 'POST', { item_id: id }).then(function (r) {
        if (!r) return;
        if (!r.success) { toast(r.error || '玩耍失败', 'error'); return; }
        toast('玩得很开心！');
        if (roaming) {
          roaming.bounce = 0.6;
          // 逗龟小球：实体化落在地上，乌龟碰到会踢它
          if (id === 'toy_ball' && roaming.spawnBall) roaming.spawnBall();
        }
        renderPet();
      });
    } else {
      // 布景装饰 / 外饰 / 武器 / 防具：再点一次即取下
      var worn = cat === 'accessory';
      api('/api/pet/equip', 'POST', { item_id: id }).then(function (r) {
        if (!r) return;
        if (!r.success) { toast(r.error || (worn ? '穿戴失败' : '布置失败'), 'error'); return; }
        var takeOff = r.action === 'removed';
        var msg;
        if (cat === 'weapon') msg = takeOff ? '已卸下武器' : '装备上武器了！';
        else if (cat === 'armor') msg = takeOff ? '已脱下防具' : '穿上防具了！';
        else if (worn) msg = takeOff ? '已摘下' : '戴上了！';
        else msg = takeOff ? '已收起' : '已布置！';
        toast(msg);
        renderPet();
      });
    }
  }

  /* ---------------- 对战 UI ---------------- */
  function openBattle() {
    if (!petState || !petState.pet) { toast('尚未领养宠物龟', 'error'); return; }
    if (roaming && roaming.battle) { toast('正在对战中，稍安勿躁~', 'error'); return; }
    api('/api/pet/pk-opponents').then(function (d) {
      if (!d) return;
      if (!d.has_pet) { toast('尚未领养宠物龟', 'error'); return; }
      showOpponents(d);
    });
  }

  function renderOppRows(opponents, pkLeft) {
    if (!opponents || !opponents.length) {
      return '<div class="text-muted small py-3 text-center">附近没有等级相近的对手，试试刷新吧</div>';
    }
    return opponents.map(function (o) {
      var wpn = o.weapon_name ? ' · 🗡 ' + o.weapon_name : '';
      var arm = o.armor_name ? ' · 🛡 ' + o.armor_name : '';
      var dis = pkLeft <= 0 ? ' disabled' : '';
      return '<div class="d-flex justify-content-between align-items-center border-bottom py-2">' +
        '<div><div class="fw-bold">' + o.name + '</div>' +
        '<div class="small text-muted">' + o.owner + ' · ' + o.species_name + ' · Lv.' + o.level + wpn + arm + '</div>' +
        '<div class="small text-muted">❤ ' + o.hp + (o.armor_max ? '  🛡 ' + o.armor_max : '') +
        '  ⚔ ' + o.power + '</div></div>' +
        '<button class="btn btn-sm btn-danger rounded-pill px-3 pk-go" data-id="' + o.id + '"' + dis + '>挑战</button></div>';
    }).join('');
  }

  function showOpponents(d) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2100;display:flex;align-items:center;justify-content:center;';
    var rowsWrap = document.createElement('div');
    rowsWrap.innerHTML = renderOppRows(d.opponents, d.pk_left);
    var refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn btn-sm btn-outline-primary rounded-pill px-3';
    refreshBtn.style.marginLeft = 'auto';
    function refreshLabel() {
      refreshBtn.textContent = '🔄 换一批（' + (d.refresh_left != null ? d.refresh_left : 3) + '）';
      refreshBtn.disabled = (d.refresh_left != null ? d.refresh_left : 0) <= 0;
    }
    refreshLabel();
    refreshBtn.addEventListener('click', function () {
      if (refreshBtn.disabled) return;
      api('/api/pet/pk-opponents?refresh=1').then(function (d2) {
        if (!d2) return;
        d = d2;
        rowsWrap.innerHTML = renderOppRows(d2.opponents, d2.pk_left);
        refreshLabel();
        bindRows();
        // 更新对战剩余次数显示
        var pkInfo = ov.querySelector('.pk-info');
        if (pkInfo) pkInfo.textContent = '今日剩余 ' + d2.pk_left + ' / ' + d2.pk_limit + ' 次';
      });
    });

    var header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-2';
    var title = document.createElement('div');
    title.className = 'fw-bold';
    title.textContent = '⚔️ 选择对战对手';
    var pkInfo = document.createElement('div');
    pkInfo.className = 'small text-muted pk-info';
    pkInfo.textContent = '今日剩余 ' + d.pk_left + ' / ' + d.pk_limit + ' 次';
    header.appendChild(title);
    header.appendChild(refreshBtn);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-outline-secondary rounded-pill w-100 mt-3';
    closeBtn.textContent = '关闭';
    closeBtn.setAttribute('data-x', 'close');

    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:16px;padding:20px;max-width:440px;width:92%;max-height:80vh;overflow:auto;box-shadow:0 12px 40px rgba(0,0,0,.3);';
    box.appendChild(header);
    box.appendChild(pkInfo);
    box.appendChild(rowsWrap);
    box.appendChild(closeBtn);
    ov.appendChild(box);
    document.body.appendChild(ov);

    function bindRows() {
      rowsWrap.querySelectorAll('.pk-go').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = parseInt(b.getAttribute('data-id'), 10);
          ov.remove();
          startPk(id);
        });
      });
    }
    bindRows();

    ov.addEventListener('click', function (e) {
      var t = e.target;
      var x = t && t.getAttribute && t.getAttribute('data-x');
      if (x === 'close' || t === ov) { ov.remove(); return; }
    });
  }

  function startPk(oppId) {
    api('/api/pet/pk', 'POST', { opponent_id: oppId }).then(function (r) {
      if (!r) return;
      if (!r.success) {
        toast(r.error || '挑战失败', 'error');
        renderPet();   // 同步剩余次数等信息
        return;
      }
      if (petState) { petState.pet = r.pet; if (typeof r.stars === 'number') petState.stars = r.stars; }
      refreshPetPanels();
      if (roaming && roaming.startBattle) roaming.startBattle(r);
      else toast('对战准备中，请稍后重试', 'error');
    });
  }

  function showBattleResult(b) {
    var win = b.winner === 'me', draw = b.winner === 'draw';
    var foeLabel = (b.foeOwner ? b.foeOwner + ' 的 ' : '') + (b.foeName || '对手');
    var title = draw ? '⚖️ 平局' : (win ? '🏆 胜利！' : '💥 惜败');
    var line = draw ? '势均力敌，双方战成平手' : (win ? '击败了 ' + foeLabel : '不敌 ' + foeLabel);
    var reward = (win && b.rewards)
      ? '<div style="margin-top:8px;color:#f39c12;font-weight:700;">奖励：⭐ +' + b.rewards.stars +
        ' ｜ 经验 +' + b.rewards.exp + '</div>'
      : '<div style="margin-top:8px;color:#999;font-size:.82rem;">再接再厉，下次一定赢！</div>';
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2100;display:flex;align-items:center;justify-content:center;';
    ov.innerHTML = '<div style="background:#fff;border-radius:16px;padding:24px;max-width:340px;width:88%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.3);">' +
      '<div style="font-size:1.35rem;font-weight:800;margin-bottom:8px;">' + title + '</div>' +
      '<div style="color:#444;font-size:.95rem;">' + line + '</div>' + reward +
      '<div style="margin-top:8px;color:#888;font-size:.8rem;">今日剩余挑战次数：' +
        (b.pkLeft != null ? b.pkLeft : 0) + ' / ' + (b.pkLimit != null ? b.pkLimit : 2) + '</div>' +
      '<button class="btn btn-primary rounded-pill px-4 mt-3" data-x="ok">知道了</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-x') === 'ok') ov.remove();
      else if (t === ov) ov.remove();
    });
    setTimeout(function () { if (ov.parentNode) ov.remove(); }, 3600);
  }

  /* ---------- Canvas 乌龟模型（小游戏级过程化绘制） ---------- */
  // 每个品种：配色 + 壳形/花纹 + 头部特征 + 尾巴/腿，全部参与绘制
  var SPECIES = {
    // 中华草龟：扁平橄榄壳 + 三条纵棱，头侧黄绿条纹
    cao: {
      shell:'#6b5a33', shellLight:'#8b7542', shellDark:'#4a3d22',
      skin:'#8fa05e', skinLight:'#aeb984', skinDark:'#5e6d3f', outline:'#241c10',
      rx:34, ry:24, dome:0.95, pattern:'keels',
      hsize:1.0, eye:'#1a1a1a', eyeR:2.3, stripe:'#e6d24f', brow:false, ear:null,
      tail:'short', leg:1.0,
    },
    // 黄缘闭壳龟：高背深色壳 + 中央黄棱，头侧黄纹
    huangyuan: {
      shell:'#3b3128', shellLight:'#5a4a3c', shellDark:'#241d15',
      skin:'#615f46', skinLight:'#807d60', skinDark:'#3e3d2e', outline:'#14100b',
      rx:31, ry:28, dome:1.34, pattern:'scutes', keel:'#e8c33f',
      hsize:1.0, eye:'#1a1a1a', eyeR:2.2, stripe:'#e8d24a', brow:false, ear:null,
      tail:'short', leg:1.0,
    },
    // 鳄龟：大壳棱刺 + 大头、眉骨、粗长尾
    eyu: {
      shell:'#5c5548', shellLight:'#7a7261', shellDark:'#3a3428',
      skin:'#6f6a5a', skinLight:'#8c8674', skinDark:'#4a4639', outline:'#1f1c15',
      rx:38, ry:26, dome:1.12, pattern:'spikes', spike:'#6f6656',
      hsize:1.4, eye:'#0f0f0b', eyeR:1.9, stripe:null, brow:true, ear:null,
      tail:'long', leg:1.3,
    },
    // 小青：圆润鲜绿壳 + 大眼
    xiaoqing: {
      shell:'#4fb15c', shellLight:'#7fd08a', shellDark:'#3a8c48',
      skin:'#7bd286', skinLight:'#a6e2ae', skinDark:'#4fa85a', outline:'#123a1c',
      rx:30, ry:26, dome:1.06, pattern:'smooth',
      hsize:1.1, eye:'#1a1a1a', eyeR:3.0, stripe:null, brow:false, ear:null,
      tail:'short', leg:0.95,
    },
    // 变异巴西龟：奶黄壳 + 红眼 + 粉红耳斑
    brazil: {
      shell:'#f0dfa6', shellLight:'#faf0c8', shellDark:'#d8c286',
      skin:'#f6efd6', skinLight:'#fffbe8', skinDark:'#c9bd8c', outline:'#8a7c50',
      rx:33, ry:27, dome:1.0, pattern:'scutes',
      hsize:1.0, eye:'#c0392b', eyeR:2.7, stripe:null, brow:false, ear:'#e59a86',
      tail:'short', leg:1.0,
    },
  };

  var roaming = null;
  function startRoaming(canvas, pen, p) {
    if (!canvas || !pen) return;
    if (roaming && roaming.raf) cancelAnimationFrame(roaming.raf);

    var dpr = window.devicePixelRatio || 1;
    function resize() {
      canvas.width = pen.clientWidth * dpr;
      canvas.height = pen.clientHeight * dpr;
    }
    resize();
    var ctx = canvas.getContext('2d');
    var W = pen.clientWidth, H = pen.clientHeight;
    var margin = 40;
    var col = SPECIES[p.species] || SPECIES.cao;

    roaming = {
      x: W / 2, y: H / 2,
      tx: 0, ty: 0, angle: 0,
      walkPhase: 0, walkSpeed: 0, state: 'idle', timer: 1.2,
      bounce: 0, headTurn: 0, headTurnTarget: 0, breathe: 0,
      tailWag: 0, turnRate: 0,
      side: 0,                              // 0=俯视(头朝上/下) 1=侧身(头朝左/右)，跟随朝向
      headExt: 0, headExtTarget: 0,         // 伸头/缩头
      mouthOpen: 0,                         // 嘴张开程度（吃东西时张合）
      headPeck: 0,                          // 进食时头前后啄食的位移(px)
      food: null,                           // 地上的那盆龟粮 {x,y}
      eatReady: false, eatTimer: 0, eatDuration: 5, onFeedDone: null,
      soakTimer: 0, headingPool: false,     // 走向水池 / 泡在水池里的状态
      ball: null,                           // 逗龟小球实体 {x,y,vx,vy,r,rot}
      vx: 0, vy: 0,                         // 上一帧乌龟的实际速度（供踢球换算用）
      kickExpAt: 0, floaters: [],           // 踢球加经验的节流时间 / 飘字列表
      level: (p.level || 1),                // 当前等级（决定体型缩放）
      species: p.species, isOpp: false,     // 绘制用：自己的品种 / 是否是对手
      swing: 0, hurt: 0,                    // 对战时：挥武器进度 / 受击闪光
      battle: null,                         // 对战状态（非空时进入对战模式）
      last: performance.now(), raf: 0,
    };
    pickTarget();

    /* 喂食：把一小盆龟粮放到附近，乌龟自己爬过去吃，吃完回调 */
    roaming.feed = function (seconds, onDone) {
      if (roaming.state === 'eat' || roaming.eatReady) return false;
      var m = 34;
      // 盆要放得比“停步距离”稍远，保证能爬过去；停下时头正好探到盆边
      var stopDist = headReachDist() + 8 * bodyScale();
      var want = stopDist + (26 + Math.random() * 40) * bodyScale();
      var bx = null, by = null;
      for (var i = 0; i < 12; i++) {
        var a = Math.random() * Math.PI * 2;
        var nx = roaming.x + Math.cos(a) * want;
        var ny = roaming.y + Math.sin(a) * want;
        if (nx >= m && nx <= W - m && ny >= m && ny <= H - m) { bx = nx; by = ny; break; }
      }
      if (bx === null) {
        var a2 = Math.random() * Math.PI * 2;
        bx = Math.max(m, Math.min(W - m, roaming.x + Math.cos(a2) * want));
        by = Math.max(m, Math.min(H - m, roaming.y + Math.sin(a2) * want));
      }
      roaming.food = { x: bx, y: by };
      roaming.tx = bx; roaming.ty = by;
      roaming.state = 'walk';
      roaming.eatReady = true;
      roaming.eatDuration = seconds || 5;
      roaming.onFeedDone = onDone || null;
      roaming.headExtTarget = 0.9;
      return true;
    };

    // 体型：初始为原始尺寸的 50%，每升 1 级放大 5%，封顶 100%
    // 对战时按“当前绘制的这只乌龟”的等级取缩放（roaming.level 会被指到对手身上）
    function bodyScale(a) {
      a = a || roaming;
      var lvl = (a && a.level) || (petState && petState.pet && petState.pet.level) || 1;
      return Math.min(1, 0.5 + 0.05 * (lvl - 1));
    }

    // 身上是否戴着某件外饰（如圣诞帽）
    function hasAccessory(id) {
      return !!(petState && petState.pet && petState.pet.accessories &&
                petState.pet.accessories.indexOf(id) >= 0);
    }

    // 乌龟头完全伸出时，嘴尖离身体中心的距离（用于判断停步/放盆距离）
    function headReachDist() {
      return (col.rx * 0.86 + 7 + 13.5 * col.hsize) * bodyScale();
    }

    // 布景：水池位置（装饰启用时才有）
    function hasDecor(id) {
      return !!(petState && petState.pet && petState.pet.decors && petState.pet.decors.indexOf(id) >= 0);
    }
    function poolGeom() {
      var rx = Math.min(52, W * 0.2);
      return { x: W * 0.28, y: H * 0.7, rx: rx, ry: rx * 0.54 };
    }

    function pickTarget() {
      roaming.headingPool = false;
      // 摆着水池时，偶尔会爬去泡一会儿
      if (hasDecor('decor_pool') && Math.random() < 0.34) {
        var pg = poolGeom();
        roaming.tx = pg.x + (Math.random() - 0.5) * pg.rx * 0.5;
        roaming.ty = pg.y + (Math.random() - 0.5) * pg.ry * 0.5;
        roaming.headingPool = true;
      } else {
        roaming.tx = margin + Math.random() * (W - margin * 2);
        roaming.ty = margin + Math.random() * (H - margin * 2);
      }
      roaming.state = 'walk';
      roaming.headExtTarget = 0.35 + Math.random() * 0.45;   // 出发时把头伸出来
    }

    // 把 hex 颜色变亮/变暗
    function shade(hex, amt) {
      var n = parseInt(hex.slice(1), 16);
      var r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
      var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
      var b = Math.max(0, Math.min(255, (n & 255) + amt));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    /* 画一条腿：从髋点到脚。髋点/落脚点由调用方按视角算好，这里只做步态 */
    function drawLeg(ax, ay, footY, phase, s, far) {
      var tk = col.leg;                       // 品种腿粗细
      var sinP = Math.sin(phase);
      // 摆动：sin>0 时脚在身体后方（支撑相），sin<0 时脚向前迈（摆动相）
      var swingX = sinP * 7 * s;
      // 抬脚：摆动相时抬
      var lift = Math.max(0, -sinP) * 6 * s;

      var kneeX = ax + swingX * 0.4;
      var footX = ax + swingX;
      var footYF = footY - lift;
      var kneeY = ay + (footYF - ay) * 0.62;
      var bendDir = footYF >= ay ? -1 : 1;

      var skin = far ? col.skinDark : col.skin;
      var skinL = far ? col.skin : col.skinLight;

      // 大腿
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo((ax + kneeX) / 2 + bendDir * 2 * s, (ay + kneeY) / 2, kneeX, kneeY);
      ctx.lineWidth = 4.5 * tk * s;
      ctx.strokeStyle = skin;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineWidth = 1.2 * tk * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();

      // 小腿
      ctx.beginPath();
      ctx.moveTo(kneeX, kneeY);
      ctx.quadraticCurveTo((kneeX + footX) / 2, (kneeY + footYF) / 2 - bendDir * 2 * s, footX, footYF);
      ctx.lineWidth = 3.6 * tk * s;
      ctx.strokeStyle = skinL;
      ctx.stroke();
      ctx.lineWidth = 1 * tk * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();

      // 脚掌
      ctx.beginPath();
      ctx.ellipse(footX, footYF, 4.2 * tk * s, 3 * tk * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = far ? col.skin : col.skinDark;
      ctx.fill();
      ctx.lineWidth = 1 * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();

      // 爪尖（3 个小爪）
      ctx.fillStyle = shade(col.skinDark, -20);
      var clawDir = footYF >= ay ? 1 : -1;
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(footX + i * 1.6 * tk * s, footYF + clawDir * 2.4 * tk * s, 0.8 * s, 1.2 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* 盾片纹理：中央椎盾 + 两侧肋盾 + 边缘分块（供各品种复用） */
    function drawScutes(rx, ry, s, lineColor, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.3 * s;
      // 中线
      ctx.beginPath();
      ctx.moveTo(-rx * 0.85, 0); ctx.lineTo(rx * 0.72, 0);
      ctx.stroke();
      // 中央椎盾
      for (var i = -1; i <= 1; i++) {
        var cx = i * rx * 0.32;
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.18, 0);
        ctx.lineTo(cx, -ry * 0.5);
        ctx.lineTo(cx + rx * 0.18, 0);
        ctx.lineTo(cx, ry * 0.5);
        ctx.closePath();
        ctx.stroke();
      }
      // 两侧肋盾
      for (var j = -1; j <= 1; j += 2) {
        ctx.beginPath();
        ctx.moveTo(-rx * 0.7, j * ry * 0.46);
        ctx.quadraticCurveTo(0, j * ry * 0.56, rx * 0.6, j * ry * 0.46);
        ctx.stroke();
      }
      // 边缘盾片分割
      ctx.globalAlpha = alpha * 0.8;
      for (var k = 0; k < 8; k++) {
        var a = -Math.PI / 2 + (k + 0.5) * (Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * rx * 0.8, Math.sin(a) * ry * 0.8);
        ctx.lineTo(Math.cos(a) * rx, Math.sin(a) * ry);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* 中央背脊黄棱（黄缘的特征）
       俯视：贯穿前后的锥形亮脊；侧身：细脊顺着拱起的背弧走 */
    function drawKeel(rx, ryT, s, side) {
      var hw0 = 2.4 * s, hw1 = 4.8 * s;        // 俯视：前端窄、后端宽
      var off = 3 * s, wS = 1.9 * s;           // 侧身：贴背弧的细脊
      var xs = -rx * 0.82, xe = rx * 0.72, N = 22;
      var up = [], dn = [];
      for (var i = 0; i <= N; i++) {
        var x = xs + (xe - xs) * (i / N);
        var k = x / rx;
        if (k > 1) k = 1; else if (k < -1) k = -1;
        var arcY = -Math.sqrt(Math.max(0, 1 - k * k)) * ryT;          // 壳体背弧
        var hw = hw0 + (hw1 - hw0) * ((x - xe) / (xs - xe));          // 锥形半宽
        var cy = side * (arcY + off);                                  // 中心线：中央 → 背弧
        var half = (1 - side) * hw + side * wS;
        up.push([x, cy - half]);
        dn.push([x, cy + half]);
      }

      ctx.beginPath();
      up.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      for (var j = dn.length - 1; j >= 0; j--) ctx.lineTo(dn[j][0], dn[j][1]);
      ctx.closePath();
      ctx.fillStyle = col.keel;
      ctx.fill();

      // 立体感：上侧受光高光 + 下侧暗边
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = shade(col.keel, 45);
      ctx.beginPath();
      up.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.stroke();
      ctx.lineWidth = 1 * s;
      ctx.strokeStyle = shade(col.keel, -80);
      ctx.beginPath();
      dn.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.stroke();
    }

    /* 画龟壳：俯视时是椭圆背甲；侧身时收成"上拱下平"的侧面轮廓 */
    function drawShell(s, side) {
      var rx = col.rx * s;
      var ry = col.ry * s;
      var ryT = ry;                                      // 背侧半高：始终不变，顶缘稳定
      var ryB = ry * (1 - 0.72 * side);                  // 腹侧半高：侧身时收平（腹甲侧）
      var ryAvg = (ryT + ryB) * 0.5;

      function shellPath(px, up, dn) {
        ctx.beginPath();
        ctx.ellipse(0, 0, px, up, 0, Math.PI, Math.PI * 2, false);   // 上拱
        ctx.ellipse(0, 0, px, dn, 0, 0, Math.PI, false);             // 下缘（扁）
        ctx.closePath();
      }

      // 顶面
      shellPath(rx, ryT, ryB);
      var grad = ctx.createRadialGradient(-rx * 0.12, -ryT * 0.32, 1 * s, 0, 0, rx);
      grad.addColorStop(0, col.shellLight);
      grad.addColorStop(0.5, col.shell);
      grad.addColorStop(1, col.shellDark);
      ctx.fillStyle = grad;
      ctx.fill();

      // 花纹（裁剪在顶面内；图案对齐到可见壳面中心）
      ctx.save();
      shellPath(rx * 0.97, ryT * 0.95, ryB * 0.94);
      ctx.clip();
      if (col.keel) drawKeel(rx, ryT, s, side);   // 先画黄棱，盾片线再压上去 → 形成分节
      ctx.translate(0, (ryB - ryT) * 0.5);
      if (col.pattern === 'keels') {
        // 草龟：三条前后向纵棱（亮脊 + 暗沟）
        [-0.5, 0, 0.5].forEach(function (fy) {
          var yy = fy * ryAvg * 0.72;
          ctx.strokeStyle = col.shellLight;
          ctx.lineWidth = 1.7 * s;
          ctx.beginPath();
          ctx.moveTo(-rx * 0.8, yy);
          ctx.quadraticCurveTo(0, yy * 0.9, rx * 0.76, yy);
          ctx.stroke();
          ctx.strokeStyle = col.shellDark;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(-rx * 0.8, yy + 2.2 * s);
          ctx.quadraticCurveTo(0, yy * 0.9 + 2.2 * s, rx * 0.76, yy + 2.2 * s);
          ctx.stroke();
        });
        drawScutes(rx, ryAvg, s, col.shellDark, 0.45);
      } else if (col.pattern === 'smooth') {
        drawScutes(rx, ryAvg, s, shade(col.shellDark, 40), 0.6);
      } else {
        drawScutes(rx, ryAvg, s, col.pattern === 'spikes' ? col.shellDark : shade(col.shellDark, -10), 1);
      }
      ctx.restore();

      // 鳄龟：沿壳缘一圈棱刺（避开头部方向）
      if (col.pattern === 'spikes') {
        for (var i = 0; i < 12; i++) {
          var a = i * (Math.PI * 2 / 12);
          if (Math.cos(a) > 0.55) continue;       // 头部一侧不长刺
          var rr = (Math.sin(a) <= 0 ? ryT : ryB) * 0.95;
          var bx = Math.cos(a) * rx * 0.95;
          var by = Math.sin(a) * rr;
          var dx = Math.cos(a), dy = Math.sin(a);
          ctx.beginPath();
          ctx.moveTo(bx - dy * 4 * s, by + dx * 4 * s);
          ctx.lineTo(bx + dx * 9 * s, by + dy * 9 * s);
          ctx.lineTo(bx + dy * 4 * s, by - dx * 4 * s);
          ctx.closePath();
          ctx.fillStyle = col.spike || col.shellLight;
          ctx.fill();
          ctx.lineWidth = 1.1 * s;
          ctx.strokeStyle = col.outline;
          ctx.stroke();
        }
      }

      // 侧身视角：露出的腹甲 / 裙边（贴住壳底那一条）
      if (side > 0.05) {
        ctx.save();
        ctx.globalAlpha = 0.5 * side;
        ctx.beginPath();
        ctx.ellipse(0, ryB * 0.5, rx * 0.86, ryB * 0.52, 0, 0, Math.PI);
        ctx.fillStyle = shade(col.shellDark, 26);
        ctx.fill();
        ctx.globalAlpha = 0.65 * side;
        ctx.beginPath();
        ctx.moveTo(-rx * 0.88, ryB * 0.7);
        ctx.quadraticCurveTo(0, ryB * 1.04, rx * 0.88, ryB * 0.7);
        ctx.lineWidth = 1.4 * s;
        ctx.strokeStyle = col.outline;
        ctx.stroke();
        ctx.restore();
      }

      // 顶部高光
      ctx.beginPath();
      ctx.ellipse(-rx * 0.2, -ryT * 0.45, rx * 0.32, ryT * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fill();

      // 外轮廓
      shellPath(rx, ryT, ryB);
      ctx.lineWidth = 1.8 * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();
    }

    /* 外饰：圣诞帽。大小由头部尺寸 hs 与体型缩放 s 决定，戴在头顶不掉不歪 */
    function drawHat(s) {
      var hs = col.hsize;
      var cx = 4.6 * hs * s;        // 帽檐中心（头顶偏后一点）
      var cy = -6.2 * hs * s;
      var rx = 9.3 * hs * s;        // 帽檐横向半径（略小于头宽，像箍在头上）
      var ry = 3.6 * hs * s;
      var tipX = cx - 6.8 * hs * s; // 帽尖向后上方翘起
      var tipY = cy - 16.5 * hs * s;
      ctx.save();

      // 帽身：红色锥形
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy + ry * 0.2);
      ctx.quadraticCurveTo(cx - rx * 0.55, cy - 9 * hs * s, tipX, tipY);
      ctx.quadraticCurveTo(cx + rx * 0.45, cy - 8.5 * hs * s, cx + rx, cy + ry * 0.2);
      ctx.closePath();
      var rg = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy);
      rg.addColorStop(0, '#d63f3c');
      rg.addColorStop(0.45, '#e14e46');
      rg.addColorStop(1, '#a7292b');
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = '#7d1c1e';
      ctx.stroke();

      // 帽身高光（一道柔和的弧）
      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.5, cy - 2 * hs * s);
      ctx.quadraticCurveTo(cx - rx * 0.95, cy - 8 * hs * s, tipX + 1.4 * hs * s, tipY + 2.4 * hs * s);
      ctx.lineWidth = 2 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,.26)';
      ctx.stroke();

      // 白色毛绒帽檐
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      var fg = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
      fg.addColorStop(0, '#ffffff');
      fg.addColorStop(1, '#e4e6e0');
      ctx.fillStyle = fg;
      ctx.fill();
      ctx.lineWidth = 1 * s;
      ctx.strokeStyle = '#c9ccc5';
      ctx.stroke();
      // 帽檐绒毛小凸起
      ctx.fillStyle = '#fbfbf7';
      for (var i = 0; i < 7; i++) {
        var a = Math.PI * (0.06 + 0.88 * i / 6);
        ctx.beginPath();
        ctx.arc(cx - Math.cos(a) * rx, cy - Math.sin(a) * ry, 1.5 * hs * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // 帽尖绒球
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3.5 * hs * s, 0, Math.PI * 2);
      var pg = ctx.createRadialGradient(tipX - 1 * s, tipY - 1 * s, 0.4 * s, tipX, tipY, 3.7 * hs * s);
      pg.addColorStop(0, '#ffffff');
      pg.addColorStop(1, '#dcded8');
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.lineWidth = 0.9 * s;
      ctx.strokeStyle = '#c6c9c2';
      ctx.stroke();

      ctx.restore();
    }

    /* 画头 + 脖子：品种头部特征（大小/眼睛/眉骨/侧纹/耳斑） */
    function drawHead(r, s, side, noAcc) {
      var hs = col.hsize;
      var headX = (col.rx * 0.86 + r.headExt * 7 + (r.headPeck || 0)) * s;
      var neckLen = headX - col.rx * 0.5 * s + 2 * s;
      // 侧身视角：双眼向头中线收拢（投影后重合），只剩一只侧眼可见
      var eyeSpread = 1 - 0.85 * side;
      var eyeDrop = side * 0.6 * hs * s;
      var headDrop = side * 2.2 * s;
      ctx.save();
      ctx.translate(headX, headDrop);
      ctx.rotate(r.headTurn * 0.35);

      // 脖子
      ctx.beginPath();
      ctx.moveTo(-neckLen, -4.5 * hs * s);
      ctx.quadraticCurveTo(-neckLen * 0.5, -3 * hs * s, 0, -4 * hs * s);
      ctx.lineTo(0, 4 * hs * s);
      ctx.quadraticCurveTo(-neckLen * 0.5, 3 * hs * s, -neckLen, 4.5 * hs * s);
      ctx.closePath();
      ctx.fillStyle = col.skin;
      ctx.fill();
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();

      // 头主体
      ctx.beginPath();
      ctx.ellipse(5 * hs * s, 0, 10 * hs * s, 8 * hs * s, 0, 0, Math.PI * 2);
      var hg = ctx.createRadialGradient(3 * hs * s, -3 * hs * s, 1 * s, 5 * hs * s, 0, 10 * hs * s);
      hg.addColorStop(0, col.skinLight);
      hg.addColorStop(1, col.skin);
      ctx.fillStyle = hg;
      ctx.fill();
      ctx.lineWidth = 1.4 * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();

      // 头部侧纹（草龟/黄缘）：侧身视角下两条纹收拢为一条
      if (col.stripe) {
        ctx.strokeStyle = col.stripe;
        ctx.lineWidth = 1.6 * s;
        [-1, 1].forEach(function (sgn) {
          ctx.beginPath();
          ctx.moveTo(1 * hs * s, sgn * 5.6 * hs * s * eyeSpread + eyeDrop);
          ctx.quadraticCurveTo(6 * hs * s, sgn * 5.4 * hs * s * eyeSpread + eyeDrop, 10 * hs * s, sgn * 3.2 * hs * s * eyeSpread + eyeDrop);
          ctx.stroke();
        });
      }

      // 下颌浅色
      ctx.beginPath();
      ctx.ellipse(5 * hs * s, 2.5 * hs * s, 7 * hs * s, 3.5 * hs * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = col.skinLight;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      // 耳斑（巴西龟）
      if (col.ear) {
        ctx.fillStyle = col.ear;
        [-1, 1].forEach(function (sgn) {
          ctx.beginPath();
          ctx.ellipse(1.5 * hs * s, sgn * 5.2 * hs * s * eyeSpread + eyeDrop, 2.2 * s, 1.7 * s, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 眼睛（俯视：头顶两侧两只；侧身：近侧一只，远侧随视角淡出）
      var eyeY = 4.4 * hs * s, ex = 7 * hs * s, eyeR = col.eyeR * s;
      [-1, 1].forEach(function (sgn) {
        var farAlpha = sgn < 0 ? Math.max(0, 1 - 2 * side) : 1;
        if (farAlpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = farAlpha;
        var ey = sgn * eyeY * eyeSpread + eyeDrop;
        // 眼白
        ctx.beginPath();
        ctx.ellipse(ex, ey, eyeR * 1.05, eyeR * 1.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 0.8 * s;
        ctx.strokeStyle = col.outline;
        ctx.stroke();
        // 虹膜（品种眼色：巴西红眼）
        var lookX = Math.cos(r.headTurn) * 0.6 * s;
        ctx.beginPath();
        ctx.arc(ex + lookX, ey, eyeR * 0.78, 0, Math.PI * 2);
        ctx.fillStyle = col.eye;
        ctx.fill();
        // 瞳孔
        ctx.beginPath();
        ctx.arc(ex + lookX, ey, eyeR * 0.36, 0, Math.PI * 2);
        ctx.fillStyle = '#141414';
        ctx.fill();
        // 高光
        ctx.beginPath();
        ctx.arc(ex + lookX + 0.5 * s, ey - 0.6 * s, 0.6 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
      });

      // 眉骨突起（鳄龟）
      if (col.brow) {
        ctx.fillStyle = shade(col.skinDark, -10);
        [-1, 1].forEach(function (sgn) {
          var farAlpha = sgn < 0 ? Math.max(0, 1 - 2 * side) : 1;
          if (farAlpha <= 0.01) return;
          var b0 = sgn * eyeY * eyeSpread + eyeDrop;
          ctx.save();
          ctx.globalAlpha = farAlpha;
          ctx.beginPath();
          ctx.moveTo(ex - 2.4 * s, b0 - sgn * 1.2 * s);
          ctx.lineTo(ex + 2.8 * s, b0 - sgn * 0.4 * s);
          ctx.lineTo(ex + 2 * s, b0 - sgn * 3.4 * s);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // 鼻孔（侧身时只见近侧一个）
      ctx.fillStyle = col.outline;
      [-1, 1].forEach(function (sgn) {
        var farAlpha = sgn < 0 ? Math.max(0, 1 - 2 * side) : 1;
        if (farAlpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = farAlpha;
        ctx.beginPath();
        ctx.arc(12.5 * hs * s, sgn * 1.2 * hs * s * (1 - 0.7 * side) + side * 0.5 * hs * s, 0.6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 嘴：吃东西时上下颚一张一合，露出口腔
      var mOpen = r.mouthOpen || 0;      // 0(闭合) → 1(大张)
      var mx = 15.5 * hs * s;            // 嘴角起点（吻尖）
      var gap = (1.0 + 6.5 * mOpen) * hs * s;   // 上下颚开口高度的一半
      if (mOpen > 0.06) {
        // 张开的嘴：一个深红的口腔
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.quadraticCurveTo(mx - 5.5 * hs * s, -gap, mx - 9.5 * hs * s, 0);
        ctx.quadraticCurveTo(mx - 5.5 * hs * s, gap, mx, 0);
        ctx.closePath();
        var mg = ctx.createRadialGradient(mx - 4 * hs * s, 0, 0.5 * s, mx - 4 * hs * s, 0, 6 * hs * s);
        mg.addColorStop(0, '#c2564e');       // 口腔内部（偏亮红）
        mg.addColorStop(0.55, '#8e2b28');
        mg.addColorStop(1, '#4d100f');
        ctx.fillStyle = mg;
        ctx.fill();
        ctx.lineWidth = 1.4 * s;
        ctx.strokeStyle = shade(col.skinDark, -30);
        ctx.stroke();
        // 上颚沿
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.quadraticCurveTo(mx - 5.5 * hs * s, -gap, mx - 9.5 * hs * s, 0);
        ctx.lineWidth = 1.2 * s;
        ctx.strokeStyle = col.skinLight;
        ctx.stroke();
      } else {
        // 闭合的嘴：一条浅色嘴缝
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.quadraticCurveTo(mx - 5 * hs * s, 1.6 * hs * s, mx - 7 * hs * s, 1.2 * hs * s);
        ctx.lineWidth = 1.2 * s;
        ctx.strokeStyle = shade(col.skinDark, -20);
        ctx.stroke();
      }

      // 外饰：圣诞帽戴在头顶（跟着头的转向、伸缩一起动；对战双方各戴各自的外饰）
      var accs = r.isOpp ? (r.accessories || [])
                        : ((petState && petState.pet && petState.pet.accessories) || []);
      if (!noAcc && accs.indexOf('acc_santa') >= 0) drawHat(s);

      ctx.restore();
    }

    function drawTail(r, s) {
      var wag = Math.sin(r.tailWag) * 3 * s;
      var bx = -col.rx * 0.8 * s;
      var len = (col.tail === 'long' ? 24 : 13) * s;   // 鳄龟粗长尾
      var tk = col.tail === 'long' ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(bx, -3 * tk * s);
      ctx.quadraticCurveTo(bx - len * 0.6, wag, bx - len, wag + (wag > 0 ? -1 : 1) * 2 * s);
      ctx.quadraticCurveTo(bx - len * 0.6, wag + (wag > 0 ? 2 : -2) * 2 * s, bx, 3 * tk * s);
      ctx.closePath();
      ctx.fillStyle = col.skin;
      ctx.fill();
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = col.outline;
      ctx.stroke();
    }

    /* 一小盆龟粮 */
    function drawFood(f) {
      var cx = f.x * dpr, cy = f.y * dpr;
      var r = 13 * dpr;
      ctx.save();
      // 盆身
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#c8823a';
      ctx.fill();
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = '#8a5417';
      ctx.stroke();
      // 盆内
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1 * dpr, r * 0.72, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#7a4712';
      ctx.fill();
      // 龟粮颗粒
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.4, cy - 1 * dpr + Math.sin(a) * r * 0.2, 2.3 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#e6b356';
        ctx.fill();
        ctx.lineWidth = 0.8 * dpr;
        ctx.strokeStyle = '#a9741f';
        ctx.stroke();
      }
      ctx.restore();
    }

    /* 逗龟小球：实体化 + 物理（乌龟碰到踢飞，撞边框反弹） */
    var KICK_CD_MS = 2200;   // 客户端节流：两次“踢球加经验”的最短间隔（略大于服务端冷却）
    roaming.spawnBall = function () {
      var r = 9;
      if (!roaming.ball) {
        // 首次使用：落在乌龟身边（避开身体，别一上来就重叠）
        var a = Math.random() * Math.PI * 2;
        var d = col.rx * bodyScale() * 0.7 + r + 14;
        var bx = Math.max(r + 4, Math.min(W - r - 4, roaming.x + Math.cos(a) * d));
        var by = Math.max(r + 4, Math.min(H - r - 4, roaming.y + Math.sin(a) * d));
        roaming.ball = { x: bx, y: by, vx: 0, vy: 0, r: r, rot: 0 };
      } else {
        // 已在地上：再玩一次就朝乌龟外侧轻轻拨一下
        var b = roaming.ball;
        var ang = Math.atan2(b.y - roaming.y, b.x - roaming.x);
        if (!ang) ang = Math.random() * Math.PI * 2;
        b.vx += Math.cos(ang) * 90;
        b.vy += Math.sin(ang) * 90;
      }
      return true;
    };

    function updateBall(dt) {
      var b = roaming.ball;
      if (!b) return;
      var tv = Math.hypot(roaming.vx, roaming.vy);   // 乌龟当前速度
      var tvx = roaming.vx, tvy = roaming.vy;

      // 位移 + 摩擦
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      var damp = Math.exp(-1.7 * dt);
      b.vx *= damp; b.vy *= damp;
      b.rot += (Math.abs(b.vx) + Math.abs(b.vy)) * dt * 0.06;   // 滚动自转

      // 边框反弹（e=0.82）
      var inset = b.r + 4, rest = 0.82;
      if (b.x < inset) { b.x = inset; b.vx = Math.abs(b.vx) * rest; }
      if (b.x > W - inset) { b.x = W - inset; b.vx = -Math.abs(b.vx) * rest; }
      if (b.y < inset) { b.y = inset; b.vy = Math.abs(b.vy) * rest; }
      if (b.y > H - inset) { b.y = H - inset; b.vy = -Math.abs(b.vy) * rest; }

      // 与乌龟身体碰撞 → 踢出去
      var dx = b.x - roaming.x, dy = b.y - roaming.y;
      var dist = Math.hypot(dx, dy) || 0.01;
      var hitR = b.r + col.rx * bodyScale() * 0.72;
      if (dist < hitR) {
        var nx = dx / dist, ny = dy / dist;
        b.x = roaming.x + nx * hitR;                 // 顶到碰撞圈外，避免粘连抖动
        b.y = roaming.y + ny * hitR;
        var kick = Math.max(90, tv * 1.2 + 50);       // 走得越快踢得越远
        var jitter = (Math.random() - 0.5) * 40;      // 一点随机侧向，看起来更活泼
        b.vx = nx * kick - ny * jitter + tvx * 0.5;
        b.vy = ny * kick + nx * jitter + tvy * 0.5;

        // 每被踢一下加一点经验（客户端节流，服务端再做一次冷却兜底）
        var now = performance.now();
        if (now - roaming.kickExpAt > KICK_CD_MS) {
          roaming.kickExpAt = now;
          kickReward(b);
        }
      } else if (Math.hypot(b.vx, b.vy) < 12) {
        b.vx = 0; b.vy = 0;                          // 滚到停下来
      }
    }

    /* 踢球加经验：飘一个 +1，并请求后端发经验 */
    function kickReward(b) {
      roaming.floaters.push({ x: b.x, y: b.y - b.r - 3, life: 1 });
      api('/api/pet/ball-kick', 'POST', {}).then(function (r) {
        if (!r || !r.success || !r.credited || !r.pet) return;
        if (petState) { petState.pet = r.pet; refreshPetPanels(); }
      });
    }

    function drawBall(b) {
      var cx = b.x * dpr, cy = b.y * dpr, R = b.r * dpr;
      ctx.save();
      // 地面投影
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.9, R * 0.9, R * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,.16)';
      ctx.fill();
      // 球体
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.12, cx, cy, R);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.68, '#eef1f4');
      g.addColorStop(1, '#c3c9cf');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 1.4 * dpr;
      ctx.strokeStyle = '#59616a';
      ctx.stroke();
      // 中央五边形 + 五条接缝（随滚动旋转）
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(b.rot);
      var pr = R * 0.42;
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        var ax = Math.cos(a) * pr, ay = Math.sin(a) * pr;
        if (i) ctx.lineTo(ax, ay); else ctx.moveTo(ax, ay);
      }
      ctx.closePath();
      ctx.fillStyle = '#2b3036';
      ctx.fill();
      ctx.strokeStyle = 'rgba(43,48,54,.7)';
      ctx.lineWidth = 1 * dpr;
      for (var j = 0; j < 5; j++) {
        var a2 = -Math.PI / 2 + j * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a2) * pr, Math.sin(a2) * pr);
        ctx.lineTo(Math.cos(a2) * R * 0.94, Math.sin(a2) * R * 0.94);
        ctx.stroke();
      }
      // 高光
      ctx.beginPath();
      ctx.ellipse(-R * 0.32, -R * 0.36, R * 0.26, R * 0.18, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }

    /* 飘字：踢球 +1 / 对战扣血 -N，上浮并淡出 */
    function updateFloaters(dt) {
      for (var i = roaming.floaters.length - 1; i >= 0; i--) {
        var f = roaming.floaters[i];
        f.life -= dt * 1.5;
        f.y -= dt * 24;
        if (f.life <= 0) roaming.floaters.splice(i, 1);
      }
    }
    function drawFloaters() {
      if (!roaming.floaters.length) return;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold ' + (12 * dpr) + 'px system-ui,-apple-system,sans-serif';
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      roaming.floaters.forEach(function (f) {
        ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
        ctx.fillStyle = f.color || '#2e7d32';
        var txt = f.text || '+1';
        ctx.strokeText(txt, f.x * dpr, f.y * dpr);
        ctx.fillText(txt, f.x * dpr, f.y * dpr);
      });
      ctx.restore();
    }

    /* 武器：由一只前脚握着（激光剑 / 大砍刀），随走路摆动、对战时挥舞 */
    function drawWeapon(r, s, side, wid) {
      if (wid !== 'wpn_laser' && wid !== 'wpn_cleaver') return;
      // 取近侧前脚的落点（与 drawLeg 的步态一致）
      var legBX = col.rx * 0.5 * s;
      var legBYTop = col.ry * 0.78 * s;
      var legBYSide = col.ry * 0.24 * s;
      var reachTop = 9 * s, reachSide = 13 * s;
      var phase = r.walkPhase + Math.PI;
      var sinP = Math.sin(phase);
      var ax = legBX;
      var footBaseY = (legBYTop + reachTop) * (1 - side) + (legBYSide + reachSide) * side;
      var footX = ax + sinP * 7 * s;
      var footY = footBaseY - Math.max(0, -sinP) * 6 * s;
      var ang = -1.15 + (r.swing || 0) * 2.2;      // 静止：蓄势上举；出手时向前劈下

      ctx.save();
      ctx.translate(footX, footY);
      ctx.rotate(ang);
      var L = 30 * s;
      ctx.lineCap = 'round';
      if (wid === 'wpn_laser') {
        // 剑柄 + 护手
        ctx.lineWidth = 4.4 * s; ctx.strokeStyle = '#2b3036';
        ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(4 * s, 0); ctx.stroke();
        ctx.lineWidth = 3 * s; ctx.strokeStyle = '#cfd6dd';
        ctx.beginPath(); ctx.moveTo(4 * s, -3.4 * s); ctx.lineTo(4 * s, 3.4 * s); ctx.stroke();
        // 发光光刃
        var lg = ctx.createLinearGradient(5 * s, 0, 5 * s + L, 0);
        lg.addColorStop(0, '#eafffb'); lg.addColorStop(0.4, '#78f0ff'); lg.addColorStop(1, '#2ea8ff');
        ctx.shadowColor = '#78f0ff'; ctx.shadowBlur = 10 * s;
        ctx.lineWidth = 5.2 * s; ctx.strokeStyle = lg;
        ctx.beginPath(); ctx.moveTo(5 * s, 0); ctx.lineTo(5 * s + L, 0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.6 * s; ctx.strokeStyle = 'rgba(255,255,255,.92)';
        ctx.beginPath(); ctx.moveTo(6 * s, 0); ctx.lineTo(5 * s + L * 0.95, 0); ctx.stroke();
      } else {
        // 大砍刀：木柄 + 宽刃
        ctx.lineWidth = 5 * s; ctx.strokeStyle = '#7a4a24';
        ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(6 * s, 0); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(6 * s, -3.4 * s);
        ctx.lineTo(6 * s + L * 0.86, -6.4 * s);
        ctx.quadraticCurveTo(6 * s + L, 0, 6 * s + L * 0.86, 6.4 * s);
        ctx.lineTo(6 * s, 3.4 * s);
        ctx.closePath();
        var sg = ctx.createLinearGradient(6 * s, -6.4 * s, 6 * s + L, 6.4 * s);
        sg.addColorStop(0, '#eef2f5'); sg.addColorStop(0.5, '#c3ccd4'); sg.addColorStop(1, '#8f99a2');
        ctx.fillStyle = sg; ctx.fill();
        ctx.lineWidth = 1.4 * s; ctx.strokeStyle = '#5c646c'; ctx.stroke();
        ctx.lineWidth = 1.2 * s; ctx.strokeStyle = 'rgba(255,255,255,.75)';
        ctx.beginPath();
        ctx.moveTo(6 * s + L * 0.86, -5.2 * s);
        ctx.quadraticCurveTo(6 * s + L * 0.98, -1 * s, 6 * s + L * 0.86, 2.6 * s);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* 武士甲胄（黑漆·金箔）：乌龟直立，头部正视、完整外露不歪；
       甲胄只披挂躯干与四肢，头部留给宠物自身的外饰（如圣诞帽）。 */
    function drawStandingArmor(r, s, wid) {
      var rx = col.rx * s;
      var ry = col.ry * s;
      var hs = col.hsize;
      var rw = ry;                      // 直立躯干半宽（水平）= 壳竖径（rx/ry 已乘 s）
      var rh = rx;                      // 直立躯干半高（垂直）= 壳横径
      ctx.save();

      // ---- 后腿（站立支撑）----
      var legHipY = ry * 0.55;
      var legFootY = ry + 20 * s;
      var legSpread = rx * 0.42;
      drawLeg(-legSpread, legHipY, legFootY, r.walkPhase, s, false);
      drawLeg(legSpread, legHipY, legFootY, r.walkPhase + Math.PI, s, false);

      // ---- 躯干（龟壳直立）----
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      drawShell(s, 0.55);
      ctx.restore();

      // ---- 前腿（化为双臂，垂在躯干两侧）----
      var armY = -rh * 0.60;
      drawLeg(-rw * 1.0, armY, armY + 17 * s, r.walkPhase + Math.PI, s, false);
      drawLeg(rw * 1.0, armY, armY + 17 * s, r.walkPhase, s, false);

      // ---- 头（抬到躯干上方，正视：双眼左右对称 → 头不歪）----
      ctx.save();
      var headX = (col.rx * 0.86 + r.headExt * 7 + (r.headPeck || 0)) * s;
      ctx.translate(0, -rh * 0.58);     // 头底部落在躯干上缘附近，脖子从领口伸出
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-headX, 0);         // 抵消 drawHead 的前伸偏移，让头居中于颈上
      drawHead(r, s, 0, true);          // side=0 正视；外饰在这里自己摆正后绘制
      // 外饰：头整体转了 -90°，帽子需要再转 +90° 才在正视下是正的，安在头顶。
      // 关键：帽子必须放在与头部完全相同的变换系（含 headX 平移 + headTurn 旋转），
      // 否则乌龟转头时帽子会留在原位、与头脱节。
      var accs = r.isOpp ? (r.accessories || [])
                        : ((petState && petState.pet && petState.pet.accessories) || []);
      if (accs.indexOf('acc_santa') >= 0) {
        ctx.save();
        // 复刻 drawHead 内部的平移与旋转，让帽子与头共坐标系
        ctx.translate(headX, 0);                    // headDrop 在 side=0 时为 0
        ctx.rotate(r.headTurn * 0.35);
        // 让帽子以"帽檐正好搭在头顶"的方式佩戴（与爬行态 drawHat 的相对关系一致）：
        // 原 drawHat 帽檐中心在自身坐标 (4.6hs, -6.2hs)，相对头顶 (5hs, -8hs) 的偏移为 (-0.4hs, 1.8hs)；
        // 这里额外旋转 +90° 让帽子直立，偏移向量旋转后变为 (-1.8hs, -0.4hs)，
        // 故 translate = 头顶 + 旋转后偏移 - 旋转后的帽檐坐标(6.2hs, 4.6hs)。
        ctx.translate(-1.6 * hs * s, -14.4 * hs * s);
        ctx.rotate(Math.PI / 2);
        drawHat(s);
        ctx.restore();
      }
      ctx.restore();

      // ---- 武士盔甲（叠加在直立乌龟之上）----
      // 配色：黑漆甲 + 金箔缘饰 + 朱红内衬
      var armorDark = '#141414', armorMid = '#2a2723', armorLight = '#4c463c';
      var gold = '#d4af37', goldDark = '#8a6d12', goldLight = '#f0d878', red = '#a8231f';

      // 胫当（小腿护具）—— 套在两条后腿下半段
      [-1, 1].forEach(function (sgn) {
        var lx = sgn * legSpread;
        ctx.save();
        var rrx = lx - 5 * s, rry = legFootY - 16 * s, rw = 10 * s, rh = 16 * s, rr = 3 * s;
        ctx.beginPath();
        ctx.moveTo(rrx + rr, rry);
        ctx.lineTo(rrx + rw - rr, rry);
        ctx.quadraticCurveTo(rrx + rw, rry, rrx + rw, rry + rr);
        ctx.lineTo(rrx + rw, rry + rh - rr);
        ctx.quadraticCurveTo(rrx + rw, rry + rh, rrx + rw - rr, rry + rh);
        ctx.lineTo(rrx + rr, rry + rh);
        ctx.quadraticCurveTo(rrx, rry + rh, rrx, rry + rh - rr);
        ctx.lineTo(rrx, rry + rr);
        ctx.quadraticCurveTo(rrx, rry, rrx + rr, rry);
        ctx.closePath();
        var sg = ctx.createLinearGradient(lx - 5 * s, 0, lx + 5 * s, 0);
        sg.addColorStop(0, armorDark); sg.addColorStop(0.5, armorLight); sg.addColorStop(1, armorDark);
        ctx.fillStyle = sg; ctx.fill();
        ctx.lineWidth = 1 * s; ctx.strokeStyle = gold; ctx.stroke();
        // 横缀
        ctx.strokeStyle = goldDark; ctx.lineWidth = 1 * s;
        for (var i = 1; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(lx - 5 * s, legFootY - 16 * s + i * 5 * s);
          ctx.lineTo(lx + 5 * s, legFootY - 16 * s + i * 5 * s);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 草摺（腰甲）—— 从胸甲下缘垂下的三段叠片
      ctx.save();
      var skirtY = rw * 0.60, lameH = 5.6 * s;
      for (var sl = 0; sl < 3; sl++) {
        var sy0 = skirtY + sl * lameH * 0.82;
        var wTop = rw * 0.88 - sl * 1.2 * s, wBot = wTop + 2.4 * s;
        ctx.beginPath();
        ctx.moveTo(-wTop, sy0);
        ctx.lineTo(wTop, sy0);
        ctx.lineTo(wBot, sy0 + lameH);
        ctx.lineTo(-wBot, sy0 + lameH);
        ctx.closePath();
        var kg = ctx.createLinearGradient(0, sy0, 0, sy0 + lameH);
        kg.addColorStop(0, armorLight); kg.addColorStop(0.45, armorMid); kg.addColorStop(1, armorDark);
        ctx.fillStyle = kg; ctx.fill();
        ctx.lineWidth = 1.1 * s; ctx.strokeStyle = sl === 0 ? gold : goldDark; ctx.stroke();
        // 叠片竖缝
        ctx.strokeStyle = 'rgba(212,175,55,.35)'; ctx.lineWidth = 0.7 * s;
        for (var k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(k * wTop * 0.34, sy0);
          ctx.lineTo(k * wBot * 0.34, sy0 + lameH);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 胴甲（胸甲）—— 覆盖躯干正面的圆角盾形板（黑漆底 + 金缘 + 金箔菱格）
      ctx.save();
      var doCy = -rh * 0.06;
      var doRx = rw * 0.90, doRy = rh * 0.62;
      ctx.beginPath();
      ctx.moveTo(0, doCy - doRy);
      ctx.quadraticCurveTo(doRx, doCy - doRy * 0.80, doRx, doCy);
      ctx.quadraticCurveTo(doRx, doCy + doRy * 0.90, doRx * 0.52, doCy + doRy * 0.97);
      ctx.quadraticCurveTo(0, doCy + doRy * 1.03, -doRx * 0.52, doCy + doRy * 0.97);
      ctx.quadraticCurveTo(-doRx, doCy + doRy * 0.90, -doRx, doCy);
      ctx.quadraticCurveTo(-doRx, doCy - doRy * 0.80, 0, doCy - doRy);
      ctx.closePath();
      var dg = ctx.createRadialGradient(-doRx * 0.25, doCy - doRy * 0.45, 1 * s, 0, doCy, doRx * 1.15);
      dg.addColorStop(0, armorLight); dg.addColorStop(0.5, armorMid); dg.addColorStop(1, armorDark);
      ctx.fillStyle = dg; ctx.fill();
      ctx.lineWidth = 1.8 * s; ctx.strokeStyle = gold; ctx.stroke();
      // 金箔菱格纹
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(212,175,55,.42)'; ctx.lineWidth = 0.7 * s;
      for (var gx = -3; gx <= 3; gx++) {
        ctx.beginPath();
        ctx.moveTo(gx * 6.5 * s, doCy - doRy * 1.1);
        ctx.lineTo(gx * 6.5 * s + doRy * 1.4, doCy + doRy * 1.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx * 6.5 * s, doCy - doRy * 1.1);
        ctx.lineTo(gx * 6.5 * s - doRy * 1.4, doCy + doRy * 1.2);
        ctx.stroke();
      }
      ctx.restore();
      // 领口金线
      ctx.beginPath();
      ctx.moveTo(-doRx * 0.55, doCy - doRy * 0.90);
      ctx.quadraticCurveTo(0, doCy - doRy * 0.62, doRx * 0.55, doCy - doRy * 0.90);
      ctx.lineWidth = 1.3 * s; ctx.strokeStyle = goldDark; ctx.stroke();
      // 胸口家纹（金环 + 朱红心）
      var embY = doCy - doRy * 0.08;
      ctx.beginPath(); ctx.arc(0, embY, 6 * s, 0, Math.PI * 2);
      ctx.fillStyle = gold; ctx.fill();
      ctx.lineWidth = 1 * s; ctx.strokeStyle = goldDark; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, embY, 3.4 * s, 0, Math.PI * 2);
      ctx.fillStyle = red; ctx.fill();
      ctx.beginPath(); ctx.arc(0, embY, 1.3 * s, 0, Math.PI * 2);
      ctx.fillStyle = goldLight; ctx.fill();
      ctx.restore();

      // 袖（肩甲）—— 罩在左右肩头、向外倾斜的三片叠甲
      [-1, 1].forEach(function (sgn) {
        ctx.save();
        ctx.translate(sgn * rw * 0.82, armY + 1 * s);
        ctx.rotate(sgn * 0.42);
        for (var p = 0; p < 3; p++) {
          var pw = 9.5 * s + p * 1.5 * s, ph = 5.6 * s, py = p * 5.2 * s;
          ctx.beginPath();
          ctx.moveTo(-pw, py);
          ctx.quadraticCurveTo(0, py + ph * 1.15, pw, py);
          ctx.quadraticCurveTo(pw * 0.72, py - ph * 0.55, 0, py - ph * 0.58);
          ctx.quadraticCurveTo(-pw * 0.72, py - ph * 0.55, -pw, py);
          ctx.closePath();
          var pg = ctx.createLinearGradient(-pw, py, pw, py + ph);
          pg.addColorStop(0, armorMid); pg.addColorStop(0.5, armorLight); pg.addColorStop(1, armorDark);
          ctx.fillStyle = pg; ctx.fill();
          ctx.lineWidth = 1 * s; ctx.strokeStyle = p === 2 ? gold : goldDark; ctx.stroke();
        }
        ctx.restore();
      });

      // 笼手（臂甲）—— 套在小臂上，上下各一道金箍
      [-1, 1].forEach(function (sgn) {
        ctx.save();
        var ax = sgn * rw * 1.0;
        var aw = 8.4 * s, ah = 13 * s, arx = ax - aw / 2, ary = armY + 4 * s, arr = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(arx + arr, ary);
        ctx.lineTo(arx + aw - arr, ary);
        ctx.quadraticCurveTo(arx + aw, ary, arx + aw, ary + arr);
        ctx.lineTo(arx + aw, ary + ah - arr);
        ctx.quadraticCurveTo(arx + aw, ary + ah, arx + aw - arr, ary + ah);
        ctx.lineTo(arx + arr, ary + ah);
        ctx.quadraticCurveTo(arx, ary + ah, arx, ary + ah - arr);
        ctx.lineTo(arx, ary + arr);
        ctx.quadraticCurveTo(arx, ary, arx + arr, ary);
        ctx.closePath();
        var ag = ctx.createLinearGradient(arx, 0, arx + aw, 0);
        ag.addColorStop(0, armorDark); ag.addColorStop(0.5, armorLight); ag.addColorStop(1, armorDark);
        ctx.fillStyle = ag; ctx.fill();
        ctx.lineWidth = 1 * s; ctx.strokeStyle = gold; ctx.stroke();
        ctx.strokeStyle = goldDark; ctx.lineWidth = 1.2 * s;
        [ary + 2.6 * s, ary + ah - 2.6 * s].forEach(function (yy) {
          ctx.beginPath(); ctx.moveTo(arx, yy); ctx.lineTo(arx + aw, yy); ctx.stroke();
        });
        ctx.restore();
      });

      // 喉轮（颈甲）—— 只护住颈根，不碰头部、不遮外饰
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-9 * s, -rh * 0.66);
      ctx.quadraticCurveTo(0, -rh * 0.60, 9 * s, -rh * 0.66);
      ctx.quadraticCurveTo(0, -rh * 0.745, -9 * s, -rh * 0.66);
      ctx.closePath();
      var ng = ctx.createLinearGradient(0, -rh * 0.745, 0, -rh * 0.60);
      ng.addColorStop(0, armorLight); ng.addColorStop(1, armorMid);
      ctx.fillStyle = ng; ctx.fill();
      ctx.lineWidth = 1.1 * s; ctx.strokeStyle = gold; ctx.stroke();
      ctx.restore();

      // ---- 武器：握在右手（右侧前腿）----
      if (wid === 'wpn_laser' || wid === 'wpn_cleaver') {
        ctx.save();
        var handX = rw * 1.0, handY = armY + 17 * s;
        ctx.translate(handX, handY);
        var ang = -1.15 + (r.swing || 0) * 2.2;
        ctx.rotate(ang);
        var L = 30 * s;
        ctx.lineCap = 'round';
        if (wid === 'wpn_laser') {
          ctx.lineWidth = 4.4 * s; ctx.strokeStyle = '#2b3036';
          ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(4 * s, 0); ctx.stroke();
          ctx.lineWidth = 3 * s; ctx.strokeStyle = '#cfd6dd';
          ctx.beginPath(); ctx.moveTo(4 * s, -3.4 * s); ctx.lineTo(4 * s, 3.4 * s); ctx.stroke();
          var lg = ctx.createLinearGradient(5 * s, 0, 5 * s + L, 0);
          lg.addColorStop(0, '#eafffb'); lg.addColorStop(0.4, '#78f0ff'); lg.addColorStop(1, '#2ea8ff');
          ctx.shadowColor = '#78f0ff'; ctx.shadowBlur = 10 * s;
          ctx.lineWidth = 5.2 * s; ctx.strokeStyle = lg;
          ctx.beginPath(); ctx.moveTo(5 * s, 0); ctx.lineTo(5 * s + L, 0); ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.lineWidth = 5 * s; ctx.strokeStyle = '#7a4a24';
          ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(6 * s, 0); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(6 * s, -3.4 * s);
          ctx.lineTo(6 * s + L * 0.86, -6.4 * s);
          ctx.quadraticCurveTo(6 * s + L, 0, 6 * s + L * 0.86, 6.4 * s);
          ctx.lineTo(6 * s, 3.4 * s);
          ctx.closePath();
          var sg = ctx.createLinearGradient(6 * s, -6.4 * s, 6 * s + L, 6.4 * s);
          sg.addColorStop(0, '#eef2f5'); sg.addColorStop(0.5, '#c3ccd4'); sg.addColorStop(1, '#8f99a2');
          ctx.fillStyle = sg; ctx.fill();
          ctx.lineWidth = 1.4 * s; ctx.strokeStyle = '#5c646c'; ctx.stroke();
        }
        ctx.restore();
      }

      // 受击闪光
      if (r.hurt > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.5, r.hurt * 0.6);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 0.95, ry * 1.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    /* 布景：迷你水池（石砌池沿 + 一汪水面 + 高光涟漪） */
    function drawPool() {
      var g = poolGeom();
      var cx = g.x * dpr, cy = g.y * dpr, rx = g.rx * dpr, ry = g.ry * dpr;
      ctx.save();
      // 池沿
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.14, ry * 1.22, 0, 0, Math.PI * 2);
      var rim = ctx.createLinearGradient(cx, cy - ry * 1.22, cx, cy + ry * 1.22);
      rim.addColorStop(0, '#9aa09a');
      rim.addColorStop(1, '#6f756f');
      ctx.fillStyle = rim;
      ctx.fill();
      ctx.lineWidth = 1.6 * dpr;
      ctx.strokeStyle = 'rgba(60,64,60,.65)';
      ctx.stroke();
      // 水面
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      var wg = ctx.createRadialGradient(cx, cy - ry * 0.4, 1 * dpr, cx, cy, rx);
      wg.addColorStop(0, '#c8ecf6');
      wg.addColorStop(0.5, '#7cc4de');
      wg.addColorStop(1, '#3d94b6');
      ctx.fillStyle = wg;
      ctx.fill();
      // 高光
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.3, cy - ry * 0.34, rx * 0.32, ry * 0.2, -0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fill();
      // 涟漪
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.6, ry * 0.58, 0, 0, Math.PI * 2);
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.stroke();
      ctx.restore();
    }

    /* 泡水时盖在乌龟身上的那层水面（半透明 + 流动反光） */
    function drawPoolWater() {
      var g = poolGeom();
      var cx = g.x * dpr, cy = g.y * dpr, rx = g.rx * dpr, ry = g.ry * dpr;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(118,198,224,.42)';
      ctx.fill();
      var t = performance.now() / 620;
      ctx.lineWidth = 1.4 * dpr;
      ctx.strokeStyle = 'rgba(255,255,255,.45)';
      for (var i = 0; i < 3; i++) {
        var yy = cy - ry * 0.3 + i * ry * 0.38;
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.68, yy);
        ctx.quadraticCurveTo(cx, yy + Math.sin(t + i * 1.7) * 2.2 * dpr, cx + rx * 0.68, yy);
        ctx.stroke();
      }
      // 水面亮的反光点
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.28, cy - ry * 0.32, rx * 0.26, ry * 0.16, -0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.fill();
      ctx.restore();
    }

    /* 布景：右上角的晒背灯，向下打出一束微黄的光 */
    function drawLamp() {
      var lx = (W - 30) * dpr, ly = 20 * dpr;
      ctx.save();
      // 光锥（微黄、越往下越淡）
      var spread = Math.max(W * 0.42, 96);
      var cone = ctx.createLinearGradient(lx, ly, lx - spread * 0.2 * dpr, H * dpr);
      cone.addColorStop(0, 'rgba(255,228,150,.34)');
      cone.addColorStop(0.45, 'rgba(255,228,150,.16)');
      cone.addColorStop(1, 'rgba(255,228,150,.03)');
      ctx.beginPath();
      ctx.moveTo(lx - 4 * dpr, ly + 2 * dpr);
      ctx.lineTo(lx - spread * dpr, H * dpr);
      ctx.lineTo(lx + spread * 0.34 * dpr, H * dpr);
      ctx.closePath();
      ctx.fillStyle = cone;
      ctx.fill();
      // 吊线
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, ly - 13 * dpr);
      ctx.lineWidth = 1.8 * dpr;
      ctx.strokeStyle = '#3a4149';
      ctx.stroke();
      // 灯罩
      ctx.beginPath();
      ctx.moveTo(lx - 11 * dpr, ly - 13 * dpr);
      ctx.lineTo(lx + 11 * dpr, ly - 13 * dpr);
      ctx.lineTo(lx + 6.5 * dpr, ly + 1 * dpr);
      ctx.lineTo(lx - 6.5 * dpr, ly + 1 * dpr);
      ctx.closePath();
      var sh = ctx.createLinearGradient(lx, ly - 13 * dpr, lx, ly + 1 * dpr);
      sh.addColorStop(0, '#697381');
      sh.addColorStop(1, '#3f4650');
      ctx.fillStyle = sh;
      ctx.fill();
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = '#2b3037';
      ctx.stroke();
      // 灯泡 + 光晕
      ctx.beginPath();
      ctx.arc(lx, ly + 3 * dpr, 5.5 * dpr, 0, Math.PI * 2);
      var glow = ctx.createRadialGradient(lx, ly + 3 * dpr, 0, lx, ly + 3 * dpr, 8 * dpr);
      glow.addColorStop(0, 'rgba(255,244,196,.95)');
      glow.addColorStop(0.4, 'rgba(255,228,150,.55)');
      glow.addColorStop(1, 'rgba(255,228,150,0)');
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly + 3 * dpr, 2.6 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#fff6d8';
      ctx.fill();
      ctx.restore();
    }

    function drawTurtle(r) {
      var prevCol = col;
      col = SPECIES[r.species] || prevCol;   // 对战时对手可能是别的品种，临时换配色
      var side = r.side;
      var s = dpr * bodyScale(r);     // 体型缩放：随等级成长

      // 朝向 → 视角：头朝左右时呈侧身，头朝上下时呈俯视
      var ca = Math.cos(r.angle);
      var flip = ca < 0 ? -1 : 1;
      var eff = flip < 0 ? Math.PI - r.angle : r.angle;
      eff = Math.atan2(Math.sin(eff), Math.cos(eff));

      ctx.save();
      ctx.translate(r.x * dpr, r.y * dpr);

      // 开心蹦高：身体上移 + 挤压拉伸
      var bounceY = 0, squashX = 1, squashY = 1;
      if (r.bounce > 0) {
        var b = r.bounce; // 0.6 → 0
        var t = 1 - b / 0.6;
        bounceY = -Math.sin(t * Math.PI) * 22 * dpr * bodyScale(r);
        if (t < 0.15) { squashX = 1.15; squashY = 0.85; }
        else if (t > 0.85) { squashX = 1.12; squashY = 0.88; }
        else { squashX = 0.92; squashY = 1.08; }
      }
      ctx.translate(0, bounceY);

      // 转向侧倾
      ctx.rotate(r.turnRate * 0.15);

      // 呼吸缩放
      var breathe = 1 + Math.sin(r.breathe) * 0.02;
      ctx.scale(breathe * squashX, breathe * squashY);

      // 侧身时水平镜像；俯视旋转只在非侧身时保留
      ctx.scale(flip, 1);
      ctx.rotate(eff * (1 - side));

      // 出手瞬间整体向前一探（挥砍 / 扑咬的冲劲）
      if (r.swing > 0) ctx.translate(r.swing * 6 * s, 0);

      // 走路身体起伏
      if (r.state === 'walk') {
        var bob = Math.sin(r.walkPhase * 2) * 1.6 * s;
        ctx.translate(0, bob);
      }

      // 武器 ID（自己有武器就画自己的；对战时各自画各自的）
      var wid = r.isOpp ? (r.weaponId || '')
                        : ((petState && petState.pet && petState.pet.weapon) || '');
      // 防具 ID：穿上武士甲胄 → 直立 + 全身盔甲
      var armId = r.isOpp ? (r.armorId || '')
                         : ((petState && petState.pet && petState.pet.armor) || '');
      if (armId === 'arm_samurai') {
        drawStandingArmor(r, s, wid);
        ctx.restore();
        col = prevCol;
        return;
      }

      // 尾巴
      drawTail(r, s);

      // 腿：俯视时伸向壳体两侧；侧身时从壳底（腹甲侧）向下蹬地
      var legBX = col.rx * 0.5 * s;
      var legBYTop = col.ry * 0.78 * s;
      var legBYSide = col.ry * 0.24 * s;   // 与侧身壳底 (ryB) 对齐
      var reachTop = 9 * s, reachSide = 13 * s;
      var ph = r.walkPhase;

      var legs = [
        { front: 1, top: 1, phase: ph + Math.PI },
        { front: 1, top: -1, phase: ph },
        { front: -1, top: 1, phase: ph },
        { front: -1, top: -1, phase: ph + Math.PI },
      ];
      legs.forEach(function (L) {
        L.far = side > 0.5 && L.top < 0;                 // 侧身时远侧腿退后半步、压暗
        L.ax = L.front * legBX - (L.far ? 5 * s : 0);
        L.ay = L.top * legBYTop * (1 - side) + legBYSide * side;
        L.footY = (L.top * (legBYTop + reachTop)) * (1 - side) + (legBYSide + reachSide) * side;
      });
      // 远的腿先画，保证前后层次
      legs.sort(function (a, b) { return (b.far ? 1 : 0) - (a.far ? 1 : 0); });
      legs.forEach(function (L) { drawLeg(L.ax, L.ay, L.footY, L.phase, s, L.far); });

      // 龟壳
      drawShell(s, side);

      // 头 + 脖子
      drawHead(r, s, side);

      // 武器：握在一只前脚上（自己有武器就画自己的；对战时各自画各自的）
      drawWeapon(r, s, side, wid);

      // 受击闪光（对战时被揍一下闪红）
      if (r.hurt > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.5, r.hurt * 0.6);
        ctx.beginPath();
        ctx.ellipse(col.rx * 0.1 * s, 0, col.rx * 0.95 * s, col.ry * 0.95 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      col = prevCol;
    }

    /* ---------- 对战：双龟靠近 → 按服务端时间线互相攻击 ---------- */
    function pushFloater(x, y, text, color) {
      roaming.floaters.push({ x: x, y: y, life: 1.15, text: text, color: color });
    }

    function drawShadow(a) {
      var aCol = SPECIES[a.species] || col;
      var bs = bodyScale(a);
      var shadowScale = a.bounce > 0 ? (1 - (1 - a.bounce / 0.6) * 0.4) : 1;
      var shadowAlpha = a.bounce > 0 ? 0.18 * shadowScale : 0.2;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(a.x * dpr, (a.y + aCol.ry * bs * 0.62) * dpr,
        aCol.rx * bs * 0.66 * dpr * shadowScale, aCol.ry * bs * 0.3 * dpr * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,' + shadowAlpha + ')';
      ctx.fill();
      ctx.restore();
    }

    function moveActor(a, spot, dt, speed) {
      var dx = spot.x - a.x, dy = spot.y - a.y;
      var dist = Math.hypot(dx, dy);
      if (dist < 3) {
        a.x = spot.x; a.y = spot.y;
        a.state = 'idle'; a.walkPhase *= 0.9; a.turnRate *= 0.8;
        a.headExtTarget = 0.35;
        return true;
      }
      var ta = Math.atan2(dy, dx);
      var diff = ta - a.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      var turn = Math.max(-3.2 * dt, Math.min(3.2 * dt, diff));
      a.angle += turn; a.turnRate = turn / dt;
      var step = Math.min(dist, speed * dt);
      a.x += Math.cos(a.angle) * step;
      a.y += Math.sin(a.angle) * step;
      a.walkPhase += dt * (9 + speed * 0.05);
      a.state = 'walk'; a.headExtTarget = 0.5;
      return false;
    }

    function keepFacing(a, other, dt) {
      var ta = Math.atan2(other.y - a.y, other.x - a.x);
      var diff = ta - a.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      a.angle += Math.max(-2.5 * dt, Math.min(2.5 * dt, diff));
    }

    function decayActor(a, dt) {
      if (a.swing > 0) a.swing = Math.max(0, a.swing - dt * 3.0);
      if (a.hurt > 0) a.hurt = Math.max(0, a.hurt - dt * 2.6);
    }

    function applyBattleEvent(ev) {
      var b = roaming.battle, foe = b.foe;
      if (ev.who === 'me') {
        roaming.swing = 1;
        foe.hurt = 1;
        b.foeArmour = ev.opp_armor;
        b.foeHp = ev.opp_hp;
        var armDmg = ev.armor_dmg || 0, hpDmg = ev.hp_dmg || 0;
        if (armDmg > 0) pushFloater(foe.x, foe.y - 40 * bodyScale(foe), '🛡-' + armDmg, '#42a5f5');
        if (hpDmg > 0) pushFloater(foe.x, foe.y - 22 * bodyScale(foe), '-' + hpDmg, '#ff5252');
      } else {
        foe.swing = 1;
        roaming.hurt = 1;
        b.meArmour = ev.me_armor;
        b.meHp = ev.me_hp;
        var aDmg = ev.armor_dmg || 0, hDmg = ev.hp_dmg || 0;
        if (aDmg > 0) pushFloater(roaming.x, roaming.y - 40 * bodyScale(roaming), '🛡-' + aDmg, '#42a5f5');
        if (hDmg > 0) pushFloater(roaming.x, roaming.y - 22 * bodyScale(roaming), '-' + hDmg, '#ff5252');
      }
    }

    function updateBattle(dt) {
      var b = roaming.battle, foe = b.foe;
      foe.breathe += dt * 2.2;
      foe.tailWag += dt * 4;
      if (foe.bounce > 0) foe.bounce = Math.max(0, foe.bounce - dt);
      foe.side += (Math.abs(Math.cos(foe.angle)) - foe.side) * Math.min(1, dt * 4);
      foe.headExt += (foe.headExtTarget - foe.headExt) * Math.min(1, dt * 3);

      if (b.phase === 'approach') {
        var meArr = moveActor(roaming, b.meSpot, dt, 78);
        var foeArr = moveActor(foe, b.foeSpot, dt, 78);
        b.meHp = b.meMax; b.foeHp = b.foeMax;
        if (meArr && foeArr) { b.phase = 'fight'; b.t = 0; b.idx = 0; }
      } else if (b.phase === 'fight') {
        b.t += dt;
        while (b.idx < b.timeline.length && b.timeline[b.idx].t <= b.t) {
          applyBattleEvent(b.timeline[b.idx]); b.idx++;
        }
        keepFacing(roaming, foe, dt);
        keepFacing(foe, roaming, dt);
        if (b.idx >= b.timeline.length) {
          b.phase = 'done'; b.doneT = 0;
          roaming.state = 'idle'; foe.state = 'walk';
          if (b.winner === 'me') roaming.bounce = 0.6;
        }
      } else {   // done：对手退场
        b.doneT += dt;
        keepFacing(roaming, foe, dt);
        if (!b.resultShown && b.doneT > 0.5) { b.resultShown = true; showBattleResult(b); }
        if (b.doneT > 2.2) {
          foe.x += 90 * dt;
          foe.walkPhase += dt * 10;
          if (foe.x > W + 60) roaming.battle = null;
        }
      }
      decayActor(roaming, dt);
      decayActor(foe, dt);
    }

    /* 对战 HUD：双方生命值 / 武力值 */
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function hpBar(x, y, w, h, pct, c1, c2) {
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      roundRect(x, y, w, h, h / 2); ctx.fill();
      var fw = Math.max(0, Math.min(1, pct || 0)) * w;
      if (fw > 1) {
        var g = ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g;
        roundRect(x, y, fw, h, h / 2); ctx.fill();
      }
    }
    function drawFighterBar(name, hp, max, pow, armor, armorMax, x, y, w, h, c1, c2) {
      ctx.save();
      ctx.fillStyle = 'rgba(20,26,32,.66)';
      roundRect(x, y, w, h, 8 * dpr); ctx.fill();
      ctx.font = 'bold ' + (10.5 * dpr) + 'px system-ui,-apple-system,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.fillText(name, x + 8 * dpr, y + 14 * dpr);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd54f';
      var statTxt = '❤ ' + Math.max(0, Math.round(hp));
      if (armorMax > 0) statTxt += '  🛡 ' + Math.max(0, Math.round(armor));
      statTxt += '  ⚔ ' + pow;
      ctx.fillText(statTxt, x + w - 8 * dpr, y + 14 * dpr);
      // 护甲条（蓝色）在上，血量条在下
      var barY = y + 20 * dpr;
      var barH = 7 * dpr;
      if (armorMax > 0) {
        hpBar(x + 8 * dpr, barY, w - 16 * dpr, barH, armorMax ? armor / armorMax : 0, '#1565c0', '#64b5f6');
        barY += barH + 2 * dpr;
      }
      hpBar(x + 8 * dpr, barY, w - 16 * dpr, barH, max ? hp / max : 0, c1, c2);
      ctx.restore();
    }
    function drawBattleHud() {
      var b = roaming.battle;
      var pad = 8 * dpr, h = (b.meArmourMax > 0 || b.foeArmourMax > 0) ? 48 * dpr : 34 * dpr, top = 6 * dpr;
      var w = (W * dpr - pad * 3) / 2;
      var meName = (petState && petState.pet && petState.pet.name) || '我方';
      drawFighterBar(meName, b.meHp, b.meMax, b.mePow, b.meArmour, b.meArmourMax, pad, top, w, h, '#2e7d32', '#8bc34a');
      drawFighterBar(b.foeName || '对手', b.foeHp, b.foeMax, b.foePow, b.foeArmour, b.foeArmourMax,
        pad * 2 + w, top, w, h, '#b71c1c', '#ff7b72');
    }

    /* 开始一场对战：设置双方站位并进入动画状态机 */
    function startBattle(r) {
      if (!r || !r.opp) return;
      // 中断进食 / 泡水，进入对战
      roaming.state = 'walk';
      roaming.eatReady = false; roaming.food = null;
      roaming.hurt = 0; roaming.swing = 0;

      var meLevel = (petState && petState.pet && petState.pet.level) || 1;
      var meCol = SPECIES[(petState && petState.pet && petState.pet.species) || 'cao'] || SPECIES.cao;
      var foeCol = SPECIES[r.opp.species] || SPECIES.cao;
      var y = H * 0.52, mid = W * 0.5;
      var meHalf = meCol.rx * bodyScale(roaming);
      var foeHalf = foeCol.rx * Math.min(1, 0.5 + 0.05 * ((r.opp.level || 1) - 1));
      var gap = meHalf + foeHalf + 16;
      var meSpot = { x: Math.max(34, mid - gap / 2), y: y };
      var foeSpot = { x: Math.min(W - 34, mid + gap / 2), y: y };

      var foe = {
        x: W + 40, y: y, angle: Math.PI, side: 0, turnRate: 0,
        breathe: Math.random() * 6, tailWag: 0, state: 'walk', walkPhase: 0,
        bounce: 0, headExt: 0, headExtTarget: 0.5, headTurn: 0,
        mouthOpen: 0, headPeck: 0, swing: 0, hurt: 0,
        species: r.opp.species, level: r.opp.level || 1, isOpp: true,
        weaponId: r.opp.weapon || '', armorId: r.opp.armor || '',
        accessories: r.opp.accessories || [],
        name: r.opp.name, owner: r.opp.owner,
      };
      var meArmourMax = (r.me && r.me.armor_max) || 0;
      var foeArmourMax = r.opp.armor_max || 0;
      roaming.battle = {
        foe: foe, meSpot: meSpot, foeSpot: foeSpot, phase: 'approach',
        timeline: r.timeline || [], idx: 0, t: 0, doneT: 0, resultShown: false,
        meMax: (r.me && r.me.hp) || 1, foeMax: (r.opp.hp) || 1,
        meHp: (r.me && r.me.hp) || 1, foeHp: r.opp.hp,
        meArmour: meArmourMax, foeArmour: foeArmourMax,
        meArmourMax: meArmourMax, foeArmourMax: foeArmourMax,
        mePow: (r.me && r.me.power) || 0, foePow: r.opp.power,
        foeName: r.opp.name, foeOwner: r.opp.owner,
        winner: r.winner, rewards: r.rewards,
        pkLeft: r.pk_left, pkLimit: r.pk_limit,
      };
      roaming.angle = 0;   // 先面朝右，走位时自动转向对手
    }
    roaming.startBattle = startBattle;

    function frame(now) {
      var dt = Math.min(0.05, (now - roaming.last) / 1000);
      roaming.last = now;
      var px = roaming.x, py = roaming.y;   // 记下本帧起始位置，算乌龟实际速度
      roaming.breathe += dt * 2.2;
      roaming.tailWag += dt * 4;
      if (roaming.bounce > 0) roaming.bounce = Math.max(0, roaming.bounce - dt);

      // 踢球 +1 飘字：上浮并淡出
      for (var fi = roaming.floaters.length - 1; fi >= 0; fi--) {
        var ft = roaming.floaters[fi];
        ft.life -= dt * 1.5;
        ft.y -= dt * 24;
        if (ft.life <= 0) roaming.floaters.splice(fi, 1);
      }

      // 视角：由朝向决定。头朝左右 → 侧身视角；头朝上下 → 俯视视角
      var sideTarget = Math.abs(Math.cos(roaming.angle));
      roaming.side += (sideTarget - roaming.side) * Math.min(1, dt * 4);
      roaming.headExt += (roaming.headExtTarget - roaming.headExt) * Math.min(1, dt * 3);

      var prevAngle = roaming.angle;

      // 非进食状态嘴自然闭合
      if (roaming.state !== 'eat') roaming.mouthOpen += (0 - roaming.mouthOpen) * Math.min(1, dt * 8);

      if (roaming.battle) {
        updateBattle(dt);
      } else if (roaming.state === 'walk') {
        var dx = roaming.tx - roaming.x, dy = roaming.ty - roaming.y;
        var dist = Math.hypot(dx, dy);
        var arrive = roaming.eatReady ? headReachDist() + 8 * bodyScale() : 5;   // 停在盆前，让头探到盆边
        if (dist < arrive) {
          if (roaming.eatReady) {
            roaming.eatReady = false;
            roaming.state = 'eat';
            roaming.eatTimer = roaming.eatDuration;
            roaming.walkSpeed = 0;
            roaming.turnRate = 0;
          } else if (roaming.headingPool) {
            // 爬到水池边 → 进池泡一会儿
            roaming.headingPool = false;
            roaming.state = 'soak';
            roaming.soakTimer = 4 + Math.random() * 4;
            roaming.walkSpeed = 0;
            roaming.turnRate = 0;
            roaming.headExtTarget = 0.15;
          } else {
            roaming.state = 'idle';
            roaming.timer = 0.8 + Math.random() * 2.5;
            roaming.walkSpeed *= 0.4;
            roaming.headTurnTarget = (Math.random() - 0.5) * 0.6;
          }
        } else {
          var targetAngle = Math.atan2(dy, dx);
          var diff = targetAngle - roaming.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          // 平滑转向，角速度用于侧倾
          var maxTurn = 3.5 * dt;
          var turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
          roaming.angle += turn;
          roaming.turnRate = turn / dt; // 近似角速度
          // 速度随转向平滑变化
          var speed = 24 + Math.random() * 12;
          roaming.walkSpeed += (speed - roaming.walkSpeed) * Math.min(1, dt * 3);
          var step = Math.min(dist, roaming.walkSpeed * dt);
          roaming.x += Math.cos(roaming.angle) * step;
          roaming.y += Math.sin(roaming.angle) * step;
          // 步态频率随速度
          roaming.walkPhase += dt * (8 + roaming.walkSpeed * 0.06);
          // 走路时头微微前探
          roaming.headTurn += (Math.sin(roaming.walkPhase) * 0.15 - roaming.headTurn) * dt * 4;
        }
      } else if (roaming.state === 'eat') {
        // 面向食盆，伸头，嘴巴一张一合地吃
        if (roaming.food) {
          var ta = Math.atan2(roaming.food.y - roaming.y, roaming.food.x - roaming.x);
          var ed = ta - roaming.angle;
          while (ed > Math.PI) ed -= Math.PI * 2;
          while (ed < -Math.PI) ed += Math.PI * 2;
          roaming.angle += Math.max(-5 * dt, Math.min(5 * dt, ed));
        }
        roaming.turnRate *= 0.8;
        roaming.walkPhase *= 0.8;
        // 头朝食盆方向完全伸出，并随咀嚼一伸一缩地啄食
        roaming.headExtTarget = 1.0;
        var chew = Math.sin((roaming.eatDuration - roaming.eatTimer) * 11);
        roaming.headPeck = chew * 6;                       // 前后啄食幅度(px)
        roaming.eatTimer -= dt;
        roaming.mouthOpen = 0.5 + 0.5 * chew;             // 咀嚼：嘴一张一合
        if (roaming.eatTimer <= 0) {
          roaming.eatTimer = 0;
          roaming.mouthOpen = 0;
          roaming.headPeck = 0;
          roaming.food = null;
          roaming.state = 'idle';
          roaming.timer = 0.8 + Math.random();
          roaming.headExtTarget = 0.2;
          var cb = roaming.onFeedDone;
          roaming.onFeedDone = null;
          if (cb) cb();
        }
      } else if (roaming.state === 'soak') {
        // 泡在水池里：安静待着，偶尔动动头
        roaming.turnRate *= 0.85;
        roaming.walkPhase *= 0.9;
        roaming.headTurn += (roaming.headTurnTarget - roaming.headTurn) * dt * 2;
        roaming.headExtTarget = 0.2;
        if (Math.random() < dt * 0.4) roaming.headTurnTarget = (Math.random() - 0.5) * 0.6;
        roaming.soakTimer -= dt;
        if (roaming.soakTimer <= 0) pickTarget();
      } else {
        roaming.timer -= dt;
        roaming.walkPhase *= 0.9;
        roaming.turnRate *= 0.85;
        roaming.headTurn += (roaming.headTurnTarget - roaming.headTurn) * dt * 2.5;
        if (Math.random() < dt * 0.35) {
          roaming.headTurnTarget = (Math.random() - 0.5) * 0.9;
          roaming.headExtTarget = -0.25 + Math.random() * 0.7;   // 偶尔缩头/伸头
        }
        if (roaming.timer <= 0) pickTarget();
      }

      // 本帧乌龟的实际速度（用来决定踢球力度）
      roaming.vx = dt > 0 ? (roaming.x - px) / dt : 0;
      roaming.vy = dt > 0 ? (roaming.y - py) / dt : 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 布景：水池（画在乌龟下方，乌龟会爬进去）
      var poolOn = hasDecor('decor_pool');
      if (poolOn) drawPool();

      // 地面投影（蹦高时缩小变淡；随品种体型变化）
      drawShadow(roaming);
      if (roaming.battle) drawShadow(roaming.battle.foe);

      // 地上的龟粮（画在乌龟下方）
      if (roaming.food) drawFood(roaming.food);

      // 逗龟小球：滚动 / 被乌龟踢飞 / 撞边框反弹（画在乌龟下方；对战时冻结）
      if (!roaming.battle) { updateBall(dt); if (roaming.ball) drawBall(roaming.ball); }
      drawFloaters();

      drawTurtle(roaming);
      if (roaming.battle) drawTurtle(roaming.battle.foe);

      // 泡水时，水面盖在乌龟下半身之上，呈半没入水中的样子
      if (poolOn && roaming.state === 'soak') drawPoolWater();
      // 晒背灯：灯罩 + 微黄光锥，覆盖在整个布景之上
      if (hasDecor('decor_lamp')) drawLamp();

      // 对战 HUD：双方生命值 / 武力值
      if (roaming.battle) drawBattleHud();

      roaming.raf = requestAnimationFrame(frame);
    }
    // 之前已经放出过逗龟小球 → 刷新后小球仍留在场地上
    if (p.ball_out) roaming.spawnBall();

    roaming.raf = requestAnimationFrame(frame);
  }

  /* ---------------- 商店页 ---------------- */
  function renderShop() {
    var root = document.getElementById('shop-root');
    api('/api/shop/items').then(function (data) {
      if (!data) return;
      var badge = document.getElementById('shop-stars');
      if (badge) badge.textContent = '⭐ ' + data.stars;
      var labels = { food: '食物', toy: '玩具', decor: '装饰', accessory: '外饰', weapon: '武器', armor: '防具' };
      var html = '';
      ['food', 'toy', 'decor', 'accessory', 'weapon', 'armor'].forEach(function (cat) {
        var list = data.catalog.filter(function (it) { return it.category === cat; });
        if (!list.length) return;
        html += '<h6 class="mt-4 mb-3">' + labels[cat] + '</h6><div class="row">';
        list.forEach(function (it) {
          // 装饰类只能拥有一件：已拥有后不再显示购买按钮
          var soldOut = it.unique && it.owned > 0;
          var buyBtn = soldOut
            ? '<button class="btn btn-sm btn-secondary w-100 mt-1" disabled>已拥有</button>'
            : '<button class="btn btn-sm btn-warning buy w-100 mt-1" data-id="' + it.id + '"' +
              (data.stars < it.price ? ' disabled' : '') + '>购买</button>';
          var ownedTxt = it.owned > 0
            ? (it.unique ? '已拥有' : '已有 ' + it.owned)
            : '';
          var sellBtn = it.owned > 0
            ? '<button class="btn btn-sm btn-outline-secondary sell w-100 mt-1" data-id="' + it.id +
              '">出售 ⭐' + it.refund + '</button>'
            : '';
          html += '<div class="col-6 col-md-4 col-lg-3 mb-2"><div class="card h-100"><div class="card-body text-center d-flex flex-column p-2">' +
            '<div style="font-size:1.45rem;line-height:1.1;">' + it.icon + '</div>' +
            '<div class="fw-bold mt-1" style="font-size:.86rem;">' + it.name + '</div>' +
            '<div class="text-muted" style="font-size:.72rem;line-height:1.25;">' + it.desc + '</div>' +
            '<div class="mt-auto pt-2"><div class="fw-bold text-warning" style="font-size:.82rem;">⭐ ' + it.price + '</div>' +
            buyBtn + sellBtn +
            (ownedTxt ? '<div class="text-muted mt-1" style="font-size:.7rem;">' + ownedTxt + '</div>' : '') +
            '</div></div></div></div>';
        });
        html += '</div>';
      });
      html += '<div class="alert alert-info mt-4 mb-0 small">星星来自 K8s 学习中心答题（每答对一题得星，通关章节约还有额外奖励）。</div>';
      root.innerHTML = html;
      root.querySelectorAll('.buy').forEach(function (b) {
        b.addEventListener('click', function () {
          api('/api/shop/buy', 'POST', { item_id: b.dataset.id, qty: 1 }).then(function (r) {
            if (!r) return;
            if (r.success) { toast('购买成功！'); renderShop(); } else { toast(r.error || '购买失败', 'error'); }
          });
        });
      });
      root.querySelectorAll('.sell').forEach(function (b) {
        b.addEventListener('click', function () {
          var it = data.catalog.filter(function (x) { return x.id === b.dataset.id; })[0];
          var name = it ? (it.icon + ' ' + it.name) : '该商品';
          confirmSell(name, it ? it.refund : 0, function () {
            api('/api/shop/sell', 'POST', { item_id: b.dataset.id }).then(function (r) {
              if (!r) return;
              if (r.success) { toast('已出售，回收 ⭐ ' + r.refund); renderShop(); }
              else { toast(r.error || '出售失败', 'error'); }
            });
          });
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('pet-root')) renderPet();
    if (document.getElementById('shop-root')) renderShop();
  });
})();
