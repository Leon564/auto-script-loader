// Interceptar y bloquear scripts maliciosos
const observer = new MutationObserver((mutations) => {
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
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
