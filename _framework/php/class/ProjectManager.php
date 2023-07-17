<?php
class ProjectManager {

    /*
     * Check вызывается каждый раз
     * Проверяет существование базы данных, а так же ее апдейты и необходимые каталоги и файлы
     *
     */


    /***************************************/
    // P U B L I C     F U N C T I O N S
    /***************************************/

    public static function checkConstants()
    {

        /*
         * Вызывается в bootstrap.php
         * Проверяет определены ли константы
         * Если нет, то дампит и умирает
         */

        $constants = [
            'DB_HOST',
            'DB_USERNAME',
            'DB_TABLE',
            'DB_PASSWORD',
            'DB_AUTOCREATE',
            'IS_LINUX',
            'IS_SESSION_ON',
            'IS_ERRORS_ON',
            'PROJECT_NAME'
        ];

        $isErrorDetected = false;

        foreach ($constants as $value) {
            if ( !defined($value) ) {
                if ( !$isErrorDetected ) {
                    $isErrorDetected = "Some problems occured. Nou full list of constants defined";
                    var_dump($isErrorDetected);
                }

                var_dump($value . " is not defined");
            }
        }

        if ( $isErrorDetected ) {
            die();
        }

        return true;
    }

    public static function check()
    {

        /*
         * Основная функция проверки, именно она вызывается
         * Каждый раз в bootstrap
         *
         */

        if ( !DB_AUTOCREATE || !DB_HOST || !DB_USERNAME || !DB_PASSWORD ) {
            return;
        }

        //проверка соединения с базой данных
        $link = mysql_connect(DB_HOST, DB_USERNAME, DB_PASSWORD);

        if (!$link) {
            dd('База данных ' . DB_HOST . ' не найдена или невозможно войти с логином ' . DB_USERNAME . ' под указанным паролем');
        }

        $db_selected = mysql_select_db(DB_TABLE, $link);

        if (!$db_selected) {
            //Указанная база данных не была найдена, хотя соединение устанавливается
            //Вызывается функция создания пустого проекта
            self::createNewProject();
        }

        self::checkUpdates(); //проверка обновлений
    }

    public static function createAdditionalDB($dbFilePath, $tableName)
    {

        /*
         * Создает дополнительную базу данных, если требуется
         */

        $link = mysql_connect(DB_HOST, DB_USERNAME, DB_PASSWORD);

        $db_selected = mysql_select_db($tableName, $link);

        if ( !$db_selected ) {
            mysql_query("CREATE DATABASE " . $tableName) or die ('Can not create DB in automode ' . mysql_error() . '<br /><br />');
        } else {
            $query = "TRUNCATE TABLE " . $tableName;
        }

        return self::runSQL($dbFilePath, $tableName);
    }

    public static function dumpDataBase($table, $saveTo)
    {

        $link = mysql_connect(DB_HOST, DB_USERNAME, DB_PASSWORD);

        if ( !$link ) {
            return false;
        }

        $db_selected = mysql_select_db($table, $link);

        if ( !$db_selected ) {
            return true;
        }

        $cmd = "mysqldump -u" . DB_USERNAME . " -p" . DB_PASSWORD . " " . $table . " > " . $saveTo;

        $shellAnswer = '';

        exec($cmd, $shellAnswer);

        if ( !$shellAnswer ) {
            return true;
        } else {
            return false;
        }
    }



    /***************************************/
    // P R I V A T E     F U N C T I O N S
    /***************************************/

    private static function createNewProject()
    {
        /*
         * Эта функция создает базу данных, проверяет наличие ключевых файлов и каталогов
         */

        //Каталоги, которые должны существовать в новом проекте и быть пустыми
        self::checkEndCreateFolders();

        //Файлы, которые необходимо удалить
        self::deleteFiles();

        //создает базу данных из файла empty_db
        self::createDefaultDataBase();
    }

