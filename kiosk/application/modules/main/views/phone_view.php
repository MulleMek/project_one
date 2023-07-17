<div class="main-wrap">

	<header>
		<figure style="">
			<img src="/<?=KIOSK_DOMAIN?>/public/pics/logo.png" alt="">
			<figcaption></figcaption>
		</figure>
		<div class="header-clock">
			<div class="clock-title">Список заказов</div>
			<div class="hours-line">
				<div class="hours-img">
					<img src="/kiosk/public/pics/clock.svg" />
				</div>
				<div id="clock-hours"></div>
			</div>
		</div>
	</header>

	<main>
		<div class="pin-pad-wrap">
			<div class="pin-input">
				<div class="pin-left-container">
					<div style="width: 100%; min-width: 420px;">
						<h1 class="centered" style="width:100%;">Введите номер телефона</h1>
					</div>
					<div>
						<input type="text" class="display-none" placeholder="+7 (___) ___ __ __" id='phone' maxlength='12'>
						<input type="text" placeholder="+7 (___) ___ __ __" id='phone-preview' maxlength='18'>
					</div>
				</div>	
			</div>
			<div class="pin-pad" id='keyboard'>
				<div class="k-line">
					<div class="number vk-button" data-value='1' >1</div>
					<div class="number vk-button" data-value='2' >2</div>
					<div class="number vk-button" data-value='3' >3</div>
				</div>
				<div class="k-line">
					<div class="number vk-button" data-value='4' >4</div>
					<div class="number vk-button" data-value='5' >5</div>
					<div class="number vk-button" data-value='6' >6</div>
				</div>
				<div class="k-line">
					<div class="number vk-button" data-value='7' >7</div>
					<div class="number vk-button" data-value='8' >8</div>
					<div class="number vk-button" data-value='9' >9</div>
				</div>
				<div class="k-line">
					<div class="number vk-button icon" style="width: 175px"  data-value='del' ><i class="icon-delete"></i></div>
					<div class="number vk-button" data-value='0' >0</div>
				</div>
			</div>
		</div>
	</main>

	<footer>
		<button class='hide'>Отмена</button>
		<div style="min-width: 230px;"></div>
		<button id='confirm'>Продолжить</button>
	</footer>
</div>

<!-- FIO POPUP -->
<div class="popup display-none fio-popup" id="fio-popup">
	 <div class="popup-inner">
	 <div class="popup-inner-wrapper">
		  <p class="pop-title" id="fio-title"></p>
		  <p class="text" id="fio-notice"></p>

		  <div class="fio-scroller" id="scroller"> 
			  <div class="fio-list" id="fio-list"> 

			  </div>
		  </div>

	 </div>
	 </div>

	 <div class="buttons">
		  <button id="fio-cancel">Отмена</button>
		  <button id="fio-confirm" class="hide">Выбрать</button>
	 </div>
</div>
