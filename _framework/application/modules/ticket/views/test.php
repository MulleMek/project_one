<h1 class="center" style="margin-bottom: 12px; font-size: 20px;font-weight: normal;">Чек пополнения счёта</h1>
<!-- <h2 class="center" style="margin-bottom: 5mm;">Внесение наличных</h2> -->

<div class="strong">Имя: <?=$data['user_name']?></div>
<div class="strong">ID (телефон): <?=$data['user_phone']?></div>
<div class="strong">Школа: <?=$data['affiliate_name']?></div>
<div class="strong">Дата операции:
	<script>
		var time = new Date();
		document.write(
			`${time.getDate().toString().padStart(2, "0")}.${(time.getMonth() + 1).toString().padStart(2, "0")}.${time.getFullYear()} ${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`
		);
	</script>
</div>

<h1 class="right" style="margin: 15px 0">Внесено: <?=$data['inserted']?> ₸</h1>

<!-- <div class="strong">ID опперации терминала: <?=$data['id']?></div> -->

<!-- <div class="strong">
	Внесенны купюры: <br>
	<?php foreach ($data['insertList'] as $v => $count) { ?>
		&nbsp;&nbsp;&nbsp;<?=$v?> ₸ x <?=$count?><br>
	<?php } ?>
</div> -->

<?php if(!$data['sync_error']) { ?>
	<div class="error">
	«Не удалось синхронизировать!<br>
	Предъявите данный чек на ресепшн»
	</div>
<?php } ?>

<div class="strong" style="margin-bottom: 10px;">ID терминала: <?=$data['id']?></div>


<div class="center" style="font-size: 12px;">
English LifeStyle Communication - ELC<br>
Перестаньте учить - начните говорить!<br>
+7(727)329-27-12 info@myelc.net www.myelc.net
</div>

<h1 class="center" style="margin-bottom: 12px; font-size: 20px;font-weight: normal;">
	<?php if(!isset($data['i']) || $data['i'] == 0) {?>
		Для клиента
	<?php } else { ?>
		Для Менеджера
	<?php } ?>
</h1>
