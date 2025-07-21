// Interceptar y bloquear scripts maliciosos
let isExtensionValid = true;

// Firefox compatibility: usar browser o chrome
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Verificar si el contexto de la extensión sigue siendo válido
function checkExtensionContext() {
  try {
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.id) {
      return true;
    }
  } catch (error) {
    console.warn("Extension context invalidated, stopping observer");
    isExtensionValid = false;
    return false;
  }
  return false;
}

const observer = new MutationObserver((mutations) => {
  try {
    // Verificar si el contexto de la extensión sigue siendo válido
    if (!isExtensionValid || !checkExtensionContext()) {
      observer.disconnect();
      return;
    }

    const keys = ['akan01.com', 'mangacrab']; // Reemplaza con tus dominios permitidos

    // si la url(key) de config.json coincide con la actual, bloquear
    if (!keys.includes(window.location.hostname)) {
      return;
    }
    
    console.log("✅ Scripts bloqueados:", keys);
    
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.tagName === "SCRIPT") {
          const content = node.textContent || "";
          const src = node.src || "";

          // Bloquear si contiene redirección o viene de dominio sospechoso
          if (
            content.includes("window.location.href") ||
            src.includes("akan01.com")
          ) {
            console.warn("❌ Script malicioso bloqueado:", src || "(inline)");
            node.remove(); // evita ejecución
          }
        }

        // Bloquea nodos de texto dentro de <script>
        if (node.nodeType === 3 && node.parentElement?.tagName === "SCRIPT") {
          const text = node.textContent || "";
          if (text.includes("window.location.href")) {
            console.warn("❌ Script de texto malicioso eliminado");
            node.parentElement.remove();
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in MutationObserver:", error);
    if (error.message.includes("Extension context invalidated")) {
      isExtensionValid = false;
      observer.disconnect();
    }
  }
});

// Inicializar el observer solo si el contexto es válido
if (checkExtensionContext()) {
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
} else {
  console.warn("Extension context is not valid, observer not started");
}

// Limpiar el observer cuando la página se descarga
window.addEventListener('beforeunload', () => {
  try {
    observer.disconnect();
  } catch (error) {
    // Ignorar errores al desconectar
  }
});

// Detectar cuando el contexto de la extensión se invalida
if (browserAPI && browserAPI.runtime) {
  try {
    browserAPI.runtime.onConnect.addListener(() => {
      // El contexto sigue siendo válido
    });
  } catch (error) {
    // Ignorar errores en Firefox si la API no está disponible
  }
}
