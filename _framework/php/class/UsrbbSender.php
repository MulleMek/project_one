<?php 
class UsrbbSender {

    public static function send( $data ) {
        if ( !Settings::get('usrbb_sender_url') ) {
            return false;
        }

        $res = file_put_contents(PROJECT.'/fake_send.log', json_encode($data));

        return $res;
    }
}