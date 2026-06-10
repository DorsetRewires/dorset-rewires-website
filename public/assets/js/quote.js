(function () {
  'use strict';

  // Price book fallback. Live values are fetched from /ops-hq/data/pricing.json below.
  var PRICES = {
    socket_price: 90, light_point_price: 90, fused_spur_price: 90,
    one_way_switch_price: 0, two_way_switch_price: 40,
    extractor_fan_price: 160, data_point_price: 80, smoke_detector_price: 110,
    consumer_unit_price: 625,
    radial_16amp_base_price: 120, radial_16amp_per_extra_metre_price: 2,
    radial_32amp_base_price: 190, radial_32amp_per_extra_metre_price: 4,
    led_strip_continuous_base_first_5_metres_price: 190,
    led_strip_continuous_per_extra_metre_price: 30,
    led_strip_section_first_section_price: 160,
    led_strip_section_additional_section_price: 90,
    led_strip_section_per_extra_metre_price: 40,
    shaver_socket_price: 90, flip_lid_floor_socket_price: 110, five_amp_socket_price: 90,
    external_ip_fitting_price: 90, wired_ring_doorbell_cam_price: 180,
    tv_aerial_price: 220, tv_point_price: 90, sky_point_price: 90, telephone_point_price: 90,
    garage_consumer_unit_price: 180,
    usb_socket_price: 100, water_bonding_price: 90, gas_bonding_price: 90
  };

  // Load live prices and re-render if calculator is already running
  fetch('/data/pricing.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j) return;
      var pp = j.rewire_per_point || {};
      var pw = j.rewire_whole_property || {};
      if (pp.socket != null) PRICES.socket_price = pp.socket;
      if (pp.light != null) PRICES.light_point_price = pp.light;
      if (pp.fused_spur != null) PRICES.fused_spur_price = pp.fused_spur;
      if (pp.one_way_switch != null) PRICES.one_way_switch_price = pp.one_way_switch;
      if (pp.two_way_switch != null) PRICES.two_way_switch_price = pp.two_way_switch;
      if (pp.extractor_fan != null) PRICES.extractor_fan_price = pp.extractor_fan;
      if (pp.data_point != null) PRICES.data_point_price = pp.data_point;
      if (pp.mains_smoke_detector != null) PRICES.smoke_detector_price = pp.mains_smoke_detector;
      if (pw.rcbo_consumer_unit_12way_with_surge != null) PRICES.consumer_unit_price = pw.rcbo_consumer_unit_12way_with_surge;
      if (pw.radial_16a_base_first_20m != null) PRICES.radial_16amp_base_price = pw.radial_16a_base_first_20m;
      if (pw.radial_16a_per_extra_metre != null) PRICES.radial_16amp_per_extra_metre_price = pw.radial_16a_per_extra_metre;
      if (pw.radial_32a_base_first_20m != null) PRICES.radial_32amp_base_price = pw.radial_32a_base_first_20m;
      if (pw.radial_32a_per_extra_metre != null) PRICES.radial_32amp_per_extra_metre_price = pw.radial_32a_per_extra_metre;
      if (pp.led_strip_continuous_base_first_5_metres != null) PRICES.led_strip_continuous_base_first_5_metres_price = pp.led_strip_continuous_base_first_5_metres;
      if (pp.led_strip_continuous_per_extra_metre != null) PRICES.led_strip_continuous_per_extra_metre_price = pp.led_strip_continuous_per_extra_metre;
      if (pp.led_strip_section_first_section != null) PRICES.led_strip_section_first_section_price = pp.led_strip_section_first_section;
      if (pp.led_strip_section_additional_section != null) PRICES.led_strip_section_additional_section_price = pp.led_strip_section_additional_section;
      if (pp.led_strip_section_per_extra_metre != null) PRICES.led_strip_section_per_extra_metre_price = pp.led_strip_section_per_extra_metre;
      if (pp.shaver_socket != null) PRICES.shaver_socket_price = pp.shaver_socket;
      if (pp.flip_lid_floor_socket != null) PRICES.flip_lid_floor_socket_price = pp.flip_lid_floor_socket;
      if (pp.five_amp_socket != null) PRICES.five_amp_socket_price = pp.five_amp_socket;
      if (pp.external_ip_fitting != null) PRICES.external_ip_fitting_price = pp.external_ip_fitting;
      if (pp.wired_ring_doorbell_cam != null) PRICES.wired_ring_doorbell_cam_price = pp.wired_ring_doorbell_cam;
      var av = j.av_points || {};
      if (av.tv_aerial != null) PRICES.tv_aerial_price = av.tv_aerial;
      if (av.tv_point != null) PRICES.tv_point_price = av.tv_point;
      if (av.sky_point != null) PRICES.sky_point_price = av.sky_point;
      if (av.telephone_point != null) PRICES.telephone_point_price = av.telephone_point;
      if (pw.garage_consumer_unit_4way_rcbo != null) PRICES.garage_consumer_unit_price = pw.garage_consumer_unit_4way_rcbo;
      if (pp.usb_socket != null) PRICES.usb_socket_price = pp.usb_socket;
      if (pw.water_bonding != null) PRICES.water_bonding_price = pw.water_bonding;
      if (pw.gas_bonding != null) PRICES.gas_bonding_price = pw.gas_bonding;
      if (typeof recalculateAndUpdateDisplay === 'function') recalculateAndUpdateDisplay();
    })
    .catch(function () { /* offline or missing - keep fallbacks */ });

  // Room presets only carry the room's name. All item counts start at 0 - Pete
  // (or the customer) fills them in per actual job. Radial circuits are tracked
  // per-room so each room owns its own dedicated circuits (e.g. kitchen owns
  // hob/oven, garage owns EV charger).
  var EMPTY_ROOM_COUNTS = {
    sockets: 0, lights: 0, fused_spurs: 0, one_way_switches: 0, two_way_switches: 0, extractor_fans: 0, data_points: 0,
    shaver_sockets: 0, usb_sockets: 0, flip_lid_floor_sockets: 0, five_amp_sockets: 0, external_ip_fittings: 0, tv_points: 0, sky_points: 0, telephone_points: 0,
    led_strip_continuous_count: 0, led_strip_continuous_total_metres: 0,
    led_strip_section_count: 0, led_strip_section_total_metres: 0,
    radial_16amp_count: 0, radial_16amp_extra_metres: 0, radial_32amp_count: 0, radial_32amp_extra_metres: 0
  };
  function buildEmptyRoomPreset(name) { return Object.assign({ name: name }, EMPTY_ROOM_COUNTS); }
  var PRESETS = {
    kitchen:  buildEmptyRoomPreset('Kitchen'),
    living:   buildEmptyRoomPreset('Living room'),
    bedroom:  buildEmptyRoomPreset('Bedroom'),
    bathroom: buildEmptyRoomPreset('Bathroom'),
    hallway:  buildEmptyRoomPreset('Hallway / landing'),
    utility:  buildEmptyRoomPreset('Utility'),
    garage:   buildEmptyRoomPreset('Garage / outbuilding'),
    blank:    buildEmptyRoomPreset('New room')
  };

  // Each item has an ADHD-friendly question label and a one-line plain-English
  // description (the "typical" hint). Same shape as radials below.
  var ROOM_ITEMS = [
    { key: 'sockets',          label: 'How many sockets in this room?',          typical: 'Single or double, £90 each. Count each wall plate (not each plug-in point).' },
    { key: 'lights',           label: 'How many light fittings?',                typical: '£90 each. Pendants, downlights, wall lights, outdoor lights all count.' },
    { key: 'fused_spurs',      label: 'How many fused spurs?',                   typical: '£90 each. Permanently wired stuff: boiler, towel rail, cooker hood, garage door opener.' },
    { key: 'one_way_switches', label: 'How many normal (1-way) light switches?', typical: 'Included free with the lights. One press on, one press off.' },
    { key: 'two_way_switches', label: 'How many 2-way switches?',                typical: '£40 each. Switches at both ends of a corridor, stairs or large room.' },
    { key: 'extractor_fans',   label: 'How many extractor fans?',                typical: '£160 each. Timer or non-timer. Bathrooms, en-suites, utility.' },
    { key: 'data_points',      label: 'How many data points?',                   typical: '£80 each. Wired internet sockets (CAT6). One per desk, TV, smart device.' }
  ];

  var state = {
    rooms: [],
    consumer_unit_count: 0,
    smoke_detector_count: 0,
    tv_aerial_count: 0,
    wired_ring_doorbell_count: 0,
    garage_consumer_unit_count: 0,
    water_bonding_count: 0,
    gas_bonding_count: 0
  };
  var nextRoomId = 1;

  var roomsList = document.getElementById('roomsList');
  var csTotal = document.getElementById('csTotal');
  var csLines = document.getElementById('csLines');
  var csCount = document.getElementById('csCount');
  var csCta = document.getElementById('csCta');

  function formatAsCurrency(n) {
    return '£' + Math.round(n).toLocaleString('en-GB');
  }

  function calculateRoomSubtotal(room) {
    var sub = 0;
    sub += room.sockets * PRICES.socket_price;
    sub += room.lights * PRICES.light_point_price;
    sub += room.fused_spurs * PRICES.fused_spur_price;
    sub += room.one_way_switches * PRICES.one_way_switch_price;
    sub += room.two_way_switches * PRICES.two_way_switch_price;
    sub += room.extractor_fans * PRICES.extractor_fan_price;
    sub += room.data_points * PRICES.data_point_price;
    sub += (room.shaver_sockets || 0) * PRICES.shaver_socket_price;
    sub += (room.usb_sockets || 0) * PRICES.usb_socket_price;
    sub += (room.flip_lid_floor_sockets || 0) * PRICES.flip_lid_floor_socket_price;
    sub += (room.five_amp_sockets || 0) * PRICES.five_amp_socket_price;
    sub += (room.external_ip_fittings || 0) * PRICES.external_ip_fitting_price;
    sub += (room.tv_points || 0) * PRICES.tv_point_price;
    sub += (room.sky_points || 0) * PRICES.sky_point_price;
    sub += (room.telephone_points || 0) * PRICES.telephone_point_price;
    // Continuous COB LED runs: each run gets 5m base. Extra metres beyond
    // (count x 5) cost £30 per metre.
    if (room.led_strip_continuous_count > 0) {
      sub += room.led_strip_continuous_count * PRICES.led_strip_continuous_base_first_5_metres_price;
      var continuousBaseAllowance = room.led_strip_continuous_count * 5;
      var continuousExtraMetres = Math.max(0, (room.led_strip_continuous_total_metres || 0) - continuousBaseAllowance);
      sub += continuousExtraMetres * PRICES.led_strip_continuous_per_extra_metre_price;
    }
    // Small COB LED sections: first section £160 (incl 2m), each additional
    // £90 (incl 2m). Extra metres beyond (count x 2) cost £40 per metre.
    if (room.led_strip_section_count > 0) {
      sub += PRICES.led_strip_section_first_section_price;
      sub += (room.led_strip_section_count - 1) * PRICES.led_strip_section_additional_section_price;
      var sectionBaseAllowance = room.led_strip_section_count * 2;
      var sectionExtraMetres = Math.max(0, (room.led_strip_section_total_metres || 0) - sectionBaseAllowance);
      sub += sectionExtraMetres * PRICES.led_strip_section_per_extra_metre_price;
    }
    if (room.radial_16amp_count > 0) {
      sub += room.radial_16amp_count * (PRICES.radial_16amp_base_price + (room.radial_16amp_extra_metres || 0) * PRICES.radial_16amp_per_extra_metre_price);
    }
    if (room.radial_32amp_count > 0) {
      sub += room.radial_32amp_count * (PRICES.radial_32amp_base_price + (room.radial_32amp_extra_metres || 0) * PRICES.radial_32amp_per_extra_metre_price);
    }
    return sub;
  }

  function recalculateAndUpdateDisplay() {
    var total = 0;
    var itemCount = 0;
    var lines = [];

    if (state.consumer_unit_count > 0) {
      var v = state.consumer_unit_count * PRICES.consumer_unit_price;
      total += v;
      itemCount += state.consumer_unit_count;
      lines.push({ name: state.consumer_unit_count + ' x RCBO consumer unit', value: v });
    }
    if (state.smoke_detector_count > 0) {
      var v2 = state.smoke_detector_count * PRICES.smoke_detector_price;
      total += v2;
      itemCount += state.smoke_detector_count;
      lines.push({ name: state.smoke_detector_count + ' x Heat/Smoke detector', value: v2 });
    }
    if (state.tv_aerial_count > 0) {
      var vAerial = state.tv_aerial_count * PRICES.tv_aerial_price;
      total += vAerial;
      itemCount += state.tv_aerial_count;
      lines.push({ name: state.tv_aerial_count + ' x TV aerial', value: vAerial });
    }
    if (state.wired_ring_doorbell_count > 0) {
      var vDoorbell = state.wired_ring_doorbell_count * PRICES.wired_ring_doorbell_cam_price;
      total += vDoorbell;
      itemCount += state.wired_ring_doorbell_count;
      lines.push({ name: state.wired_ring_doorbell_count + ' x Wired Ring Doorbell Cam', value: vDoorbell });
    }
    if (state.garage_consumer_unit_count > 0) {
      var vGarage = state.garage_consumer_unit_count * PRICES.garage_consumer_unit_price;
      total += vGarage;
      itemCount += state.garage_consumer_unit_count;
      lines.push({ name: state.garage_consumer_unit_count + ' x Garage consumer unit', value: vGarage });
    }
    if (state.water_bonding_count > 0) {
      var vWaterBond = state.water_bonding_count * PRICES.water_bonding_price;
      total += vWaterBond;
      itemCount += state.water_bonding_count;
      lines.push({ name: state.water_bonding_count + ' x Water bond', value: vWaterBond });
    }
    if (state.gas_bonding_count > 0) {
      var vGasBond = state.gas_bonding_count * PRICES.gas_bonding_price;
      total += vGasBond;
      itemCount += state.gas_bonding_count;
      lines.push({ name: state.gas_bonding_count + ' x Gas bond', value: vGasBond });
    }

    state.rooms.forEach(function (room) {
      var sub = calculateRoomSubtotal(room);
      var roomItems = room.sockets + room.lights + room.fused_spurs + room.one_way_switches + room.two_way_switches + room.extractor_fans + room.data_points
        + (room.shaver_sockets || 0) + (room.usb_sockets || 0) + (room.flip_lid_floor_sockets || 0) + (room.five_amp_sockets || 0) + (room.external_ip_fittings || 0) + (room.tv_points || 0) + (room.sky_points || 0) + (room.telephone_points || 0)
        + room.led_strip_continuous_count + room.led_strip_section_count + room.radial_16amp_count + room.radial_32amp_count;
      if (sub > 0 || roomItems > 0) {
        total += sub;
        itemCount += roomItems;
        var extras = [];
        if (room.led_strip_continuous_count > 0) {
          extras.push(room.led_strip_continuous_count + 'x continuous COB LED (' + (room.led_strip_continuous_total_metres || 0) + 'm)');
        }
        if (room.led_strip_section_count > 0) {
          extras.push(room.led_strip_section_count + 'x small COB LED (' + (room.led_strip_section_total_metres || 0) + 'm)');
        }
        if (room.radial_16amp_count > 0) extras.push(room.radial_16amp_count + 'x 16A' + (room.radial_16amp_extra_metres > 0 ? ' +' + room.radial_16amp_extra_metres + 'm' : ''));
        if (room.radial_32amp_count > 0) extras.push(room.radial_32amp_count + 'x 32A' + (room.radial_32amp_extra_metres > 0 ? ' +' + room.radial_32amp_extra_metres + 'm' : ''));
        var label = room.name + ' (' + roomItems + ' items' + (extras.length ? ', incl ' + extras.join(' + ') : '') + ')';
        lines.push({ name: label, value: sub });
      }
      var subEl = document.querySelector('[data-room-id="' + room.id + '"] .room-subtotal');
      if (subEl) subEl.textContent = sub > 0 ? formatAsCurrency(sub) : '£0';
    });

    csTotal.textContent = formatAsCurrency(total);
    csCount.textContent = itemCount === 0 ? 'Nothing added yet' : (itemCount === 1 ? '1 item added' : itemCount + ' items added');

    if (lines.length === 0) {
      csLines.innerHTML = '<div class="summary-empty">Pick a room above to begin.</div>';
    } else {
      csLines.innerHTML = lines.map(function (l) {
        return '<div class="summary-line"><span>' + l.name + '</span><strong>' + formatAsCurrency(l.value) + '</strong></div>';
      }).join('');
    }

    if (csCta && total > 0) {
      var body = 'Hi Pete,\n\nMy rough rewire quote is ' + formatAsCurrency(total) + '. Breakdown:\n\n' +
        lines.map(function (l) { return '- ' + l.name + ' = ' + formatAsCurrency(l.value); }).join('\n') +
        '\n\nPlease can you book a free home survey to confirm.';
      csCta.href = 'mailto:info@dorsetrewires.co.uk?subject=' + encodeURIComponent('Instant quote: ' + formatAsCurrency(total)) +
        '&body=' + encodeURIComponent(body);
    }
  }

  function countRoomsByPresetKey(presetKey) {
    return state.rooms.filter(function (r) { return r.preset_key === presetKey; }).length;
  }

  // Refresh the small "n" badge on each quick-add button so Pete can see at
  // a glance how many kitchens / bedrooms / etc. are already in the list.
  function updateQuickAddBadges() {
    document.querySelectorAll('.quick-add-button[data-preset]').forEach(function (button) {
      var presetKey = button.getAttribute('data-preset');
      var count = countRoomsByPresetKey(presetKey);
      var existing = button.querySelector('.quick-add-count');
      if (count > 0) {
        if (existing) {
          existing.textContent = count;
        } else {
          var badge = document.createElement('span');
          badge.className = 'quick-add-count';
          badge.setAttribute('aria-label', count + ' already added');
          badge.textContent = count;
          button.appendChild(badge);
        }
      } else if (existing) {
        existing.remove();
      }
    });
  }

  function addRoom(presetKey) {
    var preset = PRESETS[presetKey] || PRESETS.blank;
    var room = Object.assign({ id: nextRoomId++, preset_key: presetKey }, preset);
    state.rooms.push(room);

    // Auto-number rooms of the same preset so "Bedroom" + "Bedroom" becomes
    // "Bedroom 1" + "Bedroom 2". Skip the 'blank' preset.
    if (presetKey !== 'blank') {
      var sameTypeRooms = state.rooms.filter(function (r) { return r.preset_key === presetKey; });
      if (sameTypeRooms.length >= 2) {
        sameTypeRooms.forEach(function (existingRoom, index) {
          var defaultName = PRESETS[presetKey].name;
          var alreadyNumbered = new RegExp('^' + defaultName + ' \\d+$').test(existingRoom.name);
          if (existingRoom.name === defaultName || alreadyNumbered) {
            existingRoom.name = defaultName + ' ' + (index + 1);
            var nameInput = document.querySelector('[data-room-id="' + existingRoom.id + '"] .room-name');
            if (nameInput) nameInput.value = existingRoom.name;
          }
        });
      }
    }

    buildRoomCardInDom(room);
    updateQuickAddBadges();
    recalculateAndUpdateDisplay();
  }

  function countActiveItemsInRoom(room) {
    return room.sockets + room.lights + room.fused_spurs + room.one_way_switches + room.two_way_switches + room.extractor_fans + room.data_points
      + (room.shaver_sockets || 0) + (room.usb_sockets || 0) + (room.flip_lid_floor_sockets || 0) + (room.five_amp_sockets || 0) + (room.external_ip_fittings || 0) + (room.tv_points || 0) + (room.sky_points || 0) + (room.telephone_points || 0)
      + room.led_strip_continuous_count + room.led_strip_section_count + room.radial_16amp_count + room.radial_32amp_count;
  }

  function buildRoomCardInDom(room) {
    var el = document.createElement('div');
    el.className = 'room';
    el.setAttribute('data-room-id', room.id);

    // Unified row pattern. Description is hidden by default - revealed by
    // tapping the '?' button so the card stays compact for repeat use.
    function buildOneInputRow(key, label, typical, currentValue) {
      var descId = 'desc-' + key + '-' + room.id;
      return '<div class="room-item">' +
        '<div class="room-item-label">' +
          '<span class="room-item-label-row">' +
            '<strong>' + label + '</strong>' +
            '<button type="button" class="room-item-info-button" aria-expanded="false" aria-controls="' + descId + '" aria-label="More info">?</button>' +
          '</span>' +
          '<small class="room-item-description" id="' + descId + '" hidden>' + typical + '</small>' +
        '</div>' +
        '<div class="room-item-controls">' +
          '<button type="button" class="room-item-step-button" data-step="-1" data-key="' + key + '" aria-label="minus">&minus;</button>' +
          '<input type="number" class="room-item-quantity" data-key="' + key + '" value="' + currentValue + '" min="0" max="50" inputmode="numeric" aria-label="' + label + '">' +
          '<button type="button" class="room-item-step-button" data-step="1" data-key="' + key + '" aria-label="plus">&plus;</button>' +
        '</div>' +
      '</div>';
    }

    // Helper for the "extra metres" mini-row that sits under a parent count
    // (used by LED strips and both radials). Same +/- pattern as the main rows.
    function buildExtraMetresRow(key, label, currentValue) {
      return '<div class="room-item-extra-input">' +
        '<span class="room-item-extra-label">' + label + '</span>' +
        '<div class="room-item-controls">' +
          '<button type="button" class="room-item-step-button" data-step="-1" data-key="' + key + '" aria-label="minus">&minus;</button>' +
          '<input type="number" class="room-item-quantity" data-key="' + key + '" value="' + currentValue + '" min="0" max="100" inputmode="numeric">' +
          '<button type="button" class="room-item-step-button" data-step="1" data-key="' + key + '" aria-label="plus">&plus;</button>' +
        '</div>' +
      '</div>';
    }

    var itemsHtml = ROOM_ITEMS.map(function (it) {
      return buildOneInputRow(it.key, it.label, it.typical, room[it.key]);
    }).join('');

    // COB LED strip lighting - lives inside the "Extras and upgrades"
    // collapsible section below, NOT mixed with the standard items.
    //   1) Continuous runs (ceilings, coves, plinths) - £190 first 5m + £30/m extra
    //   2) Small sections (shelves, under-cupboards) - £160 first section
    //      (incl 2m) + £90 per extra section + £40 per extra metre
    var ledHtml =
      '<div class="room-led-explainer"><strong>COB LED strip lighting</strong>' +
      '<small>Chip on Board LED. A dotless ribbon of light. Smooth, not visible chips. Best look for visible installs.</small></div>' +
      buildOneInputRow(
        'led_strip_continuous_count',
        'How many continuous COB LED runs (ceilings, coves and plinths)?',
        '£190 covers the first 5 metres per run. £30 each extra metre. Always inside a profile or trunking. A U-shape with soldered 90 degree bends counts as one run. Example: 2m + 1m + 2m joined by two bends = one 5m run.',
        room.led_strip_continuous_count
      ) +
      buildExtraMetresRow('led_strip_continuous_total_metres', 'Total metres of continuous run in this room', room.led_strip_continuous_total_metres) +
      buildOneInputRow(
        'led_strip_section_count',
        'How many small COB LED sections (shelves, under-cupboards)?',
        '£160 for the first section (covers up to 2m). £90 each extra section. £40 per extra metre over 2m per section.',
        room.led_strip_section_count
      ) +
      buildExtraMetresRow('led_strip_section_total_metres', 'Total metres across small sections in this room', room.led_strip_section_total_metres);

    // Special and outdoor points. Less common, so kept in the extras section to
    // keep the main per-room list short.
    var specialPointsHtml =
      '<div class="room-led-explainer"><strong>Special and outdoor points</strong>' +
      '<small>Less common points. Add only if this room needs them.</small></div>' +
      buildOneInputRow('shaver_sockets', 'How many shaver sockets?', '£90 each. Usually in bathrooms and en-suites.', room.shaver_sockets || 0) +
      buildOneInputRow('usb_sockets', 'How many USB sockets?', '£100 each. A socket with built-in USB charging ports.', room.usb_sockets || 0) +
      buildOneInputRow('flip_lid_floor_sockets', 'How many flip-lid floor sockets?', '£110 each. A socket set into the floor with a fold-down lid.', room.flip_lid_floor_sockets || 0) +
      buildOneInputRow('five_amp_sockets', 'How many 5A lamp sockets?', '£90 each. Round-pin sockets for lamps run off the light switch.', room.five_amp_sockets || 0) +
      buildOneInputRow('external_ip_fittings', 'How many outdoor weatherproof fittings?', '£90 each. Outdoor wall lights, ground uplights or weatherproof sockets.', room.external_ip_fittings || 0) +
      buildOneInputRow('tv_points', 'How many TV points?', '£90 each.', room.tv_points || 0) +
      buildOneInputRow('sky_points', 'How many Sky points?', '£90 each.', room.sky_points || 0) +
      buildOneInputRow('telephone_points', 'How many telephone points?', '£90 each.', room.telephone_points || 0);

    // Wrap all extras/upgrades in a collapsible section below the radials.
    var extrasHtml =
      '<div class="room-extras">' +
        '<button type="button" class="room-extras-toggle" aria-expanded="false">' +
          '<span class="room-extras-toggle-icon">&plus;</span>' +
          '<span class="room-extras-toggle-text">' +
            '<strong>Add extras and upgrades</strong>' +
            '<small>Optional add-ons. COB LED strip lighting and special points.</small>' +
          '</span>' +
          '<span class="room-extras-toggle-arrow" aria-hidden="true">&#9656;</span>' +
        '</button>' +
        '<div class="room-extras-content" hidden>' + ledHtml + specialPointsHtml + '</div>' +
      '</div>';

    var radialsHtml =
      buildOneInputRow(
        'radial_16amp_count',
        'How many 16A radial circuits?',
        'Typical: fridge, immersion heater, boiler spur. £120 base + £2 per metre over 20m.',
        room.radial_16amp_count
      ) +
      buildExtraMetresRow('radial_16amp_extra_metres', 'Extra metres beyond 20m (16A)', room.radial_16amp_extra_metres) +
      buildOneInputRow(
        'radial_32amp_count',
        'How many 32A radial circuits?',
        'Typical: EV (car charger), hob, oven, electric shower. £190 base + £4 per metre over 20m.',
        room.radial_32amp_count
      ) +
      buildExtraMetresRow('radial_32amp_extra_metres', 'Extra metres beyond 20m (32A)', room.radial_32amp_extra_metres);

    el.innerHTML =
      '<div class="room-head">' +
        '<input class="room-name" value="' + room.name + '" maxlength="40">' +
        '<span class="room-subtotal">£0</span>' +
        '<button type="button" class="room-minimise" aria-label="Minimise room" title="Minimise this room">&minus;</button>' +
        '<button type="button" class="room-remove" aria-label="Remove room" title="Remove this room">&times;</button>' +
      '</div>' +
      '<div class="room-items">' + itemsHtml + radialsHtml + extrasHtml + '</div>';

    el.querySelector('.room-name').addEventListener('input', function (e) { room.name = e.target.value; recalculateAndUpdateDisplay(); });

    el.querySelector('.room-minimise').addEventListener('click', function () {
      var isCollapsed = el.classList.toggle('room-collapsed');
      var minimiseButton = el.querySelector('.room-minimise');
      minimiseButton.innerHTML = isCollapsed ? '&plus;' : '&minus;';
      minimiseButton.setAttribute('aria-label', isCollapsed ? 'Expand room' : 'Minimise room');
      minimiseButton.setAttribute('title', isCollapsed ? 'Expand this room' : 'Minimise this room');
    });

    el.querySelector('.room-extras-toggle').addEventListener('click', function () {
      var content = el.querySelector('.room-extras-content');
      var wasHidden = content.hidden;
      content.hidden = !wasHidden;
      this.setAttribute('aria-expanded', wasHidden ? 'true' : 'false');
      this.querySelector('.room-extras-toggle-icon').innerHTML = wasHidden ? '&minus;' : '&plus;';
      el.classList.toggle('room-extras-open', wasHidden);
    });

    el.querySelector('.room-remove').addEventListener('click', function () {
      var activeItemCount = countActiveItemsInRoom(room);
      if (activeItemCount > 0) {
        var message = 'This room (' + room.name + ') has ' + activeItemCount + ' item' + (activeItemCount === 1 ? '' : 's') + ' selected.\n\nDelete the room and lose all the inputs?';
        if (!window.confirm(message)) return;
      }
      state.rooms = state.rooms.filter(function (r) { return r.id !== room.id; });
      el.remove();
      updateQuickAddBadges();
      recalculateAndUpdateDisplay();
    });

    el.querySelectorAll('.room-item-step-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key');
        var step = parseInt(btn.getAttribute('data-step'), 10);
        room[key] = Math.max(0, room[key] + step);
        var input = el.querySelector('.room-item-quantity[data-key="' + key + '"]');
        if (input) input.value = room[key];
        recalculateAndUpdateDisplay();
      });
    });
    // Wire up the ? info buttons - toggle the description on click/tap
    el.querySelectorAll('.room-item-info-button').forEach(function (infoButton) {
      infoButton.addEventListener('click', function () {
        var descriptionElement = document.getElementById(infoButton.getAttribute('aria-controls'));
        if (!descriptionElement) return;
        var isCurrentlyHidden = descriptionElement.hidden;
        descriptionElement.hidden = !isCurrentlyHidden;
        infoButton.setAttribute('aria-expanded', isCurrentlyHidden ? 'true' : 'false');
        infoButton.classList.toggle('room-item-info-button-active', isCurrentlyHidden);
      });
    });

    el.querySelectorAll('.room-item-quantity, .room-radial-quantity').forEach(function (input) {
      input.addEventListener('input', function () {
        var key = input.getAttribute('data-key');
        var v = parseInt(input.value, 10);
        room[key] = isNaN(v) || v < 0 ? 0 : v;
        recalculateAndUpdateDisplay();
      });
    });

    roomsList.appendChild(el);
  }

  // Whole-property inputs (CU and smoke detectors only - radials moved into rooms)
  document.querySelectorAll('.calc-row[data-key]').forEach(function (row) {
    var key = row.getAttribute('data-key');
    var qtyInput = row.querySelector('.calc-row-quantity');

    if (qtyInput) {
      qtyInput.addEventListener('input', function () {
        var v = parseInt(qtyInput.value, 10);
        v = isNaN(v) || v < 0 ? 0 : v;
        state[key] = v;
        recalculateAndUpdateDisplay();
      });
    }
    row.querySelectorAll('.calc-row-step-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.getAttribute('data-step'), 10);
        if (!qtyInput) return;
        var current = parseInt(qtyInput.value, 10) || 0;
        var next = Math.max(0, current + step);
        qtyInput.value = next;
        state[key] = next;
        recalculateAndUpdateDisplay();
      });
    });
  });

  // Quick add buttons (manual room-by-room)
  document.querySelectorAll('.quick-add-button').forEach(function (btn) {
    btn.addEventListener('click', function () { addRoom(btn.getAttribute('data-preset')); });
  });

  // Quick estimate - load template from JSON and pre-populate all rooms
  var estimateTemplates = null;
  fetch('/data/estimate-templates.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (j) estimateTemplates = j.templates; })
    .catch(function () { /* offline - quick estimate buttons still show, but load silently fails */ });

  function clearAllRooms() {
    state.rooms = [];
    state.consumer_unit_count = 0;
    state.smoke_detector_count = 0;
    state.tv_aerial_count = 0;
    state.wired_ring_doorbell_count = 0;
    state.garage_consumer_unit_count = 0;
    state.water_bonding_count = 0;
    state.gas_bonding_count = 0;
    nextRoomId = 1;
    roomsList.innerHTML = '';
    // Reset the whole-property quantity inputs too
    document.querySelectorAll('.calc-row-quantity').forEach(function (input) {
      input.value = 0;
    });
    updateQuickAddBadges();
  }

  function loadQuickEstimateTemplate(templateKey) {
    if (!estimateTemplates || !estimateTemplates[templateKey]) {
      alert('Template not loaded yet. Try again in a moment.');
      return;
    }
    var template = estimateTemplates[templateKey];

    // Warn if rooms already exist
    if (state.rooms.length > 0) {
      if (!window.confirm('This will replace all your current rooms with the ' + template.label + ' estimate. Continue?')) return;
    }

    clearAllRooms();

    // Set whole-property items
    state.consumer_unit_count = template.consumer_unit_count || 0;
    state.smoke_detector_count = template.smoke_detector_count || 0;
    var cuInput = document.querySelector('.calc-row[data-key="consumer_unit_count"] .calc-row-quantity');
    var smokeInput = document.querySelector('.calc-row[data-key="smoke_detector_count"] .calc-row-quantity');
    if (cuInput) cuInput.value = state.consumer_unit_count;
    if (smokeInput) smokeInput.value = state.smoke_detector_count;

    // Add each room from the template
    (template.rooms || []).forEach(function (templateRoom) {
      var room = {
        id: nextRoomId++,
        preset_key: templateRoom.preset_key,
        name: templateRoom.name,
        sockets:           templateRoom.sockets           || 0,
        lights:            templateRoom.lights            || 0,
        fused_spurs:       templateRoom.fused_spurs       || 0,
        one_way_switches:  templateRoom.one_way_switches  || 0,
        two_way_switches:  templateRoom.two_way_switches  || 0,
        extractor_fans:    templateRoom.extractor_fans    || 0,
        data_points:       templateRoom.data_points       || 0,
        shaver_sockets: 0, usb_sockets: 0, flip_lid_floor_sockets: 0, five_amp_sockets: 0, external_ip_fittings: 0,
        tv_points: 0, sky_points: 0, telephone_points: 0,
        led_strip_continuous_count:       0, led_strip_continuous_total_metres: 0,
        led_strip_section_count:          0, led_strip_section_total_metres:    0,
        radial_16amp_count: 0, radial_16amp_extra_metres: 0,
        radial_32amp_count: 0, radial_32amp_extra_metres: 0
      };
      state.rooms.push(room);
      buildRoomCardInDom(room);

      // Collapse the card immediately - with 10 rooms on screen, expanded
      // all at once is too much. User expands the one they want to check.
      var newCard = roomsList.lastElementChild;
      if (newCard) {
        newCard.classList.add('room-collapsed');
        var minimiseBtn = newCard.querySelector('.room-minimise');
        if (minimiseBtn) {
          minimiseBtn.innerHTML = '&plus;';
          minimiseBtn.setAttribute('aria-label', 'Expand room');
          minimiseBtn.setAttribute('title', 'Expand this room');
        }
      }
    });

    updateQuickAddBadges();
    recalculateAndUpdateDisplay();

    // Mark the selected button as active, clear others
    document.querySelectorAll('.qe-btn').forEach(function (b) {
      b.classList.toggle('qe-btn-active', b.getAttribute('data-template') === templateKey);
    });

    // Scroll past the quick estimate block to show the rooms
    var roomsBlock = document.querySelector('.calc-block');
    if (roomsBlock) roomsBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelectorAll('.qe-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      loadQuickEstimateTemplate(btn.getAttribute('data-template'));
    });
  });

  var startFromScratch = document.getElementById('startFromScratch');
  if (startFromScratch) {
    startFromScratch.addEventListener('click', function (e) {
      e.preventDefault();
      if (state.rooms.length > 0) {
        if (!window.confirm('Clear all rooms and start from scratch?')) return;
        clearAllRooms();
        recalculateAndUpdateDisplay();
      }
      document.querySelectorAll('.qe-btn').forEach(function (b) { b.classList.remove('qe-btn-active'); });
      var roomsBlock = document.querySelector('.calc-block');
      if (roomsBlock) roomsBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Seed: empty by default, prompt
  csLines.innerHTML = '<div class="summary-empty">Pick a property type above to begin, or add rooms one by one below.</div>';
})();
