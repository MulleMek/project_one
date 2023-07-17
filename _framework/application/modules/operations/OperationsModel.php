<?php

class OperationsModel extends Model {

   /*******************************************/
   /* CREATE */
   /*******************************************/
   public function insert( $data )
   {
      $answer = [
         'error' => 0,
         'data' => null
      ];

      if ( !$this->isInsertDataOk($data) ) {
         return false;
      }

      $data = $this->prepareInsertData($data);

      $lastId = DB::insertReturnInsertedId('operations', $data);

      if ( !$lastId ) {
         $answer['error'] = 1;
      } else {
         $answer['data'] = [
            'id' => $lastId,
            'datetime' => $data['datetime']
         ];
      }

      return $answer;
   }



   /***************************************************************/
   /* UPDATE */
   /***************************************************************/
   public function update( $operationId, $data )
   {
      $data = $this->prepareData( $this->options['types'], $data );

      $matches = false;

      foreach ($data as $key => $value) {
         $line =  DB::where('id', $operationId)->getOne('operations');
         if ( $value != $line[$key] ) {
            $matches = true;
         } else {
            unset($data[$key]);
         }
      }

      if ( !$matches ) {
         return true;
      }

      $answer = DB::where('id', $operationId)->update('operations', $data);
      return $answer? array_keys($data) : false;
   }



   /***************************************************************/
   /* HELPERS */
   /***************************************************************/
   private function isInsertDataOk( $data )
   {
      foreach ( $this->options['required'] as $key ) {
         if ( !isset($data[$key]) ) {
            return false;
         }
      }
      return true;
   }

   private function prepareData( $where, $data = null )
   {
      $data = ($data)? $data : $where;
      foreach ( $where as $key => $value ) {
         if ( isset($data[$key]) ) {
            switch ($value) {
               case 'json':
                  $data[$key] = json_encode($data[$key], JSON_UNESCAPED_UNICODE); ///JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT
                  break;
               case 'decimal':
                  $number = floatval($data[$key]);
                  $number = number_format((float)$number, 2, '.', '');
                  $data[$key] = floatval($number);
                  break;
               case 'int':
                  $data[$key] = intval($data[$key]);
                  break;
               case 'string':
                  # code...
                  break;
               default:
                  # code...
                  break;
            }
         }


      }
      return $data;
   }

   private function prepareInsertData( $data )
   {
      $data = $this->prepareData($this->options['types'], $data);
      if ( empty($data['id']) ) {
         $data['id'] = '';
      }
      $data['datetime'] = time();
      return $data;
   }

   private function orDefault( $value, $default )
   {
      return ( empty($value) )? $default : $value;
   }
}