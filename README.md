# LMAITFY — Let Me AI That For You

Like [lmgtfy](https://lmgtfy.com), but for AI. Type the question someone asked you, pick an AI, and share the link. When they open it, they watch a fake browser (or terminal) go to the AI, type their question and send it. Then they get sent to the real thing.

A static site with no build step and no database. The whole question lives in the URL:

```
?ai=<provider>&q=<question>&lang=<en|he>
```

## Providers

| id | Opens | Question passed by |
|---|---|---|
| `chatgpt` | chatgpt.com/?q= | URL (fills the box; auto-sends only when typed in the address bar) |
| `claude` | claude.ai/new?q= | URL (fills the box) |
| `perplexity` | perplexity.ai/search?q= | URL (auto-sends) |
| `grok` | grok.com/?q= | URL (auto-sends) |
| `gemini` | gemini.google.com/app | Clipboard (no URL param) |
| `deepseek` | chat.deepseek.com | Clipboard (no URL param) |
| `copilot` | copilot.microsoft.com/?q= | Clipboard + URL (`?q=` is unreliable) |
| `claudecode` | Claude Code docs | Clipboard: `claude "<question>"` |

To add a provider, add an entry to `providers.js` (see the field docs at the top) and a theme block in `style.css` (`.app[data-ai="…"]`).

## Files

- `index.html`: page shell (create mode + play mode)
- `app.js`: link builder, animation engine, redirect
- `providers.js`: provider URLs + mock UI config
- `i18n.js`: English/Hebrew copy
- `icons.js`: inline SVG icons + hand-drawn logos
- `style.css`: everything visual

## Run locally

```bash
python3 -m http.server 8765
```

## Deploy (GitHub Pages)

Push to GitHub, then go to **Settings → Pages → Deploy from branch → `main` / root**. The `.nojekyll` file is already there.
