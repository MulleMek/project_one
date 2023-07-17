<?php

class Input {

   public static function get( $param = null )
   {
      return self::retrive($_GET, $param, "get");
   }

   public static function post( $param = null )
   {
      return self::retrive($_POST, $param, "post");
   }

   public static function request( $param = null )
   {
      return self::retrive($_REQUEST, $param, "request");
   }


   /**
    * Not empty
    * @param  string|array  $param
    * @return boolean
    */
   public static function has( $param )
   {
      $param = self::makeArray($param);

      foreach ( $param as $value ) {
         if ( empty($_REQUEST[$value]) ) {
            return false;
         }
      }

      return true;
   }



   /**
    * Is set?
    * @param  string|array $key 
    * @return boolean
    */
   public static function exists( $param )
   {
      $param = self::makeArray($param);

      foreach ( $param as $value ) {
         if ( !isset($_REQUEST[$value]) ) {
            return false;
         }
      }

      return true;
   }

   public static function except( $param )
   {
      $data = self::request();

      if ( empty($data) ) {
         return false;
      }
      
      if ( !is_array($param) ) {
         $param = [$param];
      }

      foreach ( $data as $key => $value ) {
         if ( in_array($key, $param) ) {
            unset($data[$key]);
         }
      }
      
      return $data;
   }

   public static function file( $key )
   {
      throw new Exception("Unimplemented Input::file()", 1);
   }

   public static function hasFile( $key )
   {
      throw new Exception("Unimplemented Input::hasFile()", 1);
   }


   /***************************************************************/
   /* PRIVATE */
   /***************************************************************/
   private static function makeArray( $anything )
   {
      if ( is_array($anything) ) {
         return $anything;
      }

      return [$anything];
   }

   private static function retrive( $from, $param, $methodName = "get" )
   {
      if ( empty($from) || !is_array($from) ) {
         return false;
      }

      /***************************************************************/
      /* 1. Input::get() => $_GET */
      /***************************************************************/
      if ( !$param ) {
         return $from;
      }



      /***************************************************************/
      /* 2. Input::get('key') */
      /***************************************************************/
      if ( is_string($param) || is_numeric($param) ) {
         if ( self::exists($param) ) {
            return $from[$param];
         }
         return false;
      }
      
      

      /***************************************************************/
      /* 3. Input::get(['key1', 'key2']) => () */
      /***************************************************************/
      if ( is_array($param) ) {
         $answer = [];

         foreach( $param as $key ) {
            
            if ( !self::exists($key) ) {
               return false;
            }

            $answer[$key] = self::$methodName($key);
         }

         return empty($answer)? false : $answer;
      }

      return false;
   }

}