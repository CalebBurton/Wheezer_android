cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-bluetoothle/www/bluetoothle.js",
        "id": "cordova-plugin-bluetoothle.BluetoothLe",
        "clobbers": [
            "window.bluetoothle"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "id": "cordova-plugin-dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dialogs/www/android/notification.js",
        "id": "cordova-plugin-dialogs.notification_android",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-vibration/www/vibration.js",
        "id": "cordova-plugin-vibration.notification",
        "merges": [
            "navigator.notification",
            "navigator"
        ]
    },
    {
        "file": "plugins/cordova.plugins.diagnostic/www/android/diagnostic.js",
        "id": "cordova.plugins.diagnostic.Diagnostic",
        "clobbers": [
            "cordova.plugins.diagnostic"
        ]
    },
    {
        "file": "plugins/ibm-mfp-core/www/BMSClient.js",
        "id": "ibm-mfp-core.BMSClient",
        "clobbers": [
            "BMSClient"
        ]
    },
    {
        "file": "plugins/ibm-mfp-core/www/MFPRequest.js",
        "id": "ibm-mfp-core.MFPRequest",
        "clobbers": [
            "MFPRequest"
        ]
    },
    {
        "file": "plugins/ibm-mfp-core/www/MFPLogger.js",
        "id": "ibm-mfp-core.MFPLogger",
        "clobbers": [
            "MFPLogger"
        ]
    },
    {
        "file": "plugins/ibm-mfp-core/www/MFPAnalytics.js",
        "id": "ibm-mfp-core.MFPAnalytics",
        "clobbers": [
            "MFPAnalytics"
        ]
    },
    {
        "file": "plugins/ibm-mfp-core/www/MFPAuthorizationManager.js",
        "id": "ibm-mfp-core.MFPAuthorizationManager",
        "clobbers": [
            "MFPAuthorizationManager"
        ]
    },
    {
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/cordova-plugin-audioinput/www/audioInputCapture.js",
        "id": "cordova-plugin-audioinput.AudioInput",
        "clobbers": [
            "audioinput"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-bluetoothle": "4.0.0",
    "cordova-plugin-dialogs": "1.2.1",
    "cordova-plugin-vibration": "2.1.1",
    "cordova-plugin-whitelist": "1.2.2",
    "cordova.plugins.diagnostic": "3.1.0",
    "ibm-mfp-core": "1.0.11",
    "cordova-plugin-splashscreen": "3.2.2",
    "cordova-plugin-compat": "1.0.0",
    "cordova-plugin-audioinput": "0.3.0"
};
// BOTTOM OF METADATA
});