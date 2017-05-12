var Modules = [
    'ionic'
    ,'pascalprecht.translate'
    ,'angular-ladda'
    , 'oc.lazyLoad'
]
var version='';
var MyApp = angular.module('MyApp',Modules)
MyApp.run(function(/*socket,*/$ionicActionSheet,$ionicPlatform,$state,$rootScope,$ionicModal,$ionicHistory,$http,$location,$ionicPopup,$ionicLoading,$window,$timeout ) {
    $rootScope.GoToHome=function(){  $state.go('app.map');  }
    $rootScope.imgfolder =imgfolder;
    $rootScope.days=[]
    $rootScope.months=[]
    $rootScope.Years=[]
    $rootScope.menuData={driverAvailable:true}
    $rootScope.path_img=path_img
    $rootScope.path_img_large=path_img_large
    for (i = 1; i < 31; i++) {  
       var num=i.toString();
        if(num.length==1)    var num="0"+i;
        $rootScope.days.push(num) 
    }
    for (i = 1; i < 13; i++) { 
         var num=i.toString();
        if(num.length==1)    var num="0"+i;
        $rootScope.months.push(num)
    }
   
    $rootScope.ReturnLocalTime=function(dateTime)
    {
        var localTime  = moment.utc(dateTime).toDate();
        localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
        return localTime;
    }
   
    $rootScope.popup_newrequest=function(notification)
    {  
        $ionicPopup.show({
            template: 
             ' <p  class="from_to"><i class="ion-record from_place"></i>'+$rootScope.language.from+notification.trip.tripFromAddress+'</p>'+
                '<p class="from_to"><i class="ion-record"></i>'+$rootScope.language.to+notification.trip.tripToAdress+'</p>' ,
            title: $rootScope.language.NEWREQUEST,
            // subTitle: ' ',
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    $state.go('app.map');
                    $timeout(function(){
                      $rootScope.$broadcast("pushRecieved",notification);
                     },1000);
                }
            },{ text:$rootScope.language.cancel,type: 'button button-block main_btn sec_bg' }
            ]
        });
    }  
    $rootScope.getminutes=function(date1,date2){
        var moment1 = moment(date1);
        var moment2= moment(date2);
        var minutes=  moment1.diff(moment2, 'minutes');
        // if(minutes==0) minutes=moment1.diff(moment2, 'seconds')/60;
        if(minutes>3) minutes=minutes-3;
        else minutes=0;
        var r =minutes.toFixed(2)
        return (isNaN(r) || !r.length)?0:r;
    }
    $rootScope.ChangeStatus=function()
    {  
        $rootScope.show_loading();
        if($rootScope.menuData.driverAvailable==true)   $rootScope.user_data.driverAvailable=1
        else   $rootScope.user_data.driverAvailable=0
        
        $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
        
        $http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,{driverAvailable:$rootScope.user_data.driverAvailable})
        .success(function(){
            if($rootScope.menuData.driverAvailable==true)
            {
                bgOptions.httpHeaders.user.driverAvailable=1; backgroundGeolocation.start();
            }
            else  backgroundGeolocation.stop();
            localStorage.user_data=JSON.stringify($rootScope.user_data);
            $rootScope.hide_loading();
            // console.log('success')
        }).error(function(error){
             $rootScope.hide_loading();
             if($rootScope.menuData.driverAvailable==true) {
                 $rootScope.menuData.driverAvailable=false;
                $rootScope.user_data.driverAvailable=0
            }
            else {
                $rootScope.user_data.driverAvailable=1
                $rootScope.menuData.driverAvailable=true;
            }
            // console.log('error: '+error);
        })
    }
    

    $rootScope.AddToDrivers=function()
    {
        $http.post(NodeApi+'drivers',{
            endPoint:localStorage.UserARN,
            tripId:0,
            driverId:$rootScope.user_data.driverId,
            driverFName:$rootScope.user_data.driverFName,
            driverLName:$rootScope.user_data.driverLName,
            driverImage:$rootScope.user_data.driverImage,
            brandName:$rootScope.user_data.brandName,
            levelName:$rootScope.user_data.levelName_en,
            levelId:$rootScope.user_data.levelId,
            modelTitle:$rootScope.user_data.modelTitle,
            carYear:$rootScope.user_data.carYear
        }) 
        .success(function (res) { }).finally(function(){ });
    }
    $rootScope.backbutton=function(e)
    {
        if($rootScope.page=='profile'){
            e.preventDefault();
            $rootScope.changeDataShow(1);
        }
    }
     $rootScope.Call=function(Number){
        window.plugins.CallNumber.callNumber(function(){}, function(){}, Number);
    }

    $rootScope.checkConnection=function (){
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        if(states[networkState]=='No network connection') {return  'no net';}
        else {return  'net';}
        // return  'net';
	}
    
    

    $rootScope.GetSetting=function(){
        if(listener_offline) listener_offline=false;
            // document.addEventListener("offline", offlinenetwork, false);
        
        $http.get(HostApi+'Settings').success(function(res){
            $rootScope.Config=res.rows
            $rootScope.Config.failed_download=false;
            $rootScope.Config.pattern_mobilelength='.{'+$rootScope.Config.mobilelength+',}';
             if($rootScope.Config && $rootScope.Config.HijriDate==1){
                  for (i = 1377; i < 1431; i++) {   $rootScope.Years.push(i)  }
            }
            else {
                 for (i = 1960; i < moment().format('YYYY'); i++) {   $rootScope.Years.push(i)  }
            }
        }).error(function(){
            // $rootScope.Config={CarsLimit:2,CarsDistance:100,failed_download:true}
            // if(Domain=='naqil' || Domain=='yellowcar' )  $rootScope.Config.mobilelength=10;
            // else $rootScope.Config.mobilelength=11;
        }).finally(function(){
            //  $rootScope.Config.pattern_mobilelength='.{'+$rootScope.Config.mobilelength+',}';
            //  if($rootScope.Config && $rootScope.Config.HijriDate==1){
            //       for (i = 1377; i < 1431; i++) {   $rootScope.Years.push(i)  }
            // }
            // else {
            //      for (i = 1960; i < moment().format('YYYY'); i++) {   $rootScope.Years.push(i)  }
            // }
        });
    }
    $rootScope.Watcher_success=function(position){
        //$rootScope.Current_Location=position.coords;
        if($rootScope.user_data && $rootScope.user_data.driverId){
            var time_now=new Date().getTime();
            if(time_now-$rootScope.time_lastlocation>60000){
                 $rootScope.time_lastlocation=new Date().getTime();
                 $rootScope.updatenewlocation_manual(position.coords.latitude,position.coords.longitude,false,false);
            }
        }
    }
     $rootScope.checkWifi=function(){
          cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
                if(enabled==0){
                    if(map) map.setClickable( false )
                    $ionicPopup.show({
                        template:  '<center> <p > '+$rootScope.language.connectWIFI+'</p> </center>',
                       // title: '',
                        scope: $rootScope,
                        buttons: 
                        [
                            {
                                text: $rootScope.language.ok,
                                type: 'button button-block main_btn bg_color',
                                onTap: function(e) {
                                  $rootScope.alertnointernet='';
                                  cordova.plugins.diagnostic.switchToWifiSettings();
                                  if(map)map.setClickable( true );
                                //   navigator.app.exitApp(); 
                                }
                            },{
                                text:$rootScope.language.cancel
                                ,type: 'button button-block main_btn sec_bg'
                                ,onTap: function(e) {
                                     $rootScope.alertnointernet='';
                                    if(map)map.setClickable( true );
                                }
                            }
                        ]
                    });  
                } 
            }, function(error){
             console.error("The following error occurred: "+error);
            });
     }
    $rootScope.nointernet=function(){
        if(map) map.setClickable( false )
        $rootScope.alertnointernet = $ionicPopup.alert({ cssClass: 'custom-class'
            ,template:  '<center> <p>'+$rootScope.language.Failedinternet+'</p></center>',
            buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
            $rootScope.alertnointernet.then(function(res) {
                $rootScope.alertnointernet='';
                if(map && (!$rootScope.modal_page || $rootScope.modal_page=='')) map.setClickable( true )

                // cordova.plugins.diagnostic.switchToWifiSettings();
                // navigator.app.exitApp(); 
        });
    }
    $ionicPlatform.ready(function() {
        $ionicPlatform.registerBackButtonAction(onBackKeyDown, 401);
        if (window.StatusBar) StatusBar.styleDefault();
        if($rootScope.checkConnection()=="net"){
             $rootScope.GetSetting();
        }
        else $rootScope.nointernet();

        $rootScope.Watcher=navigator.geolocation.watchPosition($rootScope.Watcher_success,null,{timeout: 5000, enableHighAccuracy: true});
        if(localStorage.user_data) 
        { 
            $rootScope.user_data=JSON.parse(localStorage.user_data);
            if($rootScope.user_data.driverAvailable==1) $rootScope.menuData={driverAvailable:true}
            else $rootScope.menuData={driverAvailable:false}

            var query="select  drivers.*,countryTel,levelName_ar,levelName_en,levelName_ur from drivers join countries on countryId=driverCountryId join levels on levels.levelId=drivers.levelId where driverId="+$rootScope.user_data.driverId;
            $rootScope.show_loading();
            $http({method: 'GET', url:HostApi+'query/'+query,timeout:5000 })
            .success(function(data, status, headers, config) {
                $rootScope.user_data=data.rows[0];
                
                localStorage.user_data=JSON.stringify($rootScope.user_data);
                if($rootScope.user_data.driverAvailable==1) $rootScope.menuData={driverAvailable:true}
                else $rootScope.menuData={driverAvailable:false}
                if(localStorage.uuid==data.rows[0].deviceId){
                    localStorage.user_data=JSON.stringify($rootScope.user_data)
                    if($rootScope.user_data.driverActivation&&$rootScope.user_data.driverActivation!=1){
                        $rootScope.goto('/waitAdmin')
                    }
                    else if($rootScope.user_data.driverActivation&&$rootScope.user_data.driverActivation==1) 
                    {
                         if($rootScope.user_data.blackList==0){
                            $rootScope.Show_alert ($rootScope.language.blocktxt);
                            delete localStorage.user_data;
                            delete $rootScope.user_data;
                       }
                        else {
                            if(localStorage.UserARN){
                                var postdata={endPoint:localStorage.UserARN}
                                if(localStorage.uuid) postdata.deviceId=localStorage.uuid
                                $rootScope.user_data.endPoint = localStorage.UserARN;
                                $rootScope.user_data.deviceId = localStorage.uuid;
                                localStorage.user_data=JSON.stringify($rootScope.user_data);
                                $http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,postdata)
                                    .success(function(result) {  })
                            }
                            $rootScope.goto('/app/map')
                            $rootScope.AddToDrivers();
                           StartBackGroundGpsTracking(); 
                        } 
                    }
                }else 
                {
                    $rootScope.showToast($rootScope.language.forcesignoutDevice)
                    delete localStorage.user_data;
                    delete $rootScope.user_data;
                    $rootScope.clearCache();
                    $location.path('/login');
                }
            }).finally(function(){{
                $rootScope.hide_loading();
                window.setTimeout(function(){
                    if(navigator.splashscreen)navigator.splashscreen.hide();  
                },2000);

            }});
        }else  {
            
            $rootScope.user_data='';
            $rootScope.goto('/login')
            window.setTimeout(function(){
                if(navigator.splashscreen)navigator.splashscreen.hide();  
            },2000);

        }
    });
    $rootScope.myGoBack = function() {$ionicHistory.goBack();};
  /*************************************menu_modal.html******************/
   
     $rootScope.openmenumodal = function(){
        //  if($location.path()!='/app/register') $rootScope.showdiv_menu=!$rootScope.showdiv_menu;
         $rootScope.showdiv_menu=!$rootScope.showdiv_menu;
         if($rootScope.modal_page || $rootScope.showdiv_menu) { if(map)map.setClickable( false ); }
         else { if(map)map.setClickable( true ); }
    };



	$rootScope.closemenumodal= function(type) { 
        $rootScope.showdiv_menu=false; 
        if(map)map.setClickable( true );
        if(type=='disablemap') { if(map)map.setClickable( false ); }
    };
   
    /*************************************menu_modal.html******************/
    $rootScope.goto = function(page,flag) {
        if(flag) page=page+"/"+Math.floor((Math.random() * 10000) );
        $location.path(page)
    }
    $rootScope.Show_alert = function(txt) {
        var alertPopup = $ionicPopup.alert({ title: $rootScope.language.alert,template: '<center> <p>'+txt+'</p></center>',
        buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
        alertPopup.then(function(res) {});
    }
    $rootScope.showToast = function(msg) {if(window.plugins && window.plugins.toast)window.plugins.toast.show(msg, 'long', 'center');};
    $rootScope.show_loading = function(msg) { $ionicLoading.show({template: msg});   }
    $rootScope.hide_loading = function(){  $ionicLoading.hide();   }
    

    $rootScope.clearCache=function(){
        $ionicHistory.clearHistory();
         $ionicHistory.clearCache();  
    }
    
     $rootScope.exitapp=function(){
       if(!$rootScope.exitapppop){
           $rootScope.closemenumodal();
          if(map)map.setClickable( false );
            $rootScope.exitapppop=$ionicPopup.show({
            template:  '<center> <p > '+$rootScope.language.exit_app+'</p> </center>',
            title: $rootScope.language.alert,
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                     navigator.app.exitApp(); 
                     $rootScope.exitapppop='';
                }
            },{ 
                text:$rootScope.language.cancel
                ,type: 'button button-block main_btn  sec_bg'
                ,onTap: function(e) {
                  if($rootScope.alertnointernet){ if(map)map.setClickable( false );}
                  else { if(map)map.setClickable( true );}
                  $rootScope.exitapppop='';
                }
              }
            ]
        });
       }
     }

 $rootScope.user_signout=function(){
    window.cache.clear( function(){},  function(){} );
    if(map)map.setClickable( true );
    $rootScope.user_data.driverAvailable=0
    var postdata={deviceId:'',endPoint:'',driverAvailable:0}
    $http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,postdata)
    //  .success(function(){
    //         console.log('success')
    // }).error(function(error){
    //     console.log('error: '+error);
    // })
    $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,true,false)
    backgroundGeolocation.stop();
    $location.path('/login');
 }
    $rootScope.signout=function(){
        $rootScope.closemenumodal();
        if(map)map.setClickable( false );
       $ionicPopup.show({
            template:  '<center> <p > '+$rootScope.language.signoutmsg+'</p> </center>',
            title: $rootScope.language.Signout,
            scope: $rootScope,
            buttons: [
            {
                text: $rootScope.language.ok,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                   $rootScope.user_signout();
                }
            },{
                 text:$rootScope.language.cancel
                 ,type: 'button button-block main_btn sec_bg'
                ,onTap: function(e) {
                  if(map)map.setClickable( true );
                }
              }
            ]
        });                    
    }
    $rootScope.closemenu_change_lng=function(lng){
        $rootScope.closemenumodal();
        $timeout(function(){
           $rootScope.change_lng(lng);
        },500)
    }
    $rootScope.change_lng=function(lng){ 
        $rootScope.lng=localStorage.lng=lng;
        if(lng=='en')  $rootScope.language=langEn;
        else if(lng=='ur') $rootScope.language=langEn;
        else   $rootScope.language=langAr;
    
        $rootScope.reload_divmenu();
         if($rootScope.user_data){
           $http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,{driver_app_lang:$rootScope.lng})
       }
    }
    
    $rootScope.retrive_language = function() 
    {
        if(!localStorage.lng)localStorage.lng='ar';

        $rootScope.lng=localStorage.lng;
        if(localStorage.lng=='en')  $rootScope.language=langEn; 
        else if (localStorage.lng=='ur') $rootScope.language=langUrdu; 
        else $rootScope.language=langAr; 
        if($rootScope.user_data){
           $http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,{driver_app_lang:$rootScope.lng})
       }
    } 
    $rootScope.retrive_language();
     $rootScope.reload_divmenu=function(){
        $rootScope.div_menu='<div class="modal_menu animated slideInLeft" ng-class="{\'animated slideInRight\':lng==\'ar\'||lng==\'ur\'}" ng-show="showdiv_menu">';
         if(Domain=='mshawier' || Domain=='aman') var color='sec_color';
        else  var color='main_color';
        if(Domain!='naqil'){
             $rootScope.div_menu+='<div class="menu_head" >';
             if($rootScope.user_data)  {
                if($rootScope.user_data.driverImage)  $rootScope.div_menu+=' <img  class="cir_img" ng-src="'+
                                                        $rootScope.path_img+$rootScope.user_data.driverImage+'"/>';
                else  $rootScope.div_menu+= '<img  class="cir_img" ng-src="'+$rootScope.imgfolder+'profile_img.png" />';
                $rootScope.div_menu+='<h3 class="'+color+'">{{user_data.driverFName +\' \'+user_data.driverLName| cut:true:20}}</h3>';
            }
            else $rootScope.div_menu+='<img class="cir_img" ng-src="'+$rootScope.imgfolder+'profile_img.png" /> ';                            
            $rootScope.div_menu+= '</div>';
         }
         $rootScope.div_menu+= '<ion-scroll  direction="y" class="scroll_menu"> <ion-list class="menu_app">' ;
         if(Domain!='naqil'){
                $rootScope.div_menu+= '<ion-item  href="javascript:;" ng-click="closemenumodal();closemodal_page(true);" class="item-icon-left" >';
                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic1.png">'
                else  $rootScope.div_menu+='<i class="icon ion-home '+color+'"></i>'
                $rootScope.div_menu+= $rootScope.language.home+'</ion-item>'; 
         }
        $rootScope.div_menu+=  '  <ion-item  href="javascript:;" ng-click="openPage_modal(\'notification\');" class="item-icon-left">'; 
        if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic8.png">'
        else  $rootScope.div_menu+= '<i class="icon ion-ios-bell  '+color+'"></i>'
        $rootScope.div_menu+= $rootScope.language.Notify+  '</ion-item>'+
                            '<ion-item   href="javascript:;" ng-click="openPage_modal(\'list\');" class="item-icon-left">';
                            if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic10.png">'
                            else  $rootScope.div_menu+=  '<i class="icon ion-document-text  '+color+'"></i> '
       if(Domain=='aman')  $rootScope.div_menu+=  $rootScope.language.HistoryAman ;
       else $rootScope.div_menu+=  $rootScope.language.History ;
       $rootScope.div_menu+=  '</ion-item>'+
                             ' <ion-item href="javascript:;" ng-click="openPage_modal(\'profile\');" class="item-icon-left" >';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic6.png">'
                                else  $rootScope.div_menu+=  '<i class="icon ion-person '+color+'"></i>'
        $rootScope.div_menu+= $rootScope.language.Profile+' </ion-item>';
        if(Domain!='yellowcar' && Domain!='naqil') {    
            $rootScope.div_menu+='<ion-item  href="javascript:;" ng-click="openPage_modal(\'info\')"  class="item-icon-left" >';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic2.png">'
                                else  $rootScope.div_menu+=   '<i class="icon ion-person '+color+'"></i>'
            if(Domain=='aman')$rootScope.div_menu+= $rootScope.language.PageinfoAman+ '</ion-item>';
            else  $rootScope.div_menu+= $rootScope.language.Pageinfo+ '</ion-item>';     
        }
     if(Domain!='mshawier') {
          $rootScope.div_menu+='<ion-item  href="javascript:;" ng-click="openPage_modal(\'balance\')"  class="item-icon-left" >';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic11.png">'
                                else  $rootScope.div_menu+=  '<i class="icon ion-person '+color+'"></i>'
            if(Domain=='aman')$rootScope.div_menu+= $rootScope.language.balanceAman+ '</ion-item>';
            else  $rootScope.div_menu+= $rootScope.language.balance+ '</ion-item>'; 
     }
      $rootScope.div_menu+='<ion-item  ng-hide="lng==\'ar\'" href="javascript:;"  ng-click="closemenu_change_lng(\'ar\')" class="item-icon-left">';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic12.png">'
                                else  $rootScope.div_menu+=   '<i class="icon ion-earth '+color+'"></i>'
                                $rootScope.div_menu+= $rootScope.language.btnlng_ar+
                            '</ion-item>'+
                            '<ion-item  ng-hide="lng==\'en\'" href="javascript:;"  ng-click="closemenu_change_lng(\'en\')" class="item-icon-left">';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic12.png">'
                                else  $rootScope.div_menu+=   '<i class="icon ion-earth '+color+'"></i>'
                                $rootScope.div_menu+= $rootScope.language.btnlng_en+  
                            '</ion-item>'
        if(Domain=='yellowcar' || Domain=='naqil') {                   
                  $rootScope.div_menu+='<ion-item ng-hide="lng==\'ur\'"  href="javascript:;"  ng-click="closemenu_change_lng(\'ur\')" class="item-icon-left">';
                                if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic12.png">'
                                else  $rootScope.div_menu+=   '<i class="icon ion-earth '+color+'"></i>'
                                $rootScope.div_menu+=  $rootScope.language.btnlng_ur+  
                            '</ion-item>'
        }
        if(Domain=='aman') {                 
            $rootScope.div_menu+=  ' <ion-item href="javascript:;" ng-click="openPage_modal(\'trem_condation\');" class="item-icon-left" >';
            $rootScope.div_menu+=  '<i class="icon ion-person '+color+'"></i>'
            $rootScope.div_menu+= $rootScope.language.Terms_Conditions+' </ion-item>';
        }
        
        $rootScope.div_menu+='<ion-item  href="javascript:;" ng-click="closemodal_page();signout();" class="item-icon-left">';
                            if(Domain=='naqil') $rootScope.div_menu+= '<img src="'+$rootScope.imgfolder+'ic13.png">'
                            else  $rootScope.div_menu+=     '<i class="icon ion-log-out '+color+'"></i>'
                            $rootScope.div_menu+= $rootScope.language.Signout+  
                            ' </ion-item>';
        if(Domain!='naqil'){
                $rootScope.div_menu+='<ion-item  href="javascript:;" class="item-icon-left">';
                $rootScope.div_menu+= '<i class="icon ion-information-circled '+color+'"></i>'
                $rootScope.div_menu+= 'V '+version
            '</ion-item>';
        }
        $rootScope.div_menu+=  '</ion-list></ion-scroll>';
        if(Domain=='naqil'){
            $rootScope.div_menu+='<div class="menu_footer">'+
                                  '<img src="img/naqil/lng.png" class="lng_btn"> <p>'+'V '+version+'</p>'+
                                  '</div>'
        }
        $rootScope.div_menu+= '</div>'
 };

    $rootScope.ActionSheet_call=function(){
          if(map) map.setClickable( false )
          $ionicActionSheet.show({
            buttons: [{ text: $rootScope.language.callsupport },{ text: $rootScope.language.callAdmin } ],
            cancelText: $rootScope.language.cancel,
            cancel: function() { },
            buttonClicked: function(index) {
                if(index==0)  $rootScope.Call($rootScope.Config.CallCenter)
                else  $rootScope.Call($rootScope.Config.callAdministrationFinance); 
                if(map) map.setClickable( true )
                return true;
            }
        });
    }
    cordova.getAppVersion.getVersionNumber().then(function (v) {
       version=v;
    });
    
    // socket.on('connect',function (data){
    //     console.log('Connected');
    //     socket.on('disconnect',function (data){console.log('disconnect');});
    // });
    // socket.on('updated',function (data){console.log('updated',data);});
})
