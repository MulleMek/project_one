<?php
/**
 * Class wrapper around Mailer
 * Purpose to send messages from preconfig user to list of other preconfig users
 */
class Sender {

   private static $addressee = [];


   public static function send( $body, $subject = "", $file = [] )
   {
      self::$addressee = self::getAddressee();
      return self::sendScenario($body, $subject, $file);
   }

   public static function sendTo( $to, $body, $subject = "", $file = [] )
   {
      self::$addressee = [$to];
      return self::sendScenario($body, $subject, $file);
   }

   public static function sendReport( $body, $subject = "", $file = [] )
   {
      self::$addressee = self::getReportAddressee();
      return self::sendScenario($body, $subject, $file);
   }

   private static function makeSenderConfig()
   {
      $vendor = Settings::get("email_vendor");

      if ( !$vendor ) {
         Mailer::config([
            'host' => Settings::get('email_host'),
            'security' => Settings::get('email_security')
         ]);
      }

      $login = Settings::get('email_login');
      $password = base64_decode(Settings::get('email_password'));
      $subject = Settings::get('email_subject');

      if ( !$login || !$password ) {
         return false;
      }

      Mailer::config([
         'login' => $login,
         'password' => $password, 
         'subject' => $subject,
         'vendor' => $vendor
      ]);

      return true;
   }

   private static function getAddressee()
   {
      $answer = [];
      $result = DB::where('active', 1)->get('emails');
      if ( !$result ) return [];

      foreach ( $result as $assoc ) {
         $answer[] = $assoc['email'];
      }

      return $answer;
   }

   private static function getReportAddressee()
   {
      $answer = [];
      $result = DB::where('active', 1)->where('report', 1)->get('emails');
      if ( !$result ) return [];

      foreach ( $result as $assoc ) {
         $answer[] = $assoc['email'];
      }

      return $answer;
   }

   private static function sendScenario( $body, $subject, $file )
   {
      $answer = false;
     
      foreach ( self::$addressee as $address ) {
         $mailerAnswer = Mailer::send($address, $body, $subject, $file);
         if ( !$mailerAnswer['error'] ) {
            $answer = true;
            continue;
         }

         $answer = false || $answer;
      }

      return $answer;
   }
}
