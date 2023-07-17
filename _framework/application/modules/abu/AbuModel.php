<?php

class AbuModel extends Model
{

   public function getTerminalName(){
      $add = '';
      if( defined('TERMINAL_LOCAL_NAME') ){
         $add = ' ( '.TERMINAL_LOCAL_NAME.' )';
      } else {
         if ( Settings::get('terminal_id') ) {
            $add = ' ( id - ' . Settings::get('terminal_id') . ' )';
         }
      }
      return $add;
   }

   public function getMailSubj(){
      return "Сообщение с терминала " . PROJECT_NAME . " " . ( $this -> getTerminalName() );
   }

   public function getReportBody( $report ){
      return "Составлен отчет по всем операциям с ".date("H:i d.m.Y", $report['from'])." по ".date("H:i d.m.Y",$report['to'])."<br/>Найдено операций - ".$report['count']; 
   }

   //////////////////////////////////////////
   
   public function getReports($from, $to, $csv_on)
   {  
      Logger::put("Запрошен отчет с : $from по: $to");

      $config_fields = Config::get("operations", "auto_reports");
      $fields_headers = [];
      $fields = [];
      foreach ($config_fields as $key => $value) {
         $fields[] = $key;
         $fields_headers[] = $value;
      }

      
      $from = ($from) ? strtotime($from) : strtotime(date("d.m.Y"));
      $to   = ($to) ? strtotime($to) : $from + 60*60*24;
      $to   += 60*60*24;
      if ( $from > $to ) return false;
      
      $q = "SELECT * FROM operations WHERE operations.datetime>=$from AND operations.datetime<$to";

      $operations = DB::query($q, false);
      /// если операций нет ....
      // if ( !$operations ) return false;

      foreach ($operations as $operation) {
         $operation['datetime'] = date("H:i d.m.Y", $operation['datetime']);
      }

      // if (count($operations) == 0) {
      //    $csv_url = '';
      // } else {
         $csv_url = $this->makeCSV( $operations, [ 'short' => false, 'fields' => $fields, 'fields_headers' => $fields_headers ] );
         //$xls_url = $this->makeXLS( $csv_url );
      // }

      return [
        'count' => count($operations),
        'from' => $from,
        'to' => $to,
        'file' => $csv_url,
        //'files' => [ $xls_url, $csv_url ],
        'files' => [ $csv_url ],
      ];
   }

   // private function makeXLS( $link ) 
   // { 
   //      if( !$link ) return false;
   //      $name = basename($link, ".csv");
   //      if( !$name ) return false;

   //      $uri = DOCUMENT_ROOT . "/_project/files/logs/csv_reports/";
        
   //      if( CSVtoXLS::convert( $uri.$name.'.csv', $uri.$name.'.xls' ) )
   //          return $uri.$name.'.xls' ;

   //      return false;
   //  }

   private function makeCSV($operations, $options = array())
   {
      $defaults = [
            'header' => true,
            'short' => false,
            'fields' =>  ['id', 'type', 'price', 'inserted', 'dispensed', 'printed', 'datetime', 'sync', 'no_troubles', 'approved', 'data'],
            'fields_headers' => ['ID', 'Тип', 'Цена', 'Внесено', 'Выдано', 'Напечатано', 'Дата/Время', 'Синхр.', 'Проблемы', 'Решено', 'Дата']
         ];

      $options = array_replace_recursive($defaults, $options);

      $filename = date('d_m_Y')."_".substr( md5('csv'.time()),0,6)."_report.csv"; 
      $filepath = PROJECT.'/files/logs/csv_reports/'; //$filepath = 'csv/'.$filename;
      $fileurl = $filepath.$filename;                 //$fileurl  = '/webadmin/api/csv/'.$filename;
   
      //GENERATE CSV FILE CONTENT
      $csv = "\xEF\xBB\xBF";

      if ($options['header']) {
         foreach ($options['fields_headers'] as $header) {
            $csv .= $header . ';';
         }
         $csv .= "\n";
      }

      foreach ($operations as $operation) {
         $json = null;
         foreach ($options['fields'] as $field) {
            if ( array_key_exists($field, $operation) ) {
               if ( $field == "datetime" ) {
                  $csv .= date("d.m.Y H:i", $operation[$field]) .";";
               } else {
                  $csv .= $operation[$field] .";";
               }
            } else {
               if ( array_key_exists("data", $operation) ) {
                  if( !$json ) $json = json_decode($operation["data"], true);

                  if ( $json && array_key_exists($field, $json) ) {
                     if(!is_array($json[$field])){
                        $csv .= $json[$field] . ";";
                     } else if($field == 'service' ){
                       $_str = 'Id'.$json[$field]['id'].' - '.$json[$field]['name']. '  -  '.$json[$field]['description'];
                       $_str = str_replace(["\n",";"], " ", $_str);
                       $csv .= $_str.";";
                     } else {
                        $_str = mb_convert_encoding( json_encode($json[$field],JSON_UNESCAPED_UNICODE),'UTF-8','auto');
                        $_str = str_replace(["\n",";"], " ", $_str);
                        $csv .= $_str.";";
                     }
                  } else {
                     $csv .= ";";
                  }
               }
            }
         }
         $csv .= "\n";
      }

      //$csv .= $this -> makeDeviceData( $options );

      file_put_contents($fileurl, $csv);
      Logger::put("Сформирован спец CSV отчет: $filename");
      return $fileurl;
   }

   /*
   private function makeDeviceData( $options ){
      $csv = "Отчёт обт остатке ДС в хоппере и диспенсере\n";
      $headers = array('0.5', '1', '2', '5', '10', '50', '100', '500', '1000');
      foreach ($headers as $header) {
         $csv .= $header . ';';
      }
      $csv .= "\n";

      $hopperStateOld = json_decode(Devices::get("SmatrHopper"), true);
      $dispenserStateOld = json_decode(Devices::get("ECDM400"), true);
      foreach ($hopperStateOld as $value) {
         $csv .= $value['value'] . ';';
      }
      foreach ($dispenserStateOld as $value) {
         $csv .= $value['value'] . ';';
      }
      $csv .= "\n";
      foreach ($headers as $header) {
         $csv .= $header . ';';
      }
      $csv .= "\n";
      $hopperStateNew = json_decode(Variables::get("SmartHopper"), true);
      $dispenserStateNew = json_decode(Variables::get("ECDM400"), true);
      foreach ($hopperStateNew as $value) {
         $csv .= $value['value'] . ';';
      }
      foreach ($dispenserStateNew as $value) {
         $csv .= $value['value'] . ';';
      }
      $csv .= "\n";
      $csv .= "Отчёт о выручке при оплате наличными\n";

      return $csv;
   }
   */

}