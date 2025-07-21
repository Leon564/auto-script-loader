// Script de verificación de compatibilidad Firefox/Chrome
// Este archivo puede ser incluido para verificar que las APIs funcionan correctamente

(function() {
    'use strict';
    
    // Detectar el navegador
    const isFirefox = typeof browser !== 'undefined';
    const isChrome = typeof chrome !== 'undefined';
    
    console.log('🔍 Verificación de compatibilidad:');
    console.log('📱 Navegador:', isFirefox ? 'Firefox' : isChrome ? 'Chrome/Chromium' : 'Desconocido');
    
    // Seleccionar la API correcta
    const browserAPI = isFirefox ? browser : chrome;
    
    if (!browserAPI) {
        console.error('❌ No se detectó API de extensión válida');
        return;
    }
    
    // Verificar APIs disponibles
    const apis = {
        'runtime': !!browserAPI.runtime,
        'storage': !!browserAPI.storage,
        'tabs': !!browserAPI.tabs,
        'storage.local': !!(browserAPI.storage && browserAPI.storage.local)
    };
    
    console.log('🔧 APIs disponibles:');
    Object.entries(apis).forEach(([api, available]) => {
        console.log(`  ${available ? '✅' : '❌'} ${api}`);
    });
    
    // Verificar manifiesto
    if (browserAPI.runtime && browserAPI.runtime.getManifest) {
        const manifest = browserAPI.runtime.getManifest();
        console.log('📋 Manifiesto:');
        console.log(`  📄 Versión: ${manifest.version}`);
        console.log(`  📋 Manifest Version: ${manifest.manifest_version}`);
        console.log(`  🎯 Tipo: ${manifest.manifest_version === 2 ? 'Firefox/Legacy' : 'Chrome V3'}`);
    }
    
    // Test básico de storage
    if (apis['storage.local']) {
        browserAPI.storage.local.get('test').then(result => {
            console.log('💾 Storage test: OK');
        }).catch(error => {
            console.warn('⚠️ Storage test failed:', error);
        });
    }
    
    console.log('✅ Verificación completa');
})();
