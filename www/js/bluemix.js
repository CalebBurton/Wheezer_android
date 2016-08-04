/*
*** Created by Caleb Burton, an ASSIST intern during the summer of 2016
*** cburton@u.northwestern.edu

    This module uses the REST protocol to upload/download audio files to a Bluemix Cloudant database
    using the Cloudant API.

    Originally tried using the official BMS plugin, but ran into quite a few issues. The BMS code is
    included at the end of the file inside a block comment.

    Doesn't yet support creating/deleting Cloudant documents, so it doesn't support multiple users yet.
*/

angular.module('myApp.bms', ['ionic'])

// Allows saving and retrieving data from the phone's local storage
// Not actually used right now, but included in case we want that functionality later.
.factory('Recordings', function() {
  return {
    all: function() {
      var recordingString = window.localStorage['recordings'];
      if(recordingString) {
        return angular.fromJson(recordingString);
      }
      return [];
    },
    save: function(recordings) {
      window.localStorage['recordings'] = angular.toJson(recordings);
    },
    newRecording: function(recordingName, audioBlob) {
      var currentTime = Date.now();
      return {
        title: recordingName,
        created: currentTime,
        audioData: audioBlob
      };
    },
  }
})


.controller('bmsCtrl', function ($scope, $timeout, $ionicPlatform, $ionicModal, Recordings, $ionicSideMenuDelegate, $ionicActionSheet) {
    // Global vars
    var cloudant_Username = "812cf44b-c59b-4288-a505-ad7e6b1b2f55-bluemix";
    var cloudant_Database = "my_sample_db";                             // Same accross all patients
    var cloudant_DocID = "f081c331c1d0842fd740cb801776bff8";            // Unique to each patient
    var cloudant_DocRev = "";                                           // Will be updated below by pinging the server
    var cloudant_MIMEtype = "audio/wav";
    var preview = document.querySelector('#recording-list');            // Grabs a <div> element. We'll modify it later to give a preview
    var loader = document.querySelector('#loader');
    var loadingGif = "<img src=\"img/loadingGif.gif\" height=100>";

    var xmlAppName = "ccb-cloudant";
    var xmlAPILoc = "favorites/attach";
    var xmlID = cloudant_DocID;
    var xmlName = "patient_1";
    var xmlValue = "p1description";

    //var requesterURL =  "https://" + cloudant_Username + ".cloudant.com/" + cloudant_Database + "/" + cloudant_DocID;
    
    var baseURL = "http://" + xmlAppName + ".mybluemix.net/api/" + xmlAPILoc + "?id=" + xmlID   // Same for sender and requester
    var requesterURL = baseURL + "&key=" + "ahem_x.wav"
    var senderURL = baseURL + "&name=" + xmlName + "&value=" + xmlValue;

    $scope.recordings = Recordings.all();

    // Injects an HTML audio element
    var audioPreview = function(src, type) {
        return "<audio controls>" + "<source " + "src=\"" + src + "\"" + "type=\"" + type + "\" />" + "</audio>";
    }

    // Saves a recording to the phone's memory for future retrieval.
    // Not utilized yet, but might be in the future.
    var createRecording = function(recordingName, audioBlob) {
        var newRecording = Recordings.newRecording(recordingName, audioBlob);
        $scope.recordings.push(newRecording);
        console.log("New recording added to array");
        Recordings.save($scope.recordings);
        console.log("Recordings array saved in memory");
    }

    // "b" is a boolean to determine where the file should come from
    $scope.cloudant_upload = function(b) {
        loader.innerHTML = loadingGif;

        var audioFile;
        if(b){  // File from memory
            audioFile = document.getElementById('upload_file').files[0];
            
        }
        else{   // New recording
            var aURL = preview.firstChild.nextSibling.src;
            var audioBlob = $scope.dataURLtoBlob(aURL);
            var fileName = new Date().toUTCString();
            fileName += ".wav";
            audioFile = new File([audioBlob], fileName, {type:audioBlob.type});
        }
        requesterURL = baseURL + "&key=" + audioFile.name;
        console.log(audioFile);
        console.log(requesterURL);

        // The Cloudant API wants uploads to come as a "form" object. Not sure why.
        var form = new FormData();
        form.append("file", audioFile);
        var payload = form;

        
        var xhr = new XMLHttpRequest();
        xhr.open("POST", senderURL);
        xhr.send(payload);

	    xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                loader.innerHTML = "";
                if(xhr.status == 200){
                    alert("File uploaded successfully.");
                }else{
                    alert("ERROR");
                    console.log("Upload Error: ", xhr);
                }
            }
        }
    };

    
    $scope.displayer = function(num){
        console.log("Displaying ", document.getElementById('upload_file').files[num].name)
        var f = document.getElementById('upload_file').files[num] // Gives a convenient way to reference the file we're interested in
        var r = new FileReader();   // Initializes a FileReader
        r.readAsDataURL(f);         // Uses the FilReader to actually read in the file
        r.addEventListener(
            'load',
            function () {
	            var audioURL = this.result; // The file will be in the form of a DataURL
	            preview.innerHTML = f.name;
	            preview.innerHTML += audioPreview(audioURL, cloudant_MIMEtype);
	        },
	        false
        );            
    };

    $scope.downloader = function() {
        loader.innerHTML = loadingGif;
        var xhr = new XMLHttpRequest();
	    xhr.open("GET", requesterURL, true);
        xhr.responseType = "blob";
        xhr.send();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                loader.innerHTML = "";
                if(xhr.status == 200){
                    // This part is only necessary if the user can select their own file to upload,
                    // which was a feature that was mainly used to demonstrate upload capability before
                    // the audio recording functionality was available. Probably won't be present in
                    // the final production release.
                    var fileCache = document.getElementById('upload_file');
                    var num = 0;
                    if (fileCache.files[0] != null){
                        num = 1;
                    }
                    fileCache.files[num] = xhr.response;
                    $scope.displayer(num);
                }
                else{
                    alert("ERROR");
                    console.log("Download Error: ", xhr);
                }
            }
	    };
    };	    

    $scope.dataURLtoBlob = function(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
})


