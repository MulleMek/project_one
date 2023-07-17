<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Страница чека</title>
		<style>
			* {
				margin: 0;
				padding: 0;
				font-size: 10px; /*12*/
				font-family: "Trebuchet MS";
			}
			pre {
				font-size: 10px;
				font-family: monospace;
				line-height: 110%;
			}
			body,
			html {
				/*width: 80mm;*/
				width: 90mm;
				position: relative;
				font-size: 10px; /*16px*/
				font-weight: 300;
				font-style: normal;
				overflow: hidden;
			}
			body {
				margin: 1px 0;
				padding-bottom: 2px;
				/*padding: 0 0 8mm 0;*/
				border: solid 2px #000;
				border-width: 3px 0;
			}
			.center { text-align: center; }
			h1 { font-size: 22px; }
			h2 { font-size: 18px; }
			.price {
				text-align: right;
				display: flex;
				justify-content: flex-end;
			}
			/*body > div{
				padding: 3px 0 3px 3mm;
			}*/
			.strong {
				font-weight: 600;
				margin-left: 10px;
				font-size: 12px;
				min-width: 55px;
			}
			small { opacity: 0.8; font-size: 0.8em; }
			.right { text-align: right; }
			.error {
				font-size: 15px;
				text-align: center;
				margin: 10px;
			}
			img { width: 40mm; height: auto; }
			.qr { width: auto; height: auto; margin: auto; display: block; }
			hr {
				border: none;
				border-top: 2px solid black;
				margin-top: 2px; margin-bottom: 1px;
			}
			hr.dashed {
				border-top: dashed 1px;
				margin-left: 15px;
				background: none;
			}
			.fl { float:left; padding: 0px; clear: left; line-height: 110%; }
			.fr { float:right; padding: 0px; clear: right; line-height: 110%; }
			.cl { clear: left; }
			.cr { clear: right; }
			.w-100 { width: 100%; }
			.icons-wrap div, .icons-wrap span { line-height: 18px; vertical-align: middle; margin-right: 4px;}
			.svg-icon { width: 16px; height: 16px; margin: auto;}
		</style>
	</head>
	<body> <?php include 'application'.$contentView; ?> </body>
</html>
