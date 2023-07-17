<?php

class MainModel extends Model
{
	public function getRootCategories(){

		//$q = "SELECT * FROM `categories` WHERE `parent_id` = 0 AND `is_active` <> 0 AND `is_org` IS NOT NULL  ORDER BY `order`, `name`, `id`";
		
		$q = "SELECT `categories`.*, 

			`organizations`.`seller_img` as `seller_img`,
			`organizations`.`seller_data` as `seller_data`,
			`organizations`.`terminal_id` as `terminal_id`,
			`organizations`.`kaznachey_id` as `kaznachey_id`,
			`organizations`.`settings_data` as `settings_data`

			FROM `categories`  

			LEFT JOIN `organizations`
			ON `organizations`.`id` = `categories`.`is_org`


			WHERE `parent_id` = 0 AND `is_active` <> 0 AND `is_org` IS NOT NULL  AND `organizations`.`active` = 1

			ORDER BY `categories`.`order`, `categories`.`name`, `categories`.`id`
		;";
		$result = DB::query($q, false);

		if( !$result ) return [];

		foreach ($result as $k => $val) {
			$q = "SELECT `id`,`name`,`img_path` FROM `categories` where `parent_id`=".$val['id']." AND `is_active`<>0 AND `is_org` IS NULL ORDER BY `order`, `img_path`, `name`, `id`";
			$res = DB::query( $q, false );
			if( !$res ) $res = [];
			$result[$k]['subcategories'] = $res;

			$q = "SELECT `id`,`name`,`img_path` FROM `services` where `category_id`=".$val['id']." AND `is_active`<>0 ORDER BY `order`, `img_path`, `name`, `id`";
			$res = DB::query( $q, false );
			if( !$res ) $res = [];
			$result[$k]['subservices'] = $res;
		}

		return $result;
	}

	public function getRootCategoryId(){
		$res = DB::query( "SELECT id FROM `categories` WHERE `is_active`=1 and `parent_id`=0 ORDER BY `order` LIMIT 1;", false);
		if( !$res || !isset($res[0]) || !isset($res[0]['id']) ) return 0;
		return $res[0]['id'];
	}

	public function getCategory( $id ){
		if( !$id ) $id = $this -> getRootCategoryId();

		$result = DB::query( "SELECT * FROM `categories` WHERE `id`=" .$id );
		if( !$result ) return null;
		$result = $result[0];

		$q = "SELECT * FROM `categories` WHERE `parent_id`=" .$id. " AND `is_active`<> 0 AND `is_org` IS NULL ORDER BY `order`, `img_path`, `name`, `id` ";
		$result['subcategories'] = DB::query($q, false);
		if( !$result['subcategories'] ) $result['subcategories'] = [];

		$q = "SELECT * FROM `services` WHERE `category_id`=" .$id. " AND `is_active`<> 0  ORDER BY `order` "; //, `img_path`, `name`, `id` 
		$result['subservices'] = DB::query($q, false);
		if( !$result['subservices'] ) $result['subservices'] = [];

		foreach ($result['subservices'] as $k => $val) {
			$result['subservices'][$k]['price'] = floatval($result['subservices'][$k]['price']); 
		}

		return $result;
	}

}
