angular.module('myApp.todo', ['ionic'])

/**
 * The Patients factory handles saving and loading patients
 * from local storage, and also lets us save and load the
 * last active patient index.
 */

.factory('Patients', function() {
  return {
    all: function() {
      var patientString = window.localStorage['patients'];
      if(patientString) {
        return angular.fromJson(patientString);
      }
      return [];
    },
    save: function(patients) {
      window.localStorage['patients'] = angular.toJson(patients);
    },
    newPatient: function(patientTitle) {
      // Add a new patient
      return {
        title: patientTitle,
        tasks: [],
        state: 'Healthy'
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActivePatient']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActivePatient'] = index;
    }
  }
})

.controller('TodoCtrl', function ($scope, $timeout, $ionicPlatform, $ionicModal, Patients, $ionicSideMenuDelegate, $ionicActionSheet) {
  // A utility function for creating a new patient
  // with the given patientTitle
  var createPatient = function(patientTitle) {
    var newPatient = Patients.newPatient(patientTitle);
    $scope.patients.push(newPatient);
    Patients.save($scope.patients);
    $scope.selectPatient(newPatient, $scope.patients.length-1);
  }

  $scope.toggleState = function(activePatient){
    var tempState = activePatient.state;
      if (tempState == 'Healthy') {
        $scope.activePatient.state = 'WHEEZING';
      }
      else if (tempState == 'WHEEZING') {
        $scope.activePatient.state = 'Healthy';
      }
      else {
        alert('ERROR ERROR ERROR')
      }
//      alert('Patient before:\t' + tempState +
//            '\nPatient after:\t' + $scope.activePatient.state);
      Patients.save($scope.patients);
  }

  // Load or initialize patients
  $scope.patients = Patients.all();

  // Grab the last active, or the first patient
  $scope.activePatient = $scope.patients[Patients.getLastActiveIndex()];

  // Called to create a new patient
  $scope.newPatient = function() {
    var patientTitle = prompt('Patient name');
    if(patientTitle) {
      createPatient(patientTitle);
    }
  };

  // Called to select the given patient
  $scope.selectPatient = function(patient, index) {
    $scope.activePatient = patient;
    Patients.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

  $scope.createTask = function(task) {
    if(!$scope.activePatient || task.title=="") {
      return;
    }
    $scope.activePatient.tasks.push({
      title: task.title
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the patients
    Patients.save($scope.patients);

    task.title = "";
  };


   $scope.selectTask = function(tasks, taskIndex) {
    // Show the action sheet
    
    $ionicActionSheet.show({
      buttons: [
        { text: 'Yes' },
        { text: 'No' }
      ],
      titleText: 'Are you sure you want to delete this item?',
      buttonClicked: function(buttonIndex) {
        if(buttonIndex == 0){
          for(i = taskIndex; i < tasks.length; i++){
            tasks[i] = tasks[i + 1];
          }
          tasks.length = tasks.length - 1;
          Patients.save($scope.patients);
        }
        return true;
      }
    });
  };
  

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }

  $scope.togglePatients = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };


  // Try to create the first patient, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.patients.length == 0) {
      while(true) {
        var patientTitle = "Alex"; //prompt('Your first patient\'s name:');
        if(patientTitle) {
          createPatient(patientTitle);
          break;
        }
      }
    }
  }, 1000);

  // Buzz Buzz
  $scope.buzzBuzz = function() {
		navigator.vibrate([100, 200,
							50, 50,
							50, 50,
							200, 99]);
		$scope.$broadcast('scroll.refreshComplete');
	};
});