/*
// Determines which platform the demo runs on
var isMobile = {
    Android: function () {
        return /Android/i.test(navigator.userAgent);
    },
    iOS: function () {
        return /iOS/i.test(navigator.userAgent);
    },
    any: function () {
        return (isMobile.Android() || isMobile.iOS());
    }
};
*/

var disableStartButton = function() {
    document.getElementById("startCapture").disabled = true;
    document.getElementById("stopCapture").disabled = false;
};

var disableStopButton = function() {
    document.getElementById("startCapture").disabled = false;
    document.getElementById("stopCapture").disabled = true;
};

var disableAllButtons = function() {
    document.getElementById("startCapture").disabled = true;
    document.getElementById("stopCapture").disabled = true;
};