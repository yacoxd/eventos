(function() {

var app = angular.module('events', ['ionic', 'events.user', 'ngRoute', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });
 
   $stateProvider.state('menu', {
      url: '/side-menu',
      abstract:true,
      templateUrl: 'templates/menu.html'
    });

  $stateProvider.state('menu.list', {
      url: '/list',
      cache: false,
      views: {
        'side-menu': {
          templateUrl: 'templates/eventos.html',
          controller: 'ListCtrl'
        }
      }
    });
    
      $stateProvider.state('detail', {
        url: '/detail:event_id',
        templateUrl: 'templates/detail.html',
        controller: 'DetailCtrl',
        cache: false,
    }); 

  

  $urlRouterProvider.otherwise('/login');
});

app.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup, User) {
    
  $scope.credentials = {
    user: '',
    password: ''
  };

  $scope.login = function() {
    User.login($scope.credentials, function(response){
        if (response) {
            $ionicHistory.nextViewOptions({historyRoot: true});    
            $state.go('menu.list');
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

app.controller('DetailCtrl', function($scope, $cookieStore, $stateParams,$ionicPopup, $state, $http) {
     
    
     var event = $stateParams.event_id; //getting fooVal
     $scope.event_info = [];
     var apiUrl = 'http://yacoxd.com/eventos/api/events/event/id/' + event;
     
     $http.get(apiUrl)
              .success(function(response){
                  $scope.event_info = response;
            }).error(function(){
                var alertPopup = $ionicPopup.alert({
                    title: 'Ops!',
                    template: 'Evento incorrecto'
                });
                alertPopup.then();
            }).finally(function(){
              
     });
     
     // Triggered on a button click, or some other target
        $scope.showPopup = function() {
        $scope.data = {};

            var myPopup = $ionicPopup.show({
                template: '<input type="number" ng-model="data.cant" >',
                title: 'Yeaah!! Ingresa con cuantas personas iras al evento.',
                subTitle: 'Ingresa solo números enteros',
                scope: $scope,
                buttons: [
                { text: 'Cancelar' },
                {
                    text: '<b>Guardar</b>',
                    type: 'button-dark',
                    onTap: function(e) {
                        
                    console.log($scope.data.cant);
                        
                        if (angular.isNumber($scope.data.cant)) {
                            
                            var apiURL =  'http://yacoxd.com/eventos/api/events/go_event';
                            
                            $http.post(apiURL, {cant: $scope.data.cant, event_id: event })
                            .success(function(response){
                                var alertPopupMsg = $ionicPopup.alert({
                                    title: 'Información',
                                    template: 'Se envio la informción correctamente.'
                                    });
                                    alertPopupMsg.then();
                            }).finally(function(){
                                
                                $state.go($state.current, {}, {reload: true});    
                                
                                });
                        } else {
                            var alertPopupMsg = $ionicPopup.alert({
                                title: 'Ops!',
                                template: 'Ingresa una cantidad valida.'
                            });
                            alertPopupMsg.then();
                            e.preventDefault();
                        }
                    }
                }
                ]
            });
        }
     
});

app.controller('ListCtrl', function($scope, $cookieStore, $http) {
    $scope.events = [];
    var apiUrl = 'http://yacoxd.com/eventos/api/events/all_events';
    
     $scope.loadMore = function() {
         
         if($scope.events.length > 0){
            var after = $scope.events[$scope.events.length -1].info.ev_id;
            apiUrl = 'http://yacoxd.com/eventos/api/events/all_events/after/' + after;
          }
                         
            $http.get(apiUrl)
              .success(function(response){
                  angular.forEach(response, function(child){
                        $scope.events.push(child);     
                  });
            }).finally(function(){
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
    };
    
    $scope.doRefresh = function() {
         
         if($scope.events.length > 0){
            var before = $scope.events[0].info.ev_id;
            apiUrl = 'http://yacoxd.com/eventos/api/events/all_events/before/' + before;
          }
                         
          $http.get(apiUrl)
            .success(function(response){
                var newEvents = [];
                angular.forEach(response, function(child){
                     newEvents.push(child);     
                });
                $scope.events = newEvents.concat($scope.events);
            }).finally(function(){
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
    };
    
    /*$scope.$on('$stateChangeSuccess', function() {
        $scope.loadMore();
    }); */
    
    
    
    
});

app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);  
          }
      });

      element.bind('error', function() {
        element.attr('src', attrs.errSrc);
      });
    }
  }
});

app.run(function($rootScope, $state, $ionicPlatform, $cookieStore, $http, User) {
    
  $rootScope.globals = $cookieStore.get('globals') || {};
  if ($rootScope.globals.currentUser) {
         $http.defaults.headers.common.Authorization = 'Basic ' + $rootScope.globals.currentUser.authdata;
  }
    
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