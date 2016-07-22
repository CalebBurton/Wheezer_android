/*
 This demo shows how to collect the raw microphone data, encode it into WAV format and then use the resulting blob
 as src for a HTML Audio element. No Web Audio API support is needed for this to work.
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
            //var audioSourceElement = document.getElementById("audioSource"),
            //    audioSourceType = audioSourceElement.options[audioSourceElement.selectedIndex].value;

            // Get the audio capture configuration from the UI elements
            //
            captureCfg = {
                sampleRate: 44100, //1125, //parseInt(document.getElementById('sampleRate').value),
                bufferSize: 16384, //parseInt(document.getElementById('bufferSize').value),
                channels: 1, //parseInt(document.querySelector('input[name="channels"]:checked').value),
                format: "PCM_16BIT", //document.querySelector('input[name="format"]:checked').value,
                audioSourceType: 0 //parseInt(audioSourceType)
                /*
                    <option value="0">DEFAULT (Android/iOS)</option>
                    <option value="5">CAMCORDER (Android/iOS)</option>
                    <option value="7">VOICE_COMMUNICATION (Android/iOS)</option>
                    <option value="1">MIC (Android)</option>
                */
            };


            audioinput.start(captureCfg);
            console.log("Microphone input started!");

            // Throw previously created audio
            document.getElementById("recording-list").innerHTML = "";
            if (objectURL && URL.revokeObjectURL) {
                URL.revokeObjectURL(objectURL);
            }

            // Start the Interval that outputs time and debug data while capturing
            //
            var elapsedTime = 0;
            timerInterVal = setInterval(function () {
                if (audioinput.isCapturing()) {
                    document.getElementById("infoTimer").innerHTML = "" +
                        new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") +
                        "|Received:" + totalReceivedData;
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
                audio.controls = true;
                audio.src = evt.target.result;
                audio.type = "audio/wav";
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
