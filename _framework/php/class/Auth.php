<?php

class Auth implements IAuth {

	private static $sessionKey = 'auth';
	private static $tableName = 'users';
	private static $required = ['password', 'name'];
	private static $defaultKey = false;


	// какой ключ сессии сейчас актуален
	private static function getKey() {
		if(self::$defaultKey !== false) 
			return self::$sessionKey . "_" . self::$defaultKey;
		return self::$sessionKey . "_" . substr(Route::$subdomain, 0, -1);
	}

	// устанавливаем ключ в рамках которого смотрим права
	public static function setKey($key) {
		self::$defaultKey = $key;
	}


	/**
	 * Encrypt password
	 * @param  string $password 
	 * @return string
	 */
	public static function password( $password )
	{
		return md5($password);
	}



	/**
	 * Вход
	 * @param  array  $credentials [name, password [, admin, operator]]
	 * @return bool
	 */
	public static function attempt( array $credentials )
	{
		$user = self::getUser( $credentials );
		
		if ( !$user ) {
			return false;
		}

		unset($user['password']);
		$user['update_time']  = time();

		Session::set(self::getKey(), $user);
		return true;
	}
	


	/**
	 * Check users credentials without logging in
	 * @param  array  $credentials [name, password [, admin, operator]]
	 * @return bool
	 */
	public static function validate( array $credentials )
	{
		return !!self::getUser( $credentials );
	}




	/**
	 * Check is user logged in
	 * @return bool
	 */
	public static function check()
	{
		$result = !!Session::get(self::getKey());
		return $result;
	}



	/**
	 * get user array
	 * @return bool, array  false/[id, name fillname, operator, admin]
	 */
	public static function user()
	{
		return Session::get(self::getKey());
	}



	/**
	 * get user id
	 * @return int
	 */
	public static function id()
	{
		$user = self::user();

		if ( !$user || !isset($user['id']) ) {
			return false;
		}
		return intval($user['id']);
	}



	/**
	 * get user name
	 * @return string
	 */
	public static function name()
	{
		$user = self::user();

		if ( !$user || !isset($user['name']) ) {
			return false;
		}
		return $user['name'];
	}



	/**
	 * get user fullname
	 * @return string
	 */
	public static function fullname()
	{
		$user = self::user();

		if ( !$user || !isset($user['fullname']) ) {
			return false;
		}
		return $user['fullname'];
	}



	/**
	 * Logs out user
	 * @return void
	 */
	public static function logout()
	{
		Session::pull(self::getKey());
	}



	/***************************************************************/
	/* PRIVATES */
	/***************************************************************/
	private static function required( array $credentials )
	{
		foreach ( self::$required as $value ) {
			if ( !isset($credentials[$value]) ) {
				return false;
			}
		}

		return true;
	}

	private static function getUser( $credentials )
	{

		if ( !self::required($credentials) ) {
			return false;
		}
		
		$userData = [
			'name' => $credentials['name'],
			'password' => self::password($credentials['password'])
		];

		foreach ( $userData as $key => $value ) {
			DB::where($key, $value);
		}
		
		return DB::getOne(self::$tableName);
	}

	// Проверяет права мастера
	public static function check_master(){
		self::update_data();
		$user = self::user();
		if(!$user) return false;
		if(isset($user['master']) && $user['master'] == 1) return true;
		return false; 
	}
	
	// Возвращает массив id организаций
	public static function getOrg(){
		self::update_data();
		$user = self::user();
		if(!$user || trim($user['org']) == '') return [];
		$data = json_decode($user['org'], 1);
		if(is_null($data)) return [];
		return $data;
	}

	
	public static function checkOrg($id_org){
		self::update_data();
		return in_array((int)$id_org, self::getOrg());
	}

	// раз в n минут будем обновлять информацию пользовтеля
	private static function update_data(){
		$user = self::user();
		if(!$user) return false;
		if(!isset($user['update_time']) || time() -  (int)$user['update_time'] > (int)Settings::get("auth_session_update") * 60){
			DB::where("id", $user['id']);
			$user = DB::getOne(self::$tableName);
			$user['update_time'] = time();
			unset($user['password']);
			Session::set(self::getKey(), $user);
			return true;
		}
		return false;
	}
}