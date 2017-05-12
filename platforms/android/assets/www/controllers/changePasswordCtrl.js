angular.module('MyApp').controller('changePasswordCtrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
    $scope.formData={driverPass:''}
    /*new change yahia */
    $scope.passwordType = 'password';
    $scope.ChangePasswordType=function()
    {
        $scope.passwordType = ($scope.passwordType == 'password')?'text':'password'
    }
     $scope.changePassword=function ( ) {
      if(!$scope.loading){
          $rootScope.user_signout();
        $scope.loading=true;
        $http.post(HostApi+"changePassword/"+$rootScope.user_data.driverId,{driverPass:$scope.formData.driverPass}).success(function(result) { 
                $scope.loading=false;
                /*$rootScope.user_data=result.rows;
                localStorage.user_data=JSON.stringify($rootScope.user_data)*/
               // $rootScope.signout();
               $rootScope.closemenumodal();
               $rootScope.closemodal_page(true); 
                $rootScope.user_signout();
                $rootScope.showToast($rootScope.language.successSave)
                
        }).error(function(error){
            $scope.loading=false;
            console.log(error);
        });
          
      }
     }
     
     
}]);