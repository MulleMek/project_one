<?php
class DB {

   private static $db;

   public static function init( $dbConnection )
   {
      self::$db = $dbConnection;
   }
   public static function getDB(){
       return self::$db;
   }

   public static function __callStatic($name, array $params)
   {
      return call_user_func_array(array(self::$db, $name), $params);
   }

}

DB::init(new MySqlDb(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_TABLE));