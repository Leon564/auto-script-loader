# auto-script-loader

Extensión para cargar scripts automáticamente en páginas web. Esta extensión de Chrome te permite automatizar acciones en sitios web mediante configuraciones personalizadas.

## Características

- 🔄 Eliminación automática de elementos
- 🎯 Eliminación de elementos por posición
- ⌨️ Navegación por teclado personalizada
- 🔧 Configuración por sitio web
- 💾 Persistencia de configuraciones

## Estructura del Proyecto

```
extension-test/
├── assets/
│   └── icons/        # Iconos de la extensión (16px, 48px, 128px)
├── css/
│   ├── popup.css     # Estilos de la ventana emergente
│   └── hide-element.css
├── js/
│   └── popup.js      # Funcionalidad de la ventana emergente
├── src/
│   ├── background.js # Service worker
│   └── popup.html    # Interfaz de la extensión
└── config.json       # Configuración de la extensión
```

## Permisos Requeridos

- `activeTab`: Para interactuar con la pestaña activa
- `scripting`: Para ejecutar scripts en las páginas web
- `tabs`: Para acceder a la información de las pestañas
- `storage`: Para guardar la configuración

## Instalación

1. Clona este repositorio o descarga los archivos
2. Abre Chrome y navega a `chrome://extensions/`
3. Activa el "Modo desarrollador"
4. Haz clic en "Cargar descomprimida"
5. Selecciona la carpeta del proyecto

## Uso

1. Haz clic en el icono de la extensión en la barra de herramientas
2. Selecciona el tipo de acción que deseas configurar:
   - Eliminar elemento
   - Eliminar elemento por posición
   - Navegación por teclado
3. Configura los selectores y opciones necesarias
4. ¡Listo! La extensión aplicará automáticamente las acciones configuradas
