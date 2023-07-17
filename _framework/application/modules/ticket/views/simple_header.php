
<?php $_h = $data ?>

<?php if( isset($_h['SellerData']) && $_h['SellerData']) {?>
<div class="center" style="margin-bottom: 0px; font-size: 14px;">
	
	<?php if( isset($_h['SellerData']['img']) && $_h['SellerData']['img'] ){?>
		<div style="width: 100%; margin-bottom: 3px;">
			<img class="qr" src="<?=$Model->get_logo($_h['SellerData']['img'])?>">
		</div>
	<?php } ?>

	<?php if( isset($_h['SellerData']['Name']) && $_h['SellerData']['Name']) {?>
		<h1><?=$_h['SellerData']['Name']?></h1>
	<?php } ?>
	<?php if( isset($_h['SellerData']['FullName']) && $_h['SellerData']['FullName']) {?>
		<h2><?=$_h['SellerData']['FullName']?></h2>
	<?php } ?>

	<?php if( isset($_h['SellerData']['INN']) && $_h['SellerData']['INN']) {?>
		ИНН: <?=$_h['SellerData']['INN']?>
	<?php } ?>
	<?php if( isset($_h['SellerData']['OGRNIP']) && $_h['SellerData']['OGRNIP']) {?>
		ОГРНИП: <?=$_h['SellerData']['OGRNIP']?>
	<?php } ?>
	<br/>

	<div class="w-100 icons-wrap" style="font-size:16px">
	
	<?php if( isset($_h['SellerData']['Phone']) && $_h['SellerData']['Phone']) {?>
		<span>
			<svg class="svg-icon"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
				<path fill="currentColor" d="M256 240a80 80 0 1 0 80 80 80 80 0 0 0-80-80zm0 128a48 48 0 1 1 48-48 48.05 48.05 0 0 1-48 48zm114.43-175.75A64 64 0 0 0 314.86 160H197.14a64 64 0 0 0-55.57 32.25L36.21 376.62A32 32 0 0 0 32 392.5V448a32 32 0 0 0 32 32h384a32 32 0 0 0 32-32v-55.5a32 32 0 0 0-4.21-15.88zM448 448H64v-55.5l105.36-184.38A32.07 32.07 0 0 1 197.14 192h117.72a32.07 32.07 0 0 1 27.78 16.12L448 392.5zm52.27-329.8C431.72 63.21 344.81 32 256 32S80.28 63.21 11.73 118.2A32.17 32.17 0 0 0 0 143.29V208a16 16 0 0 0 16 16h70.11a16 16 0 0 0 14.31-8.85L128 152c39.9-17.28 83.23-24 128-24 44.77 0 88.08 6.72 128 24l27.58 63.15a16 16 0 0 0 14.31 8.85H496a16 16 0 0 0 16-16v-64.71a32.17 32.17 0 0 0-11.73-25.09zM480 192h-43.61l-23.07-52.81-5-11.55-11.57-5C355.33 104.71 309.3 96 256 96s-99.32 8.71-140.71 26.63l-11.57 5-5 11.55L75.61 192H31.94l-.18-48.84A359.7 359.7 0 0 1 256 64a357.89 357.89 0 0 1 224 79.29z">
				</path>
			</svg>
		</span>
		<?=$_h['SellerData']['Phone']?>
		</br>
	<?php } ?>
	</div>	
	
	<?php if( isset($_h['SellerData']['Site']) && $_h['SellerData']['Site']) {?>
		<h3><?=$_h['SellerData']['Site']?></h2>
	<?php } ?>	
	<?php if( isset($_h['SellerData']['Instagram']) && $_h['SellerData']['Instagram']) {?>
		<h3><?=$_h['SellerData']['Instagram']?></h2>
	<?php } ?>		
	
	<?php if( isset($_h['SellerData']['WorkHours']) && $_h['SellerData']['WorkHours']) {?>
		<h3><?=$_h['SellerData']['WorkHours']?></h3>
		<br/>
	<?php } ?>

	<?php if( isset($_h['SellerData']['Address']) && $_h['SellerData']['Address']) {?>
		<?=$_h['SellerData']['Address']?>
	<?php } ?>

	<?php if( isset($_h['SellerData']['CmdBefore']) && count($_h['SellerData']['CmdBefore']) ){ 
		?><br/>
		<?foreach ($_h['SellerData']['CmdBefore'] as $str) {
		?>
		<?=$str?><br/>
	<?php } } ?>
</div>

<?php } ?>