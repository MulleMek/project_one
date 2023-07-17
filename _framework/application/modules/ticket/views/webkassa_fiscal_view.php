<br/>
<h1 class="center" style="margin-bottom: 12px; font-size: 18px;font-weight: normal;">
	Кассовый чек
</h1>

<?php include 'webkassa_header.php'; ?>

<div style="width: auto; font-size: 16px; margin: 5px;">
	<div class="fl">
	<?php if( isset($data['CheckNumber']) && $data['CheckNumber']) {?>
		Чек № <?=$data['CheckNumber']?><br/>
	<?php } ?>
	</div>

	<div class="fr">
	<?php if( isset($data['CheckOrderNumber']) && $data['CheckOrderNumber']) {?>
		Порядковый №: <?=$data['CheckOrderNumber']?><br/>
	<?php } ?>
	</div>
	<div class="fl">
	<?php if( isset($data['ShiftNumber']) && $data['ShiftNumber']) {?>
		Смена: <?=$data['ShiftNumber']?>
	<?php } ?>
	</div>
	<div class="fr">
	<?php if( isset($data['EmployeeName']) && $data['EmployeeName']) {?>
		Кассир: <?=$data['EmployeeName']?><br/>
	<?php } ?>
	</div>
	<div class="cr"></div>
</div>

<hr/>

