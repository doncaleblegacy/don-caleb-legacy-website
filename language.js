/* Don Caleb Legacy - free, manually authored multilingual language switcher */
(async function () {
  const STORAGE_KEY = 'dcl_language';
  const DEFAULT_LANGUAGE = 'en';
  const LANGUAGES = [
    ['en', '🇬🇧', 'English'], ['fil', '🇵🇭', 'Filipino'],
    ['es', '🇪🇸', 'Español'], ['fr', '🇫🇷', 'Français'],
    ['de', '🇩🇪', 'Deutsch'], ['ja', '🇯🇵', '日本語'], ['zh', '🇨🇳', '简体中文']
  ];
  let dictionaries = {};

  function translatePage(language) {
    const dictionary = dictionaries[language] || {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.__dclOriginalText) node.__dclOriginalText = node.nodeValue;
      const original = node.__dclOriginalText;
      const key = original.trim();
      if (!key) return;
      const translated = language === 'en' ? key : dictionary[key];
      if (translated) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        node.nodeValue = leading + translated + trailing;
      } else if (language === 'en') {
        node.nodeValue = original;
      }
    });
    document.documentElement.lang = language === 'fil' ? 'fil' : language;
    const select = document.getElementById('dclLanguageSelect');
    if (select) select.value = language;
    try { localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
  }

  function addSelector() {
    const nav = document.querySelector('.topbar .nav');
    if (!nav || document.getElementById('dclLanguageSelect')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'dcl-language-control';
    const label = document.createElement('label');
    label.className = 'dcl-sr-only'; label.htmlFor = 'dclLanguageSelect'; label.textContent = 'Website language';
    const select = document.createElement('select');
    select.id = 'dclLanguageSelect'; select.setAttribute('aria-label', 'Website language');
    select.title = 'Select website language';
    LANGUAGES.forEach(([code, flag, name]) => {
      const option = document.createElement('option');
      option.value = code; option.textContent = flag; option.title = name;
      select.appendChild(option);
    });
    wrapper.append(label, select); nav.appendChild(wrapper);
    select.addEventListener('change', event => translatePage(event.target.value));
    const style = document.createElement('style');
    style.textContent = `.dcl-language-control{display:flex;align-items:center;margin-left:12px;flex-shrink:0}.dcl-language-control select{width:62px;min-width:62px;background:#111;color:#ead4a0;border:1px solid rgba(201,164,92,.65);border-radius:4px;padding:9px 5px;font:inherit;font-size:21px;line-height:1.2;text-align:center;cursor:pointer;appearance:auto}.dcl-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:650px){.dcl-language-control{margin-left:auto;margin-right:8px}.dcl-language-control select{width:58px;min-width:58px;padding:8px 4px;font-size:20px}.topbar .nav{gap:6px}}`;
    document.head.appendChild(style);
  }

  try {
    const response = await fetch('languages.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('languages.json could not be loaded');
    dictionaries = await response.json();
    addSelector();
    let saved = DEFAULT_LANGUAGE;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE; } catch (_) {}
    translatePage(dictionaries[saved] || saved === 'en' ? saved : DEFAULT_LANGUAGE);
  } catch (error) {
    console.error('[Don Caleb Legacy language]', error);
  }
})();
