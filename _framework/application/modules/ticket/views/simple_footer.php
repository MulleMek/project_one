
<?php $_f = $data ?>

<?php if( isset($_f['SellerData']) && $_f['SellerData'] && isset($_f['SellerData']['CmdAfter']) ) {?>
<div class="center" style="margin-top: 2px;">
	
<div style="width: 100%; text-align: center;">
	<?php if( isset($_f['SellerData']['CmdAfter']) && count($_f['SellerData']['CmdAfter']) ){ 
		foreach ($_f['SellerData']['CmdAfter'] as $str) {
		?>
		<?=$str?><br/>
	<?php } } ?>
</div>

</div>
<?php } ?>