<?php if( isset($data['_PaymentData']) && $data['_PaymentData']) {
		$p = $data['_PaymentData'];
	?>
	<?php if( isset($p['OperationType'])) {?>
		<h1><?=$Model->webkassa_getType($p['OperationType'])?></h1>
		<br/>
	<?php } ?>

	<?php if( isset($p['Positions']) ) {
		foreach ($p['Positions'] as $indx => $val) { ?>
			<span style="font-size: 18px"><?=$indx+1?>. <?=$val['PositionName']?></span><br/>
			
			<div style="margin-left: 15px; margin-right: 5px;">
			<?php if( isset($val['PositionCode']) && $val['PositionCode'] ) {?>
				<span class="fl">Код позиции</span> <span class="fr"><?=$val['PositionCode']?></span>
			<?php } ?>
			<?php if( isset($val['SectionCode']) && $val['SectionCode'] ) {?>
				<span class="fl">Код секции</span> <span class="fr"><?=$val['SectionCode']?></span>
			<?php } ?>
			
			<span class="fl"><?=$val['Count']?> <?=$Model->webkassa_getUnits($val["UnitCode"])?> x <?=$val['Price']?></span> 
			<span class="fr"><?=$val['Count'] * $val['Price']?></span>
			
			<?php if( isset($val['Discount']) && $val['Discount'] ) {?>
				<span class="fl">Скидка</span> <span class="fr">-<?=$val['Discount']?></span>
			<?php } ?>
			<?php if( isset($val['Markup']) && $val['Markup'] ) {?>
				<span class="fl">Наценка</span> <span class="fr"><?=$val['Markup']?></span>
			<?php } ?>
			<?php if( isset($val['Tax']) && $val['Tax'] ) {?>
				<span class="fl"><?=$Model->webkassa_getTaxType($val['TaxType'])?></span> <span class="fr"><?=$val['Tax']?></span>
			<?php } ?>

			<span class="fl">Стоимость</span>
			<span class="fr">= <?=$val['_Total']?></span>

			<?php if( isset($val['IsStorno']) && $val['IsStorno'] ) {?>
				<span class="fl">Сторнировано</span>
			<?php } ?>
			<?php if( isset($val['DiscountDeleted']) && $val['DiscountDeleted'] && isset($val['Discount']) && $val['Discount'] ) {?>
				<span class="fl">Сторно Скидки</span>
			<?php } ?>
			<?php if( isset($val['MarkupDeleted']) && $val['MarkupDeleted'] && isset($val['Markup']) && $val['Markup'] ) {?>
				<span class="fl">Сторно Наценки</span>
			<?php } ?>
			</div>
			
			<div class="cr"></div>
			<div class="cl"></div>
			<hr class="dashed">
			<br>
	<?php } } ?>

	<?php if( isset($p['_Total']) ) { ?> 
	<h2 class="fl">Всего<h2><h2 class="fr">= <?=$p['_Total']?></h2>
	<div class="cr">
	<?php }?>

	<div style="margin-left: 25px; margin-right: 15px;">
		<?php if( isset($p['TicketModifiers']) ) { /* ????? мб надо руками прописать что есть скидка или наценка */
			foreach ($p['TicketModifiers'] as $val) { ?>
				<span class="fl"><?=$val['Text']?></span> <span class="fr"><?=$val['Sum']?></span>
				<?php if( isset($val['Tax']) && $val['Tax'] ) {?>
					<span class="fl"></span><span class="fr"><?=$Model->webkassa_getTaxType($val['TaxType'])?>: <?=$val['Tax']?></span>
				<?php } ?>
				<div class="cr"></div>
		<?php } } ?>
	</div>

	<hr>
	<br>

	<div style="margin-left: 25px; margin-right: 15px;">
		<?php if( isset($p['Payments']) ) {
			foreach ($p['Payments'] as $val) { ?>
				<span class="fl"><?=$Model->webkassa_getOperationType($val['PaymentType'])?></span> <span class="fr"><?=$val['Sum']?></span>
		<?php } } ?>
		<?php if( isset($p['Change']) && $p['Change'] ) {?>
			<span class="fr">Сдача</span> <span class="fl"><?=$p['Change']?></span>
		<?php } ?>
		<div class="cr"></div>
	</div>
	
	<?php if( isset($p['_TotalPay']) ) { ?> 
		<h2 class="fl">Итого к оплате<h2><h2 class="fr">= <?=$p['_TotalPay']?></h2>
		<?php if( isset($p['_TotalVat']) ) { 
		 	foreach ($p['_TotalVat'] as $key => $val ) { ?>
				<span class="fl"></span><span class="fr" style="margin-right:15px">В т.ч. <?=$Model->webkassa_getTaxType($key)?>: <?=$val?></span>
		<?php }} ?>
		<div class="cr">
	<?php }?>

	<hr/>	
	
	<?php if( isset($data['cmd']) && count($data['cmd']) ){ 
		foreach ($data['cmd'] as $str) {
		?>
		<?=$str?><br/>
	<?php } } ?>

	<?php if( isset($p['CustomerEmail']) && $p['CustomerEmail']) {?>
		Адрес клиента: <?=$p['CustomerEmail']?><br/>
	<?php } ?>
<?php } ?>



<?php if( isset($data['CheckNumber']) && $data['CheckNumber']) {?>
	Фискальный признак: <?=$data['CheckNumber']?><br/>
<?php } ?>
<?php if( isset($data['DateTime']) && $data['DateTime']) {?>
	Дата Время: <?=$data['DateTime']?><br/>
<?php } ?>
<?php if( isset($data['Cashbox']) && isset($data['Cashbox']['Address']) && $data['Cashbox']['Address'] ) {?>
	<?=$data['Cashbox']['Address']?><br/>
<?php } ?>

<?php if( isset($data['_OFD']) && $data['_OFD']) {?>
	<br/>
	<?php if( isset($data['_OFD']['Name']) && $data['_OFD']['Name']) {?>
		Оператор фискальных данных: <?=$data['_OFD']['Name']?><br/>
	<?php } ?>
	<?php if( isset($data['_OFD']['Url']) && $data['_OFD']['Url']) {?>
		Для проверки чека зайдите на сайт: <?=$data['_OFD']['Url']?><br/>
	<?php } ?>
<?php } ?>


<hr/>
<div class="center" style="font-size: 16px; margin-top: 2px;">
	<h3>Фискальный чек</h3>
</div>

<?php include 'webkassa_footer.php'; ?>
