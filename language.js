
/* DON CALEB LEGACY
   Manual English / Filipino Language System
*/

(async function () {
  const STORAGE_KEY = "dcl_language";
  const DEFAULT_LANGUAGE = "en";

  const LANGUAGES = [
    ["en", "🇬🇧", "English"],
    ["fil", "🇵🇭", "Filipino"]
  ];

  let dictionaries = {};

  // TRANSLATION SYSTEM
  function translatePage(language) {
    const dictionary = dictionaries[language] || {};

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
      if (!node.__dclOriginalText) {
        node.__dclOriginalText = node.nodeValue;
      }

      const original = node.__dclOriginalText;
      const key = original.replace(/\s+/g, " ").trim();

      if (!key) return;

      const translated =
        language === "en" ? key : dictionary[key];

      if (translated) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];

        node.nodeValue =
          leading + translated + trailing;
      } else if (language === "en") {
        node.nodeValue = original;
      }
    });

    document.documentElement.lang = language;

    const selector =
      document.getElementById("dclLanguageSelect");

    if (selector) {
      selector.value = language;
    }

    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.warn("Language preference could not be saved.");
    }
  }

  // LANGUAGE SELECTOR
  function addSelector() {
    const nav = document.querySelector(".topbar .nav");
    const navLinks = document.getElementById("navLinks");

    if (!nav || !navLinks) return;

    if (document.getElementById("dclLanguageSelect")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "dcl-language-control";

    const label = document.createElement("label");
    label.className = "dcl-sr-only";
    label.htmlFor = "dclLanguageSelect";
    label.textContent = "Website language";

    const select = document.createElement("select");
    select.id = "dclLanguageSelect";
    select.setAttribute("aria-label", "Select website language");

    LANGUAGES.forEach(([code, flag, name]) => {
      const option = document.createElement("option");

      option.value = code;
      option.textContent = flag;
      option.title = name;

      select.appendChild(option);
    });

    wrapper.append(label, select);

    // INSERT AFTER NAVIGATION LINKS
    navLinks.insertAdjacentElement("afterend", wrapper);

    // SELECT LANGUAGE
    select.addEventListener("change", function () {
      translatePage(this.value);
    });

    // SELECTOR DESIGN
    const style = document.createElement("style");

    style.textContent = `
      .topbar .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .topbar .brand {
        order: 1;
      }

      .topbar .menu-btn {
        order: 2;
      }

      .topbar .navlinks {
        order: 3;
      }

      .dcl-language-control {
        order: 4;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-left: 12px;
      }

      .dcl-language-control select {
        width: 58px;
        min-width: 58px;
        height: 42px;
        padding: 5px;
        background: #111;
        color: #ead4a0;
        border: 1px solid rgba(201,164,92,.65);
        border-radius: 6px;
        font-size: 21px;
        text-align: center;
        cursor: pointer;
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

      @media(max-width: 900px) {
        .dcl-language-control {
          margin-left: auto;
        }
      }

      @media(max-width: 650px) {
        .topbar .nav {
          gap: 8px;
        }

        .dcl-language-control {
          margin-left: auto;
          margin-right: 0;
        }

        .dcl-language-control select {
          width: 52px;
          min-width: 52px;
          height: 40px;
          font-size: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // LOAD MANUAL TRANSLATIONS
  try {
    const response = await fetch("languages.json", {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error("Unable to load languages.json");
    }

    dictionaries = await response.json();

    addSelector();

    let savedLanguage = DEFAULT_LANGUAGE;

    try {
      savedLanguage =
        localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    } catch (error) {}

    if (
      savedLanguage !== "en" &&
      savedLanguage !== "fil"
    ) {
      savedLanguage = DEFAULT_LANGUAGE;
    }

    translatePage(savedLanguage);

  } catch (error) {
    console.error(
      "Don Caleb Legacy Language Error:",
      error
    );
  }
})();
