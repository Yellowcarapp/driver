angular.module('MyApp').controller('menuCtrl', function($ocLazyLoad,$scope,$rootScope,$ionicModal,$timeout,$ionicBackdrop) { 
    
   

    $rootScope.openPage_modal=function(page_name){
       if(map)  map.setClickable(false);
        if($rootScope.modal_page) $rootScope.closemodal_page();
         $rootScope.modal_loadflag=true;
         $rootScope.show_tripDtails=false;
         $rootScope.showdiv_menu=false;
         $rootScope.profile_type='';
         $rootScope.page_name=page_name;
         if( $rootScope.page_name=='profile')$rootScope.profile_type='profile';
         var page=templateUrl+ $rootScope.page_name+'.html';
        $ionicModal.fromTemplateUrl(page,function(modal){$rootScope.modal_page=modal;}
        ,{scope: $rootScope, animation: 'slide-in-up',backdropClickToClose:false,hardwareBackButtonClose:false});
        $rootScope.openmodal_page= function(){ 
            if(map)   map.setClickable(false);
              $rootScope.modal_page.show();	
        };
        
        $rootScope.closemodal_page= function(flag) { 
            if($rootScope.modal_page)  {
                $rootScope.modal_loadflag=false; 
                $rootScope.modal_page.hide();
                $rootScope.modal_page='';
            }
            if(flag && map )  map.setClickable(true);
        };
        $rootScope.$on('modal.hidden', function() {
            if($rootScope.modal_loadflag){ 
                $rootScope.modal_loadflag=false; 
                $rootScope.closemenumodal();
            }
        });
        $timeout(function(){  $rootScope.openmodal_page(); },200)
   
    }
    
 $rootScope.reload_divmenu();
 
});