    private static function checkEndCreateFolders()
    {
        /*
         * Создает указанные в теле функции каталоги, если они не существуют
         * или же очищает их содержимое
         */


        $folders = [
            PROJECT . "/storage", //файловое хранилище
            PROJECT . "/files", //общий каталог с файлами
            PROJECT . "/files/logs", //каталог с логами,
            PROJECT . "/files/logs/operations", // каталог с логами операций
            PROJECT . "/files/logs/csv_reports", // каталог с csv отчетами
            PROJECT . "/files/logs/zip",
            PROJECT . "/files/logs/zip_extract",
            PROJECT . "/files/image_services/",

            PROJECT . "/files/ad",
            PROJECT . "/files/ad/img",
            PROJECT . "/files/ad/video",

        ];


        foreach ($folders as $folder) {
            if ( !file_exists($folder) ) {
                FileManager::createFolder($folder);
            } else {
                FileManager::clearFolder($folder);
            }
        }

        $projectFolders = Config::get("first_run", "folders_to_create");

        if ( $projectFolders && is_array($projectFolders) ) {
            $prefix = PROJECT . "/";

            foreach ($projectFolders as $folder) {
                $folder = $prefix.$folder;

                if ( !file_exists($folder) ) {
                    FileManager::createFolder($folder);
                } else {
                    FileManager::clearFolder($folder);
                }
            }
        }

        return;
    }

    private static function deleteFiles()
    {
        /*
         * Удаляет файлы, которые обязательно должны отсутствовать в пустом проекте
         */

        $files = [
            PROJECT . "/data_base/db_update_info.json", //файл с информацией о последних апдейтах базы данных
        ];

        foreach ($files as $file) {
            if ( file_exists($file) ) {
                unlink($file);
            }
        }

        return;

    }

    private static function createDefaultDataBase()
    {
        $db = DOCUMENT_ROOT . '/_project/data_base/empty_db.sql';

        if ( !file_exists($db) ) {
            dd("Не могу создать базу данных из-за отсутсвия файла /_project/data_base/empty_db.sql (загрузите файл либо отключите автоматическое создание базы данных в конфигурации");
        }

        $link = mysql_connect(DB_HOST, DB_USERNAME, DB_PASSWORD);
        mysql_query("CREATE DATABASE " . DB_TABLE) or die ('Can not create DB in automode ' . mysql_error() . '<br /><br />');
        self::runSQL($db, DB_TABLE);
    }

    private static function checkUpdates()
    {
        if ( !self::isUpdateExists() ) {
            return;
        }

        self::insertUpdates();
    }


    /********************************************************/
    // P R I V A T E     H E L P E R S     F U N C T I O N S
    /********************************************************/

    private static function isUpdateExists()
    {
        $updatesDB = PROJECT . "/data_base/db_update.sql";

        if ( !file_exists($updatesDB) ) {
            return false;
        }

        $fieldsToCompare = ["size", "time"];

        $updateFileData = [
            'size' => filesize($updatesDB),
            'time' => filemtime($updatesDB)
        ];

        $data = self::getUpdateData();

        foreach ($fieldsToCompare as $field) {
            if ( $updateFileData[$field] !== $data[$field] ) {
                return true;
            }
        }

        return false;
    }

    private static function insertUpdates()
    {
        $updatesDB = PROJECT . "/data_base/db_update.sql";
        self::runSQL($updatesDB, DB_TABLE);
        self::setUpdateData($updatesDB);
    }

    private static function setUpdateData($file)
    {
        $data = [
            'size' => filesize($file),
            'time' => filemtime($file)
        ];

        $path = DOCUMENT_ROOT . '/_project/data_base/db_update_info.json';

        return file_put_contents($path, json_encode($data));
    }

    private static function getUpdateData()
    {
        $updates =  PROJECT . "/data_base/db_update_info.json";

        if ( !file_exists($updates) ) {
            return [
                "size" => 0,
                "time" => 0
            ];
        }

        $data = file_get_contents($updates);

        $data = json_decode($data, true);

        if ( !$data ) {
            return [
                "size" => 0,
                "time" => 0
            ];
        }

        return $data;
    }

    private static function runSQL($db_file_link, $table)
    {
        $link = mysql_connect(DB_HOST, DB_USERNAME, DB_PASSWORD);
        mysql_select_db($table);

        $lines = file($db_file_link);

        $templine = "";

        foreach ($lines as $line) {
            if (substr($line, 0, 2) == '--' || $line == '') {
                continue;
            }

            $templine .= $line;

            if ( substr(trim($line), -1, 1) == ';' ) {
                mysql_query($templine) or print('Error performing query \'<strong>' . $templine . '\': ' . mysql_error() . '<br /><br />');
                $templine = '';
            }
        }

        return true;
    }


}
?>
