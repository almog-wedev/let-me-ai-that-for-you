// AI provider definitions: where to send people + how to fake each provider's UI.
//
// Fields:
//   kind      'browser' (web chat app) | 'terminal' (CLI agent)
//   prefill   true if the provider accepts the prompt in its URL; otherwise we copy it to the clipboard
//   url(q)    destination; `q` is already URI-encoded
//   copy(p)   (optional) text to put on the clipboard instead of the raw prompt `p`
//   nav       sidebar items as [icon, label]
//   tools     composer buttons on the left, toolsRight on the right (before send) as [icon, label]
//   chips     suggestion pills under the composer

/** Fake sidebar history, grouped by type. Each visit mixes one entry per type (round-robin) so it's different every time. */
const HISTORY_POOL = {
  silly: [
    'Is cereal a soup?', 'Can I legally marry my air fryer', 'Is a hot dog a sandwich (final answer)',
    'How many ducks is too many ducks', 'Can a goldfish get depressed', 'Is it rude to high-five a waiter',
    'Why does my cat stare at the wall', 'Rank every potato by personality', 'Can pigeons be bribed',
  ],
  lazy: [
    'How to boil water (step by step)', 'Summarize this 2-line email', 'Is today Tuesday?',
    'Reply “ok” to my boss but professional', 'How to open a PDF', 'Write a text to my mom for me',
    'What is 7 + 5 (no calculator)', 'Read my own resume back to me', 'How to microwave ice cream',
  ],
  dark: [
    'Write my will but passive-aggressive', 'Houseplant died again. Am I a murderer?', 'Eulogy for my will to live',
    'How to fake my own death to skip a meeting', 'Is it too late to haunt my ex', 'Signs my coworker is a vampire',
    'Will my plants testify against me', 'Explain death to my goldfish (again)', 'Best alibi for eating roommate’s leftovers',
    'Is my landlord legally a ghost', 'How long until my inbox becomes sentient',
  ],
  tech: [
    'Why is my code not working', 'Is pushing to prod on Friday a crime', 'Center a div (attempt 47)',
    'Undo git push --force (URGENT!!!)', 'Does my laptop hate me personally', 'Explain “it works on my machine” to my boss',
  ],
  life: [
    'Polite email to my landlord (not polite)', 'Best excuse for being late (again)', 'How to adult, beginner level',
    'Can dogs eat pizza crust', 'Am I the drama?', 'Is 3pm too early for pajamas', 'How to leave a party without saying bye',
  ],
  existential: [
    'Are we living in a simulation', 'Do fish know they’re wet', 'Why am I like this',
    'What if I’m the NPC', 'Meaning of life in 5 words or less', 'Is my microwave judging me',
  ],
};

const PROVIDERS = {
  chatgpt: {
    name: 'ChatGPT', site: 'chatgpt.com', kind: 'browser', prefill: true,
    url: q => `https://chatgpt.com/?q=${q}`,
    nav: [['edit', 'New chat'], ['search', 'Search chats'], ['book', 'Library'], ['grid', 'GPTs']],
    recents: 'Chats', model: 'ChatGPT 5', plan: 'Free',
    greeting: 'What can I help with?', placeholder: 'Ask anything',
    tools: [['plus', '']], toolsRight: [['mic', '']], chips: [],
    disclaimer: 'ChatGPT can make mistakes. Check important info.',
  },
  claude: {
    name: 'Claude', site: 'claude.ai', kind: 'browser', prefill: true,
    url: q => `https://claude.ai/new?q=${q}`,
    nav: [['plus', 'New chat'], ['chat', 'Chats'], ['folder', 'Projects'], ['code', 'Code']],
    recents: 'Recents', model: '', composerModel: 'Opus 5.5', plan: 'Pro plan',
    greeting: 'Good {tod}, friend', placeholder: 'How can I help you today?',
    tools: [['plus', ''], ['sliders', ''], ['clock', '']], toolsRight: [],
    chips: [['edit', 'Write'], ['book', 'Learn'], ['code', 'Code'], ['coffee', 'Life stuff'], ['sparkle', 'Claude’s choice']],
    disclaimer: '',
  },
  gemini: {
    name: 'Gemini', site: 'gemini.google.com', kind: 'browser', prefill: false,
    url: () => 'https://gemini.google.com/app',
    nav: [['edit', 'New chat'], ['sparkle', 'Explore Gems']],
    recents: 'Recent', model: 'Gemini', plan: '',
    greeting: 'Hello, friend', placeholder: 'Ask Gemini',
    tools: [['plus', ''], ['sliders', 'Tools']], toolsRight: [['mic', '']],
    chips: [['search', 'Deep Research'], ['edit', 'Canvas'], ['image', 'Image'], ['code', 'Build']],
    disclaimer: 'Gemini can make mistakes, so double-check it',
  },
  deepseek: {
    name: 'DeepSeek', site: 'chat.deepseek.com', kind: 'browser', prefill: false,
    url: () => 'https://chat.deepseek.com/',
    nav: [['chat', 'New chat']],
    recents: 'Today', model: '', plan: '',
    greeting: 'Hi, I’m DeepSeek.', subGreeting: 'How can I help you today?', placeholder: 'Message DeepSeek',
    tools: [['atom', 'DeepThink'], ['globe', 'Search']], toolsRight: [['clip', '']], chips: [],
    disclaimer: 'AI-generated, for reference only',
  },
  perplexity: {
    name: 'Perplexity', site: 'perplexity.ai', kind: 'browser', prefill: true,
    url: q => `https://www.perplexity.ai/search?q=${q}`,
    nav: [['plus', 'New Thread'], ['search', 'Home'], ['compass', 'Discover'], ['grid', 'Spaces']],
    recents: 'Library', model: '', plan: 'Free',
    greeting: 'perplexity', placeholder: 'Ask anything…',
    tools: [['search', 'Search'], ['sparkle', 'Research']], toolsRight: [['globe', ''], ['clip', ''], ['mic', '']], chips: [],
    disclaimer: '',
  },
  grok: {
    name: 'Grok', site: 'grok.com', kind: 'browser', prefill: true,
    url: q => `https://grok.com/?q=${q}`,
    nav: [['search', 'Search'], ['chat', 'Chat'], ['clock', 'History']],
    recents: 'Today', model: '', composerModel: 'Auto', plan: '',
    greeting: 'Grok', placeholder: 'What do you want to know?',
    tools: [['clip', '']], toolsRight: [],
    chips: [['search', 'DeepSearch'], ['image', 'Create Images'], ['book', 'Latest News']],
    disclaimer: '',
  },
  copilot: {
    // `?q=` is reported flaky (sometimes ignored), so treat as copy-and-open but still pass it
    name: 'Copilot', site: 'copilot.microsoft.com', kind: 'browser', prefill: false,
    url: q => `https://copilot.microsoft.com/?q=${q}`,
    nav: [['edit', 'New chat'], ['compass', 'Discover'], ['image', 'Imagine']],
    recents: 'Conversations', model: '', composerModel: 'Quick response', plan: '',
    greeting: 'Hey friend, what’s on your mind today?', placeholder: 'Message Copilot',
    tools: [['plus', '']], toolsRight: [['mic', '']], chips: [],
    disclaimer: '',
  },
  claudecode: {
    name: 'Claude Code', site: 'claude', kind: 'terminal', prefill: false,
    url: () => 'https://docs.claude.com/en/docs/claude-code/overview',
    copy: prompt => `claude "${prompt.replace(/(["\\$`])/g, '\\$1')}"`,
    placeholder: 'Try "refactor <filepath>"',
  },
};
