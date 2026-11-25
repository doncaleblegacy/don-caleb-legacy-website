
/* Don Caleb Legacy - free manual language switcher */
(async function () {
  const STORAGE_KEY = 'dcl_language';
  const DEFAULT_LANGUAGE = 'en';
  let dictionaries = {};

  function translatePage(language) {
    const dictionary = dictionaries[language] || {};
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    const nodes = [];

    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if (!node.__dclOriginalText) {
        node.__dclOriginalText = node.nodeValue;
      }

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

    const select = document.getElementById('dclLanguageSelect');
    if (select) select.value = language;

    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_) {}
  }

  function addSelector() {
    const nav = document.querySelector('.topbar .nav');
    if (!nav || document.getElementById('dclLanguageSelect')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'dcl-language-control';

    wrapper.innerHTML = `
      <label class="dcl-sr-only" for="dclLanguageSelect">
        Website language
      </label>
      <select id="dclLanguageSelect" aria-label="Website language">
        <option value="en">🇬🇧</option>
        <option value="fil">🇵🇭</option>
      </select>
    `;

    nav.appendChild(wrapper);

    wrapper.querySelector('select').addEventListener('change', event => {
      translatePage(event.target.value);
    });

    const style = document.createElement('style');

    style.textContent = `
      .dcl-language-control {
        display: flex;
        align-items: center;
        margin-left: 12px;
        flex-shrink: 0;
        position: relative;
      }

      .dcl-language-control select {
        appearance: none;
        -webkit-appearance: none;
        width: 58px;
        height: 46px;
        padding: 6px 18px 6px 5px;
        text-align: center;
        text-align-last: center;
        background: #111;
        color: #ead4a0;
        border: 1px solid rgba(201,164,92,.65);
        border-radius: 5px;
        font-size: 23px;
        cursor: pointer;
      }

      .dcl-language-control::after {
        content: '⌄';
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-55%);
        color: #ead4a0;
        font-size: 13px;
        pointer-events: none;
      }

      .dcl-language-control option {
        background: #111;
        color: #fff;
        font-size: 20px;
      }

      .dcl-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
      }

      @media(max-width:650px) {
        .dcl-language-control {
          margin-left: auto;
          margin-right: 8px;
        }

        .dcl-language-control select {
          width: 54px;
          height: 44px;
          font-size: 21px;
        }

        .topbar .nav {
          gap: 6px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  try {
    const response = await fetch('languages.json', {
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error('languages.json could not be loaded');
    }

    dictionaries = await response.json();
    addSelector();

    let saved = DEFAULT_LANGUAGE;

    try {
      saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    } catch (_) {}

    translatePage(saved === 'fil' ? 'fil' : 'en');

  } catch (error) {
    console.error('[Don Caleb Legacy language]', error);
  }
})();
