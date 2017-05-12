angular.module('MyApp').controller('LoginCtrl', function($scope,$rootScope,$http,$ionicPopup) { 
    delete $rootScope.facebookData
    $scope.formData={driverMobile:"",driverPass:""};
    $scope.LogIn=function (type) 
    {  
        $scope.loading=true
        if(!$rootScope.Config) $rootScope.GetSetting();
        $http.post(HostApi+"signin",$scope.formData).success(function(data) { 
            //if($rootScope.Config.failed_download)$rootScope.GetSetting();
            if(data.rows==false&&!type) $rootScope.showToast($rootScope.language.login_error);
            else if(data.rows==false&&type=='facebook'){
                var confirmPopup = $ionicPopup.confirm({
                    title:$rootScope.language.NEWREQUEST,
                    template: $rootScope.language.completeRegister
                    ,cancelText: $rootScope.language.ok,cancelType: 'button button-block main_btn  sec_bg'
                    ,okText: $rootScope.language.cancel,okType: 'button button-block main_btn bg_color'
                });
                confirmPopup.then(function(res) {if(!res) $rootScope.goto('/app/register') });
            }else {
                
                if(localStorage.uuid==data.rows.deviceId||data.rows.deviceId==''||data.rows.deviceId==null )
                {
                    data.rows.changeProfile=1;
                    localStorage.user_data=JSON.stringify(data.rows);
                    $rootScope.user_data=data.rows;
                    
                    $rootScope.AddToDrivers();
                    console.log(JSON.stringify($rootScope.user_data))
                    //$rootScope.Show_alert ($rootScope.language.msgverifyaccount)
                    //$rootScope.goto('/verifyCode')
                    //if($rootScope.user_data.driverActivation!=0&&$rootScope.user_data.driverActivation!=1) $rootScope.goto('/verifyCode')
                  
                    
                    if($rootScope.user_data &&$rootScope.user_data.blackList==0)
                    {
                         $rootScope.Show_alert($rootScope.language.blocktxt);
                         delete localStorage.user_data;
                         delete $rootScope.user_data;
                    }
                    else if($rootScope.user_data && $rootScope.user_data.driverActivation!=1){
                        $rootScope.goto('/waitAdmin')
                    }
                    else if($rootScope.user_data.driverActivation&&$rootScope.user_data.driverActivation==1) {
                        //  if(data.rows.deviceId==''||data.rows.deviceId==null ){
                        var post_data={deviceId:localStorage.uuid,driverAvailable:1,driver_app_lang:$rootScope.lng}
                        if(localStorage.UserARN) post_data.endPoint=localStorage.UserARN;
                        $http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,post_data)
                        .success(function(result) { 
                            console.log('success')
                           if(localStorage.uuid) $rootScope.user_data.deviceId=localStorage.uuid;
                           if(localStorage.UserARN) $rootScope.user_data.endPoint=localStorage.UserARN;
                            $rootScope.user_data.driverAvailable=1;
                            localStorage.user_data=JSON.stringify($rootScope.user_data)
                        }).error(function(err){
                            console.log('error: '+err)
                        })
                        console.log($rootScope.Current_Location);
                   // }
                         $rootScope.user_data.driverAvailable=1;
                         localStorage.user_data=JSON.stringify($rootScope.user_data)
                         StartBackGroundGpsTracking()
                         $rootScope.reload_divmenu();
                         $rootScope.goto('/app/map')
                    }
                }else{
                    $rootScope.Show_alert ($rootScope.language.signoutDevice)
                }
            }
            $scope.loading=false
            $scope.loadingfacebook=false
        }).error(function(data){
            $scope.loading=false
            $scope.loadingfacebook=false
        });
    } 
    
    $scope.changepassword=function (){	
        $scope.formData_forgetpass={driverMobile:''};//$rootScope.user_data.driverMobile
        $scope.ctrlRegister =$ionicPopup.show({
            template: '<span> {{language.msgforgetPass}}</span><label class="item item-input">  <input  maxlength="'+$rootScope.Config.mobilelength+'" type="tel" ng-model="formData_forgetpass.driverMobile"'
                    +' required placeholder="{{language.emailMobile}}"></label>',
            title: $rootScope.language.forgetPassword,
            subTitle: ' ',
            scope: $scope,
            buttons: [
            {
                text: $rootScope.language.send,
                type: 'button button-block main_btn bg_color',
                onTap: function(e) {
                    e.preventDefault();
                    if($scope.formData_forgetpass.driverMobile!='')
                    {
                        var phone=ltrim($scope.formData_forgetpass.driverMobile,'0')
                        $http.post(HostApi+"ResetPassword/"+phone,{})
                        .success(function(result) { 
                            if(result=='data not exit')  $rootScope.showToast($rootScope.language.mobileMobnoexit)
                            else {
                                $scope.ctrlRegister.close();
                                $rootScope.datasend=result.rows
                                $rootScope.goto('/restPassword')
                            }
                        })
                    }
                    else  $rootScope.showToast($rootScope.language.Enterrequireddata)

                }
            },{ text:$rootScope.language.cancel,type: 'button button-block main_btn  sec_bg'}
            ]
        });		  
    }
});