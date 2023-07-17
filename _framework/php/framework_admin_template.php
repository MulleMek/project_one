<!-- POPUP -->
<div class="popup hide" id="popup">
    <div class="popup-inner inner">
        <div class="popup-inner-wrapper">
            <div class="close display-none"><span class="icon-cross"></span></div>
            
            <p class="pop-title" data-popup="main"></p>
            <p class="text" data-popup="notice"></p>
            <!--<p class="text-small"></p> -->
        </div>
    </div>


    <div class="buttons display-none" data-popup="buttons">
        <button class='button' data-popup="button1"></button>
        <button class='button' data-popup="button2"></button>
    </div>
</div>


<!-- PRELOADER -->
<div class="preloader-wrap <?php if (isset($preloader) && $preloader): ?> show <?php else: ?> hide <?php endif ?> ">
    <svg class="preloader" height="50" width="50">
      <circle class="path" cx="25" cy="25.2" r="20" fill="none" stroke-width="4" stroke-miterlimit="10" />
    </svg>
</div>


<?php
    if ( $innerTemplates ) {
        include 'application'.$innerTemplates;
    }
?>
