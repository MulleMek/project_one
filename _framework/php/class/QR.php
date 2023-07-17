<?php
require_once 'vendors/qrcode/phpqrcode.php';

class QR {

    public static function getBase64Code( $str="", $q="Q", $size=4 )
    {
        ob_Start();
        //// str, fileName, quality (LMQH), SIZE, MARGIN?, Saveandprint?
        QRCode::png($str, null, $q, $size);
        $out = base64_encode(ob_get_contents());
        ob_end_clean();
        return $out;
    }
}
