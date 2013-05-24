// This is a shim for phonegap's setFullscreen
if (!navigator) {
    navigator = {};
}
if (!navigator.window) {
    navigator.window = {};
}
if (!navigator.window.setFullScreen) {
    navigator.window.setFullScreen = function() {};
}

// This starts the app
function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
    enyo.dispatcher.listen(document, "deviceready");
}

function onDeviceReady() {
    navigator.window.setFullScreen(true);
    window.app = new Grundschrift.App().renderInto(document.body);
}
