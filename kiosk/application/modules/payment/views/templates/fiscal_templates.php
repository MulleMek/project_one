<div class="popup fiscal-popup display-none" id="fiscal-popup">  
  <div class="popup-inner">
    <div class="popup-inner-wrapper" style="padding: 40px 15px; flex-flow: column nowrap; justify-content: center; align-items: center;">
      <div class="popup-header">
        <h1 id="header-text"></h1>
      </div>
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap; justify-content: space-around; align-items: center;">
        <div class="leftButtons" >
          <button id="email-button">Отправить на Email</button>
          <button id="phone-button">Отправить по SMS</button>
          <button class="display-none" id="print-button">Распечатать чек</button>
        </div>
        
        <div class="rightButtons">
          <button class="btn btn-wide" id="fiscal-next-button">
            <div class="btn-text">
              <h3 id="fiscal-next-notice">Не печатать чек</h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="popup fiscal-phone-input-popup display-none" id="phone-input-popup">
  <div class="popup-inner">
    <div class="popup-inner-wrapper">
      <div class="popup-header">
        <p>Введите номер телефона, на который будет передан SMS-ЧЕК</p>
      </div>
      
      <div class="pin-pad-wrap keyboard-wrap" id="phone-keyboard">
        <div class="input-center">
          <!-- <input type="text" placeholder="+7 --- --- -- --" id="phone-input" maxlength="10"> -->
          <input type="text" id="phone-input" placeholder="+7 (___) ___-__-__">
          <input type="text" id="phone-input-value" style="display:none;" maxlength="10">
        </div>
        <div class="line k-line">
          <button class="k-btn key" data-value="1">1</button>
          <button class="k-btn key" data-value="2">2</button>
          <button class="k-btn key" data-value="3">3</button>
        </div>
        <div class="line k-line">
          <button class="k-btn key" data-value="4">4</button>
          <button class="k-btn key" data-value="5">5</button>
          <button class="k-btn key" data-value="6">6</button>
        </div>
        <div class="line k-line">
          <button class="k-btn key" data-value="7">7</button>
          <button class="k-btn key" data-value="8">8</button>
          <button class="k-btn key" data-value="9">9</button>
        </div>
        <div class="line k-line">
          <button class="k-btn key" data-value="0">0</button>
          <button class="key key-delete k-btn" data-value="del">Стереть</button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="buttons">
    <button class="button cancel" id="phone-cancel">Назад</button>
    <button class="button" id="phone-confirm">Продолжить</button>
  </div>
</div>

<div class="popup fiscal-email-input-popup display-none" id="email-input-popup">
  <div class="popup-inner">
    <div class="popup-inner-wrapper">
      <p class="popup-header">Введите EMAIL, на который будет передан кассовый ЧЕК</p>
      
      <div class="keyboard-wrap" id="email-keyboard">
          <div class="k-line" style="margin-bottom: 20px;">
            <input type="text" name="EMAIL" id="email-input" style="margin-top: 0px;">
            <button class="k-btn key-delete key-inline" data-value='del'>
              Стереть
            </button>
          </div>
          <div class="k-line">
            <button class="k-number" data-value='~'>~</button>
            <button class="k-number" data-value='!'>!</button>
            <button class="k-number" data-value='@'>@</button>
            <button class="k-number" data-value='.'>.</button>
            <button class="k-number" data-value='_'>_</button>
            <button class="k-number" data-value='-'>-</button>
            <button class="k-number" data-value='='>=</button>                   
            <button class="k-number" data-value='*'>*</button>
            <button class="k-number" data-value='('>(</button>
            <button class="k-number" data-value=')'>)</button>
          </div>
          <div class="k-line">
            <button class="k-number" data-value='1'>1</button>
            <button class="k-number" data-value='2'>2</button>
            <button class="k-number" data-value='3'>3</button>
            <button class="k-number" data-value='4'>4</button>
            <button class="k-number" data-value='5'>5</button>
            <button class="k-number" data-value='6'>6</button>
            <button class="k-number" data-value='7'>7</button>
            <button class="k-number" data-value='8'>8</button>
            <button class="k-number" data-value='9'>9</button>
            <button class="k-number" data-value='0'>0</button>
          </div>
          <div class="k-line">
            <button class="k-btn" data-value='q'>q</button>
            <button class="k-btn" data-value='w'>w</button>
            <button class="k-btn" data-value='e'>e</button>
            <button class="k-btn" data-value='r'>r</button>
            <button class="k-btn" data-value='t'>t</button>
            <button class="k-btn" data-value='y'>y</button>
            <button class="k-btn" data-value='u'>u</button>
            <button class="k-btn" data-value='i'>i</button>
            <button class="k-btn" data-value='o'>o</button>
            <button class="k-btn" data-value='p'>p</button>
          </div>
          <div class="k-line">
            <button class="k-btn" data-value='a'>a</button>
            <button class="k-btn" data-value='s'>s</button>
            <button class="k-btn" data-value='d'>d</button>
            <button class="k-btn" data-value='f'>f</button>
            <button class="k-btn" data-value='g'>g</button>
            <button class="k-btn" data-value='h'>h</button>
            <button class="k-btn" data-value='j'>j</button>
            <button class="k-btn" data-value='k'>k</button>
            <button class="k-btn" data-value='l'>l</button>   
          </div>
          <div class="k-line">
            <!-- <button class="k-btn" data-value='shift'>
              <span class="icon-arrow-up"></span>
            </button> -->
            <button class="k-btn" data-value='z'>z</button>
            <button class="k-btn" data-value='x'>x</button>
            <button class="k-btn" data-value='c'>c</button>
            <button class="k-btn" data-value='v'>v</button>
            <button class="k-btn" data-value='b'>b</button>
            <button class="k-btn" data-value='n'>n</button>
            <button class="k-btn" data-value='m'>m</button>
            <!-- <button class="k-btn" data-value='shift'>
              <span class="icon-arrow-up"></span>
            </button> -->
          </div>
      </div>

    </div>
  </div>

  <div class="buttons">
    <button class="button cancel" id="email-cancel">Назад</button>
    <button class="button" id="email-confirm">Продолжить</button>
  </div>

</div>
