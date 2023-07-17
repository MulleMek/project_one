var FIOController = (function($, Helper){

	var btn = {
		popup: $("#fio-popup"),
		
		cancel: $("#fio-cancel"),
		next: $("#fio-confirm"),
	
		title: $("#fio-title"),
		notice: $("#fio-notice"),
		list: $("#fio-list"),
	};

	var _promise_callback = null;
	var scroller = null;

	function _show( title, accounts ){
		btn.next.off('click').on('click', nextHandler);
		btn.cancel.off('click').on('click', cancelHandler);
		btn.popup.removeClass("display-none");

		if( title ) btn.title.html(title);
		else btn.title.html("");

		btn.list.html("");

		// if( notice ) btn.notice.html(notice);
		// else btn.notice.html(notice);
		
		accounts.forEach( (el, index, array ) => {
			let button =  $("<button class='btn'></button>");
			button.text(el.fio + ", " + el.vc_account );

			button.on("click", _ => {
				end({ next: true, account: el });
			});

			btn.list.append(button);
		});

		if( scroller ) scroller.destroy();
		scroller = Helper.createScroll(document.getElementById('scroller'));
	};
	function _hide(){
		btn.popup.addClass("display-none");
		btn.next.off('click');
		btn.cancel.off('click');

		if( scroller ){
			scroller.destroy();
			scroller = null;
		}
	};

	
	function cancelHandler(){
		return end({ cancel: true });
	};


	function nextHandler(){
		
		////// ....

		return end({ next: true });
	};

	function end( data ){
		Helper.hidePreloader();
		_hide();
		_promise_callback( data );
	};


	function _init( title, accounts ){		
		_show( title, accounts );
		Helper.hidePreloader();
		return new Promise(resolve => _promise_callback = resolve );
	};

	return {
		show: _init,
	};

})($, Helper);
