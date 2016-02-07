(function() {

var app = angular.module('events', ['ionic', 'events.user']);

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });

  $stateProvider.state('list', {
    url: '/',
    templateUrl: 'templates/events.html',
    cache: false
  });

  $urlRouterProvider.otherwise('/');
});

app.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup, User) {

  $scope.credentials = {
    user: '',
    password: ''
  };

  $scope.login = function() {
    User.login($scope.credentials, function(response){
        if (response) {
            console.log(response);
            $state.go('app.playlists');
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Ops!',
                template: 'Usuario o contraseña incorrecta'
            });
            alertPopup.then();
        }
        
    });
  };

});

app.controller('ListCtrl', function($scope, NoteStore) {

  function refreshNotes() {
    NoteStore.list().then(function(notes) {
      $scope.notes = notes;
    });
  }
  refreshNotes();

  $scope.remove = function(noteId) {
    NoteStore.remove(noteId).then(refreshNotes);
  };

});

app.run(function($rootScope, $state, $ionicPlatform, User) {
  $rootScope.$on('$stateChangeStart', function(event, toState) {

    if (!User.isLoggedIn() && toState.name !== 'login') {
      event.preventDefault();
      $state.go('login');
    }

  });

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

}());