<?PHP

	class FileManager {

        public function deleteFile($path)
        {

            if ( substr($path, 0, 7) !== '/_files' ) {
                return false;
            }


            $fullPath = DOCUMENT_ROOT.$path;


            if ( !file_exists($fullPath) ) {
                return true;
            }

            return unlink($fullPath);

        }

        public function getRandomFileFrom($dir) 
        {
            $content = scandir($dir);
            unset($content[0]);
            unset($content[1]);
            $index = array_rand($content);
            return $content[$index];
        }

        public function copy($source, $dest, $permissions = 0755)

        /**
         * Copy a file, or recursively copy a folder and its contents
         * @param       string   $source    Source path
         * @param       string   $dest      Destination path
         * @param       string   $permissions New folder creation permissions
         * @return      bool     Returns true on success, false on failure
         */
        
        {

            // Check for symlinks
            if (is_link($source)) {
                return symlink(readlink($source), $dest);
            }

            // Simple copy for a file
            if (is_file($source)) {
                return copy($source, $dest);
            }

            // Make destination directory
            var_dump($dest);
            dd(is_dir($dest));

            if (!is_dir($dest)) {
                mkdir($dest, $permissions);
            }

            // Loop through the folder
            $dir = dir($source);
            while (false !== $entry = $dir->read()) {
                // Skip pointers
                if ($entry == '.' || $entry == '..') {
                    continue;
                }

                // Deep copy directories
                self::copy("$source/$entry", "$dest/$entry", $permissions);
            }

            // Clean up
            $dir->close();
            return true;
        }

		public static function deleteFolder($dirPath) 
        {

   			if (! is_dir($dirPath)) {
        		throw new InvalidArgumentException("$dirPath must be a directory");
    		}
    
    		if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
        		$dirPath .= '/';
    		}


    		$files = glob($dirPath . '*', GLOB_MARK);
    
    		foreach ($files as $file) {
        		if (is_dir($file)) {
            		self::deleteFolder($file);
        		} else {
            		unlink($file);
        		}
    		}
    
    		rmdir($dirPath);
		}

        public static function clearFolder($dirPath) 
        {
        
            if (! is_dir($dirPath)) {
                throw new InvalidArgumentException("$dirPath must be a directory");
            }
    
            if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
                $dirPath .= '/';
            }


            $files = glob($dirPath . '*', GLOB_MARK);
    
            foreach ($files as $file) {
                if (is_dir($file)) {
                    self::deleteFolder($file);
                } else {
                    unlink($file);
                }
            }
    
        }

        public static function createFolder($folder)
        {
            $permissions = 0755;
            mkdir($folder, $permissions, true);
        }

        public static function createZip($folder, $archivePath = false, $name = false) {

            if ( !$name ) {
                $name = 'archive_' . date('U');
            }

            if ( !$archivePath ) {

                $archivePath = DOCUMENT_ROOT.'/_files/archives/';
                
            }

            $archivePath .= $name. '.zip';


            $scanFolder = $folder; 
            
            $zip = new ZipArchive; // класс для работы с архивами
            
            if ( $zip->open($archivePath, ZipArchive::CREATE) ) { // создаем архив, если все прошло удачно продолжаем
                
                $dir = opendir($scanFolder); // открываем папку с файлами
                
                while( $file = readdir($dir)){ // перебираем все файлы из нашей папки
                    if (is_file($folder.$file)){ // проверяем файл ли мы взяли из папки
                        $zip -> addFile($folder.$file, $file); // и архивируем
                    }
                }

                $zip -> close(); // закрываем архив.
            
                $archivePath = strstr($archivePath, '_files/');

                return 'http://' . $_SERVER['HTTP_HOST'] . '/' . SUBDOMAIN_PREFIX . $archivePath;
            
            } else{

                return false;
            
            }

        }

        public static function extractGZ($pathToGZ, $outputFile)
        {
            $file_name = $pathToGZ;

            if ( !file_exists($file_name) ) {
                return false;
            }

            // Raising this value may increase performance
            $buffer_size = 4096; // read 4kb at a time
            $out_file_name = $outputFile; 

            // Open our files (in binary mode)
            $file = gzopen($file_name, 'rb');
            $out_file = fopen($out_file_name, 'wb'); 

            // Keep repeating until the end of the input file
            while (!gzeof($file)) {
                // Read buffer-size bytes
                // Both fwrite and gzread and binary-safe
                fwrite($out_file, gzread($file, $buffer_size));
            }

            // Files are done, close files
            fclose($out_file);
            gzclose($file);
        }

	}
	
?>
