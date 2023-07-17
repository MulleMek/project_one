<?php

  /*
      Можно запариться и расшириться от Интерфейса, аля iPayment
      типо чтобы во всех классах с этим интерфейсом были методы типо makePayment


      ииии слишком много копипасты, мб можно очень сильно упростить??????
      особенно в проверке статусов и генерации JSON
            можно xml объект конвертнуть в массив через JSON


      /// МОжно было бы поступить проще с конфигурацией.....,
          типо брать сразу ВСЕ данные из бд массивом и хранить их в переменной....
          но не факт что хороший вариант
          будет сложновато кусками обновлять данные... нужно будет выгружать все, менять и заново загружать

          можно было бы написать полууниверсальные функции, которые выдергивали все статусы и результаты из XML ответа
          чтобы было меньше копипасты,
          в принципе можно так и поступить, если преревести xml в json, а потом json в array

          мб лучше переделать updateConfig, чтобы если пришел пустой параметр, то попросту путь у сертификата или ключа не менялся, например
          Пока только в RSA, и хорошо..
  */

  /*


      function __construct(){                                                   ///// Можно упростить и грузить один большой конфиг

      public static function getSslConfig(){
      public static function updateSslConfig($verifypeer, $cert_path='', $verifyhost=0 ){
      public function saveSslConfig(){
      public static function getMainConfig(){
      public static function updateMainConfig($login, $sign, $signAlg, $terminalid){
      public function saveMainConfig(){
      public static function getRsaConfig(){
      public static function updateRsaConfig($path, $alg, $is_sign_enabled=false){
      public function saveRsaConfig(){

      ///// Типо для отладки.... для упрощения работы можно убрать, +убрать из методов ведение истории...
      public function getLog(){
      public function getLastXML(){


      public static function getPendingOperations(){                            //  Тащим операции в "Проведении" за последние 6 часов
      public static function getNotApprovedOperations(){                        //  Ташим проблемные операции (непроверенные) старше 6 часов
      /////  для управления таблицой qiwi_operations:
      private static function saveOperation($operationData=[]){
      private static function updOperation($operation_id, $data){
      private static function prepareOperation($data){
      private static function getNextPaymentId(){
      ///// для email рассылки...
      private static function prepareHtmlTable($data){
      private static function sendEmails($couponId, $sendedData, $receivedData=[], $msg = 'при пополнении счета телефона'){


      public function checkPendings()                                           /// Проверяем статусы у последних за шесть чаосв операций, находящихся в "ПРОВЕДЕНИИ", если произошла ошибка при проведении отправляем инфу на почту
      public function checkTroubles()                                           /// Собираем последние инциденты, старше 6 часов и делаем рассылку на почту
>>    public function checkAllPayments()                                        /// Обертка над предыдущими двумя. Проверяем статусы у не проведенных, Проверяем время и делаем рассылку раз в 24 часа (checkTroubles)

                      ///// для текущей таблицы: phone, sum, dgCode, couponDate, operationId(если есть)
>>    public function startPay($operationData = [])                             /// Обертка над makePayment, во время оплаты генерим данные, заносим в таблицу, если что - отправляем инфу по инцидентам на почту
>>    public static function createEmptyIncedent($operationData =[], $error_message = '!!! Клиент отошел от терминала или забыл ввести номер телефона!')        ////  Делаем пустую операцию, со всеми возможными данными и отправляем инфу на почту


      ////  Обертка над основными методами, для проведения онлайн оплаты с проверкой данных
      public function makePayment($paymentId, $account, $sum, $couponId = '', $couponDate = '2016-04-25T14:43:01')  ///// $couponId => qiwi_operations -> id

      ////  Сами методы
>>    public function getProvider($phone)
      public function getProviders($agentId='', $terminalId='')
      public function getCommissions($terminalid='')
      public function getForeignCommissions()
      public function getExcemptionRates($agentId ="")
      public function getBalance($agentId="")
      public function getAgentInfo($agentId="")
      public function getTerminalInfo($terminalId="")
      public function getPersonInfo()
      public function getRoles()
      public function test($agnetId ="")                                        /// для тестов
      public function checkPaymentRequisites($paymentId, $paymentData)
      public function authorizePayment($paymentId, $paymentData, $comment)
      public function confirmPayment($paymentId)
      public function getPaymentStatus($paymentId)
      public function setPublicKey($publicKey)                                  ////  Надо проверить






      ////  Генерим XML для авторизации
      private function generateAuthData( $simpleXml)
      private function generateClientData( $simpleXml)

      ////  Генерим XML для методов
      private function xml_getBalance( $simpleXml, $agentId ="")
      private function xml_getAgentInfo( $simpleXml, $agentId ="")
      private function xml_getPersonInfo( $simpleXml )
      private function xml_getRoles( $simpleXml )
      private function xml_getProviderByPhone( $simpleXml, $phoneNumber="")
      private function xml_getProviders( $simpleXml, $agentId ="", $terminalId ="")
      private function xml_checkPaymentRequisites( $simpleXml, $paymentId ="", $paymentData =[])
      private function xml_authorizePayment( $simpleXml, $paymentId ="", $paymentData =[], $comment="")
      private function xml_confirmPayment( $simpleXml, $paymentId="")
      private function xml_getPaymentStatus( $simpleXml, $paymentId="")
      private function xml_setPublicKey( $simpleXml, $publicKey)
      private function xml_getCommissions( $simpleXml, $terminalId ="")
      private function xml_getForeignCommissions( $simpleXml )

      ////
      private function request($simpleXml)                                      //  Получает XML  //  Вносит авторизационные данные и делает запрос через makeRequest
      private function makeRequest($postdata, $signData=[])                     /// Сам запрос через curl
      private function genCryptoSign($postdata)                                 /// Генерация подписи для сообщения

      private function checkCert()


  */

  class QiwiXmlRequestor
  {
      /*
       * Переменные для дополнительных данных для чека
       */
      private static $qiwiPrintDataDBKey = 'qiwi_printer_data';











      private $xml_head = '<?xml version="1.0" encoding="utf-8"?><request></request>';

      private $xml_url = "https://xml1.qiwi.com/xmlgate/xml.jsp";                 //  МБ унести это в конфиг


      //  Конфигурация CURL Для работы с SSL
      public static $ssl_variable_name = 'qiwi_ssl_config';
      private $ssl_verifypeer = true;                                             //  Отключена проверка ssl сертификата
      private $ssl_cert_path  = 'C:/TEMP_WWW/qiwi/cert/trusted/qiwi_ca_main.pem'; //  Типо default
      private $ssl_verifyhost = 2;                                                //  Типо полная проверка всех параметров сертификата

      //  Основной Конфиг...
      public static $config_variable_name = 'qiwi_main_config';
      private $config_login = 'avtokassa01';
      private $config_sign  = '';
      private $config_signalg ='MD5';                                           // Тут оно должно быть всегда MD5.... в принципе, можно было бы одним полем все сделать ( MD5 MD5withRSA SHA1withRSA ) и тогда не понадобится переменная для проверки, что RSA должен быть включен
      private $config_terminalid = '10238898';

      private $config_terminalSerial = '';                               // Не храню в конфиге

      //  КОнфиг для работы с цифровой подписью
      public static $rsa_variable_name = 'qiwi_rsa_config';
      private $config_rsa_pathToKey = 'C:/TEMP_WWW/qiwi/keys/test/private1.key';//  Типо дефолтный ключ... мб лучше и не надо так...
      private $config_rsa_alg = 'MD5withRSA';                                   ////////  "MD5withRSA" "SHA1withRSA"
      private $config_is_sign_enabled = false;

      private $last_log = [];
      private $last_postdata = "";

      /*
        В конструкторе
            Ппытаемся загрузить конфиги из БД (Variables)
            и если неудачно загрузили их (отсутствует),
            то в  переменных будут defaults
            и при этом произойдет автоматическое сохранение их в Variables

          LOAD CONFIG



      */
      function __construct(){
          $cnf = self::getFullConfig();                               /// Берем разом все что есть по конфигу.... вместо трех Variables::get

          $tmp = $cnf[self::$ssl_variable_name];                     //  Конфиг Кккурла - SSL
          if($tmp)                                                              //  Если получилось выгрузить данные, то грузим их в переменные
          {
            $this -> ssl_verifypeer = $tmp['peer'];
            $this -> ssl_cert_path  = $tmp['path'];
            $this -> ssl_verifyhost = $tmp['host'];
          } else {
            $this -> saveSslConfig();
          }                                                                     //  Если нет, то останется типо defaults

          $tmp = $cnf[self::$config_variable_name];                   //  Основной КОнфиг
          if($tmp)
          {
              $this -> config_login = $tmp['login'];
              $this -> config_sign = $tmp['sign'];
              $this -> config_signalg = $tmp['signalg'];
              $this -> config_terminalid = $tmp['terminalid'];
          } else {
              $this -> saveMainConfig();
          }

          $tmp = $cnf[self::$rsa_variable_name];
          if($tmp)
          {
              $this -> config_rsa_pathToKey = $tmp['path'];
              $this -> config_rsa_alg = $tmp['alg'];
              $this -> config_is_sign_enabled = $tmp['enabled'];
          } else {
              $this -> saveRsaConfig();
          }
      }


      /*
       * Обертка для проведения платежа, работы с бд и создания всех id-щников для проведения оплаты....
       * Не помню на счет сроков хранения payment_id походу лучше при каждом создании бд, делать уникальный стартовый id типо....
       * Нет проверки, если вдруг пустой телефон или пустая сумма....
       */
      public function startPay($data)
      {
         /*
          * Должна вернуть false если что-то не так
          * Если всё так - массив данных для печати
          */
         $id = self::saveOperation($data); 

         if ( !$id ) {
            return [
               'error' => 1,
               'description' => 'cant save operation and get id'
            ];
         } 

         $result = $this->makePayment($id, $data['phone'], $data['amount'], $id, $data['coupon_date']);

         $status = $this->getStatus($result);

         self::updOperation($id, ['status' => $status, 'status_datetime' => date('U')]);

         if ( self::isErrorStatus($status) ) {
            return false;
         }

         $dbData = json_decode(Variables::get(self::$qiwiPrintDataDBKey), true);

         if ( !$dbData ) {
            $dbData = [
               'top' => [],
               'bottom' => []
            ];
         } else {
            $answer = [];
            $keys = ['top', 'bottom'];

            foreach ($keys as $key) {
               if ( array_key_exists($key, $dbData) ) {
                  $answer[$key] = $dbData[$key];
               } else {
                  $answer[$key] = [];
               }
            }

            $dbData = $answer;
         }

         $printData = $dbData['top'];
         $printData[] = "Номер телефона: ".$data['phone'];
         $printData[] = "К зачислению: ".$data['amount'];
         $printData[] = "Дата: ".$data['coupon_date'];
         $printData[] = "Номер квитанции: ".$id;

         return array_merge($printData, $dbData['bottom']);
      }



      private static function isErrorStatus($status) {
         if ( $status == 1 || $status == 2 ) {
            return false;
         }  

         return true;
      }

      private static function getStatus($data) {
      /*
       * В makePayment вызывается 5 методов:
       * 1. Получаем сотового оператора
       * 2. Валидируем данные платежа через киви
       * 3. Авторизация данных в киви
       * 4. Подтверждаем платёж
       * 5. Единожды проверяем статус платежа
       *
       *
       * Отвалиться может на одном их этих методов, поэтому критерий успешной операции:
       * 
       * $data['requestName'] = 'getPaymentStatus' || 'confirmPayment'
       * $data['response'] - массив
       * Платеж может находиться в одном из следующих статусов:
       *  3 – «авторизован»;
       *  1 – «проводится»;
       *  2 – «проведен» (финальный статус);
       *  0 – «ошибка проведения» (финальный статус).
       *
       *
       * Наши статусы:
       * 1 - в очереди
       * 2 - принят
       * 3 - отменён
       * 4 - ошибка киви
       * 5 - ошибка 
       */

         if ( !is_array($data) ) {
            return 5; //#TODO ERROR CODES
         }

         if ( !array_key_exists('requestName', $data) || 
            ( $data['requestName'] !== 'getPaymentStatus' && $data['requestName'] !== 'confirmPayment') ) {
               return 4; // Ошибка киви - отвалились на критически важном запросе
         }

         $status = $data['response']['data']['status']; 

         switch ($status) {
            case 0:
               return 4; //ошибка проведения платежа -> ошибка киви 
            case 2:
               return 2; //проведён -> принят 
            case 1:
               return 1; //проводится -> в очереди 
            default:
               return 4; //прочие ошибки -> ошибка киви 
               break;
         }
      }

      private static function saveOperation( $data = false ) {
      /*
       * Создаёт операцию и возвращаем ее локальный ID
       */
         if ( !$data ) {
            return false;
         }

         $data['id'] = self::getId();

         $data = self::prepareOperation($data);
         return DB::insert('qiwi_operations', $data);
      }

      private static function getId() {
         return intval(Terminal::getId() . date('U'));
      }

      private static function prepareOperation($data) {
         $conf = [
            'phone' => 'string',
            'amount' => 'float',
            'coupon_date' => 'string',
            'operation_id' => 'string',
            'status' => 'int',
            'status_datetime' => 'int',
            'coupom_data' => 'string'
         ];

         $data['datetime'] = date('U');
         $answer = [];

         foreach ($data as $key => $value) {
            if ( array_key_exists($key, $conf) ) {
               switch ($conf[$key]) {
                  case 'int':
                     $answer[$key] = intval($value);
                     break;
                  case 'string':
                     $answer[$key] = strval($value);
                     break;
                  case 'float':
                     $answer[$key] = floatval($value);
                     break;
               }
            } else {
               if ( $key === 'data' ) {
                  $value = json_encode($data[$key]);
               }

               $answer[$key] = $value;
            }
         }

         return $answer;
      }

      private static function updOperation($id, $data){
         return DB::where('id', $id)->update('qiwi_operations', self::prepareOperation($data));
      }

























































      /*********

          CONFIG FUNCTIONS

        **********/
      public static function getSslConfig(){
        return json_decode(Variables::get(self::$ssl_variable_name), 1);
      }
      public static function updateSslConfig($verifypeer, $cert_path='', $verifyhost=0 ){
          $tmp = [
              'path' => $cert_path,
              'peer' => $verifypeer,
              'host' => $verifyhost,
              'updated' => date("Y-m-d H:i:s"),
          ];

          return Variables::set(self::$ssl_variable_name, json_encode($tmp));
      }

      public function saveSslConfig(){
          self::updateSslConfig(
                  $this -> ssl_verifypeer,
                  $this -> ssl_cert_path,
                  $this -> ssl_verifyhost
            );
      }

      public static function getMainConfig(){
        return json_decode(Variables::get(self::$config_variable_name), 1);
      }
      public static function updateMainConfig($login, $sign, $signAlg, $terminalid){
          $tmp = [
              'login' => $login,
              'sign' => $sign,
              'signalg' => $signAlg,
              'terminalid' => $terminalid,
              'updated' => date("Y-m-d H:i:s"),
          ];

          return Variables::set(self::$config_variable_name, json_encode($tmp));
      }

      public function saveMainConfig(){
          self::updateMainConfig(
                $this -> config_login,
                $this -> config_sign,
                $this -> config_signalg,
                $this -> config_terminalid
          );
      }

      public static function getRsaConfig(){
          return json_decode(Variables::get(self::$rsa_variable_name), 1);
      }
      public static function updateRsaConfig($path, $alg, $is_sign_enabled=false){
          $t = json_decode(Variables::get(self::$rsa_variable_name),1);

          $t['enabled'] = $is_sign_enabled;

          if($alg){
            $t['alg'] = $alg;
          }
          if($path){
            $t['path'] = $path;
          }

          $t['updated'] = date("Y-m-d H:i:s");

          return Variables::set(self::$rsa_variable_name, json_encode($t));
      }

      public function saveRsaConfig(){
        self::updateRsaConfig(
                $this -> config_rsa_pathToKey,
                $this -> config_rsa_alg,
                $this -> config_is_sign_enabled
              );
      }

      public static function getFullConfig(){

          $names = [
            self::$ssl_variable_name,
            self::$config_variable_name,
            self::$rsa_variable_name
          ];

          $tmp = json_encode($names);
          $tmp = str_replace(['[',']'],['(',')'], $tmp);

          $q = "SELECT * FROM variables WHERE k IN ".$tmp;

          $tmp = DB::query($q, false);

          $out = [];
          foreach ($tmp as  $val) {
            $out[$val['k']] = json_decode($val['v'], 1);
          }
          return $out;
      }

      //////  ЧТОБЫ можно было отлаживать... если вдруг понадобится в админке...
      public function getLog(){
        return $this -> last_log;
      }
      public function getLastXML(){
        return $this -> last_postdata;
      }


      ///////////////////////////////////
      //////  Для работы с DB QIWI OPERATIONS
      ////////////////////////////////////////

      ////// Возвращаем список операций, которые в ожидании последнии 6 часов (СМОТРИМ на LAST UPDATE, ЕСЛИ ПРОИЗОШЕЛ UPDATE то опять может попасть в список)
      public static function getPendingOperations(){

          ////  МБ учитывать еще approved = 0  no_troubles = 0

          $sel = 'SELECT * FROM qiwi_operations q WHERE q.is_pending = 1 AND q.approved=0 AND q.last_updated > CURRENT_TIMESTAMP() - INTERVAL 6 HOUR';
          $t = DB::query($sel, false);
          return $t;
      }
      //////  Получаем все операции, которые старше 6 часов и которые ИНЦИДЕНТЫ и которые НЕ ПОДТВЕРЖДЕНЫ
      //////  На счет этого, наверно надо раза два в день, и не больше, посылать письмо...
      public static function getNotApprovedOperations(){

          ///// Тут наверно надо изменить немного запрос.... типо а как же учитывать остальные инциденты которые произошли недавно...

          $sel = "SELECT * FROM qiwi_operations q WHERE q.no_troubles=0 AND q.approved=0 AND q.last_updated <= CURRENT_TIMESTAMP()-INTERVAL 6 HOUR ORDER BY last_updated DESC";

          //$sel = 'Select * FROM qiwi_operations q where q.no_troubles=0 and q.approved=0 and q.last_updated <= CURRENT_TIMESTAMP() - INTERVAL 6 HOUR Order by q.last_updated DESC';
          $t = DB::query($sel, false);

          return $t;
      }


      ////  Генерим новый PAyment id.... Ищем максимальный и делаем ++
      private static function getNextPaymentId(){
         $out = DB::query('select max(payment_id) as payment_id from qiwi_operations', false);
         
         if($out && $out[0] && intval($out[0]['payment_id'])> 31000){
            return intval($out[0]['payment_id']) + 1;
         } else {
            return 31000;      ///// МБ сделать + рандом от 0 до 99 и * 1000, чтоб если что была бы хоть какя-нибудь уникальность
          }
      }
      ////  Готовим html таблицу для письма... чтобы не писать JSON текстом
      private static function prepareHtmlTable($data){

          if(!is_array($data) || !$data){
            return "";
          }

          static $tableStyle = 'width: 100%; border: 2px gray;';
          static $tdStyle1 = 'width:25%; padding:5px; text-align: center; text-decoration: underline; border: 1px solid gray;';
          static $tdStyle2 = 'width:75%; padding:5px; text-align: center; border: 1px solid gray;';

          $tmp = "<table style='".$tableStyle."'>";

          foreach ($data as $k => $v) {
            $tmp = $tmp."<tr><td style='".$tdStyle1."'>".$k."</td><td style='".$tdStyle2."'>";
            if(is_array($v)){
              $tmp = $tmp.self::prepareHtmlTable($v);
            } else {
              $tmp = $tmp.strval($v);
            }
            $tmp = $tmp."</td></tr>";
          }

          return $tmp."</table>";
      }
      ////  Отправляем письма группе
      private static function sendEmails($couponId, $sendedData, $receivedData=[], $msg = 'при пополнении счета телефона'){
        $body = 'Произошел инцидент <b>#'.$couponId.'</b> '.$msg.
                '<br/><br/>Номер инцидента: '.$couponId.
                '<br/>Отправленные данные: '.self::prepareHtmlTable($sendedData);

        if($receivedData){
          $body = $body.'<br/>Полученный ответ: '.self::prepareHtmlTable($receivedData);
        }

        $add = '';
        if ( Settings::get('terminal_id') ) {
            $add = ' ( id - ' .Settings::get('terminal_id') . ')';
        }
        return Sender::sendToGroup($body, "Сообщение с терминала " . PROJECT_NAME . $add);
      }



      ///////////// Проверяем статусы у последних ожидающихся за 6 часов запросов
      public function checkPendings()
      {
          $op = self::getPendingOperations();
          $out = [
            "error" => 0,
            "data" => [
              'received' => sizeof($op),
              'checked' => 0,

              'aborted' => 0,             /////   Если платеж отменен ++
              'confirmed' => 0,           ////  Если платеж проведен  ++
              'withoutchanges' => 0,      /// если так и остался is_pending ++

              'errors' => 0,      ////  Количество ошибок.... вдруг пароль не правильный или еще что...
            ]
          ];

          if(!$op){
              return $out; /////// НЕТ никаких операций в базе, которые ожидаются...
          }


          foreach ($op as $val) {
              ///// Неее, типо всегда считаем что есть  if($val['payment_id']) и что всегда там есть правильные данные типо is_pending....

              $tmp = [];
              $res = $this -> getPaymentStatus($val['payment_id']);

              if($res['response'] && $res['response']['data']){

                //  status == 2 и result == 0  Done OK, тогда обновляем статусы в таблице
                if($res['response']['data']['status'] == 2 && $res['response']['data']['result'] == 0){
                    $out['data']['confirmed']++;

                    $tmp['status'] = 2;
                    $tmp['is_pending'] = 0;
                    $tmp['no_troubles'] = 1;
                    $tmp['err_method'] = 'auto_getPaymentStatus';

                    self::updOperation($val['id'], $tmp);
                }
                /////  ->status == 0 и result != 0  Ошибка!!! при проведении платежа
                elseif($res['response']['data']['status'] == 0 && $res['response']['data']['result'] != 0){
                    $out['data']['aborted']++;

                    $tmp['is_pending'] = 0;       //// ну уж точно не будет продолжаться.... и чтобы в следующий раз не попал в проверку к тому же
                    $tmp['status'] = 0;
                    $tmp['err_code'] = $val['err_code']."[".$res['response']['data']['result']."]";
                    $tmp['err_method'] = 'auto_getPaymentStatus';

                    self::updOperation($val['id'], $tmp);

                    $isSended = self::sendEmails(
                                $val['id'],
                                [
                                  'payment_id' => $val['payment_id'],
                                  'phone' => $val['phone'],
                                  'sum' => $val['sum'],
                                  'dg_code' => $val['dg_code'],
                                  'coupon_date' => $val['coupon_date']
                                ],
                                $res, 'при обновлении статуса платежа');
                } else {
                  $out['data']['withoutchanges']++;
                }

              } else {
              /////// ELSE
              /////// ПОлучается что-то пошло не так
              /////// Скорее всего проблемы с настройками или интернетом...
              ///////
                $out['data']['errors']++;
              }

              $out['data']['checked']++;
          }

          return $out;
      }

      ////////////  Проверяем статусы у платежей, которые проблемные и не Решенные (approved) и отправляем на мыло инфу по ним...
      ////  УЖС!! особенно генерация табличек
      public function checkTroubles()
      {
          $op = self::getNotApprovedOperations();
          if(!$op){
            return 0;       /// Типо все ок
          }

          /// для <TH> и Что отображать
          $conf = [
            'id' => 'Id операции',
            'payment_id' => 'paymentId',
            'phone' => 'Телефон',
            'sum' => 'Сумма',
            //'coupon_date' => 'Дата',
            //'dg_code' => 'Id путевки',
            'status' => 'статус платежа',
            'err_code' => 'коды ошибок',
            'err_message' => 'сообщение об ошибке',
            'is_pending' => 'в ожидании'

          ];

          $tmp = '<table style="text-align:center; padding: 3px; border: 4px solid black"><tr>';

          foreach ($conf as $key => $value) {
            $tmp = $tmp.'<th style="border: 2px solid gray; padding: 5px;">'.$value.'</th>';
          }
          $tmp = $tmp.'</tr>';

          foreach ($op as $val) {

            $tmp = $tmp.'<tr>';
            foreach ($conf as $key => $value) {

              if($key == 'is_pending'){
                  $ip = '';
                  if($val[$key] == 1){
                    $ip ='да';
                  }
                  $tmp = $tmp.'<td style="border: 1px solid gray; padding: 5px;">'.$ip.'</td>';
                  continue;
              }

              $tmp = $tmp.'<td style="border: 1px solid gray; padding: 5px;">'.$val[$key].'</td>';
            }
            $tmp = $tmp.'</tr>';
          }

          $tmp = $tmp. '</table>';

          $body = 'Суммарная информация по не решенным инцидентам на '.date('d/m/Y').
                  '<br/>'.$tmp;

          $add = '';
          if ( Settings::get('terminal_id') ) {
              $add = ' ( id - ' .Settings::get('terminal_id') . ')';
          }
          $isSended = Sender::sendToGroup($body, "Сообщение с терминала " . PROJECT_NAME . $add);

          return sizeof($op);
      }

      public function checkAllPayments()
      {
          $lastKey = 'lastQiwiEmailDigest';
          $delay = 60 * 60 * 24;                                                /// 24 часа


          $out = $this ->checkPendings();                                       /// Проверяем is_pending у последних за 6 часов....

          //////  Проверям что тип делали рассылку...
          $time = intval( Variables::get($lastKey) );                             /// получаем время как строку, поэтому надо ее обратно задекодить
          if($time){
            $time = (int) $time;
            if($time + $delay < time() )                                        //  Если прошло 24 часа
            {

              //$out['data']['troublesAll'] = $this -> checkTroubles();

              //$out['data']['troublesReported'] = true;
              $out['data']['TryTroubles'] = true;

              Variables::set($lastKey, $time + $delay);
            }

          } else {
            Variables::set($lastKey, time());                                   ///// тип рассылка будет только через 24 часа....
          }



          if($troublesChecked)
          $out['data']['troublesChecked'] = $troublesChecked;

          return $out;
      }



      ///// APi тогоже типа что и StartPay, Только создает пустой мессадж, мол клиент отошел от терминала
      public static function createEmptyIncedent($operationData =[], $error_message = '!!! Клиент отошел от терминала или забыл ввести номер телефона!')
      {
          $conf = [
            'phone' => 'phone',
            'sum' => 'sum',
            'dgCode' => 'dg_code',
            'couponDate' => 'coupon_date',
            'operationId' => 'operation_id',
          ];

          $data =[];
          foreach ($operationData as $key => $value) {
            $data[ $conf[$key] ] = $value;
          }
          $data['payment_id'] = self::getNextPaymentId();                       ///// Готовим даные которые отправятся в таблицу, так же получаем id операции
          $data['err_message'] = $error_message;
          $data['status'] = -3;

          $couponId = self::saveOperation($data);                               ///// Сохраняем и получаем еще локальный Id операции (Который будет для qiwi coupon ID)

          $isSended = self::sendEmails($couponId, $data, [], 'при пополнении счета телефона. Возможно клиент отошел от терминала или забыл указать телефон');


          ///// Кассовый чек
          $couponData = json_decode( Variables::get(self::$coupon_variable_name), 1 );

          $couponData[] = "Сотовая связь";
          $couponData[] = "Номер телефона: ".$data['phone'];
          $couponData[] = "К зачислению: ".$data['sum'];
          $couponData[] = "Дата: ".$data['coupon_date'];
          $couponData[] = "Номер квитанции: ".$couponId;
          $couponData[] = " ";
          $couponData[] = " ";



          return [
              'error' => 0,
              'data' => [
                'done' => 'timeoutIncedent',
                'payment_id' => $data['payment_id'],
                'phone' => $data['phone'],
                'sum' => $data['sum'],
                'operationId' => $couponId,
                'emailStatus' => $isSended,
                'couponData' => $couponData,
              ],
          ];
      }

      /***
        Проведение онлайн оплаты на Qiwi:
        { checkPaymentRequisites()
            status == 0 или result != 0  Ошибка!!!
          status == 3 и result == 0

        }
        { authorizePayment
            status == 0 или result != 0  Ошибка!!!
          status == 3 и result == 0
        }
        { confirmPayment
            status == 0 или result != 0  Ошибка!!!

            status == 2 и result == 0    DONE OK

          status == 1 и result = 0  Проводится

        While status != 1
        { getPaymentStatus
            ->status == 0 или result != 0  Ошибка!!!

            status == 2 и result == 0    DONE OK

          status == 1 и result = 0  Проводится
        }
      ***/
      /*******************************
       * Платеж может находиться в одном из следующих статусов (см. также Приложение Г):
       *  3 – «авторизован»;
       *  1 – «проводится»;
       *  2 – «проведен» (финальный статус);
       *  0 – «ошибка проведения» (финальный статус).
       *
       **************************************/

      //////  Функция для проведения платежа от а до я...
      /////// СТОИТ КОммент ТЕСТОВЫЙ ПЛАТЕЖ
      /////////// СТОИТ лишний RETURN чтобы не проходил платеж
      public function makePayment($paymentId, $account, $sum, $couponId = '', $couponDate = '2016-04-25T14:43:01')  ///// $couponId => qiwi_operations -> id
      {

          //  В случае получения финального статуса status="0" необходимо рассмотреть код ошибки
          //    для выяснения причины ошибки проведения платежа

          $providerId = $this -> getProvider($account);                            /////// Узнаем ID Провайдера
          $providerId['requestName'] = 'getProvider';

          if( $providerId['response']['data'] == false ){
            return $providerId;
            ////return "Get provider FAIL";
          }     ////////  Слишком много IF получается.....мб можно сократить как-то, до типо 'data' == false
                ////////  ...... т.к. вроде как везде чекаем эти Status... и если что, делаем FALSE

          ///////////////////!!!!!!!!!!!!!!
          //////  Для ТЕСТОВ......
          //return $providerId;
          //$sum = 1.00;
          ///////////////////////////

          /*  Считаем что всегда получаем ID провайдера в этом поле, но мб лучше проверить типо !=""  */
          $providerId = $providerId['response']['data']['providerId'];

          //////$sum = $sum + ".00";      //типо должно быть с точкой
          $paymentData = [
                    'from_amount' => $sum,
                    'to_amount'   => $sum,
                    'to_account' => $account,
                    'to_service' => $providerId,                                //  Сервис тащим из запроса getProviderByPhone

                    'receipt_id' => $couponId,
                    'receipt_date' => $couponDate,
                  ];

          $res = $this -> checkPaymentRequisites($paymentId, $paymentData);        /////// Проверяем данные по платежу
          $res['requestName'] ='checkPaymentRequisites';

          if( $res['response']['data'] == false || $res['response']['data']['result'] != '0' || $res['response']['data']['status'] != "3"){
            return $res;
            ////return "checkPaymentRequisites FAIL";
          }

          /*  status == 3 и result == 0  */

          $comment = 'Тестовый платеж';

          $res = $this -> authorizePayment($paymentId, $paymentData, $comment);    //////  Перекидываем данные по платежу
          $res['requestName'] ='authorizePayment';

          if( $res['response']['data'] == false || $res['response']['data']['result'] != '0' || $res['response']['data']['status'] != "3"){
            return $res;
            ////return "authorizePayment FAIL";
          }

          /*  status == 3 и result == 0  */

          $res = $this -> confirmPayment($paymentId);                              ///// Подтверждаем платеж по ID
          $res['requestName'] ='confirmPayment';

          if( $res['response']['data'] == false || $res['response']['data']['result'] != '0' || $res['response']['data']['status'] == "0"){
            return $res;
            ////return "confirmPayment FAIL";
          }

          if($res['response']['data']['status'] == "2"){
            return $res;
            ////return "PAYMENT DONE OK";
          }

          if($res['response']['data']['status'] == "1"){
              /* whait N seconds and try again  */
              $st = $this -> getPaymentStatus($paymentId);                         //////  Проверяем статус платежа по ID
              $st['requestName'] = 'getPaymentStatus';
              if($st['response']['data']['status'] == "2"){
                return $st;
                ////return "PAYMENT DONE OK";
                ////return true;
              } else {
                return $st;   //  status 1 .... возможно все еще проводится...
                ////return "Payment Pending";
              }
          }

          return NULL;  //  wtf here.... if status will be 3 or others
      }



      /***
            PUBLIC FUNCTIONS

            response_status -1, response->status -1, тогда походу отвалился curl (либо нет ответа от сервера)
            response_status XX != 0, response->status -1, походу проблема с авторизацией на XML QIWI, можно чекнуть message, можно чекнуть код ошибки XX в таблице
            response_status == 0, response->status XX != 0, можно чекнуть текст ошибки, либо можно чекнуть код ошибки XX в таблице

            Так же при проведении платежа появляется поле
            response -> data -> result  и обычно если там не 0, значит произошел какой-либо косяк, потипу терминал не зарегистрирован у провайдера или paymentId не существует или еще что...
      ***/

      /////// Получаем провайдера по номеру телефона
      public function getProvider($phone)
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getProvider';

        $xml = $this -> xml_getProviderByPhone( new SimpleXMLElement($this -> xml_head) , $phone);

        $str = $this -> request($xml);

        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }
        $data = new SimpleXMLElement( $str);
        $out = [
          'response_status' => (string) $data -> attributes()['result'],
        ];
        if($out['response_status'] == '0')
        {
          $out[ 'response' ] = [
                'status' =>(string) $data -> providers -> getProviderByPhone -> attributes()['result'] ,
                'message' =>(string) $data -> providers -> getProviderByPhone -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0")
          {
              $out['response']['data']['providerId'] =(string) $data -> providers -> getProviderByPhone -> providerId;
              $out['response']['data']['regionId'] = (string) $data -> providers -> getProviderByPhone -> regionId;
              $out['response']['data']['isPorted'] = JSON_decode( (string) $data -> providers -> getProviderByPhone -> isPorted); //////////////////// МБ Нужно чекнуть на счет PORTED или нет

          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }

        return $out;
      }

      //////  Получаем список провайдеров, для определеннного агента или терминала. По умолчанию для агента вроде...
      public function getProviders($agentId='', $terminalId='')
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getProviders';

        $xml = $this -> xml_getProviders(new SimpleXMLElement($this -> xml_head), $agentId, $terminalId);

        $str = $this -> request($xml);

        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);
        $out = [
          'response_status' => (string) $data -> attributes()['result'],
        ];

        if($out['response_status'] == "0")
        {
          $out ['response'] = [
                'status' =>(string) $data -> providers -> getProviders -> attributes()['result'] ,
                'message' =>(string) $data -> providers -> getProviders -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              foreach ($data ->providers -> getProviders -> row as $val) {
                $tmp = [];
                //$out[] = json_encode((array) $val -> attributes());

                ///// Что-то какая-то непонятка с @attributes и simpleXmlElement
                foreach ($val->attributes() as $key => $value) {
                  $tmp[$key] = (string)$value;
                }
                $out['response']['data'][]= $tmp;
              }

          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }

        return $out;
      }

      //////  Получаем список комиссий... не канает
      public function getCommissions($terminalid='')
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getCommissions';


        $xml = $this -> xml_getCommissions(new SimpleXMLElement($this -> xml_head), $terminalId);

        $str = $this -> request($xml);

        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);
        $out = [
          'response_status' => (string) $data -> attributes()['result'],
        ];

        if($out['response_status'] == "0")
        {
          $out ['response'] = [
                'status' =>(string) $data -> terminals -> getCommissions -> attributes()['result'] ,
                'message' =>(string) $data -> terminals -> getCommissions -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              foreach ($data -> terminals -> getCommissions -> row as $val) {
                $tmp = [];
                //$out[] = json_encode((array) $val -> attributes());

                ///// Что-то какая-то непонятка с @attributes и simpleXmlElement
                foreach ($val->attributes() as $key => $value) {
                  $tmp[$key] = (string)$value;
                }
                $out['response']['data'][]= $tmp;
              }

          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }

        return $out;
      }
      ///// Тоже комиссии, не канает
      public function getForeignCommissions()
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getForeignCommissions';

        $xml = $this -> xml_getForeignCommissions(new SimpleXMLElement($this -> xml_head));

        $str = $this -> request($xml);


        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);
        $out = [
          'response_status' => (string) $data -> attributes()['result'],
        ];

        if($out['response_status'] == "0")
        {
          $out ['response'] = [
                'status' =>(string) $data -> terminals -> getForeignCommissions -> attributes()['result'] ,
                'message' =>(string) $data -> terminals -> getForeignCommissions -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              $providers =[];
              foreach ($data -> terminals -> getForeignCommissions -> provider as $val) {
                $providers[(string)$val->attributes()['profile-id']] = (string) $val->attributes()['prv-id'];
              }
              foreach ($data -> terminals -> getForeignCommissions -> profile as $val) {
                  $tmp = [];
                  $tmp['prv-id'] = $providers[(string) $val->attributes()['id']];

                  foreach ($val -> children() as $data){
                    $prd = [];
                      foreach ($data->attributes() as $key => $attr) {
                        $prd[(string)$key] = (string) $attr;
                      }
                    $tmp['profiles'][] = $prd;
                  }
                  $out['response']['data'][] = $tmp;
              }

          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }

        return $out;
      }

      ///// Еще один большой запрос на все исключения типо...
      public function getExcemptionRates($agentId ="")
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getExcemptionRates';


        $xml = $this -> xml_getExemptionRates(new SimpleXMLElement($this -> xml_head), $agentId);

        $str = $this -> request($xml);

        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);
        $out = [
          'response_status' => (string) $data -> attributes()['result'],
        ];

        if($out['response_status'] == "0")
        {
          $out ['response'] = [
                'status' =>(string) $data -> accountingReports -> getExemptionRates  -> attributes()['result'] ,
                'message' =>(string) $data -> accountingReports -> getExemptionRates  -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              foreach ($data -> accountingReports -> getExemptionRates -> row as $val) {
                $tmp = [];
                //$out[] = json_encode((array) $val -> attributes());

                ///// Что-то какая-то непонятка с @attributes и simpleXmlElement
                foreach ($val->attributes() as $key => $value) {
                  $tmp[$key] = (string)$value;
                }
                $out['response']['data'][]= $tmp;
              }

          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }

        return $out;
      }



      ///// Проверяем баланс агента. Любого агента! :D
      public function getBalance($agentId="")
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getBalance';

          $xml = $this -> xml_getBalance(new SimpleXMLElement($this -> xml_head), $agentId);

          $str = $this -> request($xml);
          if(!$str) {
                return [
                    'response_status' => '-1',
                    'response' => [
                        'status' => '-1',
                        'message' => $str,
                        'data' => false
                    ]
                ];
          }

          $data = new SimpleXMLElement($str);
          $out = [
            'response_status' => (string) $data -> attributes()['result'],
          ];

          if($out['response_status'] == "0")
          {
            $out ['response'] = [
                  'status' =>(string) $data -> agents -> getBalance -> attributes()['result'] ,
                  'message' =>(string) $data -> agents -> getBalance -> attributes()['result-description'],
              ];

            if($out['response']['status'] == "0" )
            {

              foreach ($data -> agents -> getBalance -> children() as $key => $value) {
                $out['response']['data'][$key] = (string) $value;
              }

            } else {
                $out['response']['data'] = false;
            }
          } else {
            $out['response']=[
                'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
                'message' => (string) $data,
                'data' => false
            ];
          }

          return $out;
      }
      ////  Получаем информацию по агенту.... только нашему агенту :c
      public function getAgentInfo($agentId="")
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getAgentInfo';

          $xml = $this -> xml_getAgentInfo(new SimpleXMLElement($this -> xml_head), $agentId);

          $str = $this -> request($xml);
          if(!$str) {
                return [
                    'response_status' => '-1',
                    'response' => [
                        'status' => '-1',
                        'message' => $str,
                        'data' => false
                    ]
                ];
          }

          $data = new SimpleXMLElement($str);
          $out = [
            'response_status' => (string) $data -> attributes()['result'],
          ];

          if($out['response_status'] == "0")
          {
            $out ['response'] = [
                  'status' =>(string) $data -> agents -> getAgentInfo  -> attributes()['result'] ,
                  'message' =>(string) $data -> agents -> getAgentInfo  -> attributes()['result-description'],
              ];

            if($out['response']['status'] == "0" )
            {

              foreach ($data -> agents -> getAgentInfo -> agent -> attributes() as $key => $value) {
                $out['response']['data'][$key] = (string) $value;
              }

            } else {
                $out['response']['data'] = false;
            }
          } else {
            $out['response']=[
                'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
                'message' => (string) $data,
                'data' => false
            ];
          }

          return $out;
      }

      public function getTerminalInfo($terminalId="")
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getTerminalInfo';

          $xml = $this -> xml_getTerminalInfo(new SimpleXMLElement($this -> xml_head), $terminalId);

          $str = $this -> request($xml);
          if(!$str) {
                return [
                    'response_status' => '-1',
                    'response' => [
                        'status' => '-1',
                        'message' => $str,
                        'data' => false
                    ]
                ];
          }

          $data = new SimpleXMLElement($str);
          $out = [
            'response_status' => (string) $data -> attributes()['result'],
          ];

          if($out['response_status'] == "0")
          {
            $out ['response'] = [
                  'status' =>(string) $data -> terminals -> getTerminalInfo -> attributes()['result'] ,
                  'message' =>(string) $data -> terminals -> getTerminalInfo  -> attributes()['result-description'],
              ];

            if($out['response']['status'] == "0" )
            {

              foreach ($data -> terminals -> getTerminalInfo  -> terminal -> attributes() as $key => $value) {
                $out['response']['data'][$key] = (string) $value;
              }

            } else {
                $out['response']['data'] = false;
            }
          } else {
            $out['response']=[
                'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
                'message' => (string) $data,
                'data' => false
            ];
          }

          return $out;
      }


      ////  ПОлучаем информацию по текущей персоне
      ////    выдает все кроме идентификаторов операций для каждой роли... не особо надо
      public function getPersonInfo()
      {
          $this -> last_log = [];
          $this -> last_postdata ='';
          $this -> last_log[] = 'getPersonInfo';

            $xml = $this -> xml_getPersonInfo(new SimpleXMLElement($this -> xml_head));

            $str = $this -> request($xml);
          //  dd($str);
            if(!$str) {
                  return [
                      'response_status' => '-1',
                      'response' => [
                          'status' => '-1',
                          'message' => $str,
                          'data' => false
                      ]
                  ];
            }

            $data = new SimpleXMLElement($str);
            $out = [
              'response_status' => (string) $data -> attributes()['result'],
            ];

            if($out['response_status'] == "0")
            {
              $out ['response'] = [
                    'status' =>(string) $data -> persons -> getPersonInfo  -> attributes()['result'] ,
                    'message' =>(string) $data -> persons -> getPersonInfo  -> attributes()['result-description'],
                ];

              if($out['response']['status'] == "0" )
              {

                foreach ($data -> persons -> getPersonInfo -> person -> attributes() as $key => $value) {
                  $out['response']['data'][$key] = (string) $value;
                }

                foreach ($data -> persons -> getPersonInfo -> person -> roles -> role as $val) {
                  $out['response']['data']['roles'][] = (int) $val;
                }


                foreach ($data -> persons -> getPersonInfo -> person -> labels -> label as $val) {
                  $out['response']['data']['labels'][] = (int) $val;
                }

              } else {
                  $out['response']['data'] = false;
              }
            } else {
              $out['response']=[
                  'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
                  'message' => (string) $data,
                  'data' => false
              ];
            }

            return $out;

      }

      ///// Получаем информацию по ролям
      public function getRoles()
      {

          $this -> last_log = [];
          $this -> last_postdata ='';
          $this -> last_log[] = 'getRoles';

            $xml = $this -> xml_getRoles(new SimpleXMLElement($this -> xml_head));

            $str = $this -> request($xml);
            if(!$str) {
                  return [
                      'response_status' => '-1',
                      'response' => [
                          'status' => '-1',
                          'message' => $str,
                          'data' => false
                      ]
                  ];
            }

            $data = new SimpleXMLElement($str);
            $out = [
              'response_status' => (string) $data -> attributes()['result'],
            ];

            if($out['response_status'] == "0")
            {
              $out ['response'] = [
                    'status' =>(string) $data -> persons -> getRoles  -> attributes()['result'] ,
                    'message' =>(string) $data -> persons -> getRoles  -> attributes()['result-description'],
                ];

              if($out['response']['status'] == "0" )
              {

                foreach ($data -> persons -> getRoles -> row as $val) {
                  $out['response']['data'][] = [
                          'id' => (int) $val -> attributes()['role_id'],
                          'name' => (string) $val -> attributes()['role_name'],
                        ];
                }


              } else {
                  $out['response']['data'] = false;
              }
            } else {
              $out['response']=[
                  'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
                  'message' => (string) $data,
                  'data' => false
              ];
            }

            return $out;
      }


      ////  TEst  Можно удалить небось
      public function test($agnetId ="")
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'test';

        $xml = new SimpleXMLElement($this -> xml_head);
        $xml = $this -> xml_getBalance($xml, $agnetId);
        $xml = $this -> xml_getAgentInfo($xml, $agnetId);

        $out = $this -> request($xml);

        return $out;

      }


      ///// Проверяем правильность платежных данных
      public function checkPaymentRequisites($paymentId, $paymentData)
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'checkPaymentRequisites';

        $xml = $this -> xml_checkPaymentRequisites(new SimpleXMLElement($this -> xml_head), $paymentId, $paymentData);


        $str = $this -> request($xml);
        if(!$str) {
            return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement( $str );
        $out = [
          'response_status' => (string) $data -> attributes()['result']
        ];

        if($out['response_status']=="0")
        {
          $out['response'] = [
                'status' =>(string) $data -> providers -> checkPaymentRequisites  -> attributes()['result'] ,
                'message' =>(string) $data -> providers -> checkPaymentRequisites  -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              $val = $data ->providers -> checkPaymentRequisites -> payment;
              $tmp = [];

              foreach ($val->attributes() as $key => $value) {
                $tmp[$key] = (string)$value;
                if($key == 'fatal' || $key == 'saved'){       //  <- там у нас хранится boolean
                    $tmp[$key] = JSON_decode($tmp[$key]);
                }
              }
              $out['response']['data']= $tmp;
              /*  Не понятно что на счет EXTRAS */
          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }
        return $out;
      }
      ///// Закидываем платежные данные в qiwi
      public function authorizePayment($paymentId, $paymentData, $comment)
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'authorizePayment';

        $xml = $this -> xml_authorizePayment(new SimpleXMLElement($this -> xml_head), $paymentId, $paymentData, $comment);

        $str = $this -> request($xml);
        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);

        $out = [
          'response_status' => (string) $data -> attributes()['result']
        ];

        if($out['response_status']=="0")
        {
          $out[ 'response'] = [
                'status' =>(string) $data -> providers -> authorizePayment -> attributes()['result'],
                'message' =>(string) $data -> providers -> authorizePayment -> attributes()['result-description'],
            ];

          if( $out['response']['status'] == "0" )
          {
              $val = $data ->providers -> authorizePayment  -> payment;
              $tmp = [];

              foreach ($val->attributes() as $key => $value) {
                $tmp[$key] = (string)$value;
                if($key == 'fatal' || $key == 'saved'){
                    $tmp[$key] = JSON_decode($tmp[$key]);
                }
              }
              $out['response']['data']= $tmp;
              /*  Не понятно что на счет EXTRAS */
          } else {

              $out['response']['data'] = false;

          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }
        return $out;
      }

      ///// Подтверждаем платеж
      public function confirmPayment($paymentId)
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'confirmPayment';

        $xml = $this -> xml_confirmPayment( new SimpleXMLElement($this -> xml_head) , $paymentId);

        $str = $this -> request($xml);
        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);
        /*        МОжно избавиться от копипасты и сделать пару методов, которые например формируют начальный $out */
        $out = [
          'response_status' => (string) $data -> attributes()['result']
        ];

        if($out['response_status'] == "0")
        {
          $out['response'] = [
                'status' =>(string) $data -> providers -> confirmPayment  -> attributes()['result'] ,
                'message' =>(string) $data -> providers -> confirmPayment  -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              $val = $data ->providers -> confirmPayment -> payment;
              $tmp = [];

              foreach ($val->attributes() as $key => $value) {
                $tmp[$key] = (string)$value;
                if($key == 'fatal' || $key == 'saved'){
                    $tmp[$key] = JSON_decode($tmp[$key]);
                }
              }
              $out['response']['data']= $tmp;
              /*  Не понятно что на счет EXTRAS */
          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }
        return $out;
      }
      ///// Проверяем статус платежа
      public function getPaymentStatus($paymentId)
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'getPaymentStatus';

        $xml = $this -> xml_getPaymentStatus(new SimpleXMLElement($this -> xml_head), $paymentId);

        $str = $this -> request($xml);
        if(!$str) {
              return [
                  'response_status' => '-1',
                  'response' => [
                      'status' => '-1',
                      'message' => $str,
                      'data' => false
                  ]
              ];
        }

        $data = new SimpleXMLElement($str);
        $out = [
          'response_status' => (string) $data -> attributes()['result']
        ];

        if($out['response_status'] == "0"){
          $out['response'] = [
                'status' =>(string) $data -> providers -> getPaymentStatus -> attributes()['result'] ,
                'message' =>(string) $data -> providers -> getPaymentStatus -> attributes()['result-description'],
            ];

          if($out['response']['status'] == "0" )
          {
              $val = $data ->providers -> getPaymentStatus -> payment;
              $tmp = [];

              foreach ($val->attributes() as $key => $value) {
                $tmp[$key] = (string)$value;
                if($key == 'fatal' || $key == 'saved'){
                    $tmp[$key] = JSON_decode($tmp[$key]);
                }
              }
              $out['response']['data']= $tmp;

              /*  Не понятно что на счет EXTRAS */
          } else {
              $out['response']['data'] = false;
          }
        } else {
          $out['response']=[
              'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
              'message' => (string) $data,
              'data' => false
          ];
        }

        return $out;
      }


      //  Надо как-нибудь будет потестить
      //  Не уверен, но возможно надо убирать хедеры из ключа
      //  -------Public key----------
      //  -------End public key------
      //  или мб надо чего еще... в доках ничего не сказано на этот счет
      //  только если смотреть в соседнем запросе... при выдаче сертификата, он пишет ---Begin--- ---END--- по краям
      //    Хотяяя типо в примере этих строк нету попросто...
      ///// Устанавливаем публичный ключ для текущей персоны...
      public function setPublicKey($publicKey)
      {
        $this -> last_log = [];
        $this -> last_postdata ='';
        $this -> last_log[] = 'setPublicKey';

          $xml = $this -> xml_setPublicKey(new SimpleXMLElement($this -> xml_head), $publicKey);

          //echo("Отправленный XML");
          //dd($xml->saveXML());

          $tmp = $this->config_is_sign_enabled;
          $this->config_is_sign_enabled = false;    //  Типо этот запрос мы принудительно делаем через логин пароль
          $str = $this -> request($xml);        //  <-----------------------------------------------
          $this->config_is_sign_enabled = $tmp;

          if(!$str) {
                return [
                    'response_status' => '-1',
                    'response' => [
                        'status' => '-1',
                        'message' => $str,
                        'data' => false
                    ]
                ];
          }

          $data = new SimpleXMLElement($str);
          $out = [
            'response_status' => (string) $data -> attributes()['result']
          ];
          if($out['response_status'] == "0")
          {
            $out['response'] = [
                  'status' =>(string) $data -> persons -> setPublicKey -> attributes()['result'] ,
                  'message' =>(string) $data -> persons -> setPublicKey -> attributes()['result-description'],
              ];
            if($out['response']['status'] == "0")
            {
              $out['response']['data'] = true;      //  ТИПО прошло успешно
            } else {
              $out['response']['data'] = false;
            }
          } else {
            $out['response']=[
                'status' => '-1',           //  Скорей всего проблемы с авторизацией персоны
                'message' => (string) $data,
                'data' => false
            ];
          }

          return $out;
      }

      /**************

          PRIVATE FUNCTIONS

              Генерим xml, мб можно было бы организовать подобное черз soap
      **************/

      private function generateAuthData( $simpleXml)
      {
          $simpleXml ->addChild('auth');
          $simpleXml -> auth -> addAttribute('login', $this -> config_login);
          $simpleXml -> auth -> addAttribute('signAlg', $this -> config_signalg);
          $simpleXml -> auth -> addAttribute('sign', $this -> config_sign);

          return $simpleXml;
      }
      private function generateClientData( $simpleXml)
      {
          $simpleXml -> addChild('client');
          $simpleXml -> client -> addAttribute('serial', $this -> config_terminalSerial);
          $simpleXml -> client -> addAttribute('software', 'Dealer v0');
          $simpleXml -> client -> addAttribute('terminal', $this -> config_terminalid);

          return $simpleXml;
      }

      /*  Agents -> getBalance  */
      private function xml_getBalance( $simpleXml, $agentId ="")
      {
          $simpleXml -> addChild('agents');
          $simpleXml -> agents -> addChild('getBalance');

          if($agentId)
          {
            $simpleXml -> agents -> getBalance -> addChild('target-agent', $agentId);
          }
          return $simpleXml;
      }
      /*  terminals -> */
      private function xml_getTerminalInfo( $simpleXml, $terminalId = '')
      {
          $simpleXml -> addChild('terminals');
          $simpleXml -> terminals -> addChild('getTerminalInfo');

          if($terminalId)
          {
            $simpleXml -> terminals -> getTerminalInfo -> addChild('target-terminal', $terminalId);
          }
          return $simpleXml;
      }
      /*  Agents -> getAgentInfo  */
      private function xml_getAgentInfo( $simpleXml, $agentId ="")
      {
          $simpleXml -> addChild('agents');
          $simpleXml -> agents -> addChild('getAgentInfo');

          if($agentId)
          {
            $simpleXml -> agents -> getAgentInfo -> addChild('target-agent', $agentId);
          }
          return $simpleXml;
      }
      /*  Persons -> getPersonInfo  */
      private function xml_getPersonInfo( $simpleXml )
      {
          $simpleXml -> addChild('persons');
          $simpleXml -> persons -> addChild('getPersonInfo');

          return $simpleXml;
      }
      /*  Persons -> getRoles  */
      private function xml_getRoles( $simpleXml )
      {
          $simpleXml -> addChild('persons');
          $simpleXml -> persons -> addChild('getRoles');

          return $simpleXml;
      }


      /*  Providers -> getProviderByPhone */
      private function xml_getProviderByPhone( $simpleXml, $phoneNumber="")
      {
          $simpleXml ->addChild('providers');
          $simpleXml ->providers ->addChild('getProviderByPhone');
          $simpleXml ->providers -> getProviderByPhone -> addChild('phone', $phoneNumber);

          return $simpleXml;
      }
      /*  Providers -> getProviders */
      private function xml_getProviders( $simpleXml, $agentId ="", $terminalId ="")
      {
          $simpleXml ->addChild('providers');
          $simpleXml ->providers ->addChild('getProviders');

          if($agentId)
          {
            $simpleXml ->providers -> getProviders -> addChild('target-agent', $agentId);
          }
          elseif($terminalId)
          {
            $simpleXml ->providers -> getProviders -> addChild('target-terminal', $terminalId);
          }

          return $simpleXml;
      }


      /*  Providers -> checkPaymentRequisites */
      //  Payment data такой же как и в authorizePayment
      private function xml_checkPaymentRequisites( $simpleXml, $paymentId ="", $paymentData =[])
      {
        //  В принципе в дата можно передать массив массивов и потом генерировать xml через foreach
        //  по типу:
        /*  [
                from => [
                          currency => "643",
                          amount => "11.00"
                        ],
                to => [
                        currency => "643",
                        service => "2",
                        amount => "11.00",
                        account => "111111",
                        moneyType => "1"
                      ],
                receipt => [
                            id => "123",
                            date => "2010-08-16T12:43:01"
                          ]
             ]
        */

        /*
          Основные коды валют, в соответствии со стандартом:
          российский рубль – 643;
          доллар США – 840;
          евро – 978;
          украинская гривна – 980;
          грузинский лари – 981;
          таджикский сомони – 972
        */
          if(!$paymentId && !$paymentData){
              return "";
          }

          $simpleXml ->addChild('providers');
          $simpleXml ->providers ->addChild('checkPaymentRequisites');
          $simpleXml ->providers -> checkPaymentRequisites -> addChild('payment');
          $simpleXml ->providers -> checkPaymentRequisites -> payment ->addAttribute('id', $paymentId);

          /*  Инфа о сумме от клиента */
          $simpleXml ->providers -> checkPaymentRequisites -> payment ->addChild('from');
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> from-> addAttribute('currency', '643');    //  643 - Российский рубль
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> from-> addAttribute('amount', $paymentData['from_amount']);    //   в рублях: в десятичном виде с двумя знаками после разделителя. Разделителем является точка.

          /*  Назначение платежа  */
          $simpleXml ->providers -> checkPaymentRequisites -> payment ->addChild('to');
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> to-> addAttribute('currency', '643');
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> to-> addAttribute('service', $paymentData['to_service']);
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> to-> addAttribute('amount', $paymentData['to_amount']);
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> to-> addAttribute('account', $paymentData['to_account']);

          //?????? мб и не указывать, либо указывать только 0.... тогда надо будет проверить на других операторах, кроме мтс и билайн
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> to-> addAttribute('moneyType', '0');   // тип денежных средств, с помощью которых клиент совершил оплату (только для платежей в пользу МТС и Билайн).


          /*  Про чек */
          $simpleXml ->providers -> checkPaymentRequisites -> payment ->addChild('receipt');
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> receipt-> addAttribute('id', $paymentData['receipt_id']);
          $simpleXml ->providers -> checkPaymentRequisites -> payment -> receipt-> addAttribute('date', $paymentData['receipt_date']);

          return $simpleXml;
      }

      /*  Providers -> authorizePayment */
      private function xml_authorizePayment( $simpleXml, $paymentId ="", $paymentData =[], $comment="")
      {

          //  $paymentData  = [
          //      from_amount => '11.00',                 // <- ТОЧКА
          //      to_amount => '11.00',
          //      to_account => '9647138089',
          //      to_service => '2',                      //  Сервис тащим из запроса getProviderByPhone
          //
          //      receipt_id => '132',
          //      receipt_date => '2010-08-16T12:43:01',    //  Типо только в таком формате
          //  ``];

          if(!$paymentId && !$paymentData){
              return "";
          }

          $simpleXml ->addChild('providers');
          $simpleXml ->providers ->addChild('authorizePayment');
          $simpleXml ->providers -> authorizePayment -> addChild('payment');
          $simpleXml ->providers -> authorizePayment -> payment ->  addAttribute('id', $paymentId);
          if($comment){
            $simpleXml ->providers -> authorizePayment -> payment ->  addAttribute('comment', $comment);
          }

          /////// ???wtf???
          //$simpleXml ->providers -> authorizePayment -> payment ->addChild('extras');
          /*– тег, в атрибутах которого указываются экстра-поля платежа. В одном теге может быть
              указано несколько экстра-полей в соответствии со спецификацией интерфейса провайдера. */
          //$simpleXml ->providers -> authorizePayment -> payment -> extras-> addAttribute('ev_paytype', '5');
          //$simpleXml ->providers -> authorizePayment -> payment -> extras-> addAttribute('PAY_TYPE', '5');
          /*  ..... */

          /*  FROM  */
          $simpleXml ->providers -> authorizePayment -> payment ->addChild('from');
          $simpleXml ->providers -> authorizePayment -> payment -> from-> addAttribute('amount', $paymentData['from_amount']);
          $simpleXml ->providers -> authorizePayment -> payment -> from-> addAttribute('currency', '643');

          /*  TO  */
          $simpleXml ->providers -> authorizePayment -> payment ->addChild('to');
          $simpleXml ->providers -> authorizePayment -> payment -> to-> addAttribute('service', $paymentData['to_service']);
          $simpleXml ->providers -> authorizePayment -> payment -> to-> addAttribute('account', $paymentData['to_account']);
          $simpleXml ->providers -> authorizePayment -> payment -> to-> addAttribute('amount', $paymentData['to_amount']);
          $simpleXml ->providers -> authorizePayment -> payment -> to-> addAttribute('currency', '643');

          ////!!!!!!
          $simpleXml ->providers -> authorizePayment -> payment -> to-> addAttribute('moneyType', '0');   // тип денежных средств, с помощью которых клиент совершил оплату (только для платежей в пользу МТС и Билайн).


          /*  ЧЕК */
          $simpleXml ->providers -> authorizePayment -> payment ->addChild('receipt');
          $simpleXml ->providers -> authorizePayment -> payment -> receipt-> addAttribute('id', $paymentData['receipt_id']);
          $simpleXml ->providers -> authorizePayment -> payment -> receipt-> addAttribute('date', $paymentData['receipt_date']);

          return $simpleXml;
      }

      /*  Providers -> confirmPayment */
      private function xml_confirmPayment( $simpleXml, $paymentId="")
      {
          $simpleXml ->addChild('providers');
          $simpleXml ->providers ->addChild('confirmPayment');
          $simpleXml ->providers -> confirmPayment -> addChild('payment');
          $simpleXml ->providers -> confirmPayment -> payment -> addAttribute('id', $paymentId);

          return $simpleXml;
      }
      /*  Providers -> getPaymentStatus */
      private function xml_getPaymentStatus( $simpleXml, $paymentId="")
      {
          $simpleXml ->addChild('providers');
          $simpleXml ->providers ->addChild('getPaymentStatus');
          $simpleXml ->providers -> getPaymentStatus -> addChild('payment');
          $simpleXml ->providers -> getPaymentStatus -> payment -> addAttribute('id', $paymentId);

          return $simpleXml;
      }

      /*  PERSONS -> setPublicKey */
      private function xml_setPublicKey( $simpleXml, $publicKey)
      {
          $simpleXml ->addChild('persons');
          $simpleXml ->persons ->addChild('setPublicKey');

          $simpleXml ->persons -> setPublicKey -> addChild('store-type', '1');

          $simpleXml ->persons -> setPublicKey -> addChild('pubkey', $publicKey);

          return $simpleXml;
      }

      /*  accountingReports -> getExemptionRates  */
      private function xml_getExemptionRates( $simpleXml, $agentId ="")
      {
          $simpleXml ->addChild('accountingReports');
          $simpleXml ->accountingReports ->addChild('getExemptionRates');

          if($agentId){
              $simpleXml ->accountingReports -> getExemptionRates -> addChild('target-agent', $agentId);
          }

          return $simpleXml;
      }


      /*  Terminals -> getCommissions */
      private function xml_getCommissions( $simpleXml, $terminalId ="")
      {
          $simpleXml ->addChild('terminals');
          $simpleXml ->terminals ->addChild('getCommissions');

          if($terminalId){
              $simpleXml ->terminals -> getCommissions -> addChild('target-terminal', $terminalId);
          }

          return $simpleXml;
      }

      /*  Terminals -> getForeignCommissions */
      private function xml_getForeignCommissions( $simpleXml )
      {
          $simpleXml ->addChild('terminals');
          $simpleXml ->terminals ->addChild('getForeignCommissions');

          return $simpleXml;
      }


      ////  Миксуем авторизацию в XML в зависимости от конфига
      ////  Получается что авторизационные данные идут сами после запроса,
      ////    но впринципе норм проходит и парсит так же как надо
      //////  Обертка над основным запросом
      private function request($simpleXml)                                      //  Получает XML  //  Вносит авторизационные данные и передает в curl
      {
        $simpleXml = $this -> generateClientData($simpleXml);

        if($this -> config_is_sign_enabled)                                     //!!!!!!!  Если по ЭЦП
        {
            $signData = [];
            $post = $simpleXml -> saveXML();

            $signData['sign'] = $this -> genCryptoSign($post);
              if(!$signData['sign'])  {
                  $this -> last_log[] = "request fail";
                 return false;
              }   //  Типо косяк при составлении ЭЦП

            $signData['login'] = $this -> config_login;                           //  Логин можно завести в BASE64 типо
            $signData['alg']  = $this -> config_rsa_alg;

            return $this -> makeRequest($post, $signData);

        } else {                                                                //!!!!!!!  ЕСЛИ ПО ЛОГИНУ И ПАРОЛЮ

          $simpleXml = $this -> generateAuthData($simpleXml);
          return $this -> makeRequest($simpleXml -> saveXML());

        }
      }


      /**   REQUEST
       *
       *  POST /XMLgate/XML.jsp HTTP/1.0
       *  Connection: keep-alive
       *  Content-Type: text/XML
       *  Content-Length: 249
       *  Host: xml1.qiwi.com
       *  Accept: text/html, (*)/*                          <------- Скобки нету
       *  Accept-Encoding: identity
       *  User-Agent: Dealer v0
       *
       *  <?XML version="1.0" encoding="utf-8"?>
       *  <request>
       *   <client serial="серийный номер" software="Dealer v0" terminal="номер терминала"/>
       *   <auth login="логин персоны" signAlg="MD5" sign="md5 хеш от пароля персоны"/>
       *   <agents>
       *   <getBalance/>
       *   </agents>
       *  </request>
       */
      private function makeRequest($postdata, $signData=[])
      {

        //  $signData = [
        //      'sign' => цифорвая подпись пакета с данными,
        //      'alg' => Алгоритм, MD5withRSA(!!!) либо SHA1withRSA
        //      'login' => логин, можно закодировать в BASE64,
        //  ];
        $this -> last_postdata = $postdata;

        $curl = curl_init();
        if($curl)
        {
          curl_setopt ($curl, CURLOPT_URL, $this -> xml_url);
          curl_setopt ($curl, CURLOPT_POST, true);
          curl_setopt ($curl, CURLOPT_RETURNTRANSFER, true);

          //////////////////  Если вдруг отваливается, то ставим  Верефикацию SSL FALSE
          //curl_setopt ($curl, CURLOPT_SSL_VERIFYPEER, false);                 //  Как вариант лучше скачать сертификат и потом уже чекать соединение
          //
          //  http://unitstep.net/blog/2009/05/05/using-curl-in-php-to-access-https-ssltls-protected-sites/
          //
          curl_setopt ($curl, CURLOPT_SSL_VERIFYPEER, $this -> ssl_verifypeer);
          curl_setopt ($curl, CURLOPT_SSL_VERIFYHOST, $this -> ssl_verifyhost);
          ///////////////////
          //  0: Don’t check the common name (CN) attribute
          //  1: Check that the common name attribute at least exists
          //  2: Check that the common name exists and that it matches the host name of the server  <---- This one and As default
          ////////////////////
          curl_setopt($curl, CURLOPT_CAINFO, $this -> ssl_cert_path);  ////  <- wtf in \t. Нужно заэскейпить все слэши \
          ////  Возможно можно как вариант поставить папку для сертификатов через CURLOPT_CAPATH
          ////////
          //  Прямой путь до корневого сертификата, не хавает DER(которые из браузера) сертификаты, поэтому надо конвертнуть в PEM
          //  openssl x509 -inform der -in certificate.cer -out certificate.pem
          //           КОРНЕВОЙ .cer берем из браузера, по адресу на который собираемся делать запрос
          //  C:\Program Files (x86)\OpenSSL-Win32\bin>openssl.exe x509 -inform der -in C:/TEMP_WWW/qiwi/cert/qiwi_ca_main.cer -out C:/temp_www/qiwi/cert/qiwi_ca_main.pem
          //  По идее такое понадобится провернуть когда они обновят сертификат
          //                                      (Действителен по 29 05 2016)
          ///////////////


          //curl_setopt ($curl, CURLOPT_HEADER, true);  //  чтобы глянуть какой хедер пришел в ответе
          //curl_setopt ($curl, CURLINFO_HEADER_OUT, true);

          $headers = [
            "Connection: keep-alive",
            "Content-Type: text/xml",
            "Content-Length: ".strlen($postdata),
            "Accept: text/html, */*",
            "Accept-Encoding: identity",
          ];

          if($this -> config_is_sign_enabled && $signData)       //////  Если нам передали данны по авторизации через ЭЦП.... по идее можно было бы проверять только sign data
          {
            $headers[] = [  "X-Digital-Sign: ".$signData['sign'],
                            "X-Digital-Sign-Alg: ".$signData['alg'],
                            "X-Digital-Sign-Login: ".$signData['login'],
                          ];
          }


          curl_setopt ($curl, CURLOPT_HTTPHEADER, $headers);
          curl_setopt ($curl, CURLOPT_USERAGENT, "Dealer v0");
          curl_setopt ($curl, CURLOPT_TIMEOUT, 1000);

          curl_setopt ($curl, CURLOPT_POSTFIELDS, $postdata);

          $result = curl_exec ($curl);

          $this -> last_log[] = $result;
          $this -> last_log[] = curl_getinfo($curl);


          curl_close($curl);
          return $result;
        }

        curl_close($curl);
      }

      //  Функция которая высчитывает подпись для данных, которые собираемся отправлять в QIWI
      //  В принципе можно былобы закинуть в метод с CURL (request WithCrypto)
      private function genCryptoSign($postdata)
      {

          ////file_put_contents("C:/TEMP_WWW/qiwi/keys/test/postdata.txt", $postdata);
          //////////// for tests

          if(!file_exists($this -> config_rsa_pathToKey)){                      //  Проверяем что есть файл с ключом
            $this -> last_log[] = "genCryptoSign rsa key not found";
            return false;
          }

          $prv = file_get_contents($this -> config_rsa_pathToKey);              //  Проверяем, что удалось вытащить данные от-туда
            if(!$prv){
              $this -> last_log[] = "genCryptoSign rsa key not found";
              return false;
            }

          $signAlgorithm = 'md5WithRSAEncryption';
          if($this -> config_rsa_alg == "SHA1withRSA")
          {
            $signAlgorithm = 'sha1WithRSAEncryption';
          } elseif ($this -> config_rsa_alg != "MD5withRSA") {                                                              //  Если вдруг конфиг поломался или еще чего...
            $this -> config_rsa_alg = "MD5withRSA";
                                                                                ////  Возмо лучше бы перезаписать конфиг тогда.... если такое произошло
          }

          $status =  openssl_sign($postdata, $enc, $prv, $signAlgorithm);
          //  file_put_contents("C:/TEMP_WWW/qiwi/keys/test/php/request.sign", $enc);
          //  file_put_contents("C:/TEMP_WWW/qiwi/keys/test/php/request.enc", base64_encode($enc));
          //  Чтобы проверифицировать через OPENSSL

          if(!$status){                                                         //  Проверяем, что подпись прошла успешно
            $this -> last_log[] = "genCryptoSign openssl_sign FAIL";
            return false;
          }
          return base64_encode($enc);
      }


      /*  OPEN SSL для того чтобы почекать праивильность данныхи и генерация ключей

          C:\Program Files (x86)\OpenSSL-Win32\bin>openssl genrsa -out C:/temp_www/qiwi/keys/private1.key 1024
          C:\Program Files (x86)\OpenSSL-Win32\bin>openssl rsa -in C:/temp_www/qiwi/keys/private1.key -pubout -out C:/temp_www/qiwi/keys/public1.key

          C:\Program Files (x86)\OpenSSL-Win32\bin>openssl dgst -md5 -out C:/temp_www/qiwi/keys/test/request.sign -sign C:/temp_www/qiwi/keys/test/private1.key C:/temp_www/qiwi/keys/test/postdata.txt
          C:\Program Files (x86)\OpenSSL-Win32\bin>openssl base64 -in C:/temp_www/qiwi/keys/test/request.sign -out C:/temp_www/qiwi/keys/test/request.enc


          ВЕрификация с открытым ключом
            C:\Program Files (x86)\OpenSSL-Win32\bin>openssl dgst -md5 -verify C:/temp_www/qiwi/keys/test/public1.key -signature C:/temp_www/qiwi/keys/test/openssl/request.sign C:/temp_www/qiwi/keys/test/postdata.txt
          php
            C:\Program Files (x86)\OpenSSL-Win32\bin>openssl dgst -md5 -verify C:/temp_www/qiwi/keys/test/public1.key -signature C:/temp_www/qiwi/keys/test/php/request.sign C:/temp_www/qiwi/keys/test/postdata.txt

      */


      ////  ПО SSL СЕРТИФИКАТОМ  WTF Надо еще доделывать....
      private function checkCert()
      {

        /*
          Пока только crt to pem преобразование
          Надо как-то тащить сертификат по ссылкам. Особенно самый начальный для определенного сервера
          т.е. будет что-то типо load from server.name:443
          а потом будет рекурсивная загрузка пока не дойдет до $parsed['extensions']['basicConstraints'] = 'CA:TRUE'
          Т.е. будет грузить по ссылкам из $parsed['extensions']['authorityInfoAccess'] = 'CA Issuers - URI:http://crt.comodoca.com/COMODOHigh-AssuranceSecureServerCA.crt'

          мб сделать отдельным пакетом.....

        */

          //$cerPATH = 'C:/TEMP_WWW/qiwi/cert/trusted/qiwi.cer';
          $cerPATH = 'C:/TEMP_WWW/qiwi/cert/yandex.cer';
          if(file_exists($cerPATH))
          {
            $cerContent = file_get_contents($cerPATH);


            //////  PHP_EOL - Конец строки
            $c = '-----BEGIN CERTIFICATE-----'.PHP_EOL
                  .chunk_split(base64_encode($cerContent), 64, PHP_EOL)
                  .'-----END CERTIFICATE-----'.PHP_EOL;

            //$c = file_get_contents('C:/TEMP_WWW/qiwi/cert/qiwi.pem');


            $cert = openssl_x509_read($c);

            var_dump($cert);
            $cert = openssl_x509_parse($cert);
            var_dump($cert);

            var_dump('_________________');
            var_dump($cert ['extensions']['authorityInfoAccess']);
          }
          dd();
      }


  }




 ?>
