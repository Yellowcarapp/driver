angular.module('MyApp').controller('Reg',['$scope',function($scope){
    var El = document.getElementsByClassName('left-buttons')
    var Arg = angular.element(El).find('button');
    Arg.addClass('hide');
    $scope.$on('$destroy',function(){Arg.removeClass('hide');});
    $scope.driver_data=1
}]);

angular.module('MyApp').controller('Map',['$ionicPopup','$location','$scope','$timeout','$interval','$http','$window','$ionicModal','$rootScope','$ionicLoading',
    function($ionicPopup,$location,$scope,$timeout,$interval,$http,$window,$ionicModal,$rootScope,$ionicLoading){
       var updates_TimeToCome='';
       if($rootScope.user_data) $rootScope.user_data.driverAvailable=parseInt($rootScope.user_data.driverAvailable);
       $rootScope.disable_driverAvailable=false;
       $scope.centermap_flag=true;
       $scope.deleteAllLocations=function(tripId){
           backgroundGeolocation.getLocations(
                function (locations) {
                    //console.log(locations);
                     if(tripId) {
                        $scope.openpayment();
                        var driver_data=JSON.parse(localStorage.user_data);
                        driver_data.tripId=tripId;
                        driver_data.tripStatus=6;
                        var locationList=[];
                         angular.forEach(locations,function(loc_Obj,i){
                            locationList.push(angular.extend(loc_Obj, {donotinsert:false, version:'v2', type:'manual', vProvider:1 ,vAccuracy: 3,vType:'v2'
                                   ,appversion:version,user: driver_data,timetocome:''}));
                         })
                        var req = {method: 'POST', url: NodeApi+'newlocations2' ,data:locationList}
                        console.log(req);
                        $http(req).then(function(){ 
                             $rootScope.changemapcenter(false,true);
                             $scope.update_driverCredit();
                        }, function(){
                            $rootScope.changemapcenter(false,true);
                            $scope.update_driverCredit();
                        })
                                                 
                    }
                    else{
                        backgroundGeolocation.deleteAllLocations(function (res) {
                           // console.log('deleteAllLocations success');
                        }, function (error) {
                           // console.log('deleteAllLocations error'); console.log(error);
                        })
                    }
                },function (error) {
                   // console.log("backgroundGeolocation error 1");  console.log(error);
                });
       }
        $rootScope.short_address=function(location)
        { 
            if(location.indexOf(',')!=-1 )var split_letter=','
            else var  split_letter='،'
            var location_list=location.split(split_letter)
            location_list.splice(location_list.length-1, 1);
            location_list.splice(location_list.length-1, 1);
            address=location_list.join();
            return address;
        }
        $scope.checkheightmap=function(flag){
            if(flag) $scope.height='100%';
            else {
                $scope.height='calc(100% - 70px)'; 
               //if(Domain=='aman')
                $scope.height_request=true;
            }
            $timeout(function(){ $scope.$apply();},100)
            //if(map)  map.refreshLayout();
        }
        
        $scope.change_heightDiv=function(id){
            $scope.height_request=!$scope.height_request;
        }

        $rootScope.updatenewlocation_manual=function(lat,lng,clearData,donotinsert){
            $rootScope.user_data.endPoint = localStorage.UserARN;
            $rootScope.user_data.tripId = ($rootScope.tripId)?$rootScope.tripId:0;
            $rootScope.user_data.tripStatus = ($rootScope.tripStatus)?$rootScope.tripStatus:0;
            var update_data=[{donotinsert:donotinsert, version:'v2', type:'manual', vProvider:1 ,vAccuracy: 10,vType:'v2'
           ,appversion:version, time:new Date().getTime(),latitude:lat,longitude: lng,user: $rootScope.user_data,timetocome:$rootScope.updatetimetocome}];
            var req = {method: 'POST', url: NodeApi+'newlocations2' ,data:update_data}
            console.log(req);
            $http(req).then(function(){
                 if(clearData) {
                    delete localStorage.user_data;
                    delete $rootScope.user_data;
                    $rootScope.clearCache();
                 }
              }, function(){console.log('error')}); 
        }

        $rootScope.updatelocation_manual=function(flag){
            if(flag){
                map.getMyLocation(function(location) {
                    updates_TimeToCome= moment().add(15,'s');
                     $rootScope.updatenewlocation_manual(location.latLng.lat,location.latLng.lng,false,true)
                  });
            }
            else
            { 
                if($rootScope.tripStatus>=3 && $rootScope.tripStatus<6)
                {
                    var timenow=moment();
                    if(updates_TimeToCome<=timenow)
                    { 
                        updates_TimeToCome= moment().add(15,'s');
                        if($rootScope.tripStatus==2||$rootScope.tripStatus==3 || $rootScope.tripStatus==4) { 
                            origins=$rootScope.Current_Location.latitude+','+ $rootScope.Current_Location.longitude
                            destinations=$scope.CurrentTripData.tripFrom.lat+','+$scope.CurrentTripData.tripFrom.lng
                        }else if($rootScope.tripStatus==5) {
                            if($scope.CurrentTripData.tripTo){
                                 origins= $rootScope.Current_Location.latitude+','+ $rootScope.Current_Location.longitude
                                destinations=$scope.CurrentTripData.tripTo.lat+','+$scope.CurrentTripData.tripTo.lng
                            }else {
                                    origins=destinations='';
                            }
                        }
                        if(origins && destinations)
                            $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?key='+GOOGLEKEY+'&origins='+
                                origins+'&destinations='+destinations +'&mode=driving&language='+$rootScope.lng+'&sensor=false&trafficModel=bestguess')
                            .success(function (res) {
                                $scope.TimeToCome={}
                                $scope.TimeToCome.time = (res.rows[0].elements[0].duration.value/60).toFixed(1);
                                $scope.TimeToCome.distance=(res.rows[0].elements[0].distance.value/1000).toFixed(1);
                                if($scope.TimeToCome.time<1) $scope.TimeToCome.time='1';
                                $rootScope.updatetimetocome={time:$scope.TimeToCome.time,distance:$scope.TimeToCome.distance}
                                $scope.TimeToCome.time += ' '+$rootScope.language.MIN
                                $scope.TimeToCome.distance +=' '+$rootScope.language.KM   
                                $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,true)
                        }) 
                    }
                }
            }           
        }
             

        $scope.$on("$ionicView.enter", function(event, data){ $rootScope.showToggelav =true; });
        $scope.$on('$ionicView.beforeLeave', function() {
             $rootScope.showToggelav =false; 
             map.clear();
        })
        var MyLocationObj = document.getElementById("MyLocation");
        MyLocationObj.addEventListener("click", function() {
            map.getMyLocation(function(location) {
                $scope.centermap_flag=true; 
                $rootScope.Current_Location={latitude:location.latLng.lat,longitude:location.latLng.lng};
                $rootScope.changemapcenter(false,true);
                $timeout(function(){ $scope.centermap_flag=true; },1000) ;
            });
        });
        $scope.ReLoadTripMapView=function(DistanceTo,OpenDetail)
        {
            if($scope.CurrentTripData && $scope.CurrentTripData.tripFrom && !$scope.passenger_marker && $scope.CurrentTripData.tripStatus==3){
                $scope.centermap_flag=true;
                $scope.passenger_marker_postion=new plugin.google.maps.LatLng($scope.CurrentTripData.tripFrom.lat,$scope.CurrentTripData.tripFrom.lng)
                map.addMarker({
                    'position': { lat:$scope.CurrentTripData.tripFrom.lat,lng:$scope.CurrentTripData.tripFrom.lng},
                    'title': $scope.CurrentTripData.tripFromAddress,
                    'icon':{'url':'./'+imgfolder+'passenger.png'}
                },function(marker){ 
                    if($scope.passenger_marker) {
                         $scope.passenger_marker.setVisible(false);
                         $scope.passenger_marker.remove();
                    }
                    $scope.passenger_marker=marker;
                    $rootScope.changemapcenter(false,false);
                });
            }
            if($scope.CurrentTripData.tripTo &&  $scope.CurrentTripData.tripStatus==5){//($scope.CurrentTripData.tripStatus==4 ||
                  $scope.centermap_flag=true;
                  $scope.passenger_marker_postion=new plugin.google.maps.LatLng($scope.CurrentTripData.tripTo.lat,$scope.CurrentTripData.tripTo.lng)
                   if(!$scope.passenger_marker) 
                        map.addMarker({
                            'position': { lat:$scope.CurrentTripData.tripTo.lat,lng:$scope.CurrentTripData.tripTo.lng},
                            'title': $scope.CurrentTripData.tripToAdress,
                            'icon':{'url':'./'+imgfolder+'pin2.png'}
                        },function(marker){ 
                            if($scope.passenger_marker) {
                                $scope.passenger_marker.setVisible(false);
                                $scope.passenger_marker.remove();
                            }
                            $scope.passenger_marker=marker;   $rootScope.changemapcenter(false,false);});
                    else {
                         $scope.passenger_marker.setPosition($scope.passenger_marker_postion);
                         $scope.passenger_marker.setIcon({ 'url': './'+imgfolder+'pin2.png' });
                         $rootScope.changemapcenter(false,false);
                    }
               }
               else if(!$scope.CurrentTripData.tripTo && $scope.CurrentTripData.tripStatus==5){
                  // $scope.CurrentTripData.tripStatus==4 || 
                   if($scope.passenger_marker) {
                       $scope.passenger_marker.remove();
                       $scope.passenger_marker='';
                       $rootScope.changemapcenter(false,false);
                   }
               }
            if(!DistanceTo)
                map.getMyLocation(function(location) {
                    $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?key='+GOOGLEKEY+'&origins='+
                        location.latLng.lat+','+location.latLng.lng+'&destinations='+
                        $scope.CurrentTripData.tripFrom.lat+','+$scope.CurrentTripData.tripFrom.lng+'&mode=driving&language='+$rootScope.lng+'&sensor=false&trafficModel=bestguess')
                    .success(function (res) {
                        $scope.TimeToCome={}
                        $scope.TimeToCome.time = (res.rows[0].elements[0].duration.value/60).toFixed(1);
                        $scope.TimeToCome.distance=(res.rows[0].elements[0].distance.value/1000).toFixed(1);
                        $rootScope.updatetimetocome={time:$scope.TimeToCome.time,distance:$scope.TimeToCome.distance}
                        if($scope.TimeToCome.time<1) $scope.TimeToCome.time='1';
                        $scope.TimeToCome.time += ' '+$rootScope.language.MIN
                        $scope.TimeToCome.distance +=' '+$rootScope.language.KM     
                        $rootScope.updatenewlocation_manual(location.latLng.lat,location.latLng.lng,false,false)
                   
                    })
                    .finally(function(){
                        if(OpenDetail) 
                        {
                            if(!$scope.show_detail_requestdiv)$scope.opendetail();
                        }
                        else {
                            $scope.openrequest();
                        }
                    });
                });
            else
            {
                if($scope.CurrentTripData.tripTo)
                {
                    map.getMyLocation(function(location) {
                        $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?key='+GOOGLEKEY+'&origins='+
                             location.latLng.lat+','+location.latLng.lng+'&destinations='+
                             $scope.CurrentTripData.tripTo.lat+','+$scope.CurrentTripData.tripTo.lng+
                           '&mode=driving&language='+$rootScope.lng+'&sensor=false&trafficModel=bestguess') 
                        .success(function (res) {
                            $scope.TimeToCome={}
                            $scope.TimeToCome.time = (res.rows[0].elements[0].duration.value/60).toFixed(1);
                            $scope.TimeToCome.distance=(res.rows[0].elements[0].distance.value/1000).toFixed(1);
                            $rootScope.updatetimetocome={time:$scope.TimeToCome.time,distance:$scope.TimeToCome.distance}
                            if($scope.TimeToCome.time<1) $scope.TimeToCome.time='1';
                            $scope.TimeToCome.time += ' '+$rootScope.language.MIN
                            $scope.TimeToCome.distance +=' '+$rootScope.language.KM  
                            $rootScope.updatenewlocation_manual(location.latLng.lat,location.latLng.lng,false,false)
                          
                            $timeout(function(){$scope.$apply();},100)
                        }).finally(function(){
                            if(OpenDetail){
                                 if(!$scope.show_detail_requestdiv)$scope.opendetail();    
                            }                        
                        });
                    });
                }
                else
                {
                    $scope.TimeToCome={time:'!!',distance:'!!'}
                    $rootScope.updatetimetocome={time:'',distance:''}
                    $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
                    if(OpenDetail) if(!$scope.show_detail_requestdiv)$scope.opendetail();                            
                }
            }
        }
      $scope.update_driverCredit=function(){
         var query=" select  drivers.*,countryTel,levelName_ar,levelName_en,levelName_ur from drivers join countries on countryId=driverCountryId join levels on levels.levelId=drivers.levelId where driverId="+$rootScope.user_data.driverId;
        $http({method: 'GET', url:HostApi+'query/'+query,timeout:5000 })
        .success(function(data, status, headers, config) {
           // console.log('update_driverCredit')
            $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
            restartBackGroundGpsTracking();
            $rootScope.user_data=data.rows[0];
            localStorage.user_data=JSON.stringify($rootScope.user_data);
        })
     }

    $scope.$on('pushRecieved',function(e,Obj){
        $rootScope.disable_UpdateRequest=false;
        navigator.vibrate([500, 500, 500]);
        console.log(Obj.type)
        switch (Obj.type) {
            case 'new request':
                if($scope.show_requestdiv || $scope.show_detail_requestdiv) return false;
                else $scope.openrequest()
                $scope.CurrentTripData = Obj.trip;
                $rootScope.tripId=Obj.trip.tripId
                $rootScope.tripStatus=Obj.trip.tripStatus
                bgOptions.httpHeaders.user.tripId = $rootScope.tripId;
                bgOptions.httpHeaders.user.tripStatus = $rootScope.tripStatus;
                $scope.ReLoadTripMapView(false,false)
                restartBackGroundGpsTracking();
                $scope.Waiting=20;
                if($scope.Timer)
                {
                    $interval.cancel($scope.Timer);
                    delete $scope.Timer;
                }
                $scope.Timer = $interval(function(){
                    if($scope.Waiting >0)$scope.Waiting -= 1;
                    else
                    {
                        $interval.cancel($scope.Timer);
                        delete $rootScope.tripId
                        delete $rootScope.tripStatus
                        bgOptions.httpHeaders.user.tripId=0;
                        bgOptions.httpHeaders.user.tripStatus=0;
                        restartBackGroundGpsTracking();
                        delete $scope.Timer;
                        if($scope.show_requestdiv) $scope.closerequest();
                    }
                },1000);
                break;
            case 'accepted':
                    $scope.CurrentTripData = Obj.trip;
                    $rootScope.tripId=Obj.trip.tripId
                    $rootScope.tripStatus=Obj.trip.tripStatus
                    bgOptions.httpHeaders.user.tripId = $rootScope.tripId;
                    bgOptions.httpHeaders.user.tripStatus = $rootScope.tripStatus;
                    $scope.ReLoadTripMapView(false,true);
                    $scope.deleteAllLocations();
                    restartBackGroundGpsTracking();
                break;
                case 'arrived':
                    $scope.CurrentTripData = Obj.trip;
                    $rootScope.tripId=Obj.trip.tripId
                    $rootScope.tripStatus=Obj.trip.tripStatus
                    bgOptions.httpHeaders.user.tripId = $rootScope.tripId;
                    bgOptions.httpHeaders.user.tripStatus = $rootScope.tripStatus;
                    $scope.ReLoadTripMapView(false,true);
                    restartBackGroundGpsTracking();
                break;
                case 'pickedup':
                    localStorage.StartTripWhen = new Date().getTime();
                    $scope.CurrentTripData = Obj.trip;
                    $rootScope.tripId=Obj.trip.tripId
                    $rootScope.tripStatus=Obj.trip.tripStatus
                    bgOptions.httpHeaders.user.tripId = $rootScope.tripId;
                    bgOptions.httpHeaders.user.tripStatus = $rootScope.tripStatus;
                    $scope.ReLoadTripMapView(true,true);
                    $scope.deleteAllLocations();
                    restartBackGroundGpsTracking();
                    $timeout(function(){$scope.$apply();},100)
                break;
                case 'dropoff':
                    if($scope.passenger_marker) {
                       $scope.passenger_marker.remove();
                       $scope.passenger_marker='';
                   }
                   $scope.deleteAllLocations($rootScope.tripId);
                
                    delete localStorage.StartTripWhen;
                    $scope.CurrentTripData = Obj.trip;
                    delete $rootScope.tripId
                    delete $rootScope.tripStatus;
                    bgOptions.httpHeaders.user.tripId=0;
                    bgOptions.httpHeaders.user.tripStatus=0;
                    $rootScope.updatetimetocome={time:'',distance:''}
                    //$rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
                    //restartBackGroundGpsTracking();
                    $scope.closedetail();                    
                    $http.put(PutUrl+$rootScope.user_data.driverId ,{tripId:0,tripStatus:0},
                      {timeout:TIMEOUTHTTP}).success(function(res){ /*console.log('update tripStatus')*/ })
                break;
                case 'canceled':
                    if($scope.passenger_marker) {
                       $scope.passenger_marker.remove();
                       $scope.passenger_marker='';
                   }
                   $rootScope.changemapcenter(false,true);
                    delete localStorage.StartTripWhen;
                    if($scope.Timer)$interval.cancel($scope.Timer);
                    if($scope.show_detail_requestdiv)$scope.closedetail();
                    if($scope.show_requestdiv) $scope.closerequest();
                    if($scope.ignor_request.isShown())$scope.closeignor_request();
                    delete $scope.CurrentTripData
                    delete $rootScope.tripId
                    delete $rootScope.tripStatus
                    bgOptions.httpHeaders.user.tripId=0;
                    bgOptions.httpHeaders.user.tripStatus=0;
                    $rootScope.updatetimetocome={time:'',distance:''}
                    $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
                    restartBackGroundGpsTracking();
                    $rootScope.cancelpopup_flag=true;
                    map.setClickable( false );
                    $rootScope.cancelpopup= $ionicPopup.alert({ title: $rootScope.language.TripCanceledTitle,
                       template:'<center> <p>'+$rootScope.language.TripCanceled+'</p></center>',
                     buttons: [ { text: $rootScope.language.ok ,type: 'button button-block main_btn bg_color'}]});
                     $rootScope.cancelpopup.then(function(res) { 
                          $rootScope.cancelpopup_flag=false;
                          map.setClickable( true );
                         $timeout(function(){$scope.$apply();},100)
                        });
                break;
                case 'suspended':
                  delete localStorage.user_data;
                  navigator.app.exitApp(); 
                break;
                case 'signout':
                  delete localStorage.user_data;
                  navigator.app.exitApp(); 
                break;
            default:
                $scope.CurrentTripData = Obj.trip;
                $rootScope.tripId=$scope.CurrentTripData.tripId
                $rootScope.tripStatus=Obj.trip.tripStatus
                bgOptions.httpHeaders.user.tripId = $rootScope.tripId;
                bgOptions.httpHeaders.user.tripStatus = $rootScope.tripStatus;
                restartBackGroundGpsTracking();   
                if(!$scope.show_detail_requestdiv)$scope.opendetail();
                break;
        }
    });
    
    $scope.GoToMap=function()
    {
        var to;
        if($scope.CurrentTripData.tripStatus==3) to=new plugin.google.maps.LatLng($scope.CurrentTripData.tripFrom.lat,$scope.CurrentTripData.tripFrom.lng);
        else if($scope.CurrentTripData.tripStatus==4 || $scope.CurrentTripData.tripStatus==5) {
            if($scope.CurrentTripData.tripTo && $scope.CurrentTripData.tripTo){
                to=new plugin.google.maps.LatLng($scope.CurrentTripData.tripTo.lat,$scope.CurrentTripData.tripTo.lng);
            }
            else to='not detrmine';

        }
        map.getMyLocation(function(location) {
            if(to=='not detrmine') {
                var new_lat=location.latLng.lat+.0001;
                to=new plugin.google.maps.LatLng(new_lat,location.latLng.lng);
            }
            plugin.google.maps.external.launchNavigation({
                "from": location.latLng,
                "to": to,
                "travelMode": "driving"
            });
        });
    }

    $scope.UpdateRequest=function(CloseModels,TripObj,Mins)
    {   
        window.plugins.OneSignal.clearOneSignalNotifications();
        $rootScope.disable_UpdateRequest=true;
        $rootScope.tripStatus = TripObj.tripStatus;
         bgOptions.httpHeaders.user.tripStatus = $rootScope.tripStatus;
        //restartBackGroundGpsTracking();
        TripObj.tripModelId = $rootScope.user_data.modelId
        TripObj.tripBrandId = $rootScope.user_data.brandId
        if($scope.Timer)$interval.cancel($scope.Timer);//TripObj.tripStatus==3
        if(CloseModels)
        {
             if($scope.show_requestdiv) $scope.closerequest();
             if($scope.show_detail_requestdiv)$scope.closedetail();
             if($scope.ignor_request.isShown())$scope.closeignor_request();
        }
        if(TripObj.tripStatus==6)
        {
            TripObj.tripRealDropoff = JSON.stringify({lat:$rootScope.Current_Location.latitude,lng:$rootScope.Current_Location.longitude});
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+$rootScope.Current_Location.latitude+','+$rootScope.Current_Location.longitude+'&key='+GOOGLEKEY+'&language='+$rootScope.lng)
            .success(function(results){
                results = results.results
                    if(results.length)
                    {
                        var result = results[0]
                        var position = result.geometry.location;
                       TripObj.tripToAdress=$rootScope.short_address(result.formatted_address);
                        delete localStorage.StartTripWhen;
                        $http.post(NodeApi+'trip/'+$scope.CurrentTripData.tripId,{trip:TripObj})
                        .finally(function(){ $rootScope.disable_UpdateRequest=false;})
                    }
            }).finally(function(){ $rootScope.disable_UpdateRequest=false;});
        }
        else if(TripObj.tripStatus==5)
        {
            TripObj.tripRealFrom = JSON.stringify({lat:$rootScope.Current_Location.latitude,lng:$rootScope.Current_Location.longitude});
             $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+$rootScope.Current_Location.latitude+','+$rootScope.Current_Location.longitude+'&key='+GOOGLEKEY+'&language='+$rootScope.lng)
            .success(function(results){
                results = results.results
                    if(results.length)
                    {
                        var result = results[0]
                        var position = result.geometry.location;
                        TripObj.tripFromAddress=$rootScope.short_address(result.formatted_address);
                        $http.post(NodeApi+'trip/'+$scope.CurrentTripData.tripId,{trip:TripObj})
                        .finally(function(){ $rootScope.disable_UpdateRequest=false;})
                    }
            }).finally(function(){ $rootScope.disable_UpdateRequest=false;});
        }
        else{
            $http.post(NodeApi+'trip/'+$scope.CurrentTripData.tripId,{trip:TripObj})
            .success(function(){
                if(TripObj.tripStatus==2)
                {
                    delete $rootScope.tripId;
                    delete $rootScope.tripStatus
                    delete $scope.CurrentTripData
                    bgOptions.httpHeaders.user.tripId=0;
                    bgOptions.httpHeaders.user.tripStatus=0;
                    $rootScope.updatetimetocome={time:'',distance:''}
                    $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
                    restartBackGroundGpsTracking();
                }
            }).finally(function(){ $rootScope.disable_UpdateRequest=false;})
        }
    }
    $scope.Mins={Add:0}
    $scope.innerHeight=(($window.innerHeight-60)/2)+'px';
    $scope.innerWidth=(($window.innerWidth-40)/2)+'px';
    // $scope.addmarker_driver=function(lat,lng){
    //     if(!$rootScope.driver_marker){
    //         map.addMarker({
    //             'position': { lat:lat,lng:lng},
    //             'title':'','icon':{'url':'./'+imgfolder+'taxi.png','size': { width: 35,height:35}}
    //         },function(marker){
    //                 $rootScope.driver_marker=marker;
    //                 map.moveCamera({'target':{ lat:lat,lng:lng},'zoom': 15},function(){
    //                     $timeout(function(){
    //                         $scope.centermap_flag=true;
    //                     },2000)
    //                 });
    //         });
    //     }else {
    //        console.log('driver_marker is found before') 
    //     }
    // }
    $scope.$on("$ionicView.afterEnter", function(event, data){
        var div = document.getElementById("map_canvas");
        map = plugin.google.maps.Map.getMap(div);
        map.on(plugin.google.maps.event.MAP_READY, function(){
            map.addMarker({
                'position': { lat:0.0,lng:0.0},
                'title':'','icon':{'url':'./'+imgfolder+'taxi.png','size': { width: 35,height:35}}
            },function(marker){ $rootScope.driver_marker=marker;  });
            map.getMyLocation(function(location) {
                    var lat=location.latLng.lat;
                    var lng=location.latLng.lng
                    $rootScope.Current_Location={latitude:lat,longitude:lng};
                    $rootScope.driver_marker.setPosition(new plugin.google.maps.LatLng(lat,lng));
                    map.moveCamera({'target':{ lat:lat,lng:lng},'zoom': 15},function(){
                        $timeout(function(){
                            $scope.centermap_flag=true;
                        },2000)
                    });
            },function(){ console.log('error getMyLocation') });
            
           $rootScope.checkWifi();
            map.setOptions({
                'backgroundColor': 'white',
                'controls': {'compass': true,'myLocationButton': false,'indoorPicker': true,'zoom': false},
                'gestures': {'scroll': true,'tilt': false,'rotate': true,'zoom': true}
            });
            map.setZoom(15)
            map.setTrafficEnabled(true);
            map.on(plugin.google.maps.event.CAMERA_CHANGE, function(Location) {
                 $scope.centermap_flag=false;
            });
             map.on(plugin.google.maps.event.MAP_CLICK, function(Location) {
                 if($scope.show_requestdiv) map.setClickable( false );
                 else {
                    if($scope.height_request) {
                        $scope.height_request=false;
                        $timeout(function(){$scope.$apply();},100);
                    }
                 }
            });
            $timeout(function(){
                $http.get(HostApi+'CurrentTrip/'+$rootScope.user_data.driverId+'?endPoint='+localStorage.UserARN)
                .success(function(res){
                    if(res.rows.length)
                    {
                        $scope.CurrentTripData=res.rows[0];
                        switch($scope.CurrentTripData.tripStatus)
                        {
                            case 3:
                                $rootScope.$broadcast("pushRecieved",{trip:$scope.CurrentTripData,type:'accepted'});
                            break;
                            case 4:
                                $rootScope.$broadcast("pushRecieved",{trip:$scope.CurrentTripData,type:'arrived'});
                            break;
                            case 5:
                                $rootScope.$broadcast("pushRecieved",{trip:$scope.CurrentTripData,type:'pickedup'});
                            break;
                        }
                    }
                    else {
                        if($rootScope.Current_Location)
                        $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
                    }
                })
            },1000);
        });
    });
    $rootScope.changemapcenter=function(update,zoom){
        if(map){
            var postion=new plugin.google.maps.LatLng($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude)
            if($rootScope.driver_marker) $rootScope.driver_marker.setPosition(postion);
            if($scope.centermap_flag) { // || $rootScope.tripId
                if($scope.passenger_marker) { 
                    var bounds = [];
                    bounds.push(postion)
                    bounds.push($scope.passenger_marker_postion)
                    map.moveCamera({'target':bounds/*,'zoom': 15*/},function(){
                        $timeout(function(){ $scope.centermap_flag=true; },1000) 
                   });
                }
                else{
                     map.setCenter(postion);
                     if(zoom)  map.setZoom(18);
                     $timeout(function(){ $scope.centermap_flag=true; },1000) 
                }
            }
            if(zoom){
                map.setCenter(postion);map.setZoom(15);
                $timeout(function(){ $scope.centermap_flag=true; },1000) 
            }
          if(update)  $rootScope.updatelocation_manual(false);
        }
    }
   
    $scope.$on('$destroy', function() {
        map.off(plugin.google.maps.event.MY_LOCATION_BUTTON_CLICK);
        map.off(plugin.google.maps.event.MAP_READY);
        $scope.ignor_request.remove();
        $scope.payment.remove();
        delete $rootScope.tripId
        delete $rootScope.tripStatus
         bgOptions.httpHeaders.user.tripId=0;
        bgOptions.httpHeaders.user.tripStatus=0;   
        $rootScope.updatetimetocome={time:'',distance:''} 
    });
    
    /*************************************request.html******************/
    $scope.openrequest= function(){
        map.setClickable( false );
        $rootScope.disable_driverAvailable=true;
        $scope.show_requestdiv=true;
        $scope.checkheightmap();
    };
    $scope.closerequest= function(driverAvailable) {
        map.setClickable( true );
       if(true) $rootScope.disable_driverAvailable=false;
        $scope.show_requestdiv=false;
        $scope.checkheightmap(true);
        if($scope.Timer)
        {
            $interval.cancel($scope.Timer);
            delete $rootScope.tripId
            delete $rootScope.tripStatus
            delete $scope.Timer;
            bgOptions.httpHeaders.user.tripId=0;
            bgOptions.httpHeaders.user.tripStatus=0;
            $rootScope.updatetimetocome={time:'',distance:''}  
            $rootScope.updatenewlocation_manual($rootScope.Current_Location.latitude,$rootScope.Current_Location.longitude,false,false)
            restartBackGroundGpsTracking();
        }       
       
    }
    /*************************************request.html******************/
    /*************************************ignor_request.html******************/
    $ionicModal.fromTemplateUrl(templateUrl+'ignor_request.html',function(modal){$scope.ignor_request=modal;}, {scope: $scope,animation: 'slide-in-up',backdropClickToClose:false,hardwareBackButtonClose:false});
    $scope.openignor_request= function(){
        $scope.ignoreReason={value:0};
        $rootScope.show_loading();
        if($scope.Timer)$interval.cancel($scope.Timer);
        $http.get(HostApi+'Reasons').success(function(res){
            $scope.Reasons = res.rows
            if(res.rows.length)$scope.ignoreReason.value=res.rows[0].reasonId
            map.setClickable( false );
            $scope.ignor_request.show();
        }).finally(function(){
            $rootScope.hide_loading();
        });
    };
    $scope.closeignor_request= function(){
        map.setClickable( true );
        $scope.ignor_request.hide();
    };
    $scope.openalarm_request= function(){
        $http.post(HostApi+"Alarm",[$scope.CurrentTripData.passengerEndPoint])
        .success(function(res){
           // console.log(res);
        })
    };
    /*************************************ignor_request.html******************/
    /*************************************detail.html******************/
    $scope.opendetail= function(){
        $rootScope.disable_driverAvailable=true;
        $scope.height_request=false;
        $scope.show_requestdiv=false;
        $scope.show_detail_requestdiv=true;
        $scope.checkheightmap();
    };
    $scope.closedetail= function() {
        $rootScope.disable_driverAvailable=false;
         $scope.height_request=false;
         $scope.show_detail_requestdiv=false;
         $scope.checkheightmap(true);
    };
    /*************************************payment.html******************/
	$ionicModal.fromTemplateUrl(templateUrl+'payment.html',function(modal){$scope.payment=modal;}, {scope: $scope,animation: 'slide-in-up',backdropClickToClose:false,hardwareBackButtonClose:false});
	$scope.openpayment= function(){
        if( $scope.CurrentTripData.offerMaxValue >=   $scope.CurrentTripData.tripCost)  $scope.CurrentTripData.totaltripCost=0.00+ $scope.CurrentTripData.fineCancellation;
        else  $scope.CurrentTripData.totaltripCost= $scope.CurrentTripData.tripCost- $scope.CurrentTripData.offerMaxValue+ $scope.CurrentTripData.fineCancellation;
         $scope.CurrentTripData.totaltripCost= $scope.CurrentTripData.totaltripCost.toFixed(2);
        $scope.payment.show();
        map.setClickable( false );
    };
	$scope.closepayment= function() {
        map.setClickable( true );
        $scope.payment.hide();
       $rootScope.openPage_modal('list');
    };
    $scope.$on('modal.hidden', function() {});
    $scope.$on('modal.removed', function() {});
 
       
}]);