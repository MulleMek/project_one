<!doctype html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="google" content="notranslate">
    </head>
    <body ondrag="return false;" ondragstart="return false;">

        <?php include 'application'.$contentView; ?>

        <?php foreach ($js as $script): ?>
            <?=$script?>
        <?php endforeach ?>

    </body>
</html>
