<?php

interface IAuth {


   /**
    * Encrypt password
    * @param  string $password 
    * @return string
    */
   public static function password( $password );



   /**
    * Login user into application
    * @param  array  $credentials [login, password [, admin, operator]]
    * @return bool
    */
   public static function attempt( array $credentials );
   


   /**
    * Check users credentials without logging in
    * @param  array  $credentials [login, password [, admin, operator]]
    * @return bool
    */
   public static function validate( array $credentials );




   /**
    * Check is user logged in
    * @return bool
    */
   public static function check();



   /**
    * get user array
    * @return bool, array  false/[id, fio, operator, admin]
    */
   public static function user();



   /**
    * get user id
    * @return int
    */
   public static function id();



   /**
    * get user name
    * @return string
    */
   public static function name();



   /**
    * get user fullname
    * @return string
    */
   public static function fullname();



   /**
    * Logs out user
    * @return void
    */
   public static function logout();


   // проверяет его права мастера
   public static function check_master();
   
   // возвращает массив id организаций
   public static function getOrg(); 

   // проверяем, есть ли права у этого пользователя на изменение чего либо связанного с этой организацией
   public static function checkOrg($id_org); 
}