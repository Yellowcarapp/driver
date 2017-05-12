angular.module('MyApp').controller('verifyCodeCtrl', function($scope,$rootScope,$http,$timeout,$ionicPopup) {
    $scope.formData={userVerifyCode:'' };
    $scope.sendverifyCode = function() {
        $rootScope.Show_alert ($rootScope.language.resendverifycode)
        $timeout(function(){
            $http({method:"POST",url:HostApi+"GenerateCode/"+$rootScope.user_data.driverId+"/driverActivation" ,data:{}})
            .success(function(data, status, headers, config) {  
                $rootScope.Show_alert ($rootScope.language.msgverifyaccount)
            })
        },300000);
    }
    $scope.loading=false;
    $scope.CheckActivationCode = function() {
        $scope.loading=true;
        $http.post(HostApi+"CheckActivationCode/"+$rootScope.user_data.driverId+"/"+$scope.formData.userVerifyCode,{})
        .success(function(result) { 
            $scope.loading=false;
            if(result=='Activation error') $rootScope.Show_alert ($rootScope.language.msgverify)
            else{
                $rootScope.Show_alert ($rootScope.language.activemsg)
                $rootScope.user_data.driverActivation=0;
                localStorage.user_data=JSON.stringify($rootScope.user_data)
                $rootScope.goto('/waitAdmin')
            }
        }).error(function(result) {$scope.loading=false; })
    }
    $scope.changePhone=function (){	
        $scope.formData={driverMobile:$rootScope.user_data.driverMobile};
        $scope.active_savebutton=true;
        $scope.ctrlRegister =$ionicPopup.show({
            template: '<label class="item item-input"> <i class="icon ion-iphone"></i> <input  maxlength="'+$rootScope.Config.mobilelength+'" type="tel" ng-model="formData.driverMobile" required placeholder="{{language.Mobile}}"></label>',
            title: $rootScope.language.changePhone,
            subTitle: ' ',
            scope: $scope,
            buttons: [
            { text:$rootScope.language.cancel,type: 'button-positive'},
            {
                text: $rootScope.language.Save,
                type: 'button-positive',
                onTap: function(e) {
                    e.preventDefault();
                    if($scope.formData.driverMobile!=''){
                        if($scope.active_savebutton){
                            $scope.active_savebutton=false;
                            $http.post(HostApi+"UpdateMobileNumber/"+$rootScope.user_data.driverId+"/"+$scope.formData.driverMobile,{})
                            .success(function(result) { 
                                $scope.active_savebutton=true;
                                if(result=='Mobile exit')  $rootScope.showToast($rootScope.language.mobileexit)
                                else {
                                    $scope.ctrlRegister.close();
                                    $rootScope.user_data.driverMobile=$scope.formData.driverMobile;
                                    localStorage.user_data=JSON.stringify($rootScope.user_data)
                                }
                            })
                        }
                    }else  $rootScope.showToast($rootScope.language.Enterrequireddata)
                }
            }]
        });		  
    }
});