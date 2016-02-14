angular.module('events.user', [])
	.factory('User', function($http,  $cookieStore, $rootScope) {

		var apiUrl = 'http://yacoxd.com/eventos/api/users/user';
  
  		var loggedIn = false;

		return {

			login: function(credentials,callback) {
                
                var auth = btoa(credentials.user + ":" + credentials.password);
                var authorization = {'Authorization': 'Basic ' + auth};
                var header = { headers: authorization }
                
				return $http.get(apiUrl, header)
                .success(function(data){
				    $http.defaults.headers.common.Authorization = 'Basic ' + auth;
                    
                    $rootScope.globals = {
                        currentUser: {
                            username: data.us_username,
                            name: data.us_first_name + " " + data.us_last_name,
                            image: data.us_avatar,
                            authdata: auth,
                        }
                    };
                    
                    $cookieStore.put('globals', $rootScope.globals);
					loggedIn = true;
                    callback(data);
                }).error(function(){
                    callback(false);
                });
			},

			isLoggedIn: function() {
				return loggedIn;
			}

		};
	});