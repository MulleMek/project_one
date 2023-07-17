<?php
class SellerInfo {

	public static function get(){
		$k = [ 
			"SellerName", 
			"SellerSecondName", 
			"SellerFullName", 
			"SellerAddress", 
			"SellerINN", 
			"SellerOGRNIP", 
			"SellerPhone", 
			"SellerEmail", 
			"SellerSite", 
			"SellerInstagram", 
			"terminal_id", 
			"TerminalAddress",
			"TerminalMesto",
			"KKTSerial",
			"KKTReg",
			"SiteFNS",
			"OFDName",
			"RootCategoryID",
			"SNOName",

			"service_phone",
			"SellerWorkHours",
		];
		
		// replace with
		$r = [ 
			"Name", 
			"SecondName", 
			"FullName", 
			"Address", 
			"INN", 
			"OGRNIP", 
			"Phone", 
			"Email", 
			"Site", 
			"Instagram", 
			"TerminalID", 
			"TerminalAddress",
			"TerminalMesto",
			"KKTSerial",
			"KKTReg",
			"SiteFNS",
			"OFD",
			"RCID", /*RootCategoryID */
			"SNO",

			"ServicePhone",
			"WorkHours",
		];


		$res = Settings::getMany($k);

		if( !$res ) return [];

		$out = [];
		foreach ($k as $i => $key) {
			if( isset($res[$key]) )
				$out[$r[$i]] = $res[$key];
		}

		return $out;
	}


	public static function getOrganization( $id = null, $remote_id = null ){

		$q = "SELECT id, active, remote_id, terminal_id, kaznachey_id, name, description, seller_img, seller_data, settings_data from organizations where ";
		if( $remote_id ){
			$remote_id = intval($remote_id);
			$q = $q . " remote_id='$remote_id'";
		} else if( $id ) {
			$id = intval($id);
			$q = $q . " id='$id'";
		} else {
			return null;
		}

		$org = DB::query($q, false);
		if( !$org || !$org[0]) return null;
		$org = $org[0];

		if( $org['seller_data'] ) $org['seller_data'] = json_decode($org['seller_data'], true);
		if( !$org['seller_data'] ) $org['seller_data'] = [];

		if( $org['settings_data'] ) $org['settings_data'] = json_decode($org['settings_data'], true);
		if( !$org['settings_data'] ) $org['settings_data'] = [];

		if( $org['seller_data'] ){
			$k = [
				"terminal_id", 
				"TerminalAddress",
				"TerminalMesto",

				"SellerName", 
				"SellerAddress", 
				"SellerINN", 
				"SellerOGRNIP", 
				"SellerPhone", 
				"SellerEmail", 
				"SellerSite", 
				"SellerInstagram", 
			];
			$r = [
				"TerminalID", 
				"TerminalAddress",
				"TerminalMesto",

				"Name", 
				"Address", 
				"INN", 
				"OGRNIP", 
				"Phone", 
				"Email", 
				"Site", 
				"Instagram", 
			];

			$res = Settings::getMany($k);

			if( $res ){
				foreach ($k as $i => $key) {
					if( isset($res[$key]) && (!isset($org['seller_data'][$r[$i]]) || !$org['seller_data'][$r[$i]]) )
						$org['seller_data'][$r[$i]] = $res[$key];
				}
			}

			if( isset($org['seller_img']) ){
				$org['seller_data']['img'] = $org['seller_img'];
			}
		}

		return $org;
	}

	public static function listOrganizations( ){
		$q = "SELECT id, active, remote_id, terminal_id, kaznachey_id, name, description, seller_data from organizations ";
		$orgs = DB::query($q, false);
		if( !$orgs ) return [];
		return $orgs;
	}
}