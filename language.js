/* Don Caleb Legacy - free manual language switcher */
(async function () {
  const STORAGE_KEY = 'dcl_language';
  const DEFAULT_LANGUAGE = 'en';
  let dictionaries = {};
  let currentLanguage = DEFAULT_LANGUAGE;

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
    document.documentElement.lang = language === 'fil' ? 'fil' : 'en';
    currentLanguage = language;
    const select = document.getElementById('dclLanguageSelect');
    if (select) select.value = language;
    try { localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
  }

  function addSelector() {
    const nav = document.querySelector('.topbar .nav');
    if (!nav || document.getElementById('dclLanguageSelect')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'dcl-language-control';
    wrapper.innerHTML = '<label class="dcl-sr-only" for="dclLanguageSelect">Website language</label><select id="dclLanguageSelect" aria-label="Website language"><option value="en">🇬🇧 English</option><option value="fil">🇵🇭 Filipino</option></select>';
    nav.appendChild(wrapper);
    wrapper.querySelector('select').addEventListener('change', event => translatePage(event.target.value));
    const style = document.createElement('style');
    style.textContent = `.dcl-language-control{display:flex;align-items:center;margin-left:12px;flex-shrink:0}.dcl-language-control select{background:#111;color:#ead4a0;border:1px solid rgba(201,164,92,.65);border-radius:4px;padding:9px 10px;font:inherit;font-size:12px;cursor:pointer;max-width:125px}.dcl-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:650px){.dcl-language-control{margin-left:auto;margin-right:8px}.dcl-language-control select{padding:8px 6px;max-width:112px}.topbar .nav{gap:6px}}`;
    document.head.appendChild(style);
  }

  try {
    const response = await fetch('languages.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('languages.json could not be loaded');
    dictionaries = await response.json();
    addSelector();
    let saved = DEFAULT_LANGUAGE;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE; } catch (_) {}
    translatePage(saved === 'fil' ? 'fil' : 'en');
  } catch (error) {
    console.error('[Don Caleb Legacy language]', error);
  }
})();
