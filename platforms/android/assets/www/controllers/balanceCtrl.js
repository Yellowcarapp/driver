angular.module('MyApp').controller('balanceCtrl', function($scope,$rootScope,$http,$ionicModal,$ionicPopup ) { 
    $scope.List=[];
    $scope.Scroll={active:true};
    // $scope.LoadData=function()
    // {
    //     if($scope.List.length==0)$rootScope.show_loading(); 
    //     $http.get(HostApi+'Balance/'+$rootScope.user_data.driverId+'/'+$scope.List.length).success(function(res){    
            
    //         if($scope.List.length==0){
    //             $scope.sumaccounts=res.sumaccounts[0]
    //             console.log($scope.sumaccounts)
    //             if($scope.sumaccounts.sum==null) $scope.sumaccounts.sum=0;
    //             console.log($scope.sumaccounts)
    //             $scope.paymethod =res.paymethod[0]
    //         }
    //         $scope.List=$scope.List.concat(res.accountingAction);

    //         if(res.accountingAction.length==0) $scope.hideBtn=true; 
    //     }).finally(function(){
    //         $rootScope.hide_loading();
    //         $scope.$broadcast('scroll.infiniteScrollComplete');
    //     });
    // }
    //  $scope.LoadData();
    
    $scope.addcard=function(){ 
        if(!$scope.loading_reg)  {
            $scope.loading_reg=true;
            $http.post(HostApi+"addcard",{cardNumber:$scope.formData.cardNumber,acc_driver:$rootScope.user_data.driverId})
            .success(function(result) { 
                $scope.loading_reg=false;
                console.log(result)
                if(result=='not find card') $rootScope.showToast($rootScope.language.cardNofound )
                else if(result=='card used') $rootScope.showToast($rootScope.language.cardused)
                else {
                    var query=" select * from drivers where driverId="+$rootScope.user_data.driverId;
                    $http({method: 'GET', url:HostApi+'query/'+query,timeout:60000 })
                    .success(function(data, status, headers, config) {
                        $rootScope.user_data=data.rows[0];
                        localStorage.user_data=JSON.stringify($rootScope.user_data)
                        $rootScope.showToast($rootScope.language.successcardadd)
                        //$scope.List=[];
                        //$scope.LoadData();
                        $scope.hideBtn=false; 
                        $scope.myPopup.close()  
                    }).error(function(error){
                        $scope.loading_reg=false;
                        $scope.myPopup.close() 
                        console.log(error);
                    });
                                  
                }
            }).error(function(error){
                $scope.loading_reg=false;
                $scope.myPopup.close() 
                console.log(error);
            });
        }
     }
    
    $scope.Popup_addcard = function() {
        $scope.formData={cardNumber:''}
        $scope.myPopup = $ionicPopup.show({
        template: '<input type="number" ng-model="formData.cardNumber" placeholder="{{language.cardNo}}">', 
        title: $rootScope.language.cardNo,cssClass: 'Popup_promo',scope: $scope,
        buttons: [
          { text: $rootScope.language.cancel ,type: 'button button-block main_btn  sec_bg'},
          { text: $rootScope.language.Save, type: 'button button-block main_btn bg_color',
            onTap: function(e) {
                e.preventDefault();
                if ($scope.formData.cardNumber=='')  $rootScope.showToast($rootScope.language.Enterrequireddata)
                else  $scope.addcard()
            }
          }
        ]
      });
    }

    var query=" select  drivers.*,countryTel,levelName_ar,levelName_en,levelName_ur from drivers join countries on countryId=driverCountryId join levels on levels.levelId=drivers.levelId where driverId="+$rootScope.user_data.driverId;
    $http({method: 'GET', url:HostApi+'query/'+query,timeout:5000 })
    .success(function(data, status, headers, config) {
        $rootScope.user_data=data.rows[0];
        localStorage.user_data=JSON.stringify($rootScope.user_data);
    })
}); 