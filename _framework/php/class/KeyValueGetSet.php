<?php
class KeyValueGetSet {

   protected static $tableName;

   public static function get( $name )
   {
      $result = DB::where("k", $name)->getOne(static::$tableName);
      return $result? $result["v"] : false;
   }

   public static function getMany( $names )
   {    
      if( !is_array($names) ) return [];

      $names = str_replace(['[',']'],['(',')'], json_encode($names) );
      $q = "SELECT k,v FROM ".static::$tableName." WHERE k in ".$names;
      $result = DB::query($q, false);
      $out = [];
      foreach ($result as $val) {
         $out[$val['k']] = $val['v'];
      }
      return $out;
   }

   public static function set( $name, $value )
   {
      if ( !$name ) {
         return false;
      }

      if ( self::get($name) === (string)$value ) {
         return true;
      }

      if ( self::get($name) === false ) {
         return DB::insert(static::$tableName, ["k" => $name, "v" => $value]);
      }

      return DB::where("k", $name)->update(static::$tableName, ["v" => $value]);
   }

   public static function clear( $name )
   {
      return self::set($name, "");
   }

   public static function create( $name, $value = "" )
   {
      if ( !$name || self::exists($name) ) {
         return false;
      }

      return DB::insert(static::$tableName, [
         "k" => $name,
         "v" => $value
      ]);

   }

   public static function exists( $name )
   {
      //"" is exists
      $result = self::get($name);
      return ($result === false)? false : true;
   }

   public static function delete( $name )
   {
      if ( !$name || !self::exists($name) ) {
         return false;
      }

      return DB::where("k", $name)->delete(static::$tableName);
   }

   public static function add( $name, $value )
   {
      if ( !self::exists($name) ) {
         return false;
      }

      $new = intval(self::get($name)) + intval($value);

      return self::set($name, $new);
   }
}