let config = {};
let currentDomain = '';

async function loadConfig() {
  try {
    const result = await chrome.storage.local.get('config');
    if (Object.keys(result).length === 0) {
      const response = await fetch(chrome.runtime.getURL('config.json'));
      config = await response.json();
    } else {
      config = result.config;
    }
    displayCurrentActions();
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    const url = new URL(tab.url);
    currentDomain = url.hostname;
    document.getElementById('currentSite').textContent = currentDomain;
    displayCurrentActions();
  }
}

document.getElementById('actionType').addEventListener('change', (e) => {
  const selectorGroup = document.getElementById('selectorGroup');
  const positionGroup = document.getElementById('positionGroup');
  const navigationGroup = document.getElementById('navigationGroup');

  selectorGroup.classList.add('hidden');
  positionGroup.classList.add('hidden');
  navigationGroup.classList.add('hidden');

  switch (e.target.value) {
    case 'remove':
      selectorGroup.classList.remove('hidden');
      break;
    case 'removeScope':
      selectorGroup.classList.remove('hidden');
      positionGroup.classList.remove('hidden');
      break;
    case 'keyboardNavigation':
      navigationGroup.classList.remove('hidden');
      break;
  }
});

document.getElementById('addAction').addEventListener('click', async () => {
  const actionType = document.getElementById('actionType').value;
  if (!actionType) return;

  if (!config[currentDomain]) {
    config[currentDomain] = {};
  }

  switch (actionType) {
    case 'remove': {
      const selector = document.getElementById('selector').value;
      if (!selector) return;

      if (!config[currentDomain].remove) {
        config[currentDomain].remove = [];
      }
      config[currentDomain].remove.push(selector);
      break;
    }
    case 'removeScope': {
      const selector = document.getElementById('selector').value;
      const position = parseInt(document.getElementById('position').value);
      if (!selector || isNaN(position)) return;

      if (!config[currentDomain].removeScope) {
        config[currentDomain].removeScope = [];
      }
      config[currentDomain].removeScope.push({ selector, position });
      break;
    }
    case 'keyboardNavigation': {
      const nextSelector = document.getElementById('nextSelector').value;
      const prevSelector = document.getElementById('prevSelector').value;
      const matchText = document.getElementById('matchText').value;
      if (!nextSelector || !prevSelector) return;

      config[currentDomain].keyboardNavigation = {
        next: { selector: nextSelector },
        prev: { selector: prevSelector }
      };

      if (matchText) {
        config[currentDomain].keyboardNavigation.next.matchText = matchText;
        config[currentDomain].keyboardNavigation.prev.matchText = matchText;
      }
      break;
    }
  }

  await saveConfig();
  displayCurrentActions();
  resetForm();
});

function displayCurrentActions() {
  const actionsList = document.getElementById('actionsList');
  actionsList.innerHTML = '';

  if (!config[currentDomain]) return;

  const actions = config[currentDomain];
  
  if (actions.remove) {
    actions.remove.forEach((selector, index) => {
      addActionItem('Eliminar elemento', `Selector: ${selector}`, () => {
        actions.remove.splice(index, 1);
        if (actions.remove.length === 0) delete actions.remove;
        saveConfig();
        displayCurrentActions();
      });
    });
  }

  if (actions.removeScope) {
    actions.removeScope.forEach((scope, index) => {
      addActionItem('Eliminar por posición', 
        `Selector: ${scope.selector}, Posición: ${scope.position}`,
        () => {
          actions.removeScope.splice(index, 1);
          if (actions.removeScope.length === 0) delete actions.removeScope;
          saveConfig();
          displayCurrentActions();
        });
    });
  }

  if (actions.keyboardNavigation) {
    const nav = actions.keyboardNavigation;
    addActionItem('Navegación por teclado',
      `Siguiente: ${nav.next.selector}<br>Anterior: ${nav.prev.selector}` +
      (nav.next.matchText ? `<br>Texto: ${nav.next.matchText}` : ''),
      () => {
        delete actions.keyboardNavigation;
        saveConfig();
        displayCurrentActions();
      });
  }
}

function addActionItem(type, details, onDelete) {
  const actionsList = document.getElementById('actionsList');
  const item = document.createElement('div');
  item.className = 'action-item';
  item.innerHTML = `
    <div class="delete-action">×</div>
    <div class="action-type">${type}</div>
    <div class="action-details">${details}</div>
  `;
  
  item.querySelector('.delete-action').addEventListener('click', onDelete);
  actionsList.appendChild(item);
}

async function saveConfig() {
  try {
    await chrome.storage.local.set({ config });
    await chrome.runtime.sendMessage({ 
      type: 'updateConfig', 
      config: config 
    });
    console.log('Config saved:', config);
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function resetForm() {
  document.getElementById('actionType').value = '';
  document.getElementById('selector').value = '';
  document.getElementById('position').value = '';
  document.getElementById('nextSelector').value = '';
  document.getElementById('prevSelector').value = '';
  document.getElementById('matchText').value = '';
  
  document.getElementById('selectorGroup').classList.add('hidden');
  document.getElementById('positionGroup').classList.add('hidden');
  document.getElementById('navigationGroup').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  getCurrentTab();
});
