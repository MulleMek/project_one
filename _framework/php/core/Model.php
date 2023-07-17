<?php

class Model
{

    public $options;

    public function __construct( $domain )
    {
        $this->config(strtolower($domain));
    }

    public function config( $name )
    {
        $fileurl = DOCUMENT_ROOT . "/_framework/config/{$name}.json";


        if ( !file_exists($fileurl)) {
            return false;
        }

        $json = json_decode(file_get_contents($fileurl), true);

        if ( $json ) {
            $this->options = $json;
        }
    }

    /**
    * Creates new array with keys from $what array and k, v from $where.
    * Futher additions could be something like valid condition, so we use loop instead array_walk like function 
    * 
    * @param  [array] $where [description]
    * @param  [array] $what  [description]
    * @return [mixed(bool = false, array)]        [description]
    */
    public function validate($where, $what, $check_for_empty = false, $any = false, $toInt = false )
    {
        if (!$what || !$where || !is_array($what) || !is_array($where)) {
            return false;
        }

        $result = array();

        foreach ($what as $key) {

            if ($check_for_empty) {

                if (empty($where[$key])) {
                    if ($any) {
                        continue;
                    }
                    return false;
                }

            } else {

                if (!isset($where[$key])) {
                    if ($any) {
                        continue;
                    }
                    return false;
                }
                
            }

            $result[$key] = ($toInt)? intval($where[$key]) : $where[$key];
        }

        return $result;
    }

    public function validateAny($where, $what, $check_for_empty = false)
    {
        return $this->validate($where, $what, $check_for_empty, true);
    }

    public function validateInt( $where, $what )
    {
        return $this->validate($where, $what, false, false, true);
    }

    public function convertToPositiveInt($a)
    {
        $a = intval($a);
        return ( $a < 0 )? 0 : $a;
    }

    public function extend()
    {
        return call_user_func_array(array_replace_recursive, func_get_args());
    }
   
}