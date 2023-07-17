
<?php $_f = $data ?>

<div class="center" style="margin-top: 2px;">
	<?php if( isset($data['CashboxOfflineMode']) && $data['CashboxOfflineMode']) {?>
		Касса находится в автономном режиме<br/>
	<?php } ?>
	<?php if( isset($data['OfflineMode']) && $data['OfflineMode']) {?>
		Операция выполнена в авт. режиме<br/>
	<?php } ?>
	
<?php if( isset($_f['Cashbox']) && $_f['Cashbox'] ) {?>
<div style="padding: 3px; font-size: 16px;">
	
	<?php if( isset($_f['TicketUrl']) && $_f['TicketUrl']) {?>
	<div style="float: right; width:50%">
		<div style="width: 100%; margin-bottom:5px; padding: 0px;">
			<img class="qr" src="data:image/png;base64,<?=QR::getBase64Code($_f['TicketUrl'], 'Q', 3)?>">
		</div>
	</div>
	<div style="float:left; padding-top:10px; font-size:15px; width:50%">
	<?php } ?>

	<?php if( isset($_f['CheckNumber']) && $_f['CheckNumber']) {?>
		ФП: <?=$_f['CheckNumber']?><br/>
	<?php } ?>
	<?php if( isset($_f['Cashbox']['IdentityNumber']) && $_f['Cashbox']['IdentityNumber'] ) {?>
		ИНК: <?=$_f['Cashbox']['IdentityNumber']?><br/>
	<?php } ?>
	<?php if( isset($_f['Cashbox']['RegistrationNumber']) && $_f['Cashbox']['RegistrationNumber'] ) {?>
		РНК: <?=$_f['Cashbox']['RegistrationNumber']?><br/>
	<?php } ?>
	<?php if( isset($_f['Cashbox']['UniqueNumber']) && $_f['Cashbox']['UniqueNumber'] ) {?>
		ЗНК: <?=$_f['Cashbox']['UniqueNumber']?><br/>
	<?php } ?>
	<br/>
	WEBKASSA.KZ<br>

	<?php if( isset($_f['TicketUrl']) && $_f['TicketUrl']) {?>
	</div>
	<?php } ?>
	
	<div style="clear:left;"></div>
</div>
<?php } ?>
</div>
