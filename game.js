/**
 * game.js — SCRAP Game engine
 *
 * Manages game state (health, hunger, energy, inventory, location),
 * handles player commands, and drives the ChatGPT AI narrator.
 */

const Game = (() => {
  /* ── constants ── */
  const LOCATIONS = [
    {
      id: 'ruins',
      name: 'Collapsed Ruins',
      desc: 'Crumbling concrete and rusted rebar stretch in every direction.',
    },
    {
      id: 'junkyard',
      name: 'The Junkyard',
      desc: 'Mountains of crushed cars and twisted metal loom overhead.',
    },
    {
      id: 'factory',
      name: 'Abandoned Factory',
      desc: 'A hulking industrial shell — machinery silent for forty years.',
    },
    {
      id: 'market',
      name: 'Dusty Market',
      desc: 'A makeshift bazaar where survivors trade scraps and supplies.',
    },
    {
      id: 'outskirts',
      name: 'The Outskirts',
      desc: 'Open wasteland at the edge of the settlement. Dangerous at night.',
    },
  ];

  const QUICK_COMMANDS = [
    { label: '🔍 Search area',  cmd: 'search the area for scrap' },
    { label: '🏕️ Rest',          cmd: 'rest for a while' },
    { label: '🗺️ Move on',       cmd: 'move to a new location' },
    { label: '📦 Check inventory', cmd: 'check my inventory' },
    { label: '❓ Look around',   cmd: 'look around carefully' },
  ];

  /* ── state ── */
  let state = {
    health:    100,
    hunger:    100,  // 100 = full, 0 = starving
    energy:    100,
    inventory: [],
    location:  LOCATIONS[0],
    turn:      0,
    history:   [],   // ChatGPT conversation history
  };

  /* ── DOM refs (populated in init) ── */
  let els = {};

  /* ── init ── */
  function init() {
    els = {
      setupScreen:   document.getElementById('setup-screen'),
      gameArea:      document.getElementById('game-area'),
      apiKeyInput:   document.getElementById('api-key-input'),
      modelSelect:   document.getElementById('model-select'),
      startBtn:      document.getElementById('start-btn'),
      logOutput:     document.getElementById('log-output'),
      playerInput:   document.getElementById('player-input'),
      sendBtn:       document.getElementById('send-btn'),
      healthBar:     document.getElementById('health-bar'),
      healthVal:     document.getElementById('health-val'),
      hungerBar:     document.getElementById('hunger-bar'),
      hungerVal:     document.getElementById('hunger-val'),
      energyBar:     document.getElementById('energy-bar'),
      energyVal:     document.getElementById('energy-val'),
      locationName:  document.getElementById('location-name'),
      locationDesc:  document.getElementById('location-desc'),
      inventoryList: document.getElementById('inventory-list'),
      quickActions:  document.getElementById('quick-actions'),
      aiDot:         document.getElementById('ai-dot'),
      aiStatusText:  document.getElementById('ai-status-text'),
    };

    /* Build quick-action buttons */
    QUICK_COMMANDS.forEach(({ label, cmd }) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm';
      btn.textContent = label;
      btn.addEventListener('click', () => sendCommand(cmd));
      els.quickActions.appendChild(btn);
    });

    /* Wire up form */
    els.startBtn.addEventListener('click', handleStart);
    els.sendBtn.addEventListener('click', () => sendCommand());
    els.playerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendCommand(); }
    });

    /* AI status updates */
    AI.onStatusChange((status) => {
      els.aiDot.className = `dot ${status}`;
      els.aiStatusText.textContent =
        status === 'online' ? 'AI Narrator online'  :
        status === 'busy'   ? 'AI thinking…'        :
                              'AI offline';
      setInputsDisabled(status === 'busy');
    });

  }

  /* ── setup ── */
  function handleStart() {
    const key = els.apiKeyInput.value.trim();
    if (!key) {
      alert('Please enter your OpenAI API key to continue.');
      return;
    }
    const model = els.modelSelect.value;
    AI.configure(key, model);

    els.setupScreen.style.display = 'none';
    els.gameArea.style.display    = 'contents';

    startGame();
  }

  /* ── game start ── */
  function startGame() {
    renderSidebar();
    log('Welcome to SCRAP — a post-apocalyptic survival game.', 'system');
    log('Type a command or use the quick actions on the right.', 'system');
    log('─'.repeat(50), 'system');

    /* Kick off the opening narrative from the AI */
    const openingPrompt =
      `The player has just arrived at the ${state.location.name}. ` +
      `Describe their surroundings and set the grim, atmospheric scene to open the game.`;

    sendToAI(openingPrompt, true);
  }

  /* ── player command handling ── */
  function sendCommand(override) {
    const text = (override ?? els.playerInput.value).trim();
    if (!text) return;
    if (AI.isBusy()) return;

    els.playerInput.value = '';
    log(text, 'player');
    tickPassage();
    sendToAI(text, false);
  }

  function tickPassage() {
    state.turn++;
    /* Slowly drain hunger and energy each turn */
    state.hunger = Math.max(0, state.hunger - randomInt(2, 5));
    state.energy = Math.max(0, state.energy - randomInt(1, 3));

    if (state.hunger === 0) {
      state.health = Math.max(0, state.health - 5);
      log('You are starving! Your health is deteriorating.', 'danger');
    }
    if (state.health === 0) {
      log('You have died. Refresh to start over.', 'danger');
      setInputsDisabled(true);
    }
    renderSidebar();
  }

  /* ── AI communication ── */
  function sendToAI(userText, isNarrator) {
    if (!isNarrator) {
      state.history.push({ role: 'user', content: userText });
    }

    /* Show "thinking" indicator */
    const thinkingEl = appendThinking();

    /* Current game state appended as context */
    const contextNote =
      `[Game state — Turn ${state.turn} | ` +
      `Health:${state.health} Hunger:${state.hunger} Energy:${state.energy} | ` +
      `Location:${state.location.name} | ` +
      `Inventory:${state.inventory.map(i => `${i.name}x${i.qty}`).join(', ') || 'empty'}]`;

    const messagesForAI = isNarrator
      ? [{ role: 'user', content: `${contextNote}\n\n${userText}` }]
      : [
          ...state.history.slice(0, -1), // prior turns (exclude the raw push above)
          { role: 'user', content: `${contextNote}\n\n${userText}` }, // enriched with game state
        ];

    /* Streaming response */
    let aiEntry = null;
    let fullText = '';

    AI.askAI(
      messagesForAI,
      /* onChunk */ (chunk) => {
        thinkingEl.remove();
        if (!aiEntry) {
          aiEntry = createStreamEntry();
        }
        fullText += chunk;
        aiEntry.querySelector('.content').textContent = fullText;
        scrollLog();
      },
      /* onDone */ (complete) => {
        if (!aiEntry) {
          thinkingEl.remove();
          aiEntry = createStreamEntry();
          aiEntry.querySelector('.content').textContent = complete;
          scrollLog();
        }
        /* Push assistant reply into history */
        state.history.push({ role: 'assistant', content: complete });
        /* Keep history from growing unbounded (last 20 turns = 40 msgs) */
        if (state.history.length > 40) {
          state.history = state.history.slice(-40);
        }
        /* Parse any special game events */
        parseAIResponse(complete);
      },
      /* onError */ (errMsg) => {
        thinkingEl.remove();
        log(`AI Error: ${errMsg}`, 'danger');
      },
    );
  }

  /* ── parse AI directives ── */
  function parseAIResponse(text) {
    /* [LOOT: <item> x<qty>] */
    const lootRe = /\[LOOT:\s*([^\]]+?)\s*x(\d+)\]/gi;
    let match;
    while ((match = lootRe.exec(text)) !== null) {
      const itemName = match[1].trim();
      const qty      = parseInt(match[2], 10);
      addItem(itemName, qty);
    }

    /* [DAMAGE: <amount>] */
    const dmgRe = /\[DAMAGE:\s*(\d+)\]/i;
    const dmg   = dmgRe.exec(text);
    if (dmg) {
      const amount = parseInt(dmg[1], 10);
      state.health = Math.max(0, state.health - amount);
      log(`You take ${amount} damage! (Health: ${state.health})`, 'danger');
    }

    /* [HEAL: <amount>] */
    const healRe = /\[HEAL:\s*(\d+)\]/i;
    const heal   = healRe.exec(text);
    if (heal) {
      const amount = parseInt(heal[1], 10);
      state.health = Math.min(100, state.health + amount);
      state.hunger = Math.min(100, state.hunger + Math.floor(amount / 2));
      log(`You recover ${amount} health! (Health: ${state.health})`, 'loot');
    }

    renderSidebar();

    /* Randomly change location after certain events */
    if (/move|travel|walk|head to|go to/i.test(text)) {
      state.location = LOCATIONS[randomInt(0, LOCATIONS.length - 1)];
      renderSidebar();
    }
  }

  /* ── inventory ── */
  function addItem(name, qty) {
    const existing = state.inventory.find(
      (i) => i.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      existing.qty += qty;
    } else {
      state.inventory.push({ name, qty, icon: itemIcon(name) });
    }
    log(`Found: ${name} x${qty}`, 'loot');
    renderInventory();
  }

  function itemIcon(name) {
    const n = name.toLowerCase();
    if (/metal|scrap|iron|steel|bolt|nut|wire/.test(n)) return '🔩';
    if (/food|ration|can|bread|meat|fruit/.test(n))     return '🥫';
    if (/water|bottle|flask/.test(n))                   return '💧';
    if (/med|kit|bandage|pill|drug/.test(n))            return '💊';
    if (/weapon|knife|gun|blade|axe|pipe/.test(n))      return '🔪';
    if (/cloth|fabric|rope|rag/.test(n))                return '🧵';
    if (/fuel|oil|gas|chemical/.test(n))                return '🛢️';
    if (/battery|elec|chip|circuit/.test(n))            return '🔋';
    return '📦';
  }

  /* ── rendering ── */
  function renderSidebar() {
    renderStats();
    renderLocation();
    renderInventory();
  }

  function renderStats() {
    setBar(els.healthBar, els.healthVal, state.health);
    setBar(els.hungerBar, els.hungerVal, state.hunger);
    setBar(els.energyBar, els.energyVal, state.energy);
  }

  function setBar(barEl, valEl, value) {
    barEl.style.width = `${value}%`;
    valEl.textContent = value;
  }

  function renderLocation() {
    els.locationName.textContent = state.location.name;
    els.locationDesc.textContent = state.location.desc;
  }

  function renderInventory() {
    els.inventoryList.innerHTML = '';
    if (state.inventory.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-msg';
      li.textContent = 'Nothing yet.';
      els.inventoryList.appendChild(li);
      return;
    }
    state.inventory.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML =
        `<span class="item-icon">${item.icon}</span>` +
        `<span>${item.name}</span>` +
        `<span class="item-qty">x${item.qty}</span>`;
      els.inventoryList.appendChild(li);
    });
  }

  /* ── log helpers ── */
  function log(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = text;
    els.logOutput.appendChild(div);
    scrollLog();
    return div;
  }

  function appendThinking() {
    const div = document.createElement('div');
    div.className = 'log-entry typing-indicator';
    div.textContent = 'AI narrator thinking';
    els.logOutput.appendChild(div);
    scrollLog();
    return div;
  }

  function createStreamEntry() {
    const div = document.createElement('div');
    div.className = 'log-entry ai';
    div.innerHTML = '<span class="label">Narrator: </span><span class="content"></span>';
    els.logOutput.appendChild(div);
    scrollLog();
    return div;
  }

  function scrollLog() {
    els.logOutput.scrollTop = els.logOutput.scrollHeight;
  }

  function setInputsDisabled(disabled) {
    els.playerInput.disabled = disabled;
    els.sendBtn.disabled     = disabled;
    els.quickActions.querySelectorAll('button').forEach((b) => (b.disabled = disabled));
  }

  /* ── utilities ── */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Game.init);
