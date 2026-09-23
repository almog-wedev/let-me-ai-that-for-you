// Inline SVG icons + provider logos (approximations, drawn by hand — no brand assets).

/** Stroke icon paths (24×24, feather-style). */
const ICON_PATHS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  chat: 'M4 5h16v11H9l-5 4z',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  up: 'M12 19V5M5 12l7-7 7 7',
  left: 'M19 12H5M12 19l-7-7 7-7',
  right: 'M5 12h14M12 5l7 7-7 7',
  reload: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  dots: 'M12 5h.01M12 12h.01M12 19h.01',
  sidebar: 'M4 4h16v16H4zM9 4v16',
  chevron: 'M6 9l6 6 6-6',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  clip: 'M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7',
  share: 'M12 3v12M7 8l5-5 5 5M5 14v6h14v-6',
  sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5',
  coffee: 'M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1a3 3 0 0 1 0 6h-1M8 3v3M12 3v3',
  atom: 'M12 12h.01M12 3c4 0 6 4 6 9s-2 9-6 9-6-4-6-9 2-9 6-9zM3.5 7.5c2-3.5 6.5-2 10.8.5s7.7 6 5.7 9.5-6.5 2-10.8-.5S1.5 11 3.5 7.5z',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  x: 'M6 6l12 12M18 6L6 18',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
};

/** Render a stroke icon by name. */
const icon = (name, size = 18) =>
  `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON_PATHS[name]}"/></svg>`;

/** Repeat an SVG fragment rotated around the center `n` times. */
const radial = (n, frag) => Array.from({ length: n }, (_, i) => `<g transform="rotate(${(360 / n) * i} 12 12)">${frag}</g>`).join('');

/** Provider logos as SVG strings. */
const LOGOS = {
  chatgpt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${radial(6, '<ellipse cx="12" cy="7.5" rx="2.6" ry="5"/>')}</svg>`,
  claude: `<svg viewBox="0 0 24 24" fill="#d97757">${radial(12, '<rect x="11" y="1.5" width="2" height="9" rx="1"/>')}</svg>`,
  gemini: `<svg viewBox="0 0 24 24"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f8cff"/><stop offset=".6" stop-color="#9b72cb"/><stop offset="1" stop-color="#d96570"/></linearGradient></defs><path fill="url(#gg)" d="M12 1c.6 5.8 5.2 10.4 11 11-5.8.6-10.4 5.2-11 11-.6-5.8-5.2-10.4-11-11C6.8 11.4 11.4 6.8 12 1z"/></svg>`,
  deepseek: `<svg viewBox="0 0 24 24"><path fill="#4d6bfe" d="M2.5 12.5C2.5 8.4 6.6 5.5 11.5 5.5c4 0 7 2 8 4.8l2.2-2v6l-2-1.1c-1 3.4-4.3 5.3-8.4 5.3-5.2 0-8.8-2.4-8.8-6z"/><circle cx="7.5" cy="11" r="1.1" fill="#fff"/></svg>`,
  perplexity: `<svg viewBox="0 0 24 24" fill="none" stroke="#20808d" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2v20M5 7l7 5 7-5M5 3v4h14V3M5 7v9l7-4 7 4V7M5 16l7 6 7-6v4H5z"/></svg>`,
  grok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 7.5A7 7 0 1 0 18.5 15M4 20L20 4"/></svg>`,
  copilot: `<svg viewBox="0 0 24 24"><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b6fff"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><path fill="url(#cg)" d="M8 3h6c1.5 0 2.5 1 3 2.4L21 17c.5 2-1 4-3 4h-6c-1.5 0-2.5-1-3-2.4L5 7c-.5-2 1-4 3-4z"/><path fill="#fff" opacity=".35" d="M9 7h5l3 10h-5z"/></svg>`,
};
LOGOS.claudecode = LOGOS.claude;
