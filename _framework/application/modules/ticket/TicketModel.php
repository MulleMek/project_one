<?php

class TicketModel extends Model {

	public function test(){ }

	public function webkassa_getOperationType( $type ){
		switch ($type) {
			case 0: return "Наличными";
			case 1: return "Безналичными";
			case 2: return "Оплата в кредит";
			case 3: return "Оплата тарой";
				
			default: return "Наличные!";
		}
	}
	public function webkassa_getType( $type ){
		switch ($type) {	
			case 0: return "Покупка";
			case 1: return "Возврат покупки";
			case 2: return "Продажа";
			case 3: return "Возврат продажи";
				
			default: return "Продажа!";
		}
	}
	public function webkassa_getTaxType( $type ){
		switch ($type) {	
			case 0: return "Без НДС";
			case 100: return "НДС 12%";
			
			default: return "Без НДС!";
		}
	}

	public function simple_getOperationType( $type ){
		switch ($type) {
			case 0: return "Наличными";
			case 1: return "Безналичными";
			// case 2: return "Оплата в кредит";
			// case 3: return "Оплата тарой";
				
			default: return "Наличные!";
		}
	}
	public function simple_getType( $type ){
		switch ($type) {	
			case 'sale': return "Кассовый чек / Приход";
			case 'ret': return "Кассовый чек / Возврат прихода";
			case 'buy': return "Кассовый чек / Продажа";
			case 'buyret': return "Кассовый чек / Возврат продажи";
				
			default: return "Продажа!";
		}
	}
	public function simple_getTaxType( $type ){
		switch ( intval($type) ) {	
			case 2: return "НДС 10%";
			case 4: return "НДС 10/110";
			case 7: return "НДС 20%";
			case 8: return "НДС 20/120";
			case 5: return "НДС 0%";
			case 6: return "Без НДС";

			/*
			 OLD
			case 1: return "НДС 0%";
			case 2: return "НДС 10%";
			case 3: return "НДС 20%";
			case 4: return "Без НДС";
			case 5: return "НДС 10/110";
			case 6: return "НДС 20/120";
			
			default: return "Без НДС!";
			 */
		}
	}

	public function simple_getTaxSum( $goods, $tax ){
		$sum = 0;

		foreach ($goods as $v) {
			if( isset($v['tax']) && intval($v['tax']) && intval($v['tax']) === intval($tax) ){
				$sum +=  floatval($v['price']) * floatval($v['quantity']);
			}
		}

		if( !$sum ) return 0;

		switch ( intval($tax) ) {	
			case 2: return ceil(1000 * $sum / 110) / 100; //"НДС 10%";
			case 4: return ceil(1000 * $sum / 110) / 100; //"НДС 10/110";
			case 7: return ceil(2000 * $sum / 120) / 100; //"НДС 20%";
			case 8: return ceil(2000 * $sum / 120) / 100; //"НДС 20/120";
			
			case 5: 			//"НДС 0%";
			case 6: 			//"Без НДС";
			default: return $sum;//"Без НДС!";
		}
	}

	public function simple_getItemType( $type ){
		switch ( intval($type) ) {	
			case 1: return "ТОВАР";	
			case 2: return "ПОДАКЦИЗНЫЙ ТОВАР";	
			case 3: return "РАБОТА";	
			case 4: return "УСЛУГА";	
			case 9: return "ПРЕДОСТАВЛЕНИЕ РИД";	
			case 10: return "ПЛАТЕЖ - ВЫПЛАТА";	

			default: return "ТОВАР";
		}
	}
	public function simple_getPaymentMode( $type ){
		switch ( intval($type) ) {	
			case 1: return "ПРЕДОПЛАТА 100%";
			case 2: return "ПРЕДОПЛАТА";
			case 3: return "АВАНС";
			case 4: return "ПОЛНЫЙ РАСЧЕТ";
			case 5: return "ЧАСТИЧНЫЙ РАСЧЕТ";
			case 6: return "ПЕРЕДАЧА В КРЕДИТ";
			case 7: return "ОПЛАТА КРЕДИТА";
			default: return "ПОЛНЫЙ РАСЧЕТ";
		}
	}
	public function simple_getSNO( $type ){
		// return $type;

		//// список для нанокассы
		switch ( intval($type) ) {	
			case 0: return "Общая";	
			case 1: return "Упрощенная доход";	
			case 2: return "Упрощенная доход минус расход";	
			case 3: return "Единый налог на вмененный доход";	
			case 4: return "Единый сельскохозяйственный налог";	
			case 5: return "Патентная система налогообложения";	

			default: return $type; //"Общая";
		}
	}

