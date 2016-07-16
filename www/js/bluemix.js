/*
// Initialize BMSClient
bms_init = function() {
    this.bindEvents();
}


    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bms_bindEvents = function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }

    // deviceready Event Handler
    function onDeviceReady() {
        BMSClient.initialize(bms_route, bms_guid);
    }
*/
//////////////////////////////////////////////////////////////////////////////////////////


angular.module('myApp.bms', ['ionic'])


// Allows saving and retrieving data from the phone's local storage
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
    newRecording: function(recordingName) {
      var currentTime = Date.now();
      return {
        title: recordingName,
        created: currentTime,
        audioData: ""
      };
    },
  }
})


.controller('bmsCtrl', function ($scope, $timeout, $ionicPlatform, $ionicModal, Recordings, $ionicSideMenuDelegate, $ionicActionSheet) {
    // Bluemix credentials
    var bms_route = "http://wheezer.mybluemix.net";
    var bms_guid = "bebed0f9-f192-42c8-877e-817251c343f0";
    // Cloudant credentials
    var cloudant_bms_route = "http://ccb-cloudant.mybluemix.net";
    var cloudant_bms_guid = "503a965b-5ba8-4a3d-b7e7-403375548369";

    // Global vars used for debugging and keeping track of which functions are being called
    var funct = "";
    // Android Client ID: 853130241725-mtljp8gct4pqtjvvrdt1kl9e8t90vho3.apps.googleusercontent.com

    var cloudant_Username = "812cf44b-c59b-4288-a505-ad7e6b1b2f55-bluemix";
    var cloudant_Database = "my_sample_db";                                 // Will be the same accross all patients
    var cloudant_DocID = "9824ffba8c5837b1272a1fb08c96dec3";                // Will be unique to each patient
    var cloudant_DocRev = "";                                               // Will be updated by pinging the server below
    var cloudant_Attachment = "pirateReal.wav"//Date.now() + ".wav";                          // Named by time. Ensures that each file name will be unique
    var cloudant_MIMEtype = "audio/wav"; //"image/jpg";
    var preview = document.querySelector('#preview');                       // Grabs a <div> element. We'll modify it later to give a preview
    var audioURL;
    var audioBlob;

    var senderURL =     "https://" + cloudant_Username + ".cloudant.com/" + cloudant_Database + "/" + cloudant_DocID + "/" + cloudant_Attachment;
    var requesterURL =  "https://" + cloudant_Username + ".cloudant.com/" + cloudant_Database + "/" + cloudant_DocID;

    $scope.recordings = Recordings.all();

    var audioPreview = function(src, type) {
        return "<audio controls>" + "<source " + "src=\"" + src + "\"" + "type=\"" + type + "\">" + "</audio>";
    }

    var createRecording = function(recordingName) {
        var newRecording = Recordings.newRecording(recordingName);
        $scope.recordings.push(newRecording);
        Recordings.save($scope.recordings);
    }
    
    $scope.bms_success = function(successMsg) {
        alert("The " + funct + " function succeeded! Response:\n" + successMsg.responseText);
    };

    $scope.bms_failure = function(failureMsg) {
        alert("The " + funct + " function failed. Response:\n" + failureMsg.errorDescription);
    };

    $scope.bms_update = function () {
        BMSClient.initialize(bms_route, bms_guid);
        var todoReq = new MFPRequest("/api/items", MFPRequest.GET);
        funct = "TODO RETRIEVAL"
        todoReq.send(
            function(successMsg){
                $scope.todos = JSON.parse(successMsg.responseText);
                $scope.$apply();
            },
            $scope.bms_failure
        );

        /*
        var countReq = new MFPRequest("/api/items/count", MFPRequest.GET);
        funct = "COUNT RETRIEVAL";
        countReq.send(
            $scope.bms_success,
            $scope.bms_failure
        );
        */
    };

    $scope.bms_delete = function (IDtoDelete) {
        BMSClient.initialize(bms_route, bms_guid);

        var request = new MFPRequest("/api/Items/" + IDtoDelete, MFPRequest.DELETE);
        func = "DELETE"
        request.send(
            function (success) {},
            $scope.bms_failure
        );
    };

    $scope.bms_deleteAndUpdate = function (todoID) {
        BMSClient.initialize(cloudant_bms_route, cloudant_bms_guid);
        // Show the action sheet
        $ionicActionSheet.show({
            buttons: [
                { text: 'Yes' },
                { text: 'No' }
            ],
            titleText: 'Are you sure you want to delete this item?',
            buttonClicked: function (buttonIndex) {
                if (buttonIndex == 0) {
                    $scope.bms_delete(todoID);
                    $scope.bms_update();
                }
                return true;
            }
        });
    };

    $scope.bms_upload = function() {
        func = "UPLOAD";
        BMSClient.initialize(bms_route, bms_guid);
        var request = new MFPRequest("/api/items/", MFPRequest.POST);

        var payload = {
            "text": text_value,
            "isDone": false,
            "audio": ""
        };

        request.send(payload, function(){}, $scope.bms_failure);

        $scope.bms_update();
    };



    $scope.cloudant_upload = function() {
        BMSClient.initialize(cloudant_bms_route, cloudant_bms_guid);
        /*
        var recordingName = prompt("Please name the recording: ");
        if(recordingName) {
            createRecording(recordingName);
        }
        */
        funct = "CLOUDANT_UPLOAD";

        var requester = new MFPRequest(requesterURL, MFPRequest.GET);   // Ping the server to get the current database revision
        requester.send(
            function(successMsg) {  // Save the current revision so we can upload an attachment
                cloudant_DocRev = JSON.parse(successMsg.responseText)._rev; // NOTE: "_rev" WITH an underscore, unlike the responseText
            },
            $scope.bms_failure
        );
        
        setTimeout( // The wrapped function won't execute until the time below expires. This gives the server time to respond.
            function() {
                var sender = new MFPRequest(senderURL + "?rev=" + cloudant_DocRev, MFPRequest.PUT);
                //var headers = {"Content-Type": cloudant_MIMEtype};  // Probably not necessary
                //sender.setHeaders(headers);

                //var audioBlob = $scope.dataURLtoBlob(audioURL);
                //alert("Blob created");
                //var payload = audioBlob;
                var payload = audioURL;
                
                sender.send(
                    payload,
                    function(successMsg) {
                        alert("File uploaded successfully");
                        cloudant_DocRev = JSON.parse(successMsg.responseText).rev;  // NOTE: "rev" WITHOUT an underscore, unlike the sent message
                    },
                    $scope.bms_failure
                );
            },
            (700)   // Pause for 700 milliseconds to allow the server to send back the newest revision number
        );
    };

    $scope.displayer = function(){
        BMSClient.initialize(cloudant_bms_route, cloudant_bms_guid);
        var f = document.getElementById('upload_file').files[0] // Gives a convenient way to reference the file we uploaded
        var r = new FileReader();                               // Initializes a FileReader
        r.readAsDataURL(f);                                     // Uses the FilReader to actually read in the file
        r.addEventListener( "load",                             // Once the file has been read, begin the following:
                            function () {
                                audioURL = this.result;        // The file will be in the form of a DataURL
                                preview.innerHTML = audioPreview(audioURL, cloudant_MIMEtype);
                                /*
                                    "<audio controls>" +
                                        "<source " +
                                            "src=\"" + audioURL + "\"" +
                                            "type=\"" + cloudant_MIMEtype + "\">" +
                                    "</audio>";
                                */
                            },
                            false); // useCapture. Essentially assigns priority for alerts. FALSE is fine for our case.
    };

    $scope.downloader = function() {
        BMSClient.initialize(cloudant_bms_route, cloudant_bms_guid);
        funct = "DOWNLOADER";
        var requesterURL =  "https://" + cloudant_Username + ".cloudant.com/"
                            + cloudant_Database + "/" + cloudant_DocID
                            + "/" + "pirateReal.wav";

        var requester = new MFPRequest(requesterURL, MFPRequest.GET);
        requester.send(
            function(successMsg) {
                audioURL = successMsg.responseText;
                preview.innerHTML = audioPreview(audioURL, cloudant_MIMEtype);
                /*
                    "<audio controls>" +
                        "<source " +
                            "src=\"" + audioURL + "\"" +
                            "type=\""+ cloudant_MIMEtype + "\">" +
                    "</audio>";
                */
                alert("Success");
            },
            $scope.bms_failure
        );
    };

    $scope.dataURLtoBlob = function(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    $scope.blobToDataURL = function(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {callback(e.target.result);}
        a.readAsDataURL(blob);
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

FileReader object
    readAsDataURL: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL 

addEventListener
    useCapture: http://stackoverflow.com/questions/7398290/unable-to-understand-usecapture-attribute-in-addeventlistener


*/