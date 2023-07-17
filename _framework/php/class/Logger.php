<?php
class Logger
{
   public static function put( $text )
   {
      $ip = $_SERVER["REMOTE_ADDR"];
      $data = [
         "log" =>  "[{$ip}] {$text}",
         "datetime" => time()
      ];

      $text = date("H:i:s Y-m-d", $data["datetime"]) . " " . $data["log"] . "\n"; 

      $writeFileAnswer = file_put_contents(LOGS, $text, FILE_APPEND | LOCK_EX);
      $writeDBAnswer = DB::insert("log", $data);

      return $writeFileAnswer && $writeDBAnswer;
   }

   public static function get( $datefrom = null, $dateto = null )
   {
      $oneDay = 60 * 60 * 24 + 1;
      $datefrom = $datefrom? time() : $datefrom;
      $dateto = $dateto? $dateto + $oneDay : $dateto;

      $report = "";
      $result = DB::query("SELECT * FROM log WHERE datetime>{$datefrom} AND datetime<{$dateto}", false);
      
      if ( empty($result) ) {
         return false;
      }

      foreach ( $result as $row ) {
         $report .= date("d-m-Y H:i:s", $row["datetime"]) . " --- " . $row["log"] . "\n";
      }

      return $report;
   }
}
