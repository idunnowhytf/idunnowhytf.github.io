TweenLite.defaultEase = Expo.easeOut;

// Handle loading screen
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    TweenMax.to(loadingScreen, 1, {
      opacity: 0,
      onComplete: () => {
        loadingScreen.style.display = 'none';
        initTimer();
      }
    });
  }, 2000);
});

var reloadBtn = document.querySelector('.reload');
var timerEl = document.querySelector('.timer');

function initTimer() {
  var timerEl = document.querySelector('.timer'),
      daysGroupEl = timerEl.querySelector('.days-group'),
      hoursGroupEl = timerEl.querySelector('.hours-group'),
      minutesGroupEl = timerEl.querySelector('.minutes-group'),
      secondsGroupEl = timerEl.querySelector('.seconds-group'),

      daysGroup = {
         firstNum: daysGroupEl.querySelector('.first'),
         secondNum: daysGroupEl.querySelector('.second')
      },

      hoursGroup = {
         firstNum: hoursGroupEl.querySelector('.first'),
         secondNum: hoursGroupEl.querySelector('.second')
      },

      minutesGroup = {
         firstNum: minutesGroupEl.querySelector('.first'),
         secondNum: minutesGroupEl.querySelector('.second')
      },

      secondsGroup = {
         firstNum: secondsGroupEl.querySelector('.first'),
         secondNum: secondsGroupEl.querySelector('.second')
      };

  function updateTimer() {
    var targetDate = new Date('2025-05-01T00:00:00');
    var currentDate = new Date();
    var totalSeconds = Math.floor((targetDate - currentDate) / 1000);

    if (totalSeconds <= 0) {
      countdownFinished();
      return;
    }

    var days = Math.floor(totalSeconds / (3600 * 24));
    var hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = Math.floor(totalSeconds % 60);

    var daysStr = days.toString().padStart(2, '0');
    var hoursStr = hours.toString().padStart(2, '0');
    var minutesStr = minutes.toString().padStart(2, '0');
    var secondsStr = seconds.toString().padStart(2, '0');

    updateTimerDisplay(daysStr, hoursStr, minutesStr, secondsStr);
    setTimeout(updateTimer, 1000);
  }

  function updateTimerDisplay(days, hours, minutes, seconds) {
    animateNum(daysGroup.firstNum, days[0]);
    animateNum(daysGroup.secondNum, days[1]);

    animateNum(hoursGroup.firstNum, hours[0]);
    animateNum(hoursGroup.secondNum, hours[1]);
    
    animateNum(minutesGroup.firstNum, minutes[0]);
    animateNum(minutesGroup.secondNum, minutes[1]);
    
    animateNum(secondsGroup.firstNum, seconds[0]);
    animateNum(secondsGroup.secondNum, seconds[1]);
  }

  function animateNum(group, arrayValue) {
    TweenMax.killTweensOf(group.querySelector('.number-grp-wrp'));
    TweenMax.to(group.querySelector('.number-grp-wrp'), 1, {
      y: -group.querySelector('.num-' + arrayValue).offsetTop
    });
  }
  
  updateTimer();
}

function countdownFinished() {
  TweenMax.set(reloadBtn, { scale: 0.8, display: 'block' });
  TweenMax.to(timerEl, 1, { opacity: 0.2 });
  TweenMax.to(reloadBtn, 0.5, { scale: 1, opacity: 1 });
}

reloadBtn.addEventListener('click', function() {
  TweenMax.to(this, 0.5, { opacity: 0, onComplete:
    function() { 
      reloadBtn.style.display = "none";
    } 
  });
  TweenMax.to(timerEl, 1, { opacity: 1 });
  initTimer();
});