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
 * every time. Phrases run 3-8 words; the sidebar font is sized to fit most of them on one line.
 */
const HISTORY_POOL = {
  silly: [
    'Is cereal secretly a type of soup', 'Is a hot dog technically a sandwich', 'Can I legally marry my air fryer',
    'Do ducks actually have visible knees', 'Can pigeons be bribed with bread', 'Does soup count as a beverage',
    'Why do my socks vanish in the wash', 'Rank every potato by its personality', 'Can cats be sued for their attitude',
    'Is water just wet air, technically', 'Can I return a haircut I regret', 'Do squirrels need a labor union',
    'Is a taco just a sad sandwich', 'Can I officially befriend a pigeon', 'Do fish have belly buttons or not',
    'Is my toaster judging my choices', 'Can dogs tell what day it is', 'Is a hoodie considered business casual',
    'Why is my cat definitely plotting something', 'Can geese be reasoned with, ever', 'Is a wrap just a lazy burrito',
    'Do bees have feelings we ignore', 'Can I legally train a wild raccoon', 'Is a bagel just a fancy donut',
    'Why do birds specifically hate me', 'Can I microwave a spoon by mistake', 'Is a hot dog also a taco',
    'Do cats know they are cats', 'Can I un-adopt a needy cactus', 'Is my Roomba judging my life choices',
  ],
  lazy: [
    'Nominate my couch for an award', 'Can I hire a ghost to fold laundry', 'Outsource blinking to something else',
    'Is breathing manually exhausting for anyone else', 'Can my shadow do chores instead', 'Delegate walking the dog to a drone',
    'Is standing up a form of cardio', 'Can I nap in four dimensions', 'Hire a stunt double for Mondays',
    'Can silence do my laundry for me', 'Is lying horizontally a career path', 'Can my houseplant answer my emails',
    'Outsource existing to a subscription service', 'Is gravity doing too much work already', 'Can I pay someone to blink for me',
    'Can I nap standing up, professionally', 'Is thinking optional today, asking seriously',
  ],
  dark: [
    'Write my will, but make it petty', 'My houseplant died again, am I cursed', 'How to fake my own death, quickly',
    'Is it too late to haunt my ex', 'Is my landlord allowed to be a ghost', 'Write a eulogy for my will to live',
    'Best alibi for eating my roommate\'s leftovers', 'Signs that my coworker might be a vampire', 'Will my houseplants testify against me',
    'Is my Roomba secretly plotting something', 'Write my resignation letter as a ransom note', 'Draft an obituary for my motivation',
    'Am I the villain in someone else\'s story', 'Explain death to my goldfish, again', 'Is 3am me a legally different person',
    'A sorry letter to a plant I killed', 'Is my toaster becoming sentient, be honest', 'Draft a eulogy for my to-do list',
    'Explain ghosting to someone, very literally', 'Write my own eulogy, but a little mean', 'Is my inbox alive and getting worse',
    'Formally curse my printer for existing', 'Explain haunting to a total beginner',
  ],
  tech: [
    'Did my laptop just wink at me', 'Is my router talking to the moon', 'My code compiled itself, should I worry',
    'Is my keyboard alive and unionizing', 'Why did my Wi-Fi start whispering', 'Can my smart fridge file my taxes',
    'Is my mouse cursor sentient now', 'Explain why my printer bit me', 'Did my computer dream last night',
    'Is my USB port secretly a portal', 'My code fixed itself at 3am, why', 'Is my CPU plotting world domination',
    'Can my toaster mine crypto in secret', 'Why does my modem hum in Latin', 'Is my monitor watching me back',
  ],
  life: [
    'Is my neighbor secretly a time traveler', 'Can I befriend the mailbox permanently', 'Why does my houseplant judge my outfits',
    'Is my reflection running slightly late', 'Can I file a complaint against Mondays', 'Is my toaster having an identity crisis',
    'Why does my doorbell ring itself', 'Can I legally adopt a shadow', 'Is my umbrella cursed, genuinely asking',
    'Why do my keys teleport constantly', 'Can I un-know something I just learned', 'Is my houseplant plotting a coup',
    'Why did my socks unionize overnight', 'Can I return today and try again', 'Is my alarm clock haunted, be honest',
  ],
  existential: [
    'Are we possibly living in a simulation', 'Do fish know that they are wet', 'Why am I like this, genuinely',
    'What if I\'m just the NPC here', 'The meaning of life in five words', 'Main character energy or side character energy',
    'Is time real or just a shared guess', '2am me makes all the bad decisions', 'Is overthinking basically a hobby at this point',
    'Is nostalgia just regret with better lighting', 'Is my microwave silently judging my choices', 'What if I\'m actually the bad guy here',
  ],
  petty: [
    'Draft a formal complaint against the moon', 'Sue my alarm clock for emotional damage', 'Write a strongly worded letter to gravity',
    'File a grievance against Monday mornings', 'Ban my own reflection from judging me', 'Formally boycott my own left sock',
    'Write a diss track about my printer', 'Challenge my houseplant to a staring contest', 'Send a cease and desist to autocorrect',
    'Petition to formally outlaw slow walkers',
  ],
  money: [
    'Can I invest in imaginary friends', 'Is my piggy bank gaining consciousness', 'Can I pay rent in expired coupons',
    'Is my wallet secretly a black hole', 'Can I bribe my bank, hypothetically', 'Is loose change a valid currency now',
    'Can I short-sell my own motivation', 'Is my savings account just theoretical now', 'Can I trade favors for actual dollars',
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
