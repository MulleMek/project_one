<?php
class Terminal
{

   private static $db_key = 'terminal_id';

   public static function getId()
   {
      $id = Settings::get(self::$db_key);
      if ( $id ) {
         $id = intval($id);
      }
      return $id;
   }

   public static function getErrors()
   {
      $devices = Config::get('devices', 'devices');
      $id = self::getId();
      $errors = false;

      /*
       * Если в модулях терминала есть Qiwi:
       * qiwi использует уникальный номер операции
       * если к аккаунту привязаны несколько терминалов, то простой автоинкремент не поможет,
       * потому что идентификаторы будут совпадать.
       * Поэтому невозможно запустить терминал с qiwi и без терминал id
       */
         

      if ( $devices && !$id && in_array('Qiwi', $devices) ) {
         $errors = true;
         var_dump('Невозможно включить модуль Qiwi без terminal_id в таблице Settings');
      }

      if ( $errors ) {
         die();
      }

      return;
   }
}
