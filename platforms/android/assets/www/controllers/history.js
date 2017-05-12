angular.module('MyApp').controller('HistoryCtrl', function($scope,$rootScope,$http,$timeout) { 
    $scope.List=[];
    $scope.Scroll={active:true};
    $scope.shownodata=false;
    $scope.flag_download=true;

    $scope.opentrip_detail=function(item){
       $rootScope.show_tripDtails=true;
       $rootScope.trip_detail=item;
    //    if($rootScope.trip_detail.offerId>0){
    //      if($rootScope.trip_detail.offerMaxValue >= $rootScope.trip_detail.tripCost)  $rootScope.trip_detail.pay_trip=0 
    //      else $rootScope.trip_detail.pay_trip= $rootScope.trip_detail.tripCost- $rootScope.trip_detail.offerMaxValue;
    //    }
       // $location.path('/app/trip_detail');
    }
    $rootScope.close_trip_detail = function() {
        $rootScope.show_tripDtails=false;
    }  

    $scope.LoadData=function()
    {
        if($scope.flag_download){
            $scope.flag_download=false;
            $http.get(HostApi+'history/'+$rootScope.user_data.driverId+'/'+$scope.List.length).success(function(res){
                $scope.Scroll.active = res.rows.length;
                angular.forEach(res.rows,function(Obj,i){
                    if(Obj.offerMaxValue >=  Obj.tripCost) Obj.totaltripCost=0.00+Obj.fineCancellation;
                    else Obj.totaltripCost=Obj.tripCost-Obj.offerMaxValue+Obj.fineCancellation;
                    Obj.totaltripCost=Obj.totaltripCost.toFixed(2);
                  //?'0':CurrentTripData.tripCost-CurrentTripData.offerMaxValue}}
                    // Obj.totaltripCost=Obj.tripCost+Obj.fineCancellation;
                    Obj.link=$scope.GoogleMapImage(Obj)
                    Obj.waitingtime=$rootScope.getminutes(Obj.tripPickUpdate,Obj.tripArriveDate);
                    if(Obj.waitingtime>0) Obj.waitingcost=Obj.waitingtime*(Obj.tripWaitingPerHour/60);
                    else  Obj.waitingcost=0;
                    Obj.waitingcost= Obj.waitingcost.toFixed(2);
                    if(Obj.tripCost==null )Obj.tripCost=0
                    $scope.List.push(Obj);
                });
                if($scope.List.length==0) $scope.shownodata=true;
            }).finally(function(){
                $scope.flag_download=true;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
      }
    }
    $scope.LoadData();
    
    $scope.GoogleMapImage=function(item)
    {
        var path='https://maps.googleapis.com/maps/api/staticmap?key='+GOOGLEKEY+'&zoom=13&size=600x300&maptype=roadmap&center=';
        if(item.tripRealFrom && typeof item.tripRealFrom == 'string'){
            item.tripRealFrom=JSON.parse(item.tripRealFrom);
              path+= item.tripRealFrom.lat+','+item.tripRealFrom.lng+'&markers=color:red%7Clabel:P%7C' +item.tripRealFrom.lat
                    +','+item.tripRealFrom.lng;
        }else{
               if(item.tripFrom && typeof item.tripFrom == 'string')  item.tripFrom=JSON.parse(item.tripFrom);
               path+= item.tripFrom.lat+','+item.tripFrom.lng+'&markers=color:red%7Clabel:P%7C'+item.tripFrom.lat+','
                    +item.tripFrom.lng;
        } 
        if(item.tripRealDropoff && typeof item.tripRealDropoff == 'string'){
            item.tripRealDropoff=JSON.parse(item.tripRealDropoff);
             path+= '&markers=color:green%7Clabel:D%7C'+item.tripRealDropoff.lat+','+item.tripRealDropoff.lng;
        }else if(item.tripTo && typeof item.tripTo == 'string'){
           if(item.tripTo && typeof item.tripTo == 'string')   item.tripTo=JSON.parse(item.tripTo);
            path+= '&markers=color:green%7Clabel:D%7C'+item.tripTo.lat+',' +item.tripTo.lng;
        } 
        return path;
    }

     /*$rootScope.GoogleMapImage=function(item)
     {   
         var path='https://maps.googleapis.com/maps/api/staticmap?key='+GOOGLEKEY+'&zoom=13&size=600x300&maptype=roadmap&center=';
         if(item.tripStatus==6){
            if(item.tripRealFrom && typeof item.tripRealFrom == 'string')item.tripRealFrom=JSON.parse(item.tripRealFrom);
            if(item.tripRealDropoff && typeof item.tripRealDropoff == 'string')item.tripRealDropoff=JSON.parse(item.tripRealDropoff);
             return path+item.tripRealFrom.lat+','+item.tripRealFrom.lng+
            '&markers=color:red%7Clabel:P%7C'+item.tripRealFrom.lat+','+item.tripRealFrom.lng+
             '&markers=color:green%7Clabel:D%7C'+item.tripRealDropoff.lat+','+item.tripRealDropoff.lng;
       }else{  
             if(item.tripFrom  && typeof item.tripFrom  == 'string')item.tripFrom =JSON.parse(item.tripFrom );
             if(item.tripTo  && typeof item.tripTo  == 'string')item.tripTo =JSON.parse(item.tripTo );
            var url=path+item.tripFrom.lat+','+item.tripFrom.lng+
             '&markers=color:red%7Clabel:P%7C'+item.tripFrom.lat+','+item.tripFrom.lng;
             if(item.tripTo  && typeof item.tripTo  == 'string') url+='&markers=color:green%7Clabel:D%7C'+item.tripTo.lat+','+item.tripTo.lng;
            return url;
        }
     }*/
    
    
    $scope.TripStatus=function(item)
    {
        if(item.tripStatus==1)return $rootScope.language.WaitingAssign;
        else if(item.tripStatus==2)return $rootScope.language.waitingaccepting;
        else if(item.tripStatus==3)return $rootScope.language.Current;
        else if(item.tripStatus==4)return $rootScope.language.Current;
        else if(item.tripStatus==5)return $rootScope.language.Current;
        else if(item.tripStatus==6)return $rootScope.language.Finished;
        else if(item.tripStatus==7)return $rootScope.language.canceled;
    }
});
