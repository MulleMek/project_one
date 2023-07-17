<!doctype html>
<html>

    <script type="text/javascript">
        PAGE_START = Date.now();
    </script>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

        <title>Геометрия групп</title>

        <link rel="stylesheet" href="/<?=KIOSK_DOMAIN?>/public/css/normalize.css">
        <link rel="stylesheet" href="/<?=KIOSK_DOMAIN?>/public/css/icomoon.css">
        <link rel="stylesheet" href="/<?=KIOSK_DOMAIN?>/public/css/style.css">
        <link rel="stylesheet" href="/<?=KIOSK_DOMAIN?>/public/css/fixes.css">
        
        <link rel="stylesheet" href="/<?=KIOSK_DOMAIN?>/public/css/custom.css">
    </head>


    <script>
        console.time("body");
    </script>

    <body ondragstart="return false" draggable="false" oncontextmenu="return false">

        <?php include SHARED_FOLDER."kiosk_template.php" ?>

        <?php include 'application'.$contentView; ?>

        <?php if(!isset($nopowered) || !$nopowered) { ?>
			<span></span>
        <?php } ?>
		
        <!-- шаблоны -->
        <?php 
        if ( @$innerTemplates ) {
            include 'application'.$innerTemplates;
        }

        if ( @$additionalTemplates ) {
            foreach ($additionalTemplates as $val )
                include 'application'.$val;
        }
        ?>

        <?php foreach ($js as $script): ?>
            <?=$script?>
        <?php endforeach ?>

        <script>
            $(function(){
                console.log("%cPAGE LOADED " + (Date.now() - PAGE_START ) + "ms.", "color:blue; font-size: 1.3em;");
            });
            console.timeEnd("body");
        </script>
    </body>
</html>
