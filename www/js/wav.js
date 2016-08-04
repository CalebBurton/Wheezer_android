/*
    This file is a slimmed-down version of the demo code included in the AudioInput plugin.
    Collects the raw microphone data, encodes it into WAV format and then displays the resulting blob.
    
    Audio input plugin:
        https://www.npmjs.com/package/cordova-plugin-audioinput
 */

// Capture configuration object
var captureCfg = {};

// Audio Buffer
var audioDataBuffer = [];

// Timers
var timerInterVal, timerGenerateSimulatedData;

var objectURL = null;

// Info/Debug
var totalReceivedData = 0;

// URL shim
window.URL = window.URL || window.webkitURL;


/**
 * Called continuously while AudioInput capture is running.
 */
function onAudioInputCapture(evt) {
    try {
        if (evt && evt.data) {
            // Increase the debug counter for received data
            totalReceivedData += evt.data.length;

            // Add the chunk to the buffer
            audioDataBuffer = audioDataBuffer.concat(evt.data);
        }
        else {
            console.log("Unknown audioinput event!");
            alert("Unknown audioinput event!");
        }
    }
    catch (ex) {
        console.log("onAudioInputCapture ex: ", ex);
        alert("onAudioInputCapture ex: " + ex);
    }
}


/**
 * Called when a plugin error happens.
 */
function onAudioInputError(error) {
    console.log("onAudioInputError event recieved: ", error);
    alert("Audio Input Error");
}


/**
 *
 */
var startCapture = function () {
    try {
        if (window.audioinput && !audioinput.isCapturing()) {
            // Originally used to get the audio capture configuration from the UI elements.
            // Now the configuration is hard-coded in the optimal(?) format for the Wheeze algorithm.
            captureCfg = {
                sampleRate: 44100,
                bufferSize: 16384,
                channels: 1,
                format: "PCM_16BIT",
                audioSourceType: 0
                /*
                    0 = DEFAULT (Android/iOS)
                    1 = MIC (Android)
                    5 = CAMCORDER (Android/iOS)
                    7 = VOICE_COMMUNICATION (Android/iOS)
                */
            };


            audioinput.start(captureCfg);
            console.log("Microphone input started!");

            // Throw away the previously created audio
            document.getElementById("recording-list").innerHTML = "";
            if (objectURL && URL.revokeObjectURL) {
                URL.revokeObjectURL(objectURL);
            }

            // Start the Interval that outputs time and debug data while capturing
            //
            var startTime = new Date();
            var currentTime;
            var elapsedSec;
            var pad = "00";
            timerInterVal = setInterval(function () {
                currentTime = new Date();
                elapsedSec = Math.floor((currentTime - startTime)/1000);
                elapsedSec = (pad + elapsedSec).slice(-2);    // SLICE formats the string with leading 0
                if (audioinput.isCapturing()) {
                    document.getElementById("infoTimer").innerHTML = "Time Recorded: " +
                        "00:" + elapsedSec + " | Bits Recorded:" + totalReceivedData;
                }
            }, 1000);

            disableStartButton();
        }
    }
    catch (e) {
        console.log("startCapture exception: ", e);
        alert("startCapture exception: " + e);
    }
};


/**
 *
 */
var stopCapture = function () {
    try {
        if (window.audioinput && audioinput.isCapturing()) {
            if (timerInterVal) {
                clearInterval(timerInterVal);
            }

            if (window.audioinput) {
                audioinput.stop();
            }

            totalReceivedData = 0;
            document.getElementById("infoTimer").innerHTML = "";

            console.log("Encoding WAV...");
            console.log("\tSample rate: ", captureCfg.sampleRate);
            console.log("\tChannel num: ", captureCfg.channels);
            var encoder = new WavAudioEncoder(captureCfg.sampleRate, captureCfg.channels);
            encoder.encode([audioDataBuffer]);

            console.log("Encoding WAV finished");

            var blob = encoder.finish("audio/wav");

            console.log("BLOB created");

            var reader = new FileReader();

            reader.onload = function (evt) {
                var audio = document.createElement("AUDIO");
                var text = document.createTextNode("New Recording");
                audio.controls = true;
                audio.src = evt.target.result;
                audio.type = "audio/wav";
                document.getElementById("recording-list").appendChild(text);
                document.getElementById("recording-list").appendChild(audio);
                console.log("Audio created");
                audioDataBuffer = [];
            };

            console.log("Loading from BLOB");
            reader.readAsDataURL(blob);

            disableStopButton();
        }
    }
    catch (e) {
        console.log("stopCapture exception: ", e);
        alert("stopCapture exception: " + e);
    }
};


/**
 *
 */
var initUIEvents = function () {
    document.getElementById("startCapture").addEventListener("click", startCapture);
    document.getElementById("stopCapture").addEventListener("click", stopCapture);
};


/**
 * When cordova fires the deviceready event, we initialize everything needed for audio input.
 */
var onDeviceReady = function () {
    if (window.cordova && window.audioinput) {
        initUIEvents();

        // Subscribe to audioinput events
        //
        window.addEventListener('audioinput', onAudioInputCapture, false);
        window.addEventListener('audioinputerror', onAudioInputError, false);
    }
    else {
        console.log("cordova-plugin-audioinput not found!");
        disableAllButtons();
    }
};

if (window.cordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
}
