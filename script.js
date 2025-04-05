// Check warning acknowledgment immediately
const warningAcknowledged = localStorage.getItem('warningAcknowledged');
if (warningAcknowledged === 'true') {
  document.getElementById('warningOverlay').style.display = 'none';
}

TweenLite.defaultEase = Expo.easeOut;

// Handle loading screen
function triggerFlash() {
  const overlay = document.querySelector('.flash-overlay');
  const duration = (Math.random() * 1.9 + 0.1).toFixed(2); // Random duration between 0.1 and 2 seconds
  overlay.style.setProperty('--flash-duration', `${duration}s`);

  // Define color arrays
  const bgColors = ['black', 'white', 'yellow', 'red', 'rainbow'];
  const textColors = ['black', 'white', 'red', 'blue', 'orange'];

  // Select random colors
  const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
  const randomText = textColors[Math.floor(Math.random() * textColors.length)];

  // Apply colors
  if (randomBg === 'rainbow') {
    overlay.classList.add('rainbow');
    overlay.style.background = '';
  } else {
    overlay.classList.remove('rainbow');
    overlay.style.background = randomBg;
  }
  overlay.style.color = randomText;
  overlay.classList.add('active');
  
  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.classList.remove('rainbow');
    const nextFlash = Math.floor(Math.random() * 9000) + 1000; // Random interval between 1-10 seconds
    setTimeout(triggerFlash, nextFlash);
  }, duration * 1000);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    TweenMax.to(loadingScreen, 1, {
      opacity: 0,
      onComplete: () => {
        loadingScreen.style.display = 'none';
        initTimer();
        startGlitchEffect();
        triggerFlash();
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

function startGlitchEffect() {
  const elements = [document.querySelector('.timer img'), document.querySelector('.timer--clock')];
  
  function triggerGlitch() {
    const element = elements[Math.floor(Math.random() * elements.length)];
    element.classList.add('glitch');
    element.setAttribute('data-text', element.textContent || '');
    
    setTimeout(() => {
      element.classList.remove('glitch');
      element.removeAttribute('data-text');
    }, 1000);
    
    const nextGlitch = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
    setTimeout(triggerGlitch, nextGlitch);
  }
  
  triggerGlitch();
}
// Check warning acknowledgment on page load
document.addEventListener('DOMContentLoaded', function() {
  const videoOverlay = document.getElementById('videoOverlay');
  const introVideo = document.getElementById('introVideo');

  introVideo.play();
  introVideo.addEventListener('ended', function() {
    videoOverlay.classList.add('fade-out');
  });
  const randomDuration = (Math.random() * 2.5 + 0.5).toFixed(2); // Random between 0.5 and 3 seconds
  document.documentElement.style.setProperty('--loading-duration', `${randomDuration}s`);

  // Check if warning has been acknowledged
  const warningAcknowledged = localStorage.getItem('warningAcknowledged');
  if (warningAcknowledged === 'true') {
    document.getElementById('warningOverlay').style.display = 'none';
  }
});

function acknowledgeWarning() {
  document.getElementById('warningOverlay').style.display = 'none';
  
  // Save the choice in localStorage
  localStorage.setItem('warningAcknowledged', 'true');
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = 'Zapisano wybór.';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 7000);
}


function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function switchImage() {
  const image = document.querySelector('.glitch-image');
  
  // Add glitch effect without changing the image
  image.classList.add('glitch-active');
  
  // Remove glitch effect after a short duration
  setTimeout(() => {
    image.classList.remove('glitch-active');
    
    // Schedule next glitch effect
    setTimeout(switchImage, getRandomNumber(3000, 10000));
  }, getRandomNumber(100, 500));
}


// Start the animation after page load
window.addEventListener('load', () => {
  setTimeout(switchImage, getRandomNumber(1000, 10000));
});