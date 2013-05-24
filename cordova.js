// Cordova Browser Fallback
var device = {
    platform: "browser"
};



window.setTimeout(function() {
    var e = document.createEvent('Events');
    e.initEvent("deviceready");
    document.dispatchEvent(e);
}, 250);