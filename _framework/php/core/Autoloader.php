<?php

class Autoloader {

   private static function loadModule( $className ) {
      $subdomain = Route::$subdomain;
      $appFolder = DOCUMENT_ROOT.'/'.$subdomain.'application/classes/';
      $temp = strtolower($className);
      $domainName = null;

      if ( strpos($temp, "controller") !== false || strpos($temp, "model") !== false  ) {
         if ( $temp != "controller" && $temp != "model" ) {
            $domainName = str_replace(["controller", "model"], "", $temp);
            $domainName = DOCUMENT_ROOT.'/'.$subdomain.'application/modules/'.$domainName;
         }
      }


      switch ( true ) {
         case $domainName: 
            if ( file_exists($domainName.'/'. $className . '.php') ) {
               require_once($domainName.'/'. $className . '.php');
            }
            break;
         case file_exists($appFolder.$className.'.php'):
            require_once($appFolder.$className.'.php');
            break;
      }

   }

   public static function loader( $className )
   {
      switch( true ) {
         /***************************************************************/
         /* BASE */
         /***************************************************************/
         case file_exists( SHARED_FOLDER . 'class/'.$className.'.php' ): 
            require_once(SHARED_FOLDER . 'class/'.$className.'.php');
            break;

         case file_exists( SHARED_FOLDER .  'core/'.$className.'.php' ): 
            require_once( SHARED_FOLDER .  'core/'.$className.'.php');

            break;

         case file_exists( SHARED_FOLDER .  'interfaces/'.$className.'.php' ):
            require_once(SHARED_FOLDER .  'interfaces/'.$className.'.php');
            break;

         case file_exists( PROJECT . '/php/'.$className.'.php' ): 
            require_once(PROJECT . '/php/' . $className . '.php');
            break;

         default:
            self::loadModule($className);
            return;


      }

   }
   
}

spl_autoload_extensions('.php'); 
spl_autoload_register('Autoloader::loader'); 

   