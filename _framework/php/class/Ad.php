<?php
//Модуль отвечающий за предоставление ссылок
//
class ad
{
   protected $options;

   //пути
   public $video;
   public $img;

   function __construct($_options){
      //накидываем дефолтные настройки
      $this->options = [
         "active" => 0,
         "video" => 0,
         "img" => 0,
         "time" => 60000, //в мили секкундах
		 "img_time" => 10,

		 // для того чтобы крутить всё это дело на отдельной вкладке как рекламу и тп
		 "html_active" => true, // показывать ли слой с текстом поверх
		 "dir_img" => "img", // директория с файлами изобрадений в разделе /_project/files/ad/
		 "dir_video" => "video", // директория с видео файлами в разделе /_project/files/ad/
		 "random" => true, // порядок показа, если false то показывает случайным образом
      ];

      if(is_array($_options)){
		foreach ($_options as $k => $v) {
		   if($k == "time") {
			  $this->options[$k] = (int)$v * 1000;
			  continue;
		   }

		   if(in_array($k, ['dir_img', 'dir_video'])){
			   $this->options[$k] = $v;
				  continue;
		   }

		   $this->options[$k] = (int)$v;
		}
	 }

      $this->video = $this->options["video"] && $this->options["active"] ? $this->readDirectory($this->options['dir_video']) : [];
      $this->img = $this->options["img"] && $this->options["active"] ? $this->readDirectory($this->options['dir_img']) : [];

      //тут переопределяем активность
      if($this->options['active']){
         if($this->options['video'] && COUNT($this->video) == 0) $this->options['video'] = 0;
         if($this->options['img'] && COUNT($this->img) == 0) $this->options['img'] = 0;
         if(!$this->options['video'] && !$this->options['img']) $this->options['active'] = 0;
      }
   }

   protected function readDirectory($type){
	  $dir = D_ROOT."/_project/files/ad/$type/";
      if(!file_exists($dir)) return [];

      if ($handle = opendir($dir)) {
         $tmp = [];
         while (false !== ($file = readdir($handle)))
            if(!in_array($file, [".", "..", '', ' ', '_'])) $tmp[] = "/_project/files/ad/$type/".$file;
         return $tmp;
      } else return [];
   }

   //возвращает линк для подключеняи стилей
   function getCSS(){
      return '<link rel="stylesheet" href="/kiosk/public/css/ad.css">';
   }

