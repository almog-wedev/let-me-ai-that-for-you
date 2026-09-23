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

/**
 * Fake sidebar history, grouped by type. Each visit mixes entries across types (round-robin) so it's different
 * every time. Kept short (~30 chars) since the sidebar truncates with an ellipsis past that.
 */
const HISTORY_POOL = {
  silly: [
    'Is cereal a soup?', 'Is a hot dog a sandwich', 'Can I marry my air fryer', 'Do ducks have knees',
    'Can pigeons be bribed', 'Is soup a beverage', 'Why do my socks vanish', 'Rank potatoes by vibe',
    'Can cats be sued', 'Is water just wet air', 'Can I return a haircut', 'Do squirrels need a union',
    'Is a taco a sandwich', 'Can I befriend a pigeon', 'Do fish have belly buttons', 'Is my toaster judging me',
    'Can dogs smell Wednesdays', 'Is a hoodie formalwear', 'Why is my cat plotting', 'Can geese be reasoned with',
    'Is a wrap just a burrito', 'Do bees have feelings', 'Can I train a raccoon', 'Is a bagel a donut',
    'Why do birds hate me', 'Can I microwave a spoon', 'Is a hot dog a taco too', 'Do cats know they’re cats',
    'Can I un-adopt a cactus', 'Is my Roomba judging me',
  ],
  lazy: [
    'Boil water, step by step', 'Is today Tuesday', 'Reply “ok” but professional', 'Open a PDF for me',
    'Text my mom for me', '7 + 5, no calculator', 'Read my resume back to me', 'Microwave ice cream, how',
    'Turn my laptop off', 'What time is it right now', 'Unmute me on Zoom', 'Screenshot this for me',
    'Unzip a file, please', 'Restart my router. Again.', 'Set a timer, lazily', 'Reply to “k” for me',
    'Write my grocery list', 'Summarize this 2-line email', 'Explain the group chat', 'Do my math homework',
    'Write “happy birthday”, longer', 'Read the terms for me', 'Tell me what’s for dinner',
  ],
  dark: [
    'Write my will, petty', 'My plant died. Again.', 'Fake my death, quick', 'Is it too late to haunt my ex',
    'Is my landlord a ghost', 'Eulogy for my will to live', 'Alibi for eating leftovers', 'Is my coworker a vampire',
    'Will my plants snitch', 'Is my Roomba plotting', 'Ransom-note resignation', 'Obituary for my motivation',
    'Am I the villain here', 'Explain death to my fish', 'Is 3am me a different person', 'Sorry letter to a dead plant',
    'Is my toaster sentient', 'Bury my to-do list', 'Explain ghosting, literally', 'Draft my own eulogy, mean',
    'Is my inbox alive now', 'Curse my printer, formally', 'Explain haunting, for beginners',
  ],
  tech: [
    'Why is my code broken', 'Center a div, attempt 47', 'Undo git push --force', 'My laptop hates me',
    'Works on my machine, why', 'console.log fixed it, why', 'Off and on again, real fix?', 'Explain merge conflicts',
    'node_modules fixed it', 'Explain recursion, really', 'Too many tabs, be honest', 'Explain the cloud, simply',
    'Bug or feature, you decide', 'Stack Overflow: a skill?', 'Why did that just work',
  ],
  life: [
    'Email my landlord, mean', 'Best excuse, I’m late', 'How to adult, beginner', 'Fold a fitted sheet',
    'Fake a call, escape now', 'Say no, fifth time today', 'Un-invite myself, help', 'Survive small talk',
    'Is napping this much bad', 'Leave a party, no bye', 'Seem busy in meetings', 'Answer “what do you do”',
    'Can dogs eat pizza crust', 'Is 3pm too early for pjs', 'Adult friends, how do',
  ],
  existential: [
    'Are we in a simulation', 'Do fish know they’re wet', 'Why am I like this', 'Am I the NPC here',
    'Meaning of life, 5 words', 'Main character or side', 'Is time even real', '2am me makes bad calls',
    'Overthinking: a hobby?', 'Nostalgia vs regret, explain', 'Is my microwave judging me', 'What if I’m the bad guy',
  ],
  petty: [
    'Win an argument I lost', 'Text I’ll never send', 'One-up my sibling, how', 'Comeback from 2019, need',
    'Seem unbothered, help', 'Petty sticky note, office', 'Win a chat nobody started', 'A review that’s not a lie',
  ],
  money: [
    'Explain my bank statement', 'Budget: just don’t spend?', 'Crypto, but I have $12', 'Negotiate a raise, help',
    'Split a bill, no math', 'What’s a Roth IRA', 'Is coffee the real problem',
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
