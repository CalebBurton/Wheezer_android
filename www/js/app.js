/*
*** Created by Caleb Burton, an ASSIST intern during the summer of 2016
*** cburton@u.northwestern.edu

    This file acts as a wrapper that allows us to use angular code from multiple files at the same time.
    It can also be used to create event listeners that run when the document loads.
*/

angular.module('myApp', [
    'ionic',
    'myApp.patients',
    'myApp.ble',
    'myApp.bms'
]);


/*
    // Initialization for BMS connections. No longer necessary, since we're using the API now

angular.element(document).ready(
    function () {
        document.addEventListener(
            'deviceready',
            function () {
                var cloudant_bms_route = "http://ccb-cloudant.mybluemix.net";
                var cloudant_bms_guid = "503a965b-5ba8-4a3d-b7e7-403375548369";
                    
                BMSClient.initialize(cloudant_bms_route, cloudant_bms_guid);
            },
            false
        );
    }
)
*/