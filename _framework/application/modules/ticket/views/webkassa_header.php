
<?php $_h = $data ?>

<?php if( isset($_h['_TaxPayer']) && $_h['_TaxPayer']) {?>
<div class="center" style="margin-bottom: 5px; font-size: 14px;">
	<?php if( isset($_h['_TaxPayer']['Name']) && $_h['_TaxPayer']['Name']) {?>
		<?=$_h['_TaxPayer']['Name']?><br/>
	<?php } ?>
	<?php if( isset($_h['_TaxPayer']['IN']) && $_h['_TaxPayer']['IN']) {?>
		ИНН/БИН: <?=$_h['_TaxPayer']['IN']?><br/>
	<?php } ?>
	<?php if( isset($_h['_TaxPayer']['VAT']) && $_h['_TaxPayer']['VAT']) {?>
	НДС
	<?php if( isset($_h['_TaxPayer']['VATSeria']) && $_h['_TaxPayer']['VATSeria'] && isset($_h['_TaxPayer']['VATNumber']) && $_h['_TaxPayer']['VATNumber']) {?>
		Серия <?=$_h['_TaxPayer']['VATSeria']?> № <?=$_h['_TaxPayer']['VATNumber']?><br/>
	<?php } else { ?>
		Серия и Номер не определены<br/>
	<?php }} ?>
<?php } ?>
</div>