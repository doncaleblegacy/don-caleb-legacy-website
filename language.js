/* DON CALEB LEGACY
   Manual English / Filipino Language System - Version 2.0
   SEO and Google Search Console settings are not modified by this file.
*/
(async function () {
  "use strict";

  const STORAGE_KEY = "dcl_language";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "fil"];
  const LANGUAGES = [["en", "🇬🇧", "English"], ["fil", "🇵🇭", "Filipino"]];
  const ATTRIBUTES = ["alt", "title", "placeholder", "aria-label", "aria-description"];

  let dictionaries = {};
  let currentLanguage = DEFAULT_LANGUAGE;

  const originalText = new WeakMap();
  const appliedText = new WeakMap();
  const originalAttributes = new WeakMap();
  const appliedAttributes = new WeakMap();

  function normalize(value) {
    return String(value).replace(/\s+/g, " ").trim();
  }

  function translateValue(original, language) {
    if (language === "en") return original;
    const dictionary = dictionaries[language] || {};
    const key = normalize(original);
    return Object.prototype.hasOwnProperty.call(dictionary, key)
      ? dictionary[key]
      : original;
  }

  function withWhitespace(original, translated) {
    return (original.match(/^\s*/)[0]) + translated + (original.match(/\s*$/)[0]);
  }

  function shouldSkip(element) {
    return !element || element.closest(
      "script, style, noscript, textarea, code, pre, [contenteditable='true']"
    );
  }

  function translateTextNode(node, language) {
    if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkip(node.parentElement)) return;

    const current = node.nodeValue || "";
    if (!originalText.has(node)) {
      originalText.set(node, current);
    } else if (current !== appliedText.get(node)) {
      // Refresh the source when page scripts replace the text dynamically.
      originalText.set(node, current);
    }

    const original = originalText.get(node);
    const translated = translateValue(original, language);
    const output = language === "en" ? original : withWhitespace(original, translated);

    if (node.nodeValue !== output) node.nodeValue = output;
    appliedText.set(node, output);
  }

  function translateAttributes(element, language) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    ATTRIBUTES.forEach(function (attribute) {
      if (!element.hasAttribute(attribute)) return;

      let originals = originalAttributes.get(element);
      if (!originals) {
        originals = new Map();
        originalAttributes.set(element, originals);
      }

      let applied = appliedAttributes.get(element);
      if (!applied) {
        applied = new Map();
        appliedAttributes.set(element, applied);
      }

      const current = element.getAttribute(attribute) || "";
      if (!originals.has(attribute)) {
        originals.set(attribute, current);
      } else if (current !== applied.get(attribute)) {
        originals.set(attribute, current);
      }

      const output = translateValue(originals.get(attribute), language);
      if (element.getAttribute(attribute) !== output) {
        element.setAttribute(attribute, output);
      }
      applied.set(attribute, output);
    });
  }

  function translateTree(root, language) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, language);
      return;
    }

    if (root.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(root, language);
      if (shouldSkip(root)) return;
    }

    const doc = root.ownerDocument || document;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node, language);

    if (root.querySelectorAll) {
      root.querySelectorAll("*").forEach(function (element) {
        translateAttributes(element, language);
      });
    }
  }

  function setLanguage(language) {
    currentLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    document.documentElement.lang = currentLanguage;
    translateTree(document.body, currentLanguage);

    const selector = document.getElementById("dclLanguageSelect");
    if (selector) selector.value = currentLanguage;

    try {
      localStorage.setItem(STORAGE_KEY, currentLanguage);
    } catch (error) {
      console.warn("Language preference could not be saved.");
    }
  }

  function addSelector() {
    const nav = document.querySelector(".topbar .nav");
    const navLinks = document.getElementById("navLinks");
    if (!nav || !navLinks || document.getElementById("dclLanguageSelect")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "dcl-language-control";

    const label = document.createElement("label");
    label.className = "dcl-sr-only";
    label.htmlFor = "dclLanguageSelect";
    label.textContent = "Website language";

    const select = document.createElement("select");
    select.id = "dclLanguageSelect";
    select.setAttribute("aria-label", "Select website language");

    LANGUAGES.forEach(function ([code, flag, name]) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = flag;
      option.title = name;
      select.appendChild(option);
    });

    wrapper.append(label, select);
    navLinks.insertAdjacentElement("afterend", wrapper);
    select.addEventListener("change", function () { setLanguage(this.value); });

    const style = document.createElement("style");
    style.textContent = `
      .topbar .nav {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
      }
      .topbar .brand { order: 1; }
      .topbar .menu-btn { order: 2; }
      .topbar .navlinks { order: 3; }
      .dcl-language-control {
        order: 4; display: flex; align-items: center;
        flex-shrink: 0; margin-left: 12px;
      }
      .dcl-language-control select {
        width: 58px; min-width: 58px; height: 42px; padding: 5px;
        background: #111; color: #ead4a0;
        border: 1px solid rgba(201,164,92,.65); border-radius: 6px;
        font-size: 21px; text-align: center; cursor: pointer;
      }
      .dcl-sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }
      @media(max-width: 900px) { .dcl-language-control { margin-left: auto; } }
      @media(max-width: 650px) {
        .topbar .nav { gap: 8px; }
        .dcl-language-control { margin-left: auto; margin-right: 0; }
        .dcl-language-control select {
          width: 52px; min-width: 52px; height: 40px; font-size: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function observeDynamicContent() {
    if (!document.body || !("MutationObserver" in window)) return;

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target, currentLanguage);
        } else if (mutation.type === "attributes") {
          translateAttributes(mutation.target, currentLanguage);
        } else {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              translateTree(node, currentLanguage);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTES
    });
  }

  try {
    const response = await fetch("languages.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Unable to load languages.json (" + response.status + ")");

    const loaded = await response.json();
    if (!loaded || typeof loaded !== "object" || !loaded.fil || typeof loaded.fil !== "object") {
      throw new Error("languages.json has an invalid translation structure.");
    }
    dictionaries = loaded;

    addSelector();

    let savedLanguage = DEFAULT_LANGUAGE;
    try {
      savedLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    } catch (error) {}

    setLanguage(savedLanguage);
    observeDynamicContent();

    // Optional helpers for other same-page scripts.
    window.dclTranslatePage = setLanguage;
    window.dclTranslateText = function (text) {
      return translateValue(String(text), currentLanguage);
    };
  } catch (error) {
    console.error("Don Caleb Legacy Language Error:", error);
  }
})();
