<?php
//Обёртка для отработки команд в командной строке. Возвращает текст из командной строки
function cmd($command, $char = 'CP866', $char2 = 'UTF-8'){
  return iconv($char, $char2, shell_exec($command));
}

function is_server(){
  if(Settings::get("sync_is_server") != "1"){
     PJlogger::log("is_server()", "Терминал не является сервером.", 1);
     header('HTTP/1.0 404 not found');
     exit();
  }
}

function safe_json_encode($value, $options = 0, $depth = 512){
  $encoded = json_encode($value, $options, $depth);
  switch (json_last_error()) {
      case JSON_ERROR_NONE:
          return $encoded;
      case JSON_ERROR_DEPTH:
          return 'Maximum stack depth exceeded';
      case JSON_ERROR_STATE_MISMATCH:
          return 'Underflow or the modes mismatch';
      case JSON_ERROR_CTRL_CHAR:
          return 'Unexpected control character found';
      case JSON_ERROR_SYNTAX:
          return 'Syntax error, malformed JSON';
      case JSON_ERROR_UTF8:
          $clean = utf8ize($value);
          return safe_json_encode($clean, $options, $depth);
      default:
          return 'Unknown error';
  }
}

function utf8ize($mixed) {
  if (is_array($mixed))
    foreach ($mixed as $key => $value)
      $mixed[$key] = utf8ize($value);
  else if (is_string ($mixed))
    return utf8_encode($mixed);
  return $mixed;
}

function ajax($data = []){
  echo(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT));
  exit();
}

// вардамп поверх всего, используется для отладки
function vdump($data){
   echo("<div class='bob'>");
   var_dump($data);
   echo("</div><style>header{*display:none !important;}.bob{position:absolute;top: 0;left:0; z-index: 99999999; background:#fff; padding: 20px;}</style>");
}


// чекаем на размер и расширение
// закидывать файлы по одному, в том формате в котором они проиходят в $_FILES
function check_file($file){
   $ext = Settings::get("services_acept_input_image");
   $max_size = Settings::get("services_max_size_image");
}

// транслит
function translit($str) {
    $rus = array('А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я', 'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я');
    $lat = array('A', 'B', 'V', 'G', 'D', 'E', 'E', 'Gh', 'Z', 'I', 'Y', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H', 'C', 'Ch', 'Sh', 'Sch', 'Y', 'Y', 'Y', 'E', 'Yu', 'Ya', 'a', 'b', 'v', 'g', 'd', 'e', 'e', 'gh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'sch', 'y', 'y', 'y', 'e', 'yu', 'ya');
    return str_replace($rus, $lat, $str);
  }

function copyf(&$file, $catalog){
   if(!$file) return $file = NULL;
   $new_name = date('Y-m-d-is-') . time() . "-" . rand() ."-" . str_replace(' ', '_', translit($file['name']));
   if(copy($file['tmp_name'], $catalog . $new_name))
      return $file = $new_name;
   else
      return $file = NULL;
}

// вычитываем все файлы из дирректории в массив
function readDirectory($dir){
  if(!file_exists($dir)) return [];
  if ($handle = opendir($dir)) {
      $tmp = [];
      while (false !== ($file = readdir($handle)))
        if(!in_array($file, [".", "..", '', ' ', '_'])) $tmp[] = $file;
      return $tmp;
  } else return [];
}


function injection_object_js($obj){
  return 'JSON.parse("'.addslashes(nl2br(json_encode($obj, JSON_UNESCAPED_UNICODE))).'");';
}

// добавляем изображение в очередь на пережатие
function ResizeAdd($line) {
  if(trim($line) != '') file_put_contents(realpath($_SERVER['DOCUMENT_ROOT']."/_framework/python/list.txt"), $line.PHP_EOL, FILE_APPEND);
}

// добавляем
function ResizeStart() {
  return pclose(popen("python ".realpath($_SERVER['DOCUMENT_ROOT']."/_framework/python/resize.py"),"r"));
}

function array_merge_save_key($array1, &$array2){
  foreach ($array2 as $id => $v) $array1[$id] = $v;
  return $array1;
}

function file_force_download($file) {
	if (file_exists($file)) {
	  // сбрасываем буфер вывода PHP, чтобы избежать переполнения памяти выделенной под скрипт
	  // если этого не сделать файл будет читаться в память полностью!
	  if (ob_get_level()) {
		ob_end_clean();
	  }
	  // заставляем браузер показать окно сохранения файла
	  header('Content-Description: File Transfer');
	  header('Content-Type: application/octet-stream');
	  header('Content-Disposition: attachment; filename=' . basename($file));
	  header('Content-Transfer-Encoding: binary');
	  header('Expires: 0');
	  header('Cache-Control: must-revalidate');
	  header('Pragma: public');
	  header('Content-Length: ' . filesize($file));
	  // читаем файл и отправляем его пользователю
	  readfile($file);
	  exit;
	}
}


function fix_slash_n($text){
	return str_replace(["<br />\n", "\n"], "<br>", $text);
}
