<?php include 'simple_header.php'; ?>

<?php if( isset($data['PaymentData']) && $data['PaymentData']) {
		$p = $data['PaymentData'];
	?>
	
	<?php if( isset($p['operation']) ) { ?> 
		<h2><?=$Model -> simple_getType($p['operation'])?></h2>
	<?php }?>
	
	<?php if( isset($p['goods']) ) {
		foreach ($p['goods'] as $indx => $val) { ?>
			<span style="font-size: 16px"><?=$indx+1?>. <?=$val['name']?></span><br/>
			

			<div style="margin-left: 15px; margin-right: 5px;">
			<?php if( isset($val['code']) && $val['code'] ) {?>
				<span class="fl">Код позиции</span> <span class="fr"><?=$val['code']?></span>
			<?php } ?>
			<?php if( isset($val['dep']) && $val['dep'] ) {?>
				<span class="fl"><?=$val['dep']?></span> <span class="fr"></span>
			<?php } ?>
			<?php if( isset($val['description']) && $val['description'] ) {?>
				<span class="fl"><?=$val['description']?></span><span class="fr"></span> 
			<?php } ?>

			<span class="fl"><?=$val['quantity']?> шт x <?=$val['price']?>р</span> 
			<span class="fr"><?=$val['quantity'] * $val['price']?>р</span>
			
			<?php if( isset($val['discount']) && $val['discount'] > 0 ) {?>
				<span class="fl">Скидка</span> <span class="fr">-<?=$val['discount']?>р</span>
			<?php } ?>
			<?php if( isset($val['discount']) && $val['discount'] < 0 ) {?>
				<span class="fl">Наценка</span> <span class="fr"><?=$val['discount']?>р</span>
			<?php } ?>
		
			<span class="fl">
			<?php if( isset($val['tax']) && $val['tax'] ) {?>
				<?=$Model->simple_getTaxType($val['tax'])?>;
			<?php } ?>
			<?php if( isset($val['itemtype']) && $val['itemtype'] ) {?>
					<?=$Model->simple_getItemType($val['itemtype'])?>;
			<?php } ?>
			<?php if( isset($val['paymentMode']) && $val['paymentMode'] ) {?>
					<?=$Model->simple_getPaymentMode($val['paymentMode'])?>;
			<?php } ?>
			</span>
			<span class="fr"></span>

			<?php if( isset($val['tags']) && $val['tags'] && count($val['tags']) ) { ?>
					<?php foreach ( $Model -> simple_parseTags( $val['tags'] ) as $row) { ?>
						<span class="fl">
							<?= $row ?>
						</span>
						<span class="fr"></span>
					<?php } ?>
			<?php } ?>

			<span class="fl">Стоимость</span>
			<span class="fr">= <?=$val['_Total']?>р</span>
			</div>
			

			<div class="cr"></div>
			<div class="cl"></div>
			<hr class="dashed">
	<?php } } ?>

	<?php if( isset($p['cmd']) && count($p['cmd']) ){ 
		foreach ($p['cmd'] as $str) {
		?>
		<pre><?=$str?></pre>
	<?php } } ?>


	<?php if( isset($p['_Total']) ) { ?> 
	<h2 class="fl">Итого<h2><h2 class="fr">= <?=$p['_Total']?>р</h2>
	<div class="cr"></div>
	<?php }?>

	<hr>
	<div style="margin-left: 25px; margin-right: 15px;">
		<h3 class="fl">Внесено</h3>
		<span class="fl"><?=$Model->simple_getOperationType($p['paymentType'])?></span> <span class="fr"><?=$p['inserted']?>р</span>
		
		<?php if( isset($p['change']) && $p['change'] ) {?>
			<span class="fl">Сдача</span> <span class="fr"><?=$p['change']?>р</span>
			<?php if( isset($p['dispensed']) && $p['dispensed'] ) {?>
				<span class="fl">Выдано</span> <span class="fr"><?=$p['dispensed']?>р</span>
			<?php } ?>
		<?php } ?>
		<div class="cr"></div>
	</div>
	
	<?php if( isset($p['sum']) ) { ?> 
		<h2 class="fl">Итог<h2><h2 class="fr">= <?=$p['sum']?>р</h2>
		<div class="cr"></div>
	<?php }?>

	<div style="margin-left: 25px; margin-right: 15px;">
		<?php $t0 = $Model->simple_getTaxSum($p['goods'], 6); if( $t0 ) { ?>
			<h3 class="fl">Сумма без НДС</h3>
			<h3 class="fr"><?=$t0?>р</h3>
		<? } ?>
		<?php $t00 = $Model->simple_getTaxSum($p['goods'], 5); if( $t00 ) { ?>
			<h3 class="fl">Сумма без НДС</h3>
			<h3 class="fr"><?=$t00?>р</h3>
		<? } ?>
		<?php $t10 = $Model->simple_getTaxSum($p['goods'], 2); if( $t10 ) { ?>
			<h3 class="fl">Сумма НДС10%</h3>
			<h3 class="fr"><?=$t10?>р</h3>
		<? } ?>
		<?php $t110 = $Model->simple_getTaxSum($p['goods'], 4); if( $t110 ) { ?>
			<h3 class="fl">НДС 10/110</h3>
			<h3 class="fr"><?=$t110?>р</h3>
		<? } ?>
		<?php $t20 = $Model->simple_getTaxSum($p['goods'], 7); if( $t20 ) { ?>
			<h3 class="fl">Сумма НДС20%</h3>
			<h3 class="fr"><?=$t20?>р</h3>
		<? } ?>
		<?php $t120 = $Model->simple_getTaxSum($p['goods'], 8); if( $t120 ) { ?>
			<h3 class="fl">НДС 20/120</h3>
			<h3 class="fr"><?=$t120?>р</h3>
		<? } ?>
		<div class="cr"></div>
	</div>


<?php } ?>

