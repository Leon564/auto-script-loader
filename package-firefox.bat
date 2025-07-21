@echo off
echo Empaquetando extensión para Firefox...

REM Crear directorio temporal
if exist firefox-package rmdir /s /q firefox-package
mkdir firefox-package

REM Copiar archivos necesarios
copy manifest.json firefox-package\
copy config.json firefox-package\
copy README-Firefox.md firefox-package\README.md

REM Copiar directorios
xcopy /E /I src firefox-package\src
xcopy /E /I js firefox-package\js
xcopy /E /I css firefox-package\css
xcopy /E /I assets firefox-package\assets

REM Crear archivo XPI
cd firefox-package
echo Creando archivo XPI...
powershell Compress-Archive -Path * -DestinationPath ..\auto-script-loader-firefox.zip
cd ..
ren auto-script-loader-firefox.zip auto-script-loader-firefox.xpi

REM Limpiar
rmdir /s /q firefox-package

echo.
echo ✅ Extensión empaquetada como: auto-script-loader-firefox.xpi
echo.
echo Para instalar en Firefox:
echo 1. Abre Firefox
echo 2. Ve a about:debugging
echo 3. Haz clic en "Esta instancia de Firefox"
echo 4. Haz clic en "Cargar complemento temporal..."
echo 5. Selecciona el archivo manifest.json
echo.
echo O arrastra el archivo .xpi al navegador para instalación permanente
pause
