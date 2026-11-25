document.addEventListener("DOMContentLoaded", function () {

  const languages = [
    { code: "en", flag: "🇬🇧", name: "English" },
    { code: "fil", flag: "🇵🇭", name: "Filipino" },
    { code: "es", flag: "🇪🇸", name: "Spanish" },
    { code: "fr", flag: "🇫🇷", name: "French" },
    { code: "de", flag: "🇩🇪", name: "German" },
    { code: "ja", flag: "🇯🇵", name: "Japanese" },
    { code: "zh", flag: "🇨🇳", name: "Chinese" }
  ];

  const selector = document.createElement("div");
  selector.className = "language-selector";

  selector.innerHTML = `
    <button type="button" class="language-current" aria-label="Select language">
      <span class="current-flag">🇬🇧</span>
      <span class="language-arrow">⌄</span>
    </button>
    <div class="language-dropdown"></div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .language-selector {
      position: relative;
      display: inline-block;
      margin-left: 12px;
      z-index: 1000;
    }

    .language-current {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 55px;
      height: 38px;
      background: #111;
      border: 1px solid rgba(201,164,92,.5);
      border-radius: 6px;
      cursor: pointer;
      color: #ead4a0;
    }

    .current-flag {
      font-size: 21px;
      line-height: 1;
    }

    .language-arrow {
      font-size: 13px;
      color: #ead4a0;
    }

    .language-dropdown {
      display: none;
      position: absolute;
      top: 44px;
      right: 0;
      min-width: 150px;
      background: #111;
      border: 1px solid rgba(201,164,92,.4);
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,.4);
    }

    .language-dropdown.open {
      display: block;
    }

    .language-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 13px;
      border: 0;
      background: transparent;
      color: #f5f0e6;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
    }

    .language-option:hover {
      background: #292218;
      color: #ead4a0;
    }

    @media(max-width:650px) {
      .language-selector {
        margin-left: 8px;
      }
      .language-current {
        width: 48px;
        height: 36px;
      }
    }
  `;

  document.head.appendChild(style);

  const nav = document.querySelector(".nav");
  const menuButton = document.getElementById("menuBtn");

  if (!nav) return;

  if (menuButton) {
    menuButton.insertAdjacentElement("afterend", selector);
  } else {
    nav.appendChild(selector);
  }

  const currentButton = selector.querySelector(".language-current");
  const currentFlag = selector.querySelector(".current-flag");
  const dropdown = selector.querySelector(".language-dropdown");

  languages.forEach(language => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "language-option";
    option.innerHTML = `
      <span>${language.flag}</span>
      <span>${language.name}</span>
    `;

    option.addEventListener("click", function () {
      currentFlag.textContent = language.flag;
      dropdown.classList.remove("open");

      document.documentElement.lang = language.code;
      localStorage.setItem("selectedLanguage", language.code);

      document.dispatchEvent(new CustomEvent("languageChanged", {
        detail: { language: language.code }
      }));
    });

    dropdown.appendChild(option);
  });

  currentButton.addEventListener("click", function () {
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", function (event) {
    if (!selector.contains(event.target)) {
      dropdown.classList.remove("open");
    }
  });

  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
  const selected = languages.find(item => item.code === savedLanguage);

  if (selected) {
    currentFlag.textContent = selected.flag;
    document.documentElement.lang = selected.code;
  }

});
