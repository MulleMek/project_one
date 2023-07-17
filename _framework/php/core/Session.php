<?php

class Session implements ISession {


   /**
    * Get session property
    * @param  string $key
    * @return mixin
    */
   public static function get( $key )
   {
      if ( !self::has($key) ) {
         return null;
      }

      return $_SESSION[$key];
   }



   /**
    * Set session property
    * @param string $key  
    * @param boolean 
    */
   public static function set( $key, $data )
   {
    
      $_SESSION[$key] = $data;

   }



   /**
    * Retrive session key and delete it from session
    * @param  string $key
    * @return mixin
    */
   public static function pull( $key )
   {
      if ( !self::has($key) ) {
         return null;
      }

      $temp = $_SESSION[$key];
      unset($_SESSION[$key]);
      return $temp;
   }



   /**
    * Get all data from session
    * @return mixin
    */
   public static function all()
   {
      return $_SESSION;
   }



   /**
    * Check is session has key
    * @param  string  $key 
    * @return boolean
    */
   public static function has( $key )
   {
      return (isset($_SESSION[$key]));
   }



   /**
    * Clear all session data
    * @return void
    */
   public static function clear()
   {
      $_SESSION = [];
   }

   public static function destroy() 
   {
      session_destroy();
      $_SESSION = [];
   }

}