# ⚙️ SCRAP Game

A **post-apocalyptic survival game** narrated in real time by ChatGPT (OpenAI).  
Scavenge the wasteland, collect scraps, and survive — with an AI game master that
reacts dynamically to every move you make.

---

## Features

- 🤖 **ChatGPT AI narrator** — every action gets a unique, immersive response
- 🔍 **Dynamic loot system** — the AI describes what you find; the engine tracks it
- ❤️ **Survival stats** — health, hunger, and energy that change with every turn
- 🗺️ **Multiple locations** — ruins, junkyard, factory, market, and outskirts
- ⚡ **Real-time streaming** — see the AI's response appear word-by-word
- 📦 **Inventory tracking** — items parsed from AI responses and stored automatically

---

## Quick Start

### 1. Get an OpenAI API key

Sign up (or log in) at [platform.openai.com](https://platform.openai.com) and
create a key at **API Keys → Create new secret key**.

> The key is stored only in your browser's session storage and is sent
> exclusively to `api.openai.com` — it is never logged or stored elsewhere.

### 2. Open the game

The game is a static HTML/JS/CSS application — no build step required.

**Option A — open directly in a browser**

```
open index.html
```

**Option B — serve locally (recommended for API key security)**

```bash
# Python 3
python -m http.server 8080
# then open http://localhost:8080
```

### 3. Play

1. Enter your OpenAI API key in the setup screen
2. Choose your preferred AI model (`gpt-4o-mini` is fast and cheap)
3. Click **Enter the Wasteland** and start typing commands!

---

## How to Play

Type natural-language commands in the input box, for example:

| Command | What happens |
|---|---|
| `search the area for metal` | AI narrates, may give loot |
| `rest and eat my rations` | AI responds, health/hunger may recover |
| `look around carefully` | AI describes the location |
| `head to the factory` | AI narrates travel; location updates |
| `what can I craft?` | AI suggests crafting options |

The **Quick Actions** panel on the right provides common commands as buttons.

---

## AI Integration Details

| File | Purpose |
|---|---|
| `ai.js` | OpenAI API wrapper with SSE streaming |
| `game.js` | Game engine, state management, AI response parsing |
| `index.html` | UI layout |
| `style.css` | Styling |

### Parsed AI directives

The AI can embed structured tags that the game engine acts on automatically:

| Tag | Effect |
|---|---|
| `[LOOT: Rusty Pipe x2]` | Adds 2× Rusty Pipe to inventory |
| `[DAMAGE: 15]` | Reduces health by 15 |
| `[HEAL: 20]` | Restores 20 health |

### Changing the AI model

In the setup screen drop-down, choose from:

- `gpt-4o-mini` — fast, inexpensive, good quality
- `gpt-4o` — highest quality, higher cost
- `gpt-3.5-turbo` — legacy, very cheap

---

## File Structure

```
SCRAPGame/
├── index.html   # Game UI
├── style.css    # Styles (dark post-apocalyptic theme)
├── ai.js        # ChatGPT / OpenAI integration
├── game.js      # Game engine & state
└── README.md    # This file
```

---

## Privacy & Security

- Your API key is **never** committed to the repository.
- It is stored in `sessionStorage` (cleared when the tab closes).
- All AI requests go directly from your browser to `api.openai.com`.