/*
--------------------------------------------------------------
----------------- USEFUL LINKS FOR REFERENCE -----------------
--------------------------------------------------------------

Cloudant Document Conflict Resolution
    Part 1: https://cloudant.com/blog/introduction-to-document-conflicts-part-one/
    Part 2: https://cloudant.com/blog/introduction-to-document-conflicts-part-two/
    Part 3: https://cloudant.com/blog/introduction-to-document-conflicts-part-three/

Cloudant Attachments
    https://docs.cloudant.com/attachments.html

HTTP Transfers Using Form Data
    http://stackoverflow.com/questions/4007969/application-x-www-form-urlencoded-or-multipart-form-data

FileReader object
    readAsDataURL: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL 

Event Listeners
    addEventListener: http://stackoverflow.com/questions/21556090/cordova-angularjs-device-ready
    useCapture: http://stackoverflow.com/questions/7398290/unable-to-understand-usecapture-attribute-in-addeventlistener

*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*
    // This uses an MFPRequest to upload directly to the database. Using the API seems to be better.

        var requester = new MFPRequest(requesterURL, MFPRequest.GET);   // Ping the server to get the current database revision
        requester.send(
            function(successMsg) {  // Current revision has been retrieved
                cloudant_DocRev = JSON.parse(successMsg.responseText)._rev; // NOTE: "_rev" WITH an underscore, unlike the responseText
                var sender = new MFPRequest(senderURL + "?rev=" + cloudant_DocRev, MFPRequest.PUT);
                var headers = {"Content-type": cloudant_MIMEtype};
                sender.setHeaders(headers);
                var payload = audioURL;
                sender.send(
                    payload,
                    function(successMsg) {
                        alert("File " + angular.toUpperCase(cloudant_Attachment) + " uploaded successfully.");
                        cloudant_DocRev = JSON.parse(successMsg.responseText).rev;  // NOTE: "rev" WITHOUT an underscore
                    },
                    $scope.bms_failure
                );
            },
            $scope.bms_failure
        );
    };
*/