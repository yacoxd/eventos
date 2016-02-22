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
    
    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl',
        cache: false,
    });
    
    $stateProvider.state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl',
        cache: false,
    });

  $urlRouterProvider.otherwise('/side-menu/list');
  
});

app.controller('ProfileCtrl', function($scope, $cookieStore, $rootScope, $ionicPopup, $filter, $state, $http) {
    
     var apiUrl = 'http://yacoxd.com/eventos/api/users/user';
     var username = "";
     
     $scope.user_info = [];
     
     $scope.sexList = [
        { text: "Masculino", value: "M" },
        { text: "Femenino", value: "F" },
    ];
     
     $http.get(apiUrl)
              .success(function(response){
                  console.log(response);
                  $scope.user_info = response;
                  $scope.data = {
                        sex: response.us_gender,
                        date: new Date(response.date_dob),
                        first_name: response.us_first_name,
                        last_name:response.us_last_name,
                        phone: response.us_phone,
                        email: response.us_email,
                  };
                  
                  username = response.us_username;
                  
            }).error(function(){
                var alertPopup = $ionicPopup.alert({
                    title: 'Ops!',
                    template: 'No se pudo recuperar información de usuario'
                });
                alertPopup.then();
            }).finally(function(){
     });
     
     
     $scope.save = function() {
         
         var apiPost = 'http://yacoxd.com/eventos/api/users/edit';
         
         $http.post(apiPost, {email: $scope.data.email,
                              first_name: $scope.data.first_name,
                              last_name: $scope.data.last_name,
                              pwd: $scope.data.pwd,
                              gender: $scope.data.sex,
                              dob: $scope.data.date,
                              phone: $scope.data.phone,
                              }).success(function(response, code){
                                  
                                  console.log(code);
                                  if (code == 200) {
                                      if ($scope.data.pwd != undefined) {
                                            var auth = btoa(username + ":" + $scope.data.pwd);
                                            
                                            $rootScope.globals.currentUser.authdata = auth;
                                            $cookieStore.put('globals', $rootScope.globals);
                                            $http.defaults.headers.common.Authorization = 'Basic ' + auth;
                                        }
                                        
                                        var alertPopupMsg = $ionicPopup.alert({
                                                title: 'Información',
                                                template: 'Se envio la informción correctamente.'
                                                });
                                        alertPopupMsg.then();
                                  } else {
                                      
                                      console.log(response);
                                      
                                      var alertPopupMsg2 = $ionicPopup.alert({
                                                title: 'Información',
                                                template: response.msg
                                                });
                                        alertPopupMsg2.then();
                                  }
                              
                                  
         }).error(function(response){
             
             var alertPopupMsg = $ionicPopup.alert({
                                    title: 'Información',
                                    template: response.msg
                                    });
              alertPopupMsg.then();
             
         }).finally(function(){
              $state.go($state.current, {}, {reload: true});    
         });
         
         
     }
    
    
});

app.controller('RegisterCtrl', function($scope, $cookieStore, $rootScope, $ionicPopup, $filter, $state, $http, $ionicHistory, User) {
    
     var username = "";
     
     $scope.user_info = [];
     
     $scope.sexList = [
        { text: "Masculino", value: "M" },
        { text: "Femenino", value: "F" },
    ];

    $scope.data = {
          sex: "",
          first_name: "",
          email: "",
          last_name:"",
          username: "",
          pwd: "",
          pwd2: "",
          code: "",
    };
                  
     $scope.save = function() {
         
         if ($scope.data.sex == "" || $scope.data.first_name == "" || $scope.data.last_name == ""
            || $scope.data.username == "" || $scope.data.pwd == "" || $scope.data.pwd2 == "" || $scope.data.email == ""
            || $scope.data.code == "") {
             
             var alertPopupMsg = $ionicPopup.alert({
                                        title: 'Información',
                                        template: "Todos los campos son requeridos."
                                        });
             alertPopupMsg.then();
             
         } else if (!validateEmail($scope.data.email)){
             
             var alertPopupMsg = $ionicPopup.alert({
                                        title: 'Información',
                                        template: "Email invalido."
                                        });
             alertPopupMsg.then();
             
         } else if (!validateUsername($scope.data.username)) {
             
             var alertPopupMsg = $ionicPopup.alert({
                                        title: 'Información',
                                        template: "Username invalido."
                                        });
             alertPopupMsg.then();
             
         } else if (! angular.equals(new String($scope.data.pwd), new String($scope.data.pwd2))) {
             
             var alertPopupMsg = $ionicPopup.alert({
                                        title: 'Información',
                                        template: "Las contraseñas no coinciden."
                                        });
             alertPopupMsg.then();
             
         } else {
             
            var apiPost = 'http://yacoxd.com/eventos/api/users/register';
            
            var authReg = btoa("register:guatemala");
            var authorizationReg = {'Authorization': 'Basic ' + authReg};
            var headerReg = { headers: authorizationReg }
            
            $http.post(apiPost, {email: $scope.data.email,
                                username: $scope.data.username,
                                first_name: $scope.data.first_name,
                                last_name: $scope.data.last_name,
                                pwd: $scope.data.pwd,
                                gender: $scope.data.sex,
                                code: $scope.data.code,
                                }, headerReg).success(function(response, code){
                                    
                                    if (code == 200) {
                                            var auth = btoa($scope.data.username + ":" + $scope.data.pwd);
                                                
                                            $rootScope.globals = {
                                                    currentUser: {
                                                        username: $scope.data.username,
                                                        name: $scope.data.first_name + " " +$scope.data.last_name,
                                                        image: "",
                                                        authdata: auth,
                                                    }
                                                };
                                                
                                            $http.defaults.headers.common.Authorization = 'Basic ' + auth;
                                            User.isLoggedSet(true);
                                            
                                            var alertPopupMsg = $ionicPopup.alert({
                                                    title: 'Información',
                                                    template: 'Se envio la informción correctamente.'
                                                    });
                                            alertPopupMsg.then();
                                            
                                            $ionicHistory.nextViewOptions({historyRoot: true});    
                                            $state.go('menu.list');
                                            
                                    } else {
                                        
                                        console.log(response);
                                        var alertPopupMsg2 = $ionicPopup.alert({
                                                    title: 'Información',
                                                    template: response.msg
                                                    });
                                            alertPopupMsg2.then();
                                    }
                                
                                    
            }).error(function(response){
                
                var alertPopupMsg = $ionicPopup.alert({
                                        title: 'Información',
                                        template: response.msg
                                        });
                alertPopupMsg.then();
                
            });
         }
         
     }
    
    
});


app.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup,$rootScope, $cookieStore,  User) {
    
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

app.controller('ListCtrl', function($scope, $cookieStore, $rootScope, $state, User, $http) {
    
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
    
    $scope.clearSession = function() {
        $rootScope.globals = {};
        $cookieStore.remove('globals');
        $http.defaults.headers.common.Authorization = 'Basic ';
        User.isLoggedSet(false);
        $state.go($state.current, {}, {reload: true});
    }
    
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
    
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateUsername(username) {
    var re = /^[a-zA-Z0-9]+$/;
    return re.test(username);
}

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
        User.isLoggedSet(true);
        $http.defaults.headers.common.Authorization = 'Basic ' + $rootScope.globals.currentUser.authdata;
        event.preventDefault();
  }
    
  $rootScope.$on('$stateChangeStart', function(event, toState) {
    if (!User.isLoggedIn() && toState.name !== 'login' && toState.name !== 'register') {
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