	public function simple_getTypes( ){
		return [ 	
			'sale' => "Покупка",
			'ret' => "Возврат покупки",
			'buy' => "Продажа",
			'buyret' => "Возврат продажи",
		];
	}

	public function simple_parseTags( $tags ){
		if( !$tags || !count($tags) ) return [];
		$out = [];

		foreach ($tags as $t) {
			if( !$t || !isset($t['t']) || !isset($t['val']) ) continue;
			$out = array_merge($out, $this -> getTagInfo( $t['t'], $t['val'] ) );
		}

		return $out;
	}

	private function getTagInfo( $tag, $val ){
		switch( $tag ){
			case '1057':
			case '1222':
				if( $val == '64' ) return ["АГЕНТ"];		//// возможен составной вариант и тогда нужно вернуть массив....
			break;

			case '1226':
				return [ "ИНН: " . $val ];
			break;

			case '1225': return [ "" . $val ];
			case '1171': return [ "Тел.: " . $val ];
			
			case '1055':
				return [ "СНО: " . $this -> getTagSno($val) ];

			case '1224':
				$out = [];
				foreach ($val as $v) {
					$out = array_merge($out, $this -> getTagInfo($v['t'], $v['val']));
				}
				return $out;
		}

		return [];
	}

	private function getTagSno( $val ){
		switch ($val) {
			case '2': return "Упрощенная доход";
			case '4': return "Упрощенная доход-расход";
			case '8': return "Единый налог на вмененный доход";
			case '16': return "Единый сельскохозяйственный налог";
			case '32': return "Патент";

			case '1':
			default: return "Общая";
		}
	}

	public function simple_currency(){
		return "₽";
	}

	/* 
		список может поменяться
		потому лучше получать объект сразу в Goods
			{ Code:796,NameRu:"шт",NameEn:"PC",NameKz:"дана" },
			{ Code:166,NameRu:"кг",NameEn:"kg",NameKz:"кг" },
			{ Code:112,NameRu:"литр",NameEn:"liter",NameKz:"литр" },
			{ Code:6,NameRu:"м",NameEn:"m",NameKz:"м"},
			{ Code:55,NameRu:"м2",NameEn:"m2",NameKz:"м2"},
			{ Code:113,NameRu:"м3",NameEn:"m3",NameKz:"м3"},
			{ Code:18,NameRu:"м.пог.",NameEn:"m.lin",NameKz:"м.пог."},
			{ Code:168,NameRu:"тонн.",NameEn:"tons.",NameKz:"тонн."},
			{ Code:778,NameRu:"упак.",NameEn:"pack",NameKz:"орама"},
			{ Code:5114,NameRu:"одн.усл.",NameEn:"one",NameKz:"бір қызмет"},
			{ Code:356,NameRu:"час",NameEn:"hour",NameKz:"сағат"},
			{ Code:792,NameRu:"чел.",NameEn:"people",NameKz:"адам"},
			{ Code:5111,NameRu:"одн.пач",NameEn:"one pack",NameKz:"бір бума"}
	*/
	public function webkassa_getUnits( $type ){
		switch ($type) {
			case 796: 	return "шт";
			case 166: 	return "кг";
			case 112: 	return "литр";
			case 6: 		return "м"; 
			case 55: 	return "м2";
			case 113: 	return "м3"; 
			case 18: 	return "м.пог.";
			case 168: 	return "тонн."; 
			case 778: 	return "упак."; 
			case 5114: 	return "одн.усл.";
			case 356: 	return "час"; 
			case 792: 	return "чел."; 
			case 5111: 	return "одн.пач";

			default: return "шт!";
		}
	}

	public function webkassa_getTypes(){
		return [
					'Sell' => "Приход",
					'Buy' => "Расход",
					'ReturnSell' => "Возврат Прихода",
					'ReturnBuy' => "Возврат Расхода",
				];
	}

	public function webkassa_currency(){
		return "₸";
	}




	public function get_logo( $name ){
		return "";
	}
	
}