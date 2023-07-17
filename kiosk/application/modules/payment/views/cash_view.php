<div class="main-wrap">
	<header>
		<figure>
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

	<main class="flex-wrap">
		<div class="dispense-wrap" >
            <div class="payment-header">
                <h1 id="title">Сумма к оплате: <span id="sum"></span> <label class="rub">руб</label></h1>
            </div>
			
			<div class="color-line" style="padding: 20px;">
				<p style="text-align: center;font-size: 48px; color: white;"><span id="inserted"> </span> <label class="rub"> руб</label></p>
			</div>
            
			<div style="margin-top: 10px">
				<div style="max-width: 800px; height: 15px; margin: 0 auto; border-left: 1px solid grey; border-right: 1px solid grey; border-bottom: 1px solid grey; border-radius: 1px; display: flex; flex-flow: row nowrap; justify-content: center;">
					<label style="background-color: white; color: grey; height: 15px;  text-transform: uppercase; padding-left: 25px; padding-right: 25px; margin-top: 8px;">Внесено</label>
				</div>
				
				<div style="margin-top: 35px; display: flex; flex-flow: row wrap; justify-content: center; align-items: center;" id="banknotes"> 
				</div>
			</div>
			
		</div>
	</main>


	<footer>
		<button id='cancel'>Отмена</button>
		<div class="logo placeholder" style="min-width: 400px;">
			<div style="width: 200px; margin: 0 auto">
				<img style="position: relative; top: -138px;" src="/<?=KIOSK_DOMAIN?>/public/pics/cash.png" alt="">
			</div>
		</div>
		<button id='confirm'>Оплатить</button>
	</footer>
</div>

<script type="text/javascript">
	
	window.DEVICE_LIMITS = JSON.parse('<?=json_encode($b2b)?>');
	console.log(window.DEVICE_LIMITS);
	
	window.SELLER_DATA = <?=json_encode($seller)?>;
	window._DEVICES = <?=json_encode($devices)?>;
</script>
