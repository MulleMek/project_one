<?php
interface ISession {


   /**
    * Get session property
    * @param  string $key
    * @return mixin
    */
   public static function get( $key );



   /**
    * Set session property
    * @param string $key  
    * @param boolean 
    */
   public static function set( $key, $data );



   /**
    * Retrive session key and delete it from session
    * @param  string $key
    * @return mixin
    */
   public static function pull( $key );



   /**
    * Get all data from session
    * @return mixin
    */
   public static function all();



   /**
    * Check is session has key
    * @param  string  $key 
    * @return boolean
    */
   public static function has( $key );



   /**
    * Clear all session data
    * @return void
    */
   public static function clear();

}