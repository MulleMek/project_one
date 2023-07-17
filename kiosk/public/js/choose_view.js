(function(){
	let __t = Helper.createActivityHandlerWithNotice({
		handler: _ => { Model.clear(); Router.redirectHome(); }, 
		timeout: 90 * 1000, 
		beforeNoticeHandler: _ => $(document).off('click'), 
		restoreHandler: _ => ( $( document ).on( 'click', __t.checkActivity ), __t.checkActivity()), 
	});

	let buttons = {
		cash: $("#cash"),
		card: $("#card"),
		ballance: $("#ballance"),
		
		cancel: $("#back"),

		cart: $("#cart"),
		cart_counter: $("#cart-counter"),
		
		
	};

	let urls = {
		category: Environment.get('domains.kiosk') + '/main/category?category_id=',
		root: Environment.get('domains.kiosk') + '/main/index',

		card: Environment.get('domains.kiosk') + '/payment/card',
		cash: Environment.get('domains.kiosk') + '/payment/cash',
		dep: Environment.get('domains.kiosk') + '/payment/deposite',
	};

	let msgs = {
		sumMessages: [ 'С вашей карты будет списан<br/>', 'С вашей карты будет списано<br/>', 'С вашей карты будет списано<br/>' ],
		depMessages: [ 'С вашего депозита будет списан<br/>', 'С вашего депозита будет списано<br/>', 'С вашего депозита будет списано<br/>' ],
		rubMessages: [' рубль', ' рубля',' рублей'],
		kopMessages: [' копейка', ' копейки', ' копеек'],
	};


	if( !Model.load() ) return Router.redirect( urls.root );
	let sum = Model.getServicesSum();
	if( !sum && Model.get('carrier') ){
		sum = Model.get('carrier').price;
	}

	let sum_rub = Math.floor(sum);
	let sum_kop = Math.round( (sum * 100) % 100 );

	let dep_rub = Math.floor(parseInt(Model.get("ballance")));
	let fio = Model.get("lastName") + " " + Model.get("firstName") + " " + Model.get("middleName");
	
	function cartUpdate(){
		let count = Model.getServicesCount();
		if( !count ){
			buttons.cart.off('click');
			buttons.cart.addClass('display-none');
		} else {
			buttons.cart_counter.html( (count > 99) ? "99+" : count );
			buttons.cart.removeClass("display-none");
		}
	};

	function onCardClick(){
		let msg = ""+ Helper.prepareIntTitle(sum_rub, msgs.sumMessages) + sum_rub + Helper.prepareIntTitle(sum_rub, msgs.rubMessages);
		if( sum_kop > 0 ){
			msg += " " + sum_kop + Helper.prepareIntTitle(sum_kop, msgs.kopMessages);	
		}
		Popup.show({
			text: msg,
			notice: "Продолжить?",
			buttons: [
				{ name: 'Нет', callback: function(){}, },
				{ name: 'Да', callback: function(){ Router.redirect( urls.card ); } }
			]
		});
	};

	function onCashClick(){
		return Router.redirect( urls.cash );
	};
	
	function onDepositeClick(){
		let msg = ""+ Helper.prepareIntTitle(sum_rub, msgs.depMessages) + sum_rub + Helper.prepareIntTitle(sum_rub, msgs.rubMessages);
		if( sum_kop > 0 ){
			msg += " " + sum_kop + Helper.prepareIntTitle(sum_kop, msgs.kopMessages);	
		}
		Popup.show({
			text: msg,
			notice: "Продолжить?",
			buttons: [
				{ name: 'Нет', callback: function(){}, },
				{ name: 'Да', callback: function(){ Router.redirect( urls.dep ); } }
			]
		});		
	}

	function onCancelClick(){
		Router.redirectHome();
	};


	$(document).ready(function(){
		let msg = ""+ sum_rub + Helper.prepareIntTitle(sum_rub, msgs.rubMessages);
		if( sum_kop > 0 ){
			msg += " " + sum_kop + Helper.prepareIntTitle(sum_kop, msgs.kopMessages);	
		}
        
        $("#sum").text( msg );
        $("#fio").text( fio );
		
		let deposite_msg = dep_rub + Helper.prepareIntTitle(dep_rub, msgs.rubMessages);
		$("#deposite").text( deposite_msg );

		if(dep_rub >= sum_rub){
			buttons.ballance.removeClass("display-none");
		} else {
			buttons.ballance.addClass("display-none");
		}

		let org = Model.getOrg();

		// if( org.settings_data ){
		// 	if( org.settings_data.cash_enable ) buttons.cash.removeClass("display-none");
		// 	if( org.settings_data.card_enable ) buttons.card.removeClass("display-none");
		// } else {
			buttons.cash.removeClass("display-none");
			buttons.card.removeClass("display-none");
		// }

		buttons.cash.click(onCashClick);
		buttons.card.click(onCardClick);
		buttons.ballance.click(onDepositeClick);
		buttons.cancel.click(onCancelClick);

		cartUpdate();

		$( document ).on( 'click', __t.checkActivity );
		__t.checkActivity();

		Helper.hidePreloader();
	});

})();
