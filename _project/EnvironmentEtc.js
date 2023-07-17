var EnvironmentEtc = ( function() {

	var self = {};

	self.options = {
		BarcodeReader: {
			moduleName: 'BarcodeReader',
		 	events: {
		  		code: 'BarcodeReader/code'
		 	},
		 	debug: true,
		 	isFake: false,
		 	readTime: 5,
		 	fakeData: [ 111111111 ]
		},

		ProxyClient: {
			isFake: false,
			debug: true,
	
			scenario: { 
				getUser: {
					error: false,
					data: {"result":[{"ID":"66","XML_ID":"14864313","ACTIVE":true,"NAME":"Антон","LAST_NAME":"Куликов","SECOND_NAME":"","EMAIL":"newsteach@gmail.com","LAST_LOGIN":"2023-04-18T14:41:47+03:00","DATE_REGISTER":"2022-03-05T03:00:00+03:00","TIME_ZONE":"","IS_ONLINE":"N","TIME_ZONE_OFFSET":"0","TIMESTAMP_X":[],"LAST_ACTIVITY_DATE":[],"PERSONAL_GENDER":"","PERSONAL_WWW":"","PERSONAL_BIRTHDAY":"","PERSONAL_PHOTO":"https://cdn-ru.bitrix24.ru/b19663274/main/dce/dce5143007306c81f36e3dea412a5825/8cd32be06028d93b2ad24cfb4aa12fb0.jpg","PERSONAL_MOBILE":"+79372825893","PERSONAL_CITY":"","WORK_PHONE":"89372825893","WORK_POSITION":"","UF_EMPLOYMENT_DATE":"","UF_DEPARTMENT":[1],"UF_USR_1670855509849":[22664,22666,22668],"USER_TYPE":"employee"}],"total":1,"time":{"start":1681907914.9332,"finish":1681907915.0084,"duration":0.075182914733887,"processing":0.031002044677734,"date_start":"2023-04-19T15:38:34+03:00","date_finish":"2023-04-19T15:38:35+03:00","operating_reset_at":1681908514,"operating":0.26158595085144}},
					error_data: { result: [] },
				}, 
				getCatalog: {
					error: false,
					data: {
						result: [{"ID":"13418","TITLE":"Посёлок Гринфилд. Ул центральная д. 267","TYPE_ID":"SALE","STAGE_ID":"C22:UC_FN6W36","PROBABILITY":null,"CURRENCY_ID":"RUB","OPPORTUNITY":"1.00","IS_MANUAL_OPPORTUNITY":"Y","TAX_VALUE":null,"LEAD_ID":null,"COMPANY_ID":"0","CONTACT_ID":"5444","QUOTE_ID":null,"BEGINDATE":"2022-12-13T03:00:00+03:00","CLOSEDATE":"2023-04-18T03:00:00+03:00","ASSIGNED_BY_ID":"66","CREATED_BY_ID":"0","MODIFY_BY_ID":"0","DATE_CREATE":"2022-12-13T11:33:10+03:00","DATE_MODIFY":"2023-04-18T16:51:23+03:00","OPENED":"Y","CLOSED":"N","COMMENTS":null,"ADDITIONAL_INFO":null,"LOCATION_ID":null,"CATEGORY_ID":"18","STAGE_SEMANTIC_ID":"","IS_NEW":"N","IS_RECURRING":"N","IS_RETURN_CUSTOMER":"N","IS_REPEATED_APPROACH":"N","SOURCE_ID":"4|MOBILON_WHATS_APP","SOURCE_DESCRIPTION":null,"ORIGINATOR_ID":null,"ORIGIN_ID":null,"MOVED_BY_ID":"66","MOVED_TIME":"2023-04-18T16:51:22+03:00","UTM_SOURCE":null,"UTM_MEDIUM":null,"UTM_CAMPAIGN":null,"UTM_CONTENT":null,"UTM_TERM":null,"LAST_ACTIVITY_BY":"0","LAST_ACTIVITY_TIME":"2022-12-13T11:33:09+03:00"},{"ID":"14354","TITLE":"Страница калькулятора","TYPE_ID":null,"STAGE_ID":"C6:LOSE","PROBABILITY":null,"CURRENCY_ID":"RUB","OPPORTUNITY":"0.00","IS_MANUAL_OPPORTUNITY":"N","TAX_VALUE":null,"LEAD_ID":null,"COMPANY_ID":"0","CONTACT_ID":null,"QUOTE_ID":null,"BEGINDATE":"2023-02-06T03:00:00+03:00","CLOSEDATE":"2023-02-06T03:00:00+03:00","ASSIGNED_BY_ID":"66","CREATED_BY_ID":"66","MODIFY_BY_ID":"0","DATE_CREATE":"2023-02-06T11:18:58+03:00","DATE_MODIFY":"2023-04-17T17:43:49+03:00","OPENED":"N","CLOSED":"Y","COMMENTS":"Нужны доставка и монтаж сеток на три распашных створки пластиковых окон (две комнаты и кухня). Можно сделать расчет для обычных москитных сеток и отдельно для сеток Антикот?","ADDITIONAL_INFO":null,"LOCATION_ID":null,"CATEGORY_ID":"6","STAGE_SEMANTIC_ID":"F","IS_NEW":"N","IS_RECURRING":"N","IS_RETURN_CUSTOMER":"N","IS_REPEATED_APPROACH":"N","SOURCE_ID":null,"SOURCE_DESCRIPTION":null,"ORIGINATOR_ID":null,"ORIGIN_ID":null,"MOVED_BY_ID":"26","MOVED_TIME":"2023-02-06T17:06:42+03:00","UTM_SOURCE":null,"UTM_MEDIUM":null,"UTM_CAMPAIGN":null,"UTM_CONTENT":null,"UTM_TERM":null,"LAST_ACTIVITY_BY":"66","LAST_ACTIVITY_TIME":"2023-02-06T11:18:58+03:00"},{"ID":"13402","TITLE":"ТЕСТ НЕ УДАЛЯТЬ","TYPE_ID":"SALE","STAGE_ID":"C14:LOSE","PROBABILITY":null,"CURRENCY_ID":"RUB","OPPORTUNITY":"0.00","IS_MANUAL_OPPORTUNITY":"N","TAX_VALUE":"0.00","LEAD_ID":null,"COMPANY_ID":"0","CONTACT_ID":"578","QUOTE_ID":null,"BEGINDATE":"2022-12-12T03:00:00+03:00","CLOSEDATE":"2022-12-15T03:00:00+03:00","ASSIGNED_BY_ID":"66","CREATED_BY_ID":"66","MODIFY_BY_ID":"0","DATE_CREATE":"2022-12-12T17:05:06+03:00","DATE_MODIFY":"2023-04-17T17:43:09+03:00","OPENED":"Y","CLOSED":"Y","COMMENTS":"","ADDITIONAL_INFO":null,"LOCATION_ID":null,"CATEGORY_ID":"14","STAGE_SEMANTIC_ID":"F","IS_NEW":"N","IS_RECURRING":"N","IS_RETURN_CUSTOMER":"Y","IS_REPEATED_APPROACH":"N","SOURCE_ID":"CALL","SOURCE_DESCRIPTION":"","ORIGINATOR_ID":null,"ORIGIN_ID":null,"MOVED_BY_ID":"66","MOVED_TIME":"2022-12-15T01:53:02+03:00","UTM_SOURCE":null,"UTM_MEDIUM":null,"UTM_CAMPAIGN":null,"UTM_CONTENT":null,"UTM_TERM":null,"LAST_ACTIVITY_BY":"26","LAST_ACTIVITY_TIME":"2022-12-15T01:45:49+03:00"},
						{"ID":"1341800000","TITLE":"Посёлок Гринфилд. Ул центральная д. 267","TYPE_ID":"SALE","STAGE_ID":"C22:UC_FN6W36","PROBABILITY":null,"CURRENCY_ID":"RUB","OPPORTUNITY":"1.00","IS_MANUAL_OPPORTUNITY":"Y","TAX_VALUE":null,"LEAD_ID":null,"COMPANY_ID":"0","CONTACT_ID":"5444","QUOTE_ID":null,"BEGINDATE":"2022-12-13T03:00:00+03:00","CLOSEDATE":"2023-04-18T03:00:00+03:00","ASSIGNED_BY_ID":"66","CREATED_BY_ID":"0","MODIFY_BY_ID":"0","DATE_CREATE":"2022-12-13T11:33:10+03:00","DATE_MODIFY":"2023-04-18T16:51:23+03:00","OPENED":"Y","CLOSED":"N","COMMENTS":null,"ADDITIONAL_INFO":null,"LOCATION_ID":null,"CATEGORY_ID":"18","STAGE_SEMANTIC_ID":"","IS_NEW":"N","IS_RECURRING":"N","IS_RETURN_CUSTOMER":"N","IS_REPEATED_APPROACH":"N","SOURCE_ID":"4|MOBILON_WHATS_APP","SOURCE_DESCRIPTION":null,"ORIGINATOR_ID":null,"ORIGIN_ID":null,"MOVED_BY_ID":"66","MOVED_TIME":"2023-04-18T16:51:22+03:00","UTM_SOURCE":null,"UTM_MEDIUM":null,"UTM_CAMPAIGN":null,"UTM_CONTENT":null,"UTM_TERM":null,"LAST_ACTIVITY_BY":"0","LAST_ACTIVITY_TIME":"2022-12-13T11:33:09+03:00"},{"ID":"134189","TITLE":"Посёлок Гринфилд. Ул центральная д. 267","TYPE_ID":"SALE","STAGE_ID":"C22:UC_FN6W36","PROBABILITY":null,"CURRENCY_ID":"RUB","OPPORTUNITY":"1.00","IS_MANUAL_OPPORTUNITY":"Y","TAX_VALUE":null,"LEAD_ID":null,"COMPANY_ID":"0","CONTACT_ID":"5444","QUOTE_ID":null,"BEGINDATE":"2022-12-13T03:00:00+03:00","CLOSEDATE":"2023-04-18T03:00:00+03:00","ASSIGNED_BY_ID":"66","CREATED_BY_ID":"0","MODIFY_BY_ID":"0","DATE_CREATE":"2022-12-13T11:33:10+03:00","DATE_MODIFY":"2023-04-18T16:51:23+03:00","OPENED":"Y","CLOSED":"N","COMMENTS":null,"ADDITIONAL_INFO":null,"LOCATION_ID":null,"CATEGORY_ID":"18","STAGE_SEMANTIC_ID":"","IS_NEW":"N","IS_RECURRING":"N","IS_RETURN_CUSTOMER":"N","IS_REPEATED_APPROACH":"N","SOURCE_ID":"4|MOBILON_WHATS_APP","SOURCE_DESCRIPTION":null,"ORIGINATOR_ID":null,"ORIGIN_ID":null,"MOVED_BY_ID":"66","MOVED_TIME":"2023-04-18T16:51:22+03:00","UTM_SOURCE":null,"UTM_MEDIUM":null,"UTM_CAMPAIGN":null,"UTM_CONTENT":null,"UTM_TERM":null,"LAST_ACTIVITY_BY":"0","LAST_ACTIVITY_TIME":"2022-12-13T11:33:09+03:00"},],
					},
					error_data: { result: [] },
				},
				solve: {
					error: false,
					data: { result: true },
					error_data: { result: false },
				},
			},
		},
	};

	return {
		get: function(){ return self; },
	};
})();