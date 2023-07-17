<?php

if ( !function_exists('dd') ) {
   /**
    * Dump the passed variables and end the script.
    *
    * @param  dynamic  mixed
    * @return void
   */
   function dd()
   {
      array_map(function($x) { var_dump($x); }, func_get_args()); die;
   }
}

if ( !function_exists('sj') ) {
   /*
    * Отправляет ответ в виде Json
    */
   
   function sj($data)
   {
      header('Content-Type: application/json; charset=utf-8');

      if ( is_array($data) ) {
         $data = json_encode($data, JSON_UNESCAPED_UNICODE);
      }

      echo $data; 
   }
   
}

if ( !function_exists('sj_all') ) {
   /*
    * Отправляет ответ в виде Json
    */
   
   function sj_all($data)
   {

      header('Access-Control-Allow-Origin: *');
      header('Content-Type: application/json; charset=utf-8');

      if ( is_array($data) ) {
         $data = json_encode($data);
      }

      echo $data; 
   }
   
}

if ( !function_exists('ss') ) {
   /*
    * Тормозит сессию, чтобы долгий скрипт на сервере не стопил общую работу
    */
   
   function ss()
   {
      session_write_close();
   }
   
}