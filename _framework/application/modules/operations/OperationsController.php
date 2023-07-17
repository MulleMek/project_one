<?php

/***************************************************************/
/* CRUD */
/***************************************************************/
class OperationsController extends Controller
{

   function __construct( $model = null ){
      if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
         //$_SERVER['HTTP_X_FORWARDED_FOR']; // &&? 
         die();
      }
      parent::__construct( $model );
   }

   public function action_create()
   {
      
/*      $data = [
         "type" => "payment_cash",
         "price" => "500",
         "data" => '{"name":"lol","wtf":"aszaaz","wtfasdass":"aszaaz"}}'
      ];

      dd(DB::where('id', 12)->update('operations', $data));*/

      $answer = array(
         'error' => 0,
         'data' => null
      );

      
      $keys = $this->model->options['keys'];
      $data = $this->model->validateAny(Input::request(), $keys);

      if ( !$data ) {
         $answer['error'] = 1;
         $answer['data'] = 'Invalid data';
         sj($answer);
         return;
      }

      $insertAnswer = $this->model->insert($data);

      if ( !$insertAnswer || $insertAnswer['error'] ) {
         $answer['error'] = 2;
         $answer['data'] = 'Insert into db fail';
         sj($answer);
         return;
      }

      $answer['data'] = [
         'operationId' => $insertAnswer['data']['id'],
         'datetime' => $insertAnswer['data']['datetime']
      ];
      
      sj($answer);
   }

   public function action_update( $operationId )
   {
      $keys = $this->model->options['keys'];

      $answer = array(
         'error' => 0,
         'data' => null
      );

      if ( !$operationId || !($data = $this->model->validateAny(Input::request(), $keys, true)) ) {
         $answer['error'] = 1;
         $answer['data'] = 'Invalid data';
         sj($answer);
         return;
      }

      if ( !($updatedFields = $this->model->update($operationId, $data)) ) {
         $answer['error'] = 2;
         $answer['data'] = 'Update fail';
         sj($answer);
         return;
      }

      $answer['data'] = $updatedFields;      
      sj($answer);
   }
}