var NodeApi='https://airocab.eu-gb.mybluemix.net/';
var PutUrl='http://api.airocab.com/drivers/';
NodeApi='http://api.airocab.com/';//NodeApi='https://nodejs-yahia.rhcloud.com/';
var HostUrl='http://airocab.com/service/';
var HostApi= HostUrl+'api/v1/driver/';
var path_img=HostUrl+"resources/uploads/files/original/";
var path_img_large=HostUrl+"resources/uploads/files/large/";


var TIMEOUTHTTP = 10000;
var senderID = "579197847132";
var GOOGLEKEY='AIzaSyCWOoYfEli74GVnYnzEQsnPvVXnz17hAg8'//'AIzaSyBskO5TtpbqFPb_0fYOYfan1rXzB8IrXu4';

var Authorizations = 'Basic c8bc49c21b59774294d282e7d107ffe5';
var Domain = 'yellowcar'
var Sms_Sender = 'yellowcar'
var AppIdDriver="a52bd1d8-56df-41f6-9a16-361ee724953b";
var AppSecretDriver='MWQyM2U0MmItYjhmOC00ZWQ0LWExYzctZTM4MTRjYTNkNjlm';
var AppIdPassenger="77cc10db-4a8a-493b-a07b-bb273c0254f5";
var AppSecretPassenger="M2M0N2Q0NWQtZGM0NC00ZjlkLTkzMzItYmVlMWE4MDEyNjU0";
    

var templateUrl = 'templates/'+Domain+'/'
var imgfolder='img/'+Domain+'/';
var sharelinkapp='https://play.google.com/store/apps/details?id=driver.'+Domain+'.com';
var map;
var myMedia;
var First_Open=false;
MyApp.config(function($httpProvider,$stateProvider, $urlRouterProvider,$ionicConfigProvider,$translateProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $httpProvider.interceptors.push(function ($q, $injector) {
        var incrementalTimeout = 1;
        function retryRequest (httpConfig) {
            var $timeout = $injector.get('$timeout');
            return $timeout(function() {
                var $http = $injector.get('$http');
                return $http(httpConfig);
            }, 1000);
        };
        return {
            responseError: function (response) {
                //if (response.status === 500) 
                {
                    if (incrementalTimeout < 5) {
                        incrementalTimeout += 1;
                        return retryRequest(response.config);
                    }
                    else {
                        incrementalTimeout = 1;
                        var $rootScope = $injector.get('$rootScope');
                        if(window.plugins && window.plugins.toast)window.plugins.toast.showLongBottom($rootScope.language.NoInternet, function(a){}, function(b){})
                    }
                }
                //else {
                //    incrementalTimeout = 1000;
                //}
                return $q.reject(response);
            }
        };
    });
    $httpProvider.defaults.timeout = TIMEOUTHTTP;
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.backButton.text('').previousTitleText('');
    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.navBar.alignTitle('center');
    
    $translateProvider.translations('en', langEn);
    $translateProvider.translations('ar', langAr);
    $translateProvider.translations('ur', langUrdu);
    $translateProvider.preferredLanguage('ar');

     $stateProvider.state('app', {url: "/app",abstract: true,templateUrl: templateUrl+"menu.html",controller:'menuCtrl'
     ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/menuCtrl.js']);
            }]
        }
    })
     $stateProvider.state('waitAdmin', {url: "/waitAdmin",templateUrl: templateUrl+"waitAdmin.html"})
    $stateProvider.state('app.payment', {url: "/payment",views: { 'menuContent': {templateUrl: templateUrl+"payment_setting.html"}  } })
    $stateProvider.state('login', {url: "/login",templateUrl: templateUrl+"login.html",controller:'LoginCtrl'
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/LoginCtrl.js']);
            }]
        }
    })
    $stateProvider.state('app.register',{url: "/register"
        ,views:{
            'menuContent':{templateUrl:templateUrl+"register.html",controller:'RegisterCtrl'} 
        }
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/RegisterCtrl.js']);
            }]
        }
    })
    $stateProvider.state('register',{url: "/register",templateUrl:templateUrl+"register.html",controller:'RegisterCtrl'
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/RegisterCtrl.js']);
            }]
        }
    } )
    $stateProvider.state('verifyCode', {url: '/verifyCode',templateUrl: templateUrl+"verifyCode.html", controller: 'verifyCodeCtrl'  
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/verifyCodeCtrl.js']);
            }]
        }
    })
    $stateProvider.state('restPassword', {url: '/restPassword',  templateUrl: templateUrl+"restPassword.html", controller: 'restPasswordCtrl'  
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/restPasswordCtrl.js']);
            }]
        }
    })
    // $stateProvider.state('changePassword',{url:'/changePassword',templateUrl:templateUrl+"changePassword.html", controller: 'changePasswordCtrl'
    //     ,resolve: { 
    //         loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
    //                 return $ocLazyLoad.load(['controllers/changePasswordCtrl.js']);
    //         }]
    //     }
    // })
    // $stateProvider.state('app.newslist',{url: "/newslist/:rand"
    //     ,views: {
    //         'menuContent': {templateUrl: templateUrl+"newslist.html",controller:'newsCtrl'} 
    //     } 
    //     ,resolve: { 
    //         loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
    //                 return $ocLazyLoad.load(['controllers/newsCtrl.js']);
    //         }]
    //     }
    // })
    
    $stateProvider.state('app.map', {url: "/map"
        , views: { 
            'menuContent': {templateUrl: templateUrl+"map.html",controller:'Map'} 
        } 
        ,resolve: { 
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(['controllers/map.js']);
            }]
        }
    })
    $urlRouterProvider.otherwise('/login');
})
MyApp.directive('focus', function() {
  return {
    restrict: 'A',
    link: function($scope,elem,attrs) {

      elem.bind('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
          e.preventDefault();
          elem.parent('div').parent('div').parent('div').next().find('input')[0].focus();
        }
      });
    }
  }
});

MyApp.directive('compile', function ($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function (scope, ele, attrs) {
			scope.$watch(attrs.compile, function(html) {
				ele.html(html);
                $compile(ele.contents())(scope);
			});
		}
	};
})
MyApp.factory('httpRequestInterceptor', function () {
  return {
    request: function (config) {
      config.headers['Authorizations'] = Authorizations;
      config.headers['Domain'] = Domain;
      config.headers['SmsSender'] = Sms_Sender;   
            config.headers['AppIdPassenger'] = AppIdPassenger;   
            config.headers['AppSecretPassenger'] = AppSecretPassenger;
            config.headers['AppIdDriver'] = AppIdDriver;   
            config.headers['AppSecretDriver'] = AppSecretDriver;  
            config.headers['test'] = 1;  
            config.headers['applang'] = localStorage.lng;  
      return config;
    }
  };
});
function ltrim (str, charlist) {
  charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1')
  var re = new RegExp('^[' + charlist + ']+', 'g')
  return (str + '').replace(re, '')
}
function getMediaURL(s) {
    if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}

MyApp.directive('compile', function ($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function (scope, ele, attrs) {
			scope.$watch(attrs.compile, function(html) {
				ele.html(html);
                $compile(ele.contents())(scope);
			});
		}
	};
})
MyApp.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';
        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});
