# Auto Script Loader - Extensión para Firefox

Esta es una extensión para Firefox que permite cargar scripts automáticamente y bloquear elementos en páginas web específicas.

## Características

- 🛡️ **Bloqueo de scripts maliciosos**: Intercepta y bloquea scripts que contengan redirecciones no deseadas
- 🎯 **Eliminación de elementos**: Remueve elementos específicos usando selectores CSS
- ⌨️ **Navegación por teclado**: Permite usar las flechas del teclado para navegar entre páginas
- 🔧 **Configuración por dominio**: Cada sitio web puede tener su propia configuración

## Instalación en Firefox

### Opción 1: Instalación temporal (desarrollo)
1. Abre Firefox
2. Ve a `about:debugging` en la barra de direcciones
3. Haz clic en "Esta instancia de Firefox"
4. Haz clic en "Cargar complemento temporal..."
5. Selecciona el archivo `manifest.json` de esta carpeta

### Opción 2: Empaquetado para distribución
1. Comprime todos los archivos en un archivo ZIP
2. Cambia la extensión de `.zip` a `.xpi`
3. Instala el archivo `.xpi` en Firefox

## Diferencias con Chrome

Esta extensión ha sido adaptada de Chrome a Firefox con los siguientes cambios:

- **Manifest V2**: Firefox usa Manifest V2 en lugar de V3
- **browser_action**: En lugar de `action`, Firefox usa `browser_action`
- **Background scripts**: En lugar de service workers, Firefox usa scripts de fondo tradicionales
- **APIs compatibility**: Se usa `browser` API cuando está disponible, con fallback a `chrome`

## Estructura del proyecto

```
├── manifest.json          # Manifiesto de la extensión (V2 para Firefox)
├── config.json           # Configuración de dominios
├── src/
│   ├── background.js     # Script de fondo (adaptado para Firefox)
│   ├── blocker.js        # Script de contenido para bloqueo
│   └── popup.html        # Interfaz del popup
├── js/
│   └── popup.js          # Lógica del popup (adaptada para Firefox)
├── css/
│   ├── popup.css         # Estilos del popup
│   └── hide-element.css  # Estilos para ocultar elementos
└── assets/
    └── icons/            # Iconos de la extensión
```

## Configuración

La extensión se configura a través del archivo `config.json` y la interfaz del popup. Puedes:

1. **Eliminar elementos**: Especifica selectores CSS para remover elementos
2. **Navegación por teclado**: Configura botones de siguiente/anterior
3. **Bloqueo de divs aleatorios**: Elimina elementos con IDs/clases generadas aleatoriamente

## Compatibilidad

- **Firefox**: 109.0 o superior
- **Manifest**: V2 (compatible con Firefox)
- **APIs**: Usa `browser` API nativo de Firefox con fallback a `chrome`

## Desarrollo

Para modificar la extensión:

1. Edita los archivos necesarios
2. Recarga la extensión en `about:debugging`
3. Prueba los cambios en las páginas objetivo

## Notas importantes

- Esta extensión está optimizada para Firefox y usa Manifest V2
- La compatibilidad con Chrome se mantiene usando detección de APIs
- Los permisos han sido ajustados para cumplir con las políticas de Firefox
