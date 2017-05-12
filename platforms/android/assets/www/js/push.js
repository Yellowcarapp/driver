// var pushNotification;
var TIMER_BG;
var listener_offline=true;

var bgOptions = {
  stationaryRadius: 25,
  distanceFilter:60,//5
  desiredAccuracy: 3,//10
  debug: false,
  notificationTitle: Domain +' Driver',
  notificationText: 'enabled',
  notificationIconColor: '#FEDD1E',
  notificationIconLarge: 'icon',
  notificationIconSmall: 'icon',
  locationProvider:1,// distance=0
  interval: 15000,//5000
  fastestInterval: 10000,//5000
  activitiesInterval: 10000,//5000
  stopOnTerminate: false,
  startOnBoot: true,
  startForeground: true,
  stopOnStillActivity: true,
  activityType: 'AutomotiveNavigation',
  url: NodeApi+'newlocations', //'http://dev.airocab.com/newlocations',
  syncUrl:NodeApi+'newlocations',
  syncThreshold: 100,
  httpHeaders: {
    'X-FOO': 'bar'
    ,"Content-Type":"application/json; charset=UTF-8" 
  },
  pauseLocationUpdates: false,
  saveBatteryOnBackground: false,
  maxLocations: 1000
};
document.addEventListener("pause", function(){
    // bgOptions.locationProvider=0;
    // bgOptions.httpHeaders.vProvider=0;
    bgOptions.httpHeaders.app_ground='background' ;
    console.log('pause :: background' ) 
    restartBackGroundGpsTracking(); 
}, false);
document.addEventListener("resume", function(){
    // bgOptions.locationProvider=1;
    // bgOptions.httpHeaders.vProvider=1;
    bgOptions.httpHeaders.app_ground='foreground' ;
    console.log('resume  :: foreground') 
    restartBackGroundGpsTracking(); 	
}, false);

function onBackKeyDown(e) {
    e.preventDefault();
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $location = $injector.get('$location');
     var $rootScope = $injector.get('$rootScope');
     var path=$location.path();
     if(path.indexOf('map')!=-1)
    { 
        if($rootScope.modal_page) {
            if($rootScope.show_tripDtails)  $rootScope.$apply(function(){$rootScope.show_tripDtails=false;});
            else if( $rootScope.page_name=='changePassword') $rootScope.openPage_modal('profile');
            else  $rootScope.closemodal_page(true)
        }
        else $rootScope.exitapp(); 
    }
    else if( path.indexOf('login')!=-1 || path.indexOf('waitAdmin')!=-1)
    { 
        navigator.app.exitApp(); 
    }
   else if(path.indexOf('register')!=-1 || path.indexOf('verifyCode')!=-1 || path.indexOf('restPassword')!=-1 ) {
       $rootScope.$apply(function(){
            $location.path('/login')
        }) 
    }
    else
    { 
        $rootScope.$apply(function(){  $location.path('/app/map') }) 
    }
}
document.addEventListener("offline", offlinenetwork, false);
document.addEventListener("deviceready", function(){

    window.plugins.insomnia.keepAwake();
    window.plugins.OneSignal
        .startInit(AppIdDriver,senderID)
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
         .handleNotificationOpened(function(jsonData) {
           if(jsonData.notification.payload.additionalData)
            { 
                var notification=jsonData.notification.payload.additionalData;
                console.log(notification);
                opennotiication(notification);
            }
           })
         .handleNotificationReceived(function(jsonData) {    
            if(jsonData.payload.additionalData)
            { 
                var notification=jsonData.payload.additionalData;
                 console.log(notification);
                opennotiication(notification);
            }
           })
        .endInit();
         window.plugins.OneSignal.enableVibrate(true)
        getids_onesignal();
        window.plugins.OneSignal.sendTag("name",Domain);
        window.plugins.OneSignal.clearOneSignalNotifications();
        window.plugins.uniqueDeviceID.get(function(uuid){
        localStorage.uuid=uuid;
    })
});

function getids_onesignal(){
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
     var $rootScope = $injector.get('$rootScope');

    window.plugins.OneSignal.getIds(function(ids) {
        if(ids){
             localStorage.UserARN=ids.userId;
            //  bgOptions.httpHeaders.user=JSON.parse(bgOptions.httpHeaders.user)
            // restartBackGroundGpsTracking(); 
        }
        else   setTimeout(function(){ getids_onesignal();}, 4000);
    });
}

