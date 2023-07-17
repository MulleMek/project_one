<?php
require_once 'vendors/PHPMailer/class.phpmailer.php';
//#API
/**
https://github.com/Synchro/PHPMailer
http://phpmailer.github.io/PHPMailer/
dependency php.ini openssl extension
return @bool Mailer::send("someEmail@mail.ru", "Hi there. Привет", "Тестовое письмо");
*/
class Mailer {

    private static $options = [
        "login" => "",
        //"password" => "",
        "host" => "",
        "from" => "",
        "port" => "",
        "security" => "", //"ssl", "tls", "",
        "subject" => ""
    ];

    private static $SMTPVendorConfigs = [
        "gmail" => [
            "host" => "smtp.gmail.com",
            "port" => "465",
            "security" => "ssl"
        ],

        "mail" => [
            "host" => "smtp.mail.ru",
            "port" => "465",
            "security" => "ssl"
        ],

        "rambler" => [
            "host" => "smtp.rambler.ru",
            "port" => "465",
            "security" => "ssl"
        ],

        "yandex" => [
            "host" => "smtp.yandex.ru",
            "port" => "465",
            "security" => "ssl",
        ]
    ];

    public static function config( $first, $second = null )
    {

        /*
            Mailer::config([
                "key" => "value",
                ...
            ])        
         */
        if ( is_array($first) ) {

            self::setConfig($first);


        /*
            Mailer::config("host", "smtp.myhost.com");

         */
        } else if ( is_string($first) && $second ) {
            self::setConfigItem($first, $second);
        } 

    }

    private static function setConfig( $params )
    {
        foreach ( $params as $param => $value ) {
            self::setConfigItem($param, $value);
        }
    } 

    private static function setConfigItem( $name, $value )
    {
        /***************************************************************/
        /* IN CASE USER SPECIFY 
            "vendor" => "mail"/"gmail"/"rambler" etc
         */
        /***************************************************************/
        if ( $name === "vendor" && isset(self::$SMTPVendorConfigs[$value]) ) {
            $config = self::$SMTPVendorConfigs[$value];
            self::setConfig($config);
        } elseif ( isset(self::$options[$name]) ) {
            self::$options[$name] = $value;
        }
    }

    public static function send( $address, $body, $subject = "", $attachfile = [] )
    {
        $answer = [
            "error" => 0,
            "data" => null
        ];

        self::$options = [
            "login" => "",
            "password" => "",
            "host" => "",
            "from" => "",
            "port" => "",    ///было 465,  587
            "security" => "tls", //было "ssl", "tls", "",
            "subject" => ""
        ];

        $mail = new PHPMailer;
        $mail->CharSet = "utf-8"; 
        $mail->isSMTP();                                      // Set mailer to use SMTP
        $mail->Host = self::$options["host"];                 // Specify main and backup server
        $mail->Port = self::$options["port"];
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Username = self::$options["login"];            // SMTP username
        $mail->Password = self::$options["password"];         // SMTP password
        $mail->SMTPSecure = self::$options["security"];  

        $mail->From = self::$options["login"];
        $mail->FromName = self::$options["from"];
        $mail->addAddress($address);                          // Name is optional
        $mail->addReplyTo(self::$options["login"], self::$options["from"]);

        foreach ($attachfile as $file ) {
            $mail -> AddAttachment( $file );
        }

        $mail->Subject = (!empty($subject))? $subject : self::$options["subject"];
        $mail->Body = $body;
        $mail->AltBody = $body;                               //for non html clients

        if ( !$mail->send() ) {
            $answer["data"] = $mail->ErrorInfo;
            $answer["error"] = 1;
        }

        return $answer;
    }

}
