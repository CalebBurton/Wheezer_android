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
    //var testFile = new Image();
    var testFile = new Audio();
    // Android Client ID: 853130241725-mtljp8gct4pqtjvvrdt1kl9e8t90vho3.apps.googleusercontent.com

    $scope.recordings = Recordings.all();

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



    $scope.cloudant_upload = function(file) {
        /*
        var recordingName = prompt("Please name the recording: ");
        if(recordingName) {
            createRecording(recordingName);
        }
        */

        funct = "CLOUDANT_UPLOAD";
        BMSClient.initialize(cloudant_bms_route, cloudant_bms_guid);
        // Cloudant DB info
        //
        //{ Key: 'wilyhowersecoughtselaire', 
        //  Password: 'b5a398755a7751978efd2637e57ce844bbd86a46'
        //}

        /*
        var form = new FormData();
	    form.append("file", file);
            alert("Form created: ");
            alert(form.formData);
        */

        var cloudant_Username = "812cf44b-c59b-4288-a505-ad7e6b1b2f55-bluemix";
        var cloudant_Database = "my_sample_db";
        var cloudant_DocID = "f26d6fc4783784738f6a715081dc4ce6";
        var cloudant_DocRev = "";               // Will be updated by pinging the server below
        var queryRev = "";
        var cloudant_Attachment = Date.now() + ".wav";   // Ensures that each file name will be unique
        var cloudant_MIMEtype = "audio/wav";
        var senderURL =     "https://" + cloudant_Username + ".cloudant.com/" + cloudant_Database + "/" + cloudant_DocID + "/" + cloudant_Attachment;
        var requesterURL =  "https://" + cloudant_Username + ".cloudant.com/" + cloudant_Database + "/" + cloudant_DocID;
        
        /*
        var queryID = "id=" + "testIDforQP";;
	    var queryName = "&name=" + "testNameForQP";
	    var queryValue ="&value=" + "testValueForQP";
        var queryParams = queryID + queryName + queryValue;
            alert("Query: " + queryParams);
        */
        

        var requester = new MFPRequest(requesterURL, MFPRequest.GET);   // Ping the server to get the current database revision
        requester.send(
            function(successMsg) {  // Save the current revision so we can upload an attachment
                cloudant_DocRev = JSON.parse(successMsg.responseText)._rev; // NOTE: "_rev" WITH an underscore, unlike the response
                queryRev = "?rev=" + cloudant_DocRev;   // Our query needs to access the most up-to-date revision of this patient's data
            },
            $scope.bms_failure
        );
        
        setTimeout(
            function() {    // This function won't execute until the time below expires (gives the server time to respond)
                var sender = new MFPRequest(senderURL + queryRev, MFPRequest.PUT);
                //var headers = {"Content-Type": cloudant_MIMEtype};
                var form = new FormData();
	            form.append("file", testFile.src);
                var payload = form;
                /*
                    api/favorites/attach
                ?   id=     ba50efc1748fc3fe77c89675e163c599
                &   name=   aa
                &   value=  dsdccd
                */
                sender.setHeaders(headers);
                sender.send(
                    payload,
                    function(successMsg) {
                        alert("The CLOUDANT_UPLOAD function succeeded! Response:\n" + successMsg.responseText);
                        cloudant_DocRev = JSON.parse(successMsg.responseText).rev;  // NOTE: "rev" WITHOUT an underscore, unlike the sent message
                    },
                    $scope.bms_failure
                );
            },
            (700)   // Pause for 700 milliseconds to allow the server to send back the newest revision number
        );

/*
        payload = {
            "_id":  "f26d6fc4783784738f6a715081dc4ce6",
            "_rev": "1-967a00dff5e02add41819138abb3284d",
            "value":{
                "rev":  "1-967a00dff5e02add41819138abb3284d"
            },
            "key":  "f26d6fc4783784738f6a715081dc4ce6",
            "attachment": ""
        };
*/



    };

    $scope.debugger = function(){
        var f = document.getElementById('upload_file').files[0], r = new FileReader(); // Initializes a FileReader
        var preview = document.querySelector('#preview');
        
        r.readAsDataURL(f);         // Uses the FileReader initialized above to actually read in the file
        r.addEventListener( "load", // Once the file has been read, do the following:
                            function () {
                                //testFile.height = 200; // only for images
                                testFile.type = cloudant_MIMEtype; // only for audio
                                testFile.src = this.result;
                                preview.appendChild(testFile);
                            },
                            false); // useCapture. A boolean that essentially assigns priority. FALSE is fine for our case.
    };
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