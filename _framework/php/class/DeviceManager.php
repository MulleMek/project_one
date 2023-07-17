<?php
class DeviceManager
{

   public static function runAll()
   {
      $data = Config::get("devices", "devices");

      if ( !$data ) {
         return;
      }

      self::run($data);
   }

   public static function run( $device )
   {
      /*
       * (void)
       * Запускает указанные в $device exe-шники
       * Девайс может быть как и строкой, так и массивом
       */

      $data = self::prepareData($device);

      foreach ($data as $key => $value) {
         if ( !self::isRunning($value) ) {
            self::runDevice($value);
         }
      }
   }

   public static function check( $device )
   {
      /*
       * (bool)
       * Проверяет, запущен ли указанные в $device exe-шники
       * Девайс может быть как и строкой, так и массивом
       *
       * Возвращает false если хотя бы один из $device не запущен
       */

      $data = self::prepareData($device);

      $status = true;

      foreach ($data as $key => $value) {
         if ( !self::isRunning($value) ) {
            $status = false;
         }
      }

      return $status;
   }

   public static function stop( $device )
   {
      /*
       * (void)
       * Проверяет, запущен ли указанные в $device exe-шники    ??????
       * Если нет - запускает                                   ??????
       * Девайс может быть как и строкой, так и массивом
       *
       * Возвращает false если хотя бы один из $device не запущен
       */

      $data = self::prepareData($device);

      $result = true;

      foreach ($data as $key => $value) {
         if ( self::isRunning($value) ) {
            if ( self::makeStop($value) ) {
               $result = false;
            }
         }
      }

      return $result;
   }



   private static function prepareData( $device )
   {
      if ( is_string($device) ) {
         $device = [$device];
      }

      return self::getDevicesFiles($device);
   }

   private static function getDevicesFiles($list)
   {
      $answer = [];

      foreach ($list as $key => $value) {

        if ( self::getDeviceFile($value) ) {
            $answer[] = self::getDeviceFile($value);
        }
      }

      return $answer;
   }

   private static function getDeviceFile($file)
   {
      $data = [                                                                 /// Нужен будет отдельный список под Linux
         "CashcodeSM" => "CashcodeSM/CC_SM.exe",
         //"CashcodeBNL" => "",
         "Printer" => "Printer/Printers.exe",
         "FPrinter" => "FPrinter/Fiscal.exe",
         "Kaznachey" => "Kaznachey/Kaznachey.exe",
         "ECDM400" => "ECDM400/ECDM.exe",
         "LCDM200" => "LCDM2000/lcdm2000.exe",
         "SmartHopper" => "SmartHopper_and_NV200/NV.exe",
         "NV200" => "SmartHopper_and_NV200/NV.exe",
         "JCM" => "JCM/CMASH.exe",
         "JCM_RC" => "JCM_RC/JCM_UBA.exe",
         "ICT" => "ICT/ICT.exe",
         "Scanner" => "Scanner_EM1200C/EM_Scan.exe",                            /// Сканнер, который сломанный китайский А5
         //"Scanner" => "Scanner_HP_Rel260416/Scanner.exe",                     /// Общее приложение для скана
         "PinPad" => "Pilot.exe",
         "WebCam" => "wtf/CommandCam.exe",                                      /// Чтоб тормозить commandCam .... когда тот отваливается //  Типо нужно было только название exe
         "Uniteller" => "Uniteller/PayBank.exe"
      ];


      if ( array_key_exists($file, $data) ) {

        if($file == "PinPad"){                                                  /// Если таких файлов накопится много, то можно завести другой массив с отдельными путями....

          if(Settings::get("pinpad_status") ){
            return "C:/sc552/".$data[$file];
          } else {
            return false;
          }

        } else {
          return DOCUMENT_ROOT . "/_framework/exe/" . $data[$file];
        }

      } else {
        return false;
      }
   }

   private static function runDevice( $path )
   {
      $application = substr($path, strripos($path, "/") + 1);

      $path = str_replace("/", "\\", $path);                                    //  Windows вроде бы все равно на слеши

      //preg_match('/[^\\\\]+\.exe$/', $path, $matches1);   /// Альтернатива тому Substr. Нужно чтоб обязательно заканчивался на .exe     Даже с маленькой буквы
      //var_dump($matches1[0]);    ////  как-то вытаскивает название файла      ////  Если путь будет написан по другому то может отвалиться

      $cmd = $application;
      $cd = preg_replace('/('.$application.')$/', '', $path);                   /// Рабочая папка



      if (substr(php_uname(), 0, 7) == "Windows"){
        if($application){
          pclose(popen('cd '.$cd.' && start "" /B '.$cmd, "r"));
        } else {
          pclose(popen('start "" /B '.$path, "r"));                             /// Если вдруг что-то пошло не так. То запускаем как было... из _framework
        }
      } else { //*nix
        exec($cmd . " > /dev/null &");                                          /// Не факт что будет работать под Linux, но наверно можно также сделать навигацию в нужную директорию
      }

      return;
   }

   private static function isRunning( $path )
   {
      $application = substr($path, strripos($path, "/") + 1);

      $cmd = 'tasklist /FI "imagename eq ' . $application . '" 2>nul | (findstr /i ' . $application . '|| echo 0)';

      $output = [];

      exec($cmd, $output);

      if ( !is_array($output) || !count($output) || $output[0] == "0" ) {
         return false;
      }

      return true;
   }

   private static function makeStop( $path )
   {

      $application = substr($path, strripos($path, "/") + 1);

      $cmd = 'TASKKILL /F /IM "' . $application . '"';

      $output = true;

      exec($cmd, $output);

      return self::isRunning($path);
   }

     public static function getLevelCash($device, $onecash = true, $data = false){
     if(!$data) $data = json_decode(Variables::get($device),1);      
      if(isset($data) && gettype($data)=='array'){     

        $text ='
        <table>
            <tr>
                <th>Номинал </th>
                <th>Количество </th>
                <th>Сумма </th>
            </tr>
            <tbody>';
        $cash=0;
        foreach ($data as $key => $v) 
        {
          $cash+=$v['count'];
            $sum = $v['value']*$v['count'];
            $text.='<tr><td>'.$v['value'].'</td>
            <td>'.$v['count'].'</td>
            <td>'.$sum.'</td>
            </tr>';             
        }
        $text.='</tbody></table><br>Всего купюр: '.$cash;  
        if  ($onecash) $text = $cash;
    }else{
      return "Нет данных";  
    }
    return $text;
   }

   public static function getMinLevelCash($device){
    $data = json_decode(Variables::get($device),1);
    if (!$data) return 'Нет данных';

    if($data && gettype($data)=='array'){
      $min = 999999999;
      foreach ($data as $key => $value) {
        if($value['count']<$min)$min = $value['count'];
      }
      return $min;
    } else return 'Нет данных';
   }

}
