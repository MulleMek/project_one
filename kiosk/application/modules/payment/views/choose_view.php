<div class="main-wrap">
	<header>
		<div class="logo">
			<img src="/<?=KIOSK_DOMAIN?>/public/pics/logo.png" alt="">
		</div>
	</header>

	<main style="flex-flow: column nowrap; text-align:center; ">
	    <div class="pay-info">
            <p>Здравствуйте, <span id="fio"></span></p>
            <p>К оплате: <span id="sum"></span></p>
        </div>
        <h1>Выберите способ оплаты</h1>
		<div class="choose-wrap" style="margin-top: 50px;">
			<?php if( $cash ) { ?> 
			<button id='cash' class="display-none">
				<label>Наличными</label>
			</button>
			<?php } ?>

			<?php if( $pinpad ) { ?>
			<button id='card' class="display-none">
				<label>Картой</label>
			</button>
			<?php } ?>
		</div>
	</main>

	<footer>
		<button id='back'>Назад</button>
		<button class='hide'> </button>
	</footer>
</div>

