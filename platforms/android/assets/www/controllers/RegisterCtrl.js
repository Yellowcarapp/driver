angular.module('MyApp').controller('RegisterCtrl', function($ionicPlatform,$window,$location,$scope,$rootScope,$timeout,$http,$stateParams,$filter,$ionicPopup,$ionicActionSheet,$ionicScrollDelegate) {
    /*new change yahia */
    $scope.type=$rootScope.profile_type;
    $scope.passwordType = 'password';
    $scope.driverbirth={day:$rootScope.days[0],month:$rootScope.months[0],Year:parseInt($rootScope.Years[0])}
    var dd=$scope.driverbirth.Year+'-'+$scope.driverbirth.month+'-'+$scope.driverbirth.day;
        $scope.$on("$ionicView.enter", function(event, data){ $rootScope.showToggelav=false; });
    // $scope.checknumber_id=function()  {
    //     if ($scope.formData.driverIdnumber && $scope.formData.driverIdnumber.length != 14)  $rootScope.number_idvalid=false;
    //     else $rootScope.number_idvalid=true;
    //  }
   
    $scope.checksequenceNumber=function()  {
        if ($scope.formData.sequenceNumber.length<6)  $rootScope.sequenceNumber_valid=false;
        else $rootScope.sequenceNumber_valid=true;
    }
    
//    $scope.checkcarNumber=function()  {
//        if ($scope.formData.carNumber && $scope.formData.carNumber2 && $scope.formData.carNumber.length==6 && $scope.formData.carNumber2.length==5)  $rootScope.carNumber_valid=true;
//        else $rootScope.carNumber_valid=false;
//    }

    $scope.show_list_uploadImg=function(img_id)  {
        var flag=false;
       if($rootScope.Config){ 
           if($rootScope.Config.DriverDocumentsRequired.indexOf(img_id)!=-1) flag=true;
       }
       return flag
    }

    $scope.return_requireduploadImg=function()  {
        var img_list=$rootScope.Config.DriverDocumentsRequired;
        var requireduploadImg=true;
         if(img_list.indexOf(1)!=-1 && !$scope.formData.driverImage)  requireduploadImg=false;
         if(img_list.indexOf(2)!=-1 && !$scope.formData.carFrontPhoto)requireduploadImg=false;
         if(img_list.indexOf(3)!=-1 && !$scope.formData.carBackPhoto) requireduploadImg=false;
         if(img_list.indexOf(4)!=-1 && !$scope.formData.licensePhoto) requireduploadImg=false;
         if(img_list.indexOf(5)!=-1 && !$scope.formData.driverIDphoto) requireduploadImg=false;
       return requireduploadImg
    }

    $scope.ChangePasswordType=function()
    {
        $scope.passwordType = ($scope.passwordType == 'password')?'text':'password'
    }
    var El = document.getElementsByClassName('left-buttons')
    var Arg = angular.element(El).find('button');
    $scope.innerHeight=($window.innerHeight-215)+'px';
    $scope.page='profile';
    
    if($location.path()=='/app/register')
    {
        $scope.innerHeight=($window.innerHeight-89)+'px';
        Arg.addClass('hide');
    }
    $scope.KeyBoardHide=function()
    {
        if($location.path()=='/app/register')$scope.innerHeight=($window.innerHeight-89)+'px';
        else $scope.innerHeight=($window.innerHeight-215)+'px';
        $timeout(function(){
            angular.element(document.getElementById('mainScroll')).css('height',$scope.innerHeight);
            $ionicScrollDelegate.$getByHandle('mainScroll').resize();
        },500);
    }
    //$ionicPlatform.onHardwareBackButton($scope.backbutton);
    var El2 = document.getElementById('MyApp')
    El2 =angular.element(El2);
    if(El2.hasClass('platform-android')) El2.removeClass('platform-android');
    $scope.$on('$destroy',function(){
        window.removeEventListener('native.keyboardhide',$scope.KeyBoardHide);
        //$ionicPlatform.offHardwareBackButton($scope.backbutton);
        delete $rootScope.page;
        if(Arg.hasClass('hide'))Arg.removeClass('hide');
    });
    $scope.carYear=[];
    var yyyy=new Date().getFullYear()
    for(var i = 2001;i<=yyyy;i++)
    {
        $scope.carYear.push(i);
    }
   
    $scope.seat=[2,3,4,5,6,7];
    
    if(!$scope.type){
        
        $scope.formData={driver_app_lang:$rootScope.lng,driverGender:1,carYear:parseInt($scope.carYear[0]),seatNo:parseInt($scope.seat[0])};//,refercode:''
        if($rootScope.facebookData){
            $scope.formData.driverFName=$rootScope.facebookData.first_name
            $scope.formData.driverLName=$rootScope.facebookData.last_name
            $scope.formData.driverEmail=$rootScope.facebookData.email
//            $scope.tempData={driverMobile:$rootScope.facebookData.phone}
            $scope.formData.driverMobile=$rootScope.facebookData.phone
            delete $rootScope.facebookData
        }
    }else{
        $scope.formData=(localStorage.user_data && localStorage.user_data.length)?JSON.parse(localStorage.user_data):{}//$rootScope.user_data;
        var driverbirth=$scope.formData.driverbirth;        
        if($scope.formData.driverbirth){
              var driverbirth= $scope.formData.driverbirth.split('-');
              $scope.driverbirth={day:driverbirth[2],month:driverbirth[1],Year:parseInt(driverbirth[0])};
        }
        else  $scope.driverbirth={day:$rootScope.days[0],month:$rootScope.months[0],Year:parseInt($rootScope.Years[0])};
         $scope.formData.driver_app_lang=$rootScope.lng;
      // if($scope.formData.driverIdnumber) $rootScope.number_idvalid=true;
      // if($scope.formData.sequenceNumber) $rootScope.sequenceNumber_valid=true;

//       if ($scope.formData.carNumber && $scope.formData.carNumber2 && $scope.formData.carNumber.length==6 
//            && $scope.formData.carNumber2.length==5)  $rootScope.carNumber_valid=true;
    }
    
    function onFail(message) {/*alert('Failed because:' + message);*/}
    
    
	$scope.setimage = function(imageName,imgType){ 
        
		if(imgType=='carFrontPhoto')$scope.formData.carFrontPhoto=imageName
        else if(imgType=='carBackPhoto')$scope.formData.carBackPhoto=imageName
        else if(imgType=='licensePhoto')$scope.formData.licensePhoto=imageName
        else if(imgType=='driverImage')$scope.formData.driverImage=imageName
        else if(imgType=='driverIDphoto')$scope.formData.driverIDphoto=imageName

        $timeout(function(){
            $scope.$apply();
        },1000);
	}
	
	$scope.sendimage = function(image,imgType){ 
        var list=[]; list.push(image);
        $scope.loadingimage=true;
		$scope.setimage(imgfolder+'Loading-1.gif',imgType);
		$http({ method : 'POST',url: HostUrl+'upload_base64.php',data: {'image':list}}).success(function(resultx) {

			$scope.setimage(resultx[0],imgType);
            $scope.loadingimage=false;
		}).error(function(data, status, headers, config) {	
            $scope.loadingimage=false;
            if(imgType=='carFrontPhoto') delete $scope.formData.carFrontPhoto 
			else if(imgType=='carBackPhoto') delete $scope.formData.carBackPhoto 
			else if(imgType=='licensePhoto') delete $scope.formData.licensePhoto 
			else if(imgType=='driverImage') delete $scope.formData.driverImage 
            else if(imgType=='driverIDphoto') delete $scope.formData.driverIDphoto
            
		});
	};
	
    $scope.get_camera=function (source,imgType) {
        
        var pictureSource=navigator.camera.PictureSourceType;
		var destinationType=navigator.camera.DestinationType;		 
        if(source==1){    
            navigator.camera.getPicture(function(imageURI){
                $scope.sendimage("data:image/jpeg;base64," +imageURI,imgType);
            }, onFail, { quality: 100, destinationType: destinationType.DATA_URL,allowEdit:true,targetWidth:512,targetHeight:512
                                          ,sourceType: pictureSource.PHOTOLIBRARY, correctOrientation:true});
		} else if(source==0){ 
            navigator.camera.getPicture(function(imageURI){
                $scope.sendimage("data:image/jpeg;base64," +imageURI,imgType);
            }, onFail, { quality: 100,destinationType: destinationType.DATA_URL,allowEdit:true,targetWidth:512,targetHeight:512
                                        ,sourceType: Camera.PictureSourceType.CAMERA, correctOrientation:true});
		}
    }
    
    $scope.getPhoto=function (imgType)
    { 	
        var arrbutton=[];
		var arrbutton=[{id:0,text: $rootScope.language.cameraimg},{id:1, text:$rootScope.language.galleryimg}]
        
        if(arrbutton.length>0){
            var Options =
            {
                buttons: arrbutton ,
                titleText:  $rootScope.language.chooseImg,
                //destructiveText: $rootScope.language.Delete,
                cancelText:$rootScope.language.cancel,
                cancel: function() {},
                buttonClicked: function(index) {                  
                    $scope.get_camera(arrbutton[index].id,imgType);
                    return true;
                },destructiveButtonClicked:function() {
                    $scope.delete_image(imgType)
                }
            }
            if($scope.formData[imgType])Options.destructiveText = $rootScope.language.Delete
            $scope.HideActionSheet=$ionicActionSheet.show(Options);
      }
	};
    
	//============= camera =========================
    $scope.delete_image= function(imgType) {
        var confirmPopup = $ionicPopup.confirm({ title:$rootScope.language.alert, template: $rootScope.language.deleteimg
                                                ,cancelText: $rootScope.language.ok,cancelType: 'button button-block main_btn  sec_bg',okText: $rootScope.language.cancel
                                                ,okType: 'button button-block main_btn bg_color'});
        confirmPopup.then(function(res) {
            if(!res) {
				if(imgType=='carFrontPhoto') delete $scope.formData.carFrontPhoto 
				else if(imgType=='carBackPhoto')  delete $scope.formData.carBackPhoto 
				else if(imgType=='licensePhoto')  delete $scope.formData.licensePhoto 
				else if(imgType=='driverImage') delete  $scope.formData.driverImage 
                else if(imgType=='driverIDphoto') delete $scope.formData.driverIDphoto
                $scope.HideActionSheet();
			}
        });
    }
	  $scope.saveProfile=function(){
         
		//$scope.countrySelected.countryTel + 
           var profileData={driverFName:$scope.formData.driverFName,driverLName:$scope.formData.driverLName,driverEmail:$scope.formData.driverEmail,
                            driverMobile:$scope.formData.driverMobile,driverImage:$scope.formData.driverImage,driverIDphoto:$scope.formData.driverIDphoto,
                            driverCountryId:$scope.formData.driverCountryId,driverCityId:$scope.formData.driverCityId
                            ,networkId:$scope.formData.networkId,driverGender:$scope.formData.driverGender,brandId:$scope.formData.brandId,
                            levelId:$scope.formData.levelId,  modelId:$scope.formData.modelId, carYear:$scope.formData.carYear,
                            seatNo:$scope.formData.seatNo,carFrontPhoto:$scope.formData.carFrontPhoto,carNumber:$scope.formData.carNumber
                            ,carNumber2:$scope.formData.carNumber2,driverActivation:0,carColor:$scope.formData.carColor
                            ,licensePhoto:$scope.formData.licensePhoto,licenseNumber:$scope.formData.licenseNumber
                            ,carBackPhoto:$scope.formData.carBackPhoto ,editProfile:1,driverIdnumber:$scope.formData.driverIdnumber,sequenceNumber:$scope.formData.sequenceNumber
                            //,refercode:$scope.formData.refercode
           }
           
           profileData.deviceId=localStorage.uuid; 
           profileData.endPoint=localStorage.UserARN; 
           profileData.driverbirth=$scope.driverbirth.Year+'-'+$scope.driverbirth.month+'-'+$scope.driverbirth.day;   
        
            if($scope.formData.driverPass!='') profileData.driverPass=$scope.formData.driverPass;
            
			$http.post(HostApi+"changeProfile/"+$rootScope.user_data.driverId,profileData).success(function(result) { 
				 $scope.loading_reg=false;
				
				 if(result=='Email exit') $rootScope.Show_alert($rootScope.language.emailexit)
				 else if(result=='Mobile exit') $rootScope.Show_alert($rootScope.language.mobileexit)
				 //else if(result=='refercode no exit') $rootScope.Show_alert($rootScope.language.referNotexit)
				 else {
                    $rootScope.user_data=result.rows;
					localStorage.user_data=JSON.stringify($rootScope.user_data)
                    $rootScope.clearCache();
                    $rootScope.closemodal_page();
                    $rootScope.reload_divmenu();
                    $rootScope.goto('/waitAdmin')
				} 
			}).error(function(error){
				$scope.loading_reg=false;
				console.log(error);
			});
    }  
	
    $scope.register=function(){
        var required_img=$scope.return_requireduploadImg();
       $scope.formData.driverMobile = ltrim($scope.formData.driverMobile,'0')
		$scope.formData.driverMobile = ltrim($scope.formData.driverMobile,$scope.countrySelected.countryTel)
       if($scope.loadingimage || $scope.formData.carFrontPhoto ==imgfolder+'Loading-1.gif'|| $scope.formData.driverImage ==imgfolder+'Loading-1.gif'
           || $scope.formData.carBackPhoto ==imgfolder+'Loading-1.gif'|| $scope.formData.licensePhoto ==imgfolder+'Loading-1.gif'){ 
           $rootScope.Show_alert($rootScope.language.waitUpload)
		}else if(!required_img){
           // !$scope.formData.driverImage! || $scope.formData.carFrontPhoto || !$scope.formData.carBackPhoto || !$scope.formData.licensePhoto ||
			$rootScope.Show_alert($rootScope.language.requiredImg)
		}else{
           
           if($scope.type){ 
              var confirmPopup = $ionicPopup.confirm({ title:$rootScope.language.changeProfilemsg, template: $rootScope.language.changeProfiledata
                                           ,cancelText: $rootScope.language.ok,cancelType: 'button button-block main_btn  sec_bg'
                                           ,okText: $rootScope.language.cancel,okType: 'button button-block main_btn bg_color'});
               confirmPopup.then(function(res) {
                   if(!res) {
                       $scope.loading_reg=true;
                       $scope.saveProfile();
                   }
               });

           }else{
//                $scope.loading_reg=true;//$scope.countrySelected.countryTel + 
                var profileData={driverFName:$scope.formData.driverFName,driverLName:$scope.formData.driverLName,
                            driverEmail:$scope.formData.driverEmail,
                            driverMobile:$scope.formData.driverMobile,driverImage:$scope.formData.driverImage,driverIDphoto:$scope.formData.driverIDphoto,
                            driverCountryId:$scope.formData.driverCountryId,driverCityId:$scope.formData.driverCityId
                            ,networkId:$scope.formData.networkId,driverGender:$scope.formData.driverGender,brandId:$scope.formData.brandId,
                            levelId:$scope.formData.levelId,  modelId:$scope.formData.modelId, carYear:$scope.formData.carYear,
                            seatNo:$scope.formData.seatNo,carFrontPhoto:$scope.formData.carFrontPhoto,carNumber:$scope.formData.carNumber
                            ,carNumber2:$scope.formData.carNumber2,driverActivation:0,carColor:$scope.formData.carColor
                            ,licensePhoto:$scope.formData.licensePhoto,licenseNumber:$scope.formData.licenseNumber
                            ,carBackPhoto:$scope.formData.carBackPhoto ,editProfile:1
                            ,driverPass:$scope.formData.driverPass,driverIdnumber:$scope.formData.driverIdnumber
                                 ,sequenceNumber:$scope.formData.sequenceNumber
                            //,refercode:$scope.formData.refercode
                                }

                profileData.driverCreateDate=moment().format('YYYY-MM-DD hh:mm:ss'); 
                profileData.drivercode=Math.floor((Math.random() * 1000000)).toString(); 
                profileData.deviceId=localStorage.uuid; 
                profileData.endPoint=localStorage.UserARN; 
                profileData.driverbirth=$scope.driverbirth.Year+'-'+$scope.driverbirth.month+'-'+$scope.driverbirth.day;
        console.log(profileData);
               var datasend=$scope.formData;
               
               datasend.driverMobile=$scope.countrySelected.countryTel+$scope.formData.driverMobile
               $scope.formData.driverMobile=$scope.formData.driverMobile;
               $http.post(HostApi+"signup",profileData).success(function(result) { 
                    $scope.loading_reg=false;
                    console.log(result)
                   if(result=='Email exit') $rootScope.Show_alert($rootScope.language.emailexit)
                   else if(result=='Mobile exit') $rootScope.Show_alert($rootScope.language.mobileexit)
                   else {
                       $rootScope.user_data=$scope.formData;
                       $rootScope.user_data.driverId=result.id;
                       $rootScope.user_data.driverActivation=0;
                       localStorage.user_data=JSON.stringify($rootScope.user_data)
                       //$rootScope.Show_alert ($rootScope.language.msgverifyaccount)
                       //$rootScope.goto('/verifyCode')
                       $rootScope.clearCache();
                       $rootScope.goto('/waitAdmin')
                   }
               }).error(function(error){
                   $scope.loading_reg=false;
                   console.log(error);
               });
           }
		}	
    }
    
       
    window.addEventListener('native.keyboardhide',$scope.KeyBoardHide);
    $rootScope.changeDataShow=function(type,formStatus){
        if(!formStatus)  $scope.driver_data=type; 
        $timeout(function(){
            $ionicScrollDelegate.$getByHandle('mainScroll').resize();
        },500);
    }
    $rootScope.changeDataShow(1);
    $scope.chooseCountry=function(){
        $scope.countrySelected=$filter('filter')($scope.countries,{countryId:$scope.formData.driverCountryId}
                                                 ,function(a,b){if(a==b) return true})[0] ;
       // $scope.formData.networkId=-1;
        $scope.formData.driverCityId=$filter('filter')($scope.cities,{countryId:$scope.formData.driverCountryId}
                                                 ,function(a,b){if(a==b) return true})[0].cityId;
    }
    
    $scope.getData=function(query,type){
        $http.get(HostApi+"query/"+query).success(function(data) { 
//            console.log(data.rows)
            if(type=='countries'){
                $scope.countries=data.rows
                if(!$scope.type&&$scope.countries.length>0) {
                   $scope.countrySelected=$scope.countries[0]
                   $scope.formData.driverCountryId=$scope.countrySelected.countryId
                }else{
                    $scope.countrySelected=$filter('filter')($scope.countries,{countryId:$scope.formData.driverCountryId}
                                                 ,function(a,b){if(a==b) return true})[0];
                    //var mobileArr=$rootScope.user_data.driverMobile.toString().split($scope.countrySelected.countryTel)
                    //$scope.formData.driverMobile=mobileArr[1];
                }
                $scope.getData("select * from cities where cityStatus=1",'cities')
           
            }else if(type=='cities'){
                $scope.cities=data.rows
                if(!$scope.type&&$scope.cities.length>0) {
                   $scope.formData.driverCityId=$filter('filter')($scope.cities,{countryId:$scope.formData.driverCountryId}
                                               ,function(a,b){if(a==b) return true})[0].cityId ;
                }
                $scope.getData("select * from brands where brandStatus=1",'brands')
           
            }else if(type=='brands'){
                $scope.brandsList=data.rows
                if(!$scope.type&&$scope.brandsList.length>0) $scope.formData.brandId=$scope.brandsList[0].brandId
                $scope.getData("select * from models where modelStatus=1",'models')
            }else if(type=='models'){
                $scope.modelsList=data.rows
                if(!$scope.type&&$scope.modelsList.length>0){
                    $scope.formData.modelId=$filter('filter')($scope.modelsList,{brandId:$scope.formData.brandId}
                                                 ,function(a,b){if(a==b) return true})[0].modelId ;
                }  
                $scope.getData("select * from levels where levelStatus=1",'levels')
            }else if(type=='levels'){
                $scope.levelsList=data.rows
                if(!$scope.type&&$scope.levelsList.length>0) $scope.formData.levelId=$scope.levelsList[0].levelId;
				$scope.getData("select * from network where network_active=1 and network_id!=-1  ",'network')
                //$scope.getData("select * from packages where packageStatus=1",'packages')
            } /*else if(type=='packages'){
                $scope.packagesList=data.rows
                if($scope.packagesList.length>0) $scope.formData.packageId=$scope.packagesList[0].packageId
                $scope.getData("select * from network where network_active=1 and network_id!=-1  ",'network')
            }*/else if(type=='network'){
                $scope.networkList=data.rows
                if(!$scope.type&&$scope.networkList.length>0){
                   // $scope.formData.networkId=-1
                    $scope.formData.networkId=$scope.networkList[0].network_id;
                }  
            }
            
         }).error(function(error){
            console.log(error);
         });
    }
    $scope.getData("select * from countries where countryStatus=1",'countries')
});

