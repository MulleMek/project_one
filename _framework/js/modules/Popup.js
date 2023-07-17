var Popup = (function ($) {

	/*************************************/
	/* DOM OBJECTS                       */
	/*************************************/

	var $popup = $('#popup');
	var $mainText = $popup.find('[data-popup="main"]'),
		$noticeText = $popup.find('[data-popup="notice"]'),
		$buttonsWrap = $popup.find('[data-popup="buttons"]'),
		$leftButton = $popup.find('[data-popup="button1"]'),
		$rightButton = $popup.find('[data-popup="button2"]'),
		$close = $popup.find('[data-popup="close"]'),
		$qrWrap = $popup.find('[data-popup="specific"]'),
		$qrImage = $popup.find('[data-popup="qr-code"]'),
		$qrNotice = $popup.find('[data-popup="qr-notice"]');

	/*************************************/
	/* PRIVATE                           */
	/*************************************/

	function close() {

		$popup.removeClass("show");
		$popup.addClass("hide");

		$rightButton.off('click');
		$leftButton.off('click');
		$close.off('click');
		$popup.off("click");

		console.log("popup closed");

		//setTimeout(function(){
		$mainText.html('');
		$noticeText.html('');
		$leftButton.html('');
		$rightButton.html('');
		$leftButton.html('');

		$qrNotice.html('').addClass("display-none");
		$qrImage.html('');
		$qrWrap.addClass("display-none");


		$buttonsWrap.addClass('display-none');

		buttonWasClicked = false;
		//}, 500);

		$("#scroll-inner").show();

	}


	var buttonWasClicked = false;

	function show(options) {
		console.log('Showing popup with options', options);

		if (!options.text) {
			return false;
		}

		$mainText.html(options.text);

		if (options.notice) {
			$noticeText.html(options.notice);
		}

		if( options.qr_code && $qrImage.qrcode ){

			$qrImage.html('').qrcode({
				text: options.qr_code,
				width: 250, height: 250,
				background: 'white', foreground: 'black',
				render: 'canvas', correctLevel: QRErrorCorrectLevel.M,
			});

			if( options.qr_notice ) 
			$qrNotice.removeClass("display-none").html(options.qr_notice);

			$qrWrap.removeClass("display-none");
		}


		if (options.close && typeof options.close == "number") {
			//$buttonsWrap.removeClass('display-none');
			_show();

			setTimeout(function () {
				close();
			}, options.close * 1000);

			return;
		}

		if (options.close && typeof options.close == "function") {
			_show();

			$popup.off('click').on('click', function () {

				if (buttonWasClicked) {
					return;
				}

				buttonWasClicked = true;

				close();
				$popup.off("click");
				return options.close();
			});

			return;
		}

		if (options.buttons.length == 2) {

			var _dataLeft = options.buttons[0];

			$leftButton.html(_dataLeft.name);

			$leftButton.off('click').on('click', function () {

				if (buttonWasClicked) {
					return;
				}

				buttonWasClicked = true;

				close();
				_dataLeft.callback();
			})

			$close.off('click').on('click', function () {

				if (buttonWasClicked) {
					return;
				}

				buttonWasClicked = true;

				close();
				_dataLeft.callback();
			})


			_dataRight = options.buttons[1];

			$rightButton.html(_dataRight.name);

			$rightButton.off('click').on('click', function () {

				if (buttonWasClicked) {
					return;
				}

				buttonWasClicked = true;

				close();
				_dataRight.callback();
			})
		}

		if (options.buttons.length == 2)
			$buttonsWrap.removeClass('display-none');

		$("#scroll-inner").hide();
		_show();
	}

	function _show() {
		$popup.removeClass("hide");
		$popup.addClass("show");
	}

	return {
		show: show,
		close: close,
	};

}($));


/************************/
// EXAMPLES
/*************************


   Выводит текст и закрывает его через 3 секунды без каких-либо коллбеков:

   Popup.show({
      text: 'Терминал не выдает сдачи',
      close: 3
   })


   Выводит текст и подсказку, как только пользователь кликнет на поп-ап вызовется коллбек - в консоле появится "кликнули"

   Popup.show({
      text: 'Терминал не выдает сдачи',
      notice: 'Нажмите на экран для продолжения',
      close: function() { console.log ('кликнули!') }
   })


   Выводит текст и две кнопки со значениями, переданными в "name", по клику на каждую вызовется собственный коллбек

   Popup.show({
      text: 'Вы уверены?',
      buttons: [
         {
            name: 'Да',
            callback: function() { console.log('Пользователь сказал да') }
         },

         {
            name: 'Нет',
            callback: function() { console.log('Пользователь сказал нет') }
         }
      ]
   })

*/
