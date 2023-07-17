<br/>
<h1 class="center" style="margin-bottom: 12px; font-size: 17px;font-weight: normal;">
	Отчет о состоянии счетчиков ККТ<br/>
	<?php if( isset($data['CloseOn']) && $data['CloseOn']) {?>
		С Гашением
	<?php } else { ?>
		Без гашения
	<?php } ?>
</h1>

<?php include 'webkassa_header.php'; ?>

<?php if( isset($data['ReportNumber']) && $data['ReportNumber']) {?>
	Документ № <?=$data['ReportNumber']?><br/>
<?php } ?>
<?php if( isset($data['StartOn']) && $data['StartOn']) {?>
	Начало смены: <?=$data['StartOn']?><br/>
<?php } ?>
<?php if( isset($data['CloseOn']) && $data['CloseOn']) {?>
	Конец смены: <?=$data['CloseOn']?><br/>
<?php } ?>
<?php if( isset($data['ReportOn']) && $data['ReportOn']) {?>
	Дата Время: <?=$data['ReportOn']?><br/>
<?php } ?>

<?php foreach ($Types as $type => $typeName) { ?>
<?php if( isset($data[$type]) && $data[$type]) {
	$tmp = $data[$type];
	?>
	<hr/>
	<h1 style="font-size: 19px;font-weight: normal;margin:5px;"><?=$typeName?>: 
		<?php if( isset($tmp['Count']) ) {?>
			<?=$tmp['Count']?> <!-- операц. -->
		<?php } ?>
	</h1>
	
	<div style="margin-left: 2px; margin-bottom:3px; font-size:14px">
	<?php if( isset($tmp['PaymentsByTypesApiModel']) && $tmp['PaymentsByTypesApiModel']) {
		foreach ($tmp['PaymentsByTypesApiModel'] as $val) {
		?>
		<?=$Model->webkassa_getOperationType($val['Type'])?>: <?=$val['Sum']?> <?=$Currency?><br/>
	<?php } } ?>
	</div>
	<?php if( isset($tmp['Discount']) && $tmp['Discount'] ) {?>
		Скидка: <?=$tmp['Discount']?> <?=$Currency?><br/>
	<?php } ?>
	<?php if( isset($tmp['Markup']) && $tmp['Markup'] ) {?>
		Наценка: <?=$tmp['Markup']?> <?=$Currency?><br/>
	<?php } ?>
	<?php if( isset($tmp['Taken']) ) {?>
		Получено: <?=$tmp['Taken']?> <?=$Currency?><br/>
	<?php } ?>
	<?php if( isset($tmp['Change']) && $tmp['Change'] ) {?>
		Сдача: <?=$tmp['Change']?> <?=$Currency?><br/>
	<?php } ?>
	<?php /* ?????? странные числа */ if( isset($tmp['TotalCount']) && $tmp['TotalCount'] ) {?>
		Общ. Кол-во: <?=$tmp['TotalCount']?><br/>
	<?php } ?>
	<?php if( isset($tmp['VAT']) ) {?>
		НДС: <?=$tmp['VAT']?> <?=$Currency?><br/>
	<?php } ?>
<?php } ?>
<?}?>

<br/>
<hr/>

<?php if( isset($data['StartNonNullable']) && $data['StartNonNullable']) {?>
	<h1 style="font-size: 19px;font-weight: normal;margin:5px;">Необнуляемые суммы<br/>на начало смены:</h1>
	<div style="margin-left: 2px; margin-bottom:3px; font-size:14px">
	<?php foreach ($Types as $type => $typeName) { 
		if( isset($data['StartNonNullable'][$type]) ) {
	?>
		<?=$typeName?>: <?=$data['StartNonNullable'][$type]?> <?=$Currency?><br/>
	<?}}?>
	</div>
<?php } ?>
<hr/>
<?php if( isset($data['EndNonNullable']) && $data['EndNonNullable']) {?>
	<h1 style="font-size: 19px;font-weight: normal;margin:5px;">Необнуляемые суммы<br/>на конец смены:</h1>
	<div style="margin-left: 2px; margin-bottom:3px; font-size:14px">
	<?php foreach ($Types as $type => $typeName) { 
		if( isset($data['EndNonNullable'][$type]) ) {
	?>
		<?=$typeName?>: <?=$data['EndNonNullable'][$type]?> <?=$Currency?><br/>
	<?}}?>
	</div>
<?php } ?>

<hr/>

<?php if( isset($data['PutMoneySum']) && $data['PutMoneySum']) {?>
	Внесение: <?=$data['PutMoneySum']?> <?=$Currency?><br/>
<?php } ?>
<?php if( isset($data['TakeMoneySum']) && $data['TakeMoneySum']) {?>
	Выплата: <?=$data['TakeMoneySum']?> <?=$Currency?><br/>
<?php } ?>

<?php if( isset($data['CashierCode']) && $data['CashierCode']) {?>
	Код Кассира: <?=$data['CashierCode']?><br/>
<?php } ?>
<?php if( isset($data['ShiftNumber']) && $data['ShiftNumber']) {?>
	Номер смены: <?=$data['ShiftNumber']?><br/>
<?php } ?>
<?php if( isset($data['DocumentCount']) && $data['DocumentCount']) {?>
	Документов: <?=$data['DocumentCount']?><br/>
<?php } ?>
<?php if( isset($data['SumInCashbox']) && $data['SumInCashbox']) {?>
	Сумма в кассе: <?=$data['SumInCashbox']?> <?=$Currency?><br/>
<?php } ?>
<?php if( isset($data['ControlSum']) && $data['ControlSum']) {?>
	Контрольная сумма: <?=$data['ControlSum']?><br/>
<?php } ?>

<br/>
<?php include 'webkassa_footer.php'; ?>
<br/>