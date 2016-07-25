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
    // Global vars used for debugging and keeping track of which functions are being called
    var funct = "";
    // Android Client ID: 853130241725-mtljp8gct4pqtjvvrdt1kl9e8t90vho3.apps.googleusercontent.com

    var cloudant_Username = "812cf44b-c59b-4288-a505-ad7e6b1b2f55-bluemix";
    var cloudant_Database = "my_sample_db";                             // Will be the same accross all patients
    var cloudant_DocID = "f081c331c1d0842fd740cb801776bff8";            // Will be unique to each patient
    var cloudant_DocRev = "";                                           // Will be updated by pinging the server below
    var cloudant_Attachment = Date.now() + ".wav";                    // Named by time. Ensures that each file name will be unique
    var cloudant_MIMEtype = "audio/wav";
    var preview = document.querySelector('#recording-list');                   // Grabs a <div> element. We'll modify it later to give a preview
    var loader = document.querySelector('#loader');
    var loadingGif = "<img src=\"img/loadingGif.gif\" height=100>";

    var xmlAppName = "ccb-cloudant";
    var xmlAPILoc = "favorites/attach";
    var xmlID = cloudant_DocID;
    var xmlName = "patient_1";
    var xmlValue = "p1description";

    //var requesterURL =  "https://" + cloudant_Username + ".cloudant.com/" + cloudant_Database + "/" + cloudant_DocID;
    
    var baseURL = "http://" + xmlAppName + ".mybluemix.net/api/" + xmlAPILoc + "?id=" + xmlID
    var requesterURL = baseURL + "&key=" + "ahem_x.wav"
    var senderURL = baseURL + "&name=" + xmlName + "&value=" + xmlValue;

    $scope.recordings = Recordings.all();

    var audioPreview = function(src, type) {
        return "<audio controls>" + "<source " + "src=\"" + src + "\"" + "type=\"" + type + "\" />" + "</audio>";
    }

    var createRecording = function(recordingName, audioBlob) {
        var newRecording = Recordings.newRecording(recordingName, audioBlob);
        $scope.recordings.push(newRecording);
        console.log("New recording added to array");
        Recordings.save($scope.recordings);
        console.log("Recordings array saved in memory");
    }
    
    $scope.bms_success = function(successMsg) {
        alert("The " + funct + " function succeeded! Response:\n" + successMsg.responseText);
    };

    $scope.bms_failure = function(failureMsg) {
        alert("The " + funct + " function failed. Response:\n" + failureMsg.errorDescription);
    };


    $scope.cloudant_upload = function(b) {
        loader.innerHTML = loadingGif;

        var audioFile;
        if(b){  // File from memory
            audioFile = document.getElementById('upload_file').files[0];
        }
        else{   // New recording
            var aURL = preview.firstChild.nextSibling.src;
            audioFile = $scope.dataURLtoBlob(aURL);
            audioFile.__proto__.Symbol(Symbol.toStringTag) = "TEST FILE.wav";
            //audioFile = new File("TEST NAME.wav", audioFile, audioFile.type, Date.now(), audioFile.size);
            //(name, localURL, type, lastModifiedDate, size)
        }
        console.log(audioFile);
        /*
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
                    console.log("Upload Error: ", xhr.responseText);
                    console.log(xhr);
                }
            }
        }*/
    };


    $scope.displayer = function(num){
        console.log("Displaying ", document.getElementById('upload_file').files[num].name)
        var f = document.getElementById('upload_file').files[num] // Gives a convenient way to reference the file we uploaded
        var newname = new Date().toUTCString();
        newname += ".wav";
        console.log("Possible new name: ", newname);
        console.log("File object: ", f);
        var r = new FileReader();   // Initializes a FILE FileReader (standard FileReader type overwritten by FILE plugin)
        r.readAsDataURL(f);         // Uses the FilReader to actually read in the file
        r.onloadend =
            function () {
                var audioURL = this.result;        // The file will be in the form of a DataURL
                preview.innerHTML = f.name;
                preview.innerHTML += audioPreview(audioURL, cloudant_MIMEtype);
            };
    };

    $scope.downloader = function() {
        funct = "DOWNLOADER";
        loader.innerHTML = loadingGif;
        var xhr = new XMLHttpRequest();
	    xhr.open("GET", requesterURL, true);
        xhr.responseType = "blob";
        xhr.send();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                loader.innerHTML = "";
                if(xhr.status == 200){
                    var fileCache = document.getElementById('upload_file');
                    var num = 0;
                    if (fileCache.files[0] != null){num = 1;}
                    fileCache.files[num] = xhr.response;
                    $scope.displayer(num);
                }
                else{
                    alert("ERROR");
                    console.log("Download Error: ", xhr.responseText);
                    console.log(xhr);
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
/*
    $scope.blobToDataURL = function(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {return e.target.result;}
        a.readAsDataURL(blob);
        
    }
*/

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

Event Listeners
    http://stackoverflow.com/questions/21556090/cordova-angularjs-device-ready

FileReader object
    readAsDataURL: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL 

addEventListener
    useCapture: http://stackoverflow.com/questions/7398290/unable-to-understand-usecapture-attribute-in-addeventlistener


*/



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Old code for todo app
/*
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


*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*      // This uses an MFPRequest to upload directly to the database. Using the API seems to be better.

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