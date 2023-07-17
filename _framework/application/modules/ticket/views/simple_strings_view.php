<?php if( isset($data['Header']) && $data['Header']) { ?>
<h1 class="center" style="margin-bottom: 5px; font-size: 18px;font-weight: normal;">
	<?=$data['Header']?>
</h1>
<?php } ?>

<?php include 'simple_header.php'; ?>
<hr/>

<?php if( isset($data['StringsData']) && $data['StringsData']) { ?>
	<div class="strings">
	<?php if( isset($data['StringsData']) && count($data['StringsData']) ){ 
		foreach ($data['StringsData'] as $str) {
		?>
		<pre><?=$str?></pre>
	<?php } } ?>
	</div>
<?php } ?>

<hr/>

<?php if(isset($data['SellerData']) ) { ?>
	<?php if( isset($data['SellerData']['TerminalAddress']) && $data['SellerData']['TerminalAddress'] ) {?>
		<?=$data['SellerData']['TerminalAddress']?><br/>
	<?php } ?>
	<?php if( isset($data['SellerData']['TerminalMesto']) && $data['SellerData']['TerminalMesto'] ) {?>
		<?=$data['SellerData']['TerminalMesto']?><br/>
	<?php } ?>
	<?php if( isset($data['SellerData']['TerminalID']) && $data['SellerData']['TerminalID'] ) {?>
		Терминал: <?=$data['SellerData']['TerminalID']?><br/>
	<?php } ?>
<?php }?>

<?php include 'simple_footer.php'; ?>
