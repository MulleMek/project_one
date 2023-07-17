<!-- POPUP -->
<div class="popup hide" id="popup">
	<div class="popup-inner">
		<div class="popup-inner-wrapper">
			<div class="popup-content"> 
				<div class="pop-title" data-popup='main'></div>
				<p class="text" data-popup="notice"></p>
			</div>

			<div class='qr-wrapper display-none' data-popup="specific">
				<div class="qr-image" data-popup="qr-code"></div>
				<p class="qr-notice display-none" data-popup="qr-notice"></p>
			</div>
		</div>
	</div>
	
	<div class="buttons display-none" data-popup="buttons">
		<button data-popup="button1" class="button cancel"></button>
		<button data-popup="button2" class="button"></button>
	</div>
</div>

<!-- PRELOADER -->
<? if (isset($preloader) && $preloader): ?>
	<div class="preloader-wrap show">
<? else: ?>
	<div class="preloader-wrap hide">
<? endif ?>
	<svg class="preloader" height="50" width="50">
	  <circle class="path" cx="25" cy="25.2" r="19.9" fill="none" stroke-width="3" stroke-miterlimit="10" />
	</svg>
</div>

<style type="text/css">
	<? if ( !Config::get("style", "cursor" )): ?>
		html,
		body,
		button,
		input,
		textarea,
		input[type="text"],
		input[type="select"],
		input[type="radio"],
		*,
		*:after,
		*:before {cursor: none}
	<? endif ?>
	
</style>

<?php
	if ( $innerTemplates ) {
		include 'application'.$innerTemplates;
	}
?>
