let config = {};

// Firefox compatibility: usar browser o chrome
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.storage.local.get("config").then((result) => {
  if (Object.keys(result).length === 0) {
    fetch(browserAPI.runtime.getURL("config.json"))
      .then((response) => response.json())
      .then((data) => {
        config = data;
        browserAPI.storage.local.set({ config });
      });
  } else {
    config = result.config;
  }
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateConfig") {
    config = message.config;
    browserAPI.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tab.url) return;

        for (const domain in config) {
          if (tab.url.includes(domain)) {
            updateTab(tab.id, config[domain]);
            break;
          }
        }
      });
    });
  }
});

function updateTab(tabId, domainConfig) {
  // Firefox: usar insertCSS en lugar de scripting.insertCSS
  const cssCode = domainConfig.remove
    ?.map((sel) => `${sel} { display: none !important; }`)
    .join("\n") || "";
  
  if (cssCode) {
    browserAPI.tabs.insertCSS(tabId, { code: cssCode });
  }

  // Firefox: usar executeScript en lugar de scripting.executeScript
  browserAPI.tabs.executeScript(tabId, {
    code: `
      const config = ${JSON.stringify(domainConfig)};
      (${handlePageScripts.toString()})(config);
    `
  });
}

browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  for (const domain in config) {
    if (tab.url.includes(domain)) {
      updateTab(tabId, config[domain]);
      break;
    }
  }
});

function handlePageScripts(config) {
  console.log("Executing script for page...");

  if (config.remove) {
    config.remove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });
  }

  if (config.removeScope) {
    config.removeScope.forEach((scope) => {
      document.querySelectorAll(scope.selector).forEach((el, i) => {
        if (i === scope.position) el.remove();
      });
    });
  }

  if (config.removeRandomDiv) {
    const randomPattern = /^[a-z]{50,}$/;
    document.querySelectorAll("div").forEach((div) => {
      const id = div.id;
      const classes = Array.from(div.classList);

      if (
        (id && randomPattern.test(id)) ||
        classes.some((cls) => randomPattern.test(cls))
      ) {
        div.remove();
      }
    });
  }

  if (config.keyboardNavigation) {
    document.addEventListener("keydown", (event) => {
      const isNext = event.key === "ArrowRight";
      const isPrev = event.key === "ArrowLeft";

      if (isNext || isPrev) {
        const navConfig = config.keyboardNavigation[isNext ? "next" : "prev"];
        let button = document.querySelector(navConfig.selector);

        if (navConfig.matchText) {
          button = Array.from(
            document.querySelectorAll(navConfig.selector)
          ).find((a) => a.textContent.trim() === navConfig.matchText);
        }

        if (button && button.tagName === "DIV") {
          button = Array.from(button.children).find(
            (child) => child.tagName === "A" || child.tagName === "BUTTON"
          );
        }

        if (button) button.click();
      }
    });
  }

  if (config.checkUrl) {
    if (window.location.pathname.endsWith("/paginated")) {
      window.location.href =
        window.location.origin +
        window.location.pathname.replace("/paginated", "/cascade") +
        window.location.search;
    }
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (config.remove?.some((sel) => node.matches(sel))) node.remove();
          if (config.removeScope) {
            config.removeScope.forEach((scope) => {
              const elements = node.querySelectorAll(scope.selector);
              elements.forEach((el, i) => {
                if (i === scope.position) el.remove();
              });
            });
          }
          if (config.removeRandomDiv && node.tagName === "DIV") {
            const id = node.id;
            const classes = Array.from(node.classList);
            const randomPattern = /^[a-z]{60,}$/;

            if (
              (id && randomPattern.test(id)) ||
              classes.some((cls) => randomPattern.test(cls))
            ) {
              node.remove();
            }
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
