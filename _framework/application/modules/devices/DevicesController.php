<?php

class DevicesController extends Controller
{
   function __construct( $model = null ){
    if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
      //$_SERVER['HTTP_X_FORWARDED_FOR']; // &&? 
      die();
    }
    parent::__construct( $model );
   }

   public function action_save()
   {

      $answer = [
         "error" => 0,
         "data" => null
      ];

      $errorsArray = [];

      if ( Input::has('logs') ) {
         $data = Input::request('logs');
         $result = $this->model->saveSocketLogs($data['name'], $data['data']);
         if ( !$result ) {
            $errorsArray[] = "Can't save SocketLogs";
         }
      }

      if ( Input::has('devicesData') ) {

         $errors = $this->model->updateDevices(Input::request('devicesData'));

         if ( !empty($errors) ) {
            $errorString = 'Fail Update States of ';

            foreach ($errors as $device) {
               $errorString .= $device .' ';
            }

            $errorsArray[] = $errorString;
         }
      }

      //$errors = $this->model->sendExternalRequestToHomeAndGetErrors(Input::request());

      if ( !empty($errors) ) {
         $errorsArray[] = $errors;
      }

      if ( count($errorsArray) ) {
         $answer['data'] = $errorsArray;
         $answer['error'] = 1;
      }

      return sj($answer);
   }

   public function action_get()
   {
      $answer = [
         "error" => 0,
         "data" => null
      ];

      if ( !Input::has('device') ) {
         $answer["error"] = 1;
         $answer["data"] = "No device in request";
         return sj($answer);
      }


      $result = $this->model->getDeviceData(Input::request('device'));

      if ( !$result ) {
         $answer["error"] = 1;
         $answer["data"] = "Can't get " . Input::request("device") . " data";
         return sj($answer);
      }

      $answer["data"] = $result;
      return sj($answer);
   }

   /*
    * Слушает файл, который пишет PinPad.exe
    * необходим для работы модуля сбербанка
    */
   public function action_sber()
   {
      $answer = [
         "error" => 0,
         "data" => null
      ];

      $path = 'C:\sc552\exchange';

      if ( !file_exists($path) ) {
         $answer['error'] = 1;
         $answer['data'] = 'Not founded exhange file';
         return sj($answer);
      }

      $message = file_get_contents($path);

      $converted = iconv('windows-1251', 'UTF-8', $message);
      $answer['data'] = $converted;
      return sj($answer);
   }

   public function action_disable_pin()
   {
      Settings::set('pinpad_status', 0);
   }

   public function action_runall()
   {
        DeviceManager::runAll();
        return Route::redirectHome();
   }

   public function action_getnoticelevels()
   {

      $names = [
         'min_jcm',
         'max_jcm',
         'min_smarthopper',
         'max_smarthopper',
      ];
      //////    Возможно для JCM_RC Будет гораздо больше параметров тип....
      //////    И + сюда можно подкинуть данные которые будут печататься на фискальном чеке.
      //////    Только надо не забыть их вытащить в глоб на странице.

      $out = [
        'error' => 1,
        'data' => false,
      ];

     $tmp = json_encode($names);
     $tmp = str_replace(['[',']'],['(',')'], $tmp);

     $q = "SELECT * FROM settings WHERE k IN ".$tmp;

     $tmp = DB::query($q, false);

     if(!$tmp){
        return sj($out);
     };

     foreach ($tmp as  $val) {
       $out['data'][$val['k']] = intval( $val['v'] );
     }

     $out['error'] = 0;
     return sj($out);
   }

}