function opennotiication(notification){
    setTimeout(function(){
        window.plugins.OneSignal.clearOneSignalNotifications();
    }, 20000);
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $location = $injector.get('$location');
    var $rootScope = $injector.get('$rootScope')
    var IamIn = $location.path();
    /*if in the sme page if not */
    if($rootScope.modal_loadflag) $rootScope.closemodal_page()
    if(IamIn=='/app/map')
    {   
        if($rootScope.cancelpopup_flag) $rootScope.cancelpopup.close();
       // setTimeout(function(){map.setClickable( false );},1000);
         $rootScope.$broadcast("pushRecieved",notification);
        // if($rootScope.modal_loadflag){
        //     $rootScope.closemodal_page()
        //     $rootScope.$broadcast("pushRecieved",notification);
        // }
        // else  $rootScope.$broadcast("pushRecieved",notification);
    }
    else if(notification.type =='new request')
    {
        if(IamIn.indexOf('login')!=-1) check_pushRecieved(notification);
    }
}
function check_pushRecieved(notification){
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $location = $injector.get('$location');
    var $rootScope = $injector.get('$rootScope')
    setTimeout(function(){
        var IamIn = $location.path();
        if(IamIn=='/app/map' && map) $rootScope.$broadcast("pushRecieved",notification);
        else check_pushRecieved(notification);
    }, 1000);
}

 function StartBackGroundGpsTracking()
 {
        /** backgroundGeolocation ***/
        bgOptions.httpHeaders.user={driverId:JSON.parse(localStorage.user_data).driverId};
        bgOptions.httpHeaders.user.tripId = 0;
        bgOptions.httpHeaders.user.tripStatus = 0;
        bgOptions.httpHeaders.domain=Domain;
        bgOptions.httpHeaders.vProvider=1 ;
        bgOptions.httpHeaders.vAccuracy= 3;
        bgOptions.httpHeaders.vType= 'v2';
        bgOptions.httpHeaders.appversion=version;
        bgOptions.httpHeaders.app_ground='foreground' ;
       if(localStorage.UserARN) bgOptions.httpHeaders.user.endPoint = localStorage.UserARN;
        backgroundGeolocation.configure(callbackFn, failureFn, bgOptions);
        backgroundGeolocation.start();
 }
function restartBackGroundGpsTracking(flag)
 {
   var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $rootScope = $injector.get('$rootScope');
    backgroundGeolocation.stop();
    setTimeout(function(){ 
        backgroundGeolocation.configure(callbackFn, failureFn, bgOptions);
        backgroundGeolocation.start();
    }, 1000);
 }
 
 function callbackFn(location) {
    console.log('BackgroundGeolocation callback:' + location.latitude + ',' + location.longitude);
    var el = document.getElementById('MyApp');
    var $injector = angular.element(el).injector();
    var $rootScope = $injector.get('$rootScope');
    $rootScope.Current_Location=location;
    console.log($rootScope.user_data)
    if(localStorage.UserARN) $rootScope.user_data.endPoint = localStorage.UserARN;
    $rootScope.user_data.latitude = location.latitude;
    $rootScope.user_data.longitude = location.longitude;
    $rootScope.user_data.tripId = ($rootScope.tripId)?$rootScope.tripId:0;
    $rootScope.user_data.tripStatus = ($rootScope.tripStatus)?$rootScope.tripStatus:0;
   if(map) $rootScope.changemapcenter(true,false);
   $rootScope.time_lastlocation= new Date().getTime();
   backgroundGeolocation.finish();
};

function failureFn(error) {
    console.log('BackgroundGeolocation error');
};

function CalDistance(lat1,lon1,lat2,lon2)
{
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var radlon1 = Math.PI * lon1/180;
    var radlon2 = Math.PI * lon2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;

    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return dist.toFixed(6);
}
function offlinenetwork() {
        var el = document.getElementById('MyApp');
        var $injector = angular.element(el).injector();
        var $rootScope = $injector.get('$rootScope')
       if(!listener_offline && !$rootScope.alertnointernet) $rootScope.nointernet();
  }