<hr/>


<?php if( isset($p['address']) && $p['address']) {?>
	<?php if( strpos( $p['address'], '@' ) === false ) { ?>
		Телефон: <?=$p['address']?><br/>
	<?php } else { ?>
		<!-- Email: <?=$p['address']?><br/> -->
	<?php } ?> 

	<?php if(isset($data['SellerData']) ) { ?>
		<?php if( isset($data['SellerData']['Email']) && $data['SellerData']['Email'] ) {?>
			Email отправителя: <?=$data['SellerData']['Email']?><br/>
		<?php } ?>
	<?php }?>
<?php } ?>

<div class='fl' style="width: 54%">
<?php if( isset($p['date_time']) && $p['date_time']) {?>
	<?=$p['date_time']?><br/>
<?php } ?>
<?php if( isset($p['check_number']) && $p['check_number'] ) {?>
	Номер чека: <?=$p['check_number']?><br/>
<?php } ?>
<?php if( isset($p['shift_number']) && $p['shift_number'] ) {?>
	Номер смены: <?=$p['shift_number']?><br/>
<?php } ?>
<?php if( isset($p['vend_address']) && $p['vend_address'] ) {?>
	Адрес: <?=$p['vend_address']?><br/>
<?php } ?>
<?php if( isset($p['vend_mesto']) && $p['vend_mesto'] ) {?>
	Место: <?=$p['vend_mesto']?><br/>
<?php } ?>
<?php if( isset($p['vend_num_avtovat']) && $p['vend_num_avtovat'] ) {?>
	Номер терминала: <?=$p['vend_num_avtovat']?><br/>
<?php } ?>

<?php if( isset($p['site_fns']) && $p['site_fns'] ) {?>
	Сайт ФНС: <?=$p['site_fns']?><br/>
<?php } ?>
<?php if( isset($p['kkt_operator']) && $p['kkt_operator'] ) {?>
	Оператор ККТ: <?=$p['kkt_operator']?><br/>
<?php } ?>
<?php if( isset($p['tags']) && $p['tags'] && count($p['tags']) ) { ?>
	<?php foreach ( $Model -> simple_parseTags( $p['tags'] ) as $row) { ?>
		<?= $row ?> <br/>
	<?php } ?>
<?php } ?>
<?php if( isset($p['sno']) ) {?>
	СНО: <?=$Model -> simple_getSNO( $p['sno'] )?><br/>
<?php } ?>

<?php if(isset($data['SellerData']) ) { ?>
	<?php if( isset($data['SellerData']['SecondName']) && $data['SellerData']['SecondName'] ) {?>
		<?=$data['SellerData']['SecondName']?><br/>
	<?php } ?>
	<?php if( isset($data['SellerData']['INN']) && $data['SellerData']['INN'] ) {?>
		ИНН: <?=$data['SellerData']['INN']?><br/>
	<?php } ?>
	<?php if( isset($data['SellerData']['KKTSerial']) && $data['SellerData']['KKTSerial'] ) {?>
		ЗН ККТ: <?=$data['SellerData']['KKTSerial']?><br/>
	<?php } ?>
	<?php if( isset($data['SellerData']['KKTReg']) && $data['SellerData']['KKTReg'] ) {?>
		РН ККТ: <?=$data['SellerData']['KKTReg']?><br/>
	<?php } ?>
<?php } ?>

<?php if( isset($p['fn_num']) && $p['fn_num'] ) {?>
	ФН: <?=$p['fn_num']?><br/>
<?php } ?>
<?php if( isset($p['num_fp']) && $p['num_fp'] ) {?>
	ФП: <?=$p['num_fp']?><br/>
<?php } ?>
<?php if( isset($p['num_fd']) && $p['num_fd'] ) {?>
	ФД: <?=$p['num_fd']?><br/>
<?php } ?>

</div>

<div class="fr" style="width: 45%;">
<div style="padding: 1px; height: 140px;">	
	<?php if( isset($p['qr_code']) && $p['qr_code']) {?>
		<img class="qr" src="data:image/png;base64,<?=QR::getBase64Code($p['qr_code'], 'Q', 3)?>">
	<?php } ?>
</div>
</div>

<?php include 'simple_footer.php'; ?>
