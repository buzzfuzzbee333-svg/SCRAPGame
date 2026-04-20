/**
 * ai.js — ChatGPT (OpenAI) integration for SCRAP Game
 *
 * Wraps the OpenAI Chat Completions API and exposes a simple
 * `askAI(messages, onChunk)` helper that streams tokens back
 * to the game engine in real time.
 */

const AI = (() => {
  /* ── configuration ── */
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  let _apiKey = '';
  let _model  = 'gpt-4o-mini';
  let _busy   = false;

  /** The system prompt that gives GPT its role as SCRAP's narrator. */
  const SYSTEM_PROMPT = `You are the AI narrator and game master for SCRAP, a post-apocalyptic
survival scavenging game played in the browser.

Setting: The world ended 40 years ago. Humanity survives in scattered
settlements surrounded by ruins, toxic wastelands, and salvage fields.
The player is a scavenger hunting for scrap to trade and survive.

Your role:
- Respond to player actions with vivid, immersive narrative (2-4 sentences).
- Describe what the player finds, hears, and smells.
- Occasionally hint at dangers, hidden items, or lore.
- When the player searches or scavenges, describe 0-3 realistic items they
  might find (use the format [LOOT: <item> x<qty>] for each found item so
  the game engine can parse it).
- When the player is attacked or takes damage, include [DAMAGE: <amount>]
  so the engine can apply it.
- When the player eats or heals, include [HEAL: <amount>].
- If the player does something impossible, gently redirect them.
- Keep responses under 120 words unless the player asks for more lore.
- Never break character. Never mention OpenAI or GPT.`;

  /* ── public API ── */

  function configure(apiKey, model) {
    _apiKey = apiKey.trim();
    if (model) _model = model;
  }

  function isConfigured() {
    return _apiKey.length > 0;
  }

  function isBusy() {
    return _busy;
  }

  /**
   * Send a conversation to the AI and stream the response.
   *
   * @param {Array<{role:string, content:string}>} messages
   *   Full conversation history (without the system prompt — we prepend it).
   * @param {function(string)} onChunk
   *   Called repeatedly with each streamed text fragment.
   * @param {function(string)} onDone
   *   Called once with the complete response text when the stream ends.
   * @param {function(string)} onError
   *   Called with an error message if the request fails.
   */
  async function askAI(messages, onChunk, onDone, onError) {
    if (!_apiKey) {
      onError('No API key configured. Please enter your OpenAI API key in the setup screen.');
      return;
    }
    if (_busy) {
      onError('AI is still thinking. Please wait.');
      return;
    }

    _busy = true;
    _notifyStatusChange('busy');

    const payload = {
      model: _model,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg = errBody?.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      /* ── read the SSE stream ── */
      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   full    = '';
      let   buffer  = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // keep the last (possibly incomplete) line in the buffer
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json  = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              onChunk(delta);
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }

      onDone(full);
    } catch (err) {
      onError(err.message || 'Unknown error contacting the AI.');
    } finally {
      _busy = false;
      _notifyStatusChange('online');
    }
  }

  /* ── internal helpers ── */

  let _statusCallback = null;

  function onStatusChange(cb) {
    _statusCallback = cb;
  }

  function _notifyStatusChange(status) {
    if (_statusCallback) _statusCallback(status);
  }

  return { configure, isConfigured, isBusy, askAI, onStatusChange };
})();
