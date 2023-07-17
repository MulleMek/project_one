<?php

class AbuController extends Controller
{
   
   function __construct( $model = null ){
      if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
         if( !defined("IS_DEVELOPER_ON") || !IS_DEVELOPER_ON ){
            die();
         }
      }
      parent::__construct( $model );
   }

   public function action_sendmail()
   {
         $isSended = Sender::send('asdadsa', "Сообщение с терминала " . PROJECT_NAME);
         dd($isSended);
   }

   public function action_index()
   {
      return sj([
         "data" => "Empty abu action",
         "error" => 1
      ]);
   }

	public function action_log()
	{
      $key = "data";

      $answer = [
         "error" => 0,
         "data" => null
      ];

      if ( !Input::exists($key) ) {
         $answer["error"] = 1;
         $answer["data"] = "You don't specify anything to write use key: {$key} in your post/get data";
      }

      Logger::put(Input::request($key));
      sj($answer);
	}

   public function action_mail()
   {
      $key = "data";
      $answer = [
         "error" => 0,
         "data" => null
      ];

      if ( !Input::exists($key) ) {
         $answer["error"] = 1;
         $answer["data"] = "You don't specify anything to write use key: {$key} in your post/get data";
      }

      $body = Input::request($key);

      if ( Input::exists('to') ) {
         $isSended = Sender::sendTo(Input::get("to"), $body);
      } else {
         $isSended = Sender::send($body, $this->model->getMailSubj() );
      }

      if ( !$isSended ) {
         $answer["error"] = 2;
      }
      
      $client = new Remote();
      if( $client -> isReady() ){
         $answer['remote'] = $client -> notification( $body );
      }

      sj($answer);
   }

   public function action_mailto()
   {
      $keys = ["data", "email"];
      
      $answer = [
         "error" => 0,
         "data" => null
      ];

      if ( !Input::exists($keys) ) {
         $answer["error"] = 1;
         $answer["data"] = "You don't specify anything to write use key: data and email in your post/get data";
      }

      $isSended = Sender::sendTo( Input::request("email"), Input::request("data"), $this->model->getMailSubj() );

      if ( !$isSended ) {
         $answer["error"] = 2;
      }
      
      sj($answer);
   }


   public function action_mail_report()
   {
      $from = date('d-m-Y');
      $to = date('d-m-Y');
      
      $key = "data";
      $body = "";
      $answer = [
         "error" => 0,
         "data" => null
      ];

      if( Input::exists("type") ){
         $type = Input::request("type");
         switch ($type) {
            case 'week':
               $from = date('d-m-Y', strtotime($from. ' - 1 week'));
               break;
            case 'month':
               $from = date('d-m-Y', strtotime($from. ' - 1 month'));
               break;
            case 'year':
               $from = date('d-m-Y', strtotime($from. ' - 1 year'));
               break;
            case 'day':
            default:
               break;
         }

      } else {
         if(Input::exists('from')){
            $from = DateTime::createFromFormat('d-m-Y H:i:s', Input::request('from')) -> format('d-m-Y H:i:s'); ///   Нужна проверка данных
         }
         if(Input::exists('to')){
            $to = DateTime::createFromFormat('d-m-Y H:i:s', Input::request('to')) -> format('d-m-Y H:i:s'); ///   Нужна проверка данных
         }
      }
       
      $report = $this -> model -> getReports($from, $to, true);

      if( !$report ) {
         $answer["error"] = 3;
         return sj($answer);
      }

      if ( Input::exists($key) ) {
          $body = Input::request($key);
      }
      $body .= "<br/>". $this -> model -> getReportBody( $report );


      $isSended = Sender::sendReport($body,  $this->model->getMailSubj(), $report['files'] );
      
      if ( !$isSended ) {
         $answer["error"] = 2;
      } else {
         $answer['data'] = $isSended;
      }
      
      sj($answer);
   }

}