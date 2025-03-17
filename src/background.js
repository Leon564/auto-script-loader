let config = {};

chrome.storage.local.get('config').then(result => {
  if (Object.keys(result).length === 0) {
    fetch(chrome.runtime.getURL('config.json'))
      .then(response => response.json())
      .then(data => {
        config = data;
        chrome.storage.local.set({ config });
      });
  } else {
    config = result.config;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateConfig') {
    config = message.config;
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
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
  chrome.scripting.insertCSS({
    target: { tabId },
    css: domainConfig.remove
      ?.map((sel) => `${sel} { display: none !important; }`)
      .join("\n") || "",
  });

  chrome.scripting.executeScript({
    target: { tabId },
    func: handlePageScripts,
    args: [domainConfig],
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
    document.querySelectorAll('div').forEach(div => {
      const id = div.id;
      const classes = Array.from(div.classList);
      
      if ((id && randomPattern.test(id)) || classes.some(cls => randomPattern.test(cls))) {
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
          if (config.removeRandomDiv && node.tagName === 'DIV') {
            const id = node.id;
            const classes = Array.from(node.classList);
            const randomPattern = /^[a-z]{60,}$/;
            
            if ((id && randomPattern.test(id)) || classes.some(cls => randomPattern.test(cls))) {
              node.remove();
            }
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
