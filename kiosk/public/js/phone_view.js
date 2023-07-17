(function(){
	let __t = Helper.createActivityHandler(Router.reload, 10 * 60 * 1000);
	
	Model.clear();
	
	let urls = {
		next: Environment.get("domains.kiosk") + '/main/services',
	};

	$("input").focus( function(){ $(this).blur(); });

	function goNext(){
		let phone = $("#phone").val();

		if( !phone ) return Helper.showPopup("Укажите номер телефона", null, 5 * 1000 );
		if( phone.length < 10 ) return Helper.showPopup("Проверьте правильность введенного номера телефона", null, 5 * 1000 );

		Helper.showPreloader();

		ProxyClient.checkPhone( phone )  
			.then( data => {		
				if( !data )
					return Helper.showPopup("Упс! Что-то не так со связью. Попробуйте еще раз", null, 5 * 1000, "Обратитесь к менеджеру" );
				
				if( data.error )
					return Helper.showPopup("Сожалеем, но мы не смогли вас найти", null, 5 * 1000, "Проверьте введенный номер или обратитесь к менеджеру" );
				
				if( !data.result.active )
					return Helper.showPopup("Ваша учетная запись не активна", null, 5 * 1000, "Обратитесь к менеджеру" );
				
				Model.setData(data.result);
				
				return Router.redirect(urls.next);
				
			}, ( err ) => {
				console.log( err );
				return Helper.showPopup("Упс! Что-то не так со связью. Попробуйте еще раз", null, 5 * 1000, "Обратитесь к менеджеру" );
			});
	};

	function onChange(){
		__t.checkActivity();
		console.log($(this).val());

		$("#phone-preview").val( Helper.maskPhone( $(this).val() , $(this) ) );
	};

	$( document ).on('ready', _ => {

		VirtualKeyboard.init({
			input: 		$("#phone"),
			keyboard: 	$("#keyboard"),
			callback: 	function() { },
		});

		$("#confirm").on("click", goNext);
		$("#phone").on("change", onChange);
		
	});

})();
