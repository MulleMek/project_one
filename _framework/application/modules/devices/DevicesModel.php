<?php

class DevicesModel extends Model {

   private static $tableName = 'devices';

   /*******************************************/
   /* PRIVATE */
   /*******************************************/

   private function updateDevice($device, $data, $error)
   {

      if ( !is_string($data) ) {
         $data = json_encode($data);
      }

      Variables::set($device, $data);

      $updateData = [
         'device_name' => $device,
         'last_device_report' => $data,
         'last_device_report_time' => Date('U'),
         'last_device_error' => $error,
      ];

      if ( !DB::where('device_name', $device)->getOne(self::$tableName) ) {
         return DB::insert(self::$tableName, $updateData);
      } else {
         unset($updateData['device_name']);
         return DB::where('device_name', $device)->update(self::$tableName, $updateData);
      }

   }

   /*******************************************/
   /* PUBLIC */
   /*******************************************/
   public function saveSocketLogs( $name, $data )
   {

      $fileName = OPERATION_LOGS_PATH . $name . '.log';
      if ( !file_put_contents($fileName, $data) ) {
         return false;
      }

      chmod($fileName, 0777);

      return $fileName;
   }

   public function updateDevices($devicesData)
   {
      $errors = [];

      foreach ($devicesData as $device => $data) {
         $error = '';

         if ( array_key_exists('lastError', $data) ) {
            $error = $data['lastError'];
         }

         if ( $error == 'false' || $error == '0' ) {
            $error == '';
         }

         if ( DB::where("device_name", $device)->getOne("devices") ) {
            DB::where("device_name", $device)->update("devices", ["last_device_error" => $error]);
         }

         if ( array_key_exists("data", $data) ) {
            if ( !$this->updateDevice($device, $data['data'], $error ) ) {
               $errors[] = $device;
            }
         };

      }

      return $errors;
   }

   public function sendExternalRequestToHomeAndGetErrors($request)
   {

      $data = [
         'terminal' => [
            'project' => Settings::get('terminal_name'),
            'terminal_id' => Settings::get('terminal_id')
         ],
         'devices' => [],
         'operation' => []
      ];


      $errors = [];

      if ( isset($request['devicesData']) ) {
         foreach ($request['devicesData'] as $deviceName => $value) {
            $dbResult = DB::where('device_name', $deviceName)->getOne('devices');
            $data['devices'][] = $dbResult;
            if ( !$dbResult ) {
               $errors['devices'][] = $deviceName;
            }
         }
      }

      if ( isset($request['operation']) ) {
         $data['operation'] = $request['operation'];
      }

      if ( !UsrbbSender::send($data) ) {
         $errors[] = 'Fail send';

      }

      return $errors;
   }

   public function getDeviceData($name)
   {
      $devices = [
         'ECDM400',
         'SmartHopper',
         'CashcodeBNL',
         'CashcodeSM',
         'MEI',
         'LCDM200',
         'JCM',
         'NV200',
         'ICT',
         'JCM_RC',
         'Bill2Bill',
      ];

      $answer = [
         "error" => 0,
         "data" => null
      ];

      if ( !$name || !in_array($name, $devices) ) {
         $answer['error'] = 1;
         $answer['data'] = 'No such device';
         return $answer;
      }

      switch ($name) {
         case 'ECDM400':
            $data = Variables::get('ECDM400');
            $data = json_decode($data, true);


            if ( !$data ) {
               $data = [];
               for ($i = 1; $i < 5; $i++) {
                  $data[] = [
                     "id" => $i,
                     "value" => 0,
                     "count" => 0,
                     "dispensable" => true,
                     "reject" => 0
                  ];
               }


               Variables::set('ECDM400', json_encode($data));
            }

            return $data;

         case 'LCDM200':
            $data = Variables::get('LCDM200');
            $data = json_decode($data, true);


            if ( !$data ) {
               $data = [];
               for ($i = 1; $i < 3; $i++) {
                  $data[] = [
                     "id" => $i,
                     "value" => 0,
                     "count" => 0,
                     "dispensable" => true,
                     "reject" => 0
                  ];
               }


               Variables::set('LCDM200', json_encode($data));

            }
            return $data;

         case 'NV200':
            $data = Variables::get('NV200');
            $data = json_decode($data, true);


            if ( !$data ) {
               $data = [];
               for ($i = 1; $i < 7; $i++) {
                  $data[] = [
                     "id" => $i,
                     "value" => 0,
                     "count" => 0,
                     "dispensable" => true,
                     "reject" => 0
                  ];
               }


               Variables::set('NV200', json_encode($data));

            }
            return $data;

         default:
            $data = Variables::get($name);
            $data = json_decode($data, true);

            if ( !$data ) {

               $data = [
                  [
                     'id' => 1,
                     'value' => 10,
                     'count' => 0,
                     'dispensable' => false
                  ],
                  [
                     'id' => 2,
                     'value' => 50,
                     'count' => 0,
                     'dispensable' => false
                  ],
                  [
                     'id' => 3,
                     'value' => 100,
                     'count' => 0,
                     'dispensable' => false
                  ],
                  [
                     'id' => 4,
                     'value' => 200,
                     'count' => 0,
                     'dispensable' => false
                  ],
                  [
                     'id' => 5,
                     'value' => 500,
                     'count' => 0,
                     'dispensable' => false
                  ],
                  [
                     'id' => 6,
                     'value' => 1000,
                     'count' => 0,
                     'dispensable' => false
                  ],
                  [
                     'id' => 7,
                     'value' => 2000,
                     'count' => 0,
                     'dispensable' => false
                  ],                  
                  [
                     'id' => 8,
                     'value' => 5000,
                     'count' => 0,
                     'dispensable' => false
                  ]

               ];

               $res = Variables::set($name, json_encode($data));
            }
            return $data;
            break;
      }
   }

}