   function getHTML(){

      if($this->options['active']){?>
         <?=$this->getCSS()?>

         <!-- контейнер для медиа -->
         <div class="ad_popup" id="ad_popup" style="display:none;">
		 	<div class="relative">
				<video src="" autoplay muted style="display: none;"></video>
				<div class="img" style="display: none;"></div>

				<div class="fill" <?=!$this->options['html_active'] ? 'style="display:none;"' : ""?>></div>

				<div class="ad-notice" <?=!$this->options['html_active'] ? 'style="display:none;"' : ""?>>
					<h1> Коснитесь, чтобы разблокировать экран </h1>
				</div>
			</div>
         </div>
         <script>
			"use strict";
            var ad_video =  <?=COUNT($this->video) > 0 ? '["'.implode('", "', $this->video).'"]' : "[]"?>;
            var ad_img =  <?=COUNT($this->img) > 0 ? '["'.implode('", "', $this->img).'"]' : "[]"?>;

            //счётчик на каком элементе находимся чтобы показывать
            var status = 0; // состояние 0-не показываем, 1 - видео, 2 - картинки

            var timeout = <?=$this->options['time']?>;
            var timeout_id = null;
			var img_timer = null;
			var ad_active = -1;

			var timeout_video = null;



            (function ($, Helper) {

               //рандомер - чтобы решать что показывать
               function getRandomInt(min, max) {
				  	//console.log(min, max, Math.floor(Math.random() * (max - min)) + min);
				  	return Math.floor(Math.random() * (max - min)) + min;
               }

			   function getIndex(min, max){
					<?php if($this->options['random']){ ?>
						return getRandomInt(min, max);
					<?php } else { ?>
						ad_active++;
						if(ad_active >= max) ad_active = min;
						console.log(ad_active);
						return ad_active;
					<?php } ?>
			   }

               function noActivityHandler() {
                  clearTimeout(timeout_id);
                  timeout_id = setTimeout(function () {
                     LocalStorage.clear();
                     if(window._noActivityHandler_CallBack) window._noActivityHandler_CallBack();

                     // тут показ слайдов
                     // if(category_id != void 0 && category_id != 1){
                     //   return location.href = '/';
                     // }

                     next();

                  }, timeout);
               };

               function next(){
                  if(img_timer) clearTimeout(img_timer);
                  //console.log("Вызвана рекламка");
                  // показываем главнй экран
                  if(status == 0) $("#ad_popup").css("display", "flex");

                  // Выбираем какой тип будем показывать
                  if(ad_video.length > 0 && ad_img.length > 0){
                     // В таком случае выбираем ещё что-то
                     // Узнаём соотношение
                     let temp = getRandomInt(0, ad_video.length + ad_img.length);
                     if (temp > ad_img.length - 1) status = 1; else status = 2;
                  } else
                     status = ad_video.length > 0 ? 1 : 2;

                  // запуск видео
                  function playVideo(){
                     //выбор видео
                     let index = getIndex(0, ad_video.length);

					 // удаляем ссылку на 500 милисекунд чтобы он побыл пустым, нужно чтобы мусор удалялся
                     $("#ad_popup").find("video").prop("src", "").show();

					 if (timeout_video) clearTimeout(timeout_video);
					 timeout_video = setTimeout(() => {
						// показ его
						$("#ad_popup").find("video").prop("src", ad_video[index]).show();
						$("#ad_popup").find("div.img").first().css('background-image', '').hide();

						let obj = document.getElementsByTagName('video')[0];
						//вешаем событие на момент окончания видео
						obj.addEventListener("ended", () => {
							if (status) next();
						})
					 }, 700);

                  }

                  // запуск картинки
                  function playImg() {
                     // выбираем картинку
                     let index = getIndex(0, ad_img.length);
                     // грузим её
                     $("#ad_popup").find("video").prop("src", "").hide();
                     $("#ad_popup").find("div.img").first().css('background-image', `url("${ad_img[index]}")`).show(50);

                     // выжидаем и запускаем
                     if(img_timer) clearTimeout(img_timer);
                     img_timer = setTimeout(() => {
                        if(status) next();
                     }, <?=$this->options["img_time"]?> * 1000);
                  }

                  if(status == 1)
                     playVideo();
                  else
                     playImg();
               }

              $(document).ready(function () {
                 //инициализируем всё это дело
                 noActivityHandler();
                 //если коснётся то обновляем счётчик
                 $(document).on('click', noActivityHandler);

                 $("#ad_popup").click(function () {
                    //тут разгружаем контент и скрываем попап
                     status = 0;
                     $(this).hide();
                     $(this).find("video").prop("src", "").hide();
                     $(this).find("div.img").first().css('background-image', '').hide();
                     if(img_timer) clearTimeout(img_timer);
                     noActivityHandler();
                 });
              });
            })($, Helper)

         </script>
      <?php } else { //дефолтные?>
         <script>
            var timeout = 2 * 60 * 1000;
            var timeout_id = null;

            function noActivityHandler() {
               	clearTimeout(timeout_id);
               	timeout_id = setTimeout(function () {
					Helper.showPreloader();
					LocalStorage.clear();
					return Router.redirectHome();
				}, timeout);
            };

            $(document).ready(function () {
               //инициализируем всё это дело
               noActivityHandler();
            });
         </script>
      <?php
      }
   }
}
