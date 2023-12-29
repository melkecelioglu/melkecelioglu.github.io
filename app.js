document.addEventListener('DOMContentLoaded', function() {
  // Check and register service worker
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
      .then(function(reg) {
          console.log('Service Worker registration successful');
      })
      .catch(function(error) {
          console.log('Service Worker registration failed:', error);
      });
  }

  // Selecting DOM elements
  const player = document.querySelector('.bird');
  const heavens = document.querySelector('.sky');
  const gameArea = document.querySelector('.game-container');
  const movingGround = document.querySelector('.ground-moving');
  const bonus = document.createElement('div');

  // Game variables
  let playerX = 100, playerY = 200, bonusY, pull = 1;
  let gameOverFlag = false, obstacleGap = 430;
  let currentScore = 0, bonusCount = 2, topScores = [0];
  let gameSpeed = 3000, scoreInterval = 10;

  // Sound elements
  const flapSound = document.querySelector('#audio');
  const pointSound = document.querySelector('#audio2');
  const collisionSound = document.querySelector('#audio3');
  const winSound = document.querySelector('#audio4');

  // Sound settings
  flapSound.volume = 0.3;
  pointSound.volume = 0.3;
  collisionSound.volume = 0.5;
  winSound.volume = 0.4;

  // Initialize and display high scores
  setupHighScores();
  document.getElementById('high').innerText = getHighestScore(topScores);
  document.getElementById('p3').innerText = bonusCount;

  // Show instructions briefly
  document.getElementById("instruction").style.display = "block";
  setTimeout(function() {
      document.getElementById("instruction").style.display = "none";
  }, 3000);

  // Game functions
  function setupHighScores() {
      if (!localStorage.getItem('topScores')) {
          localStorage.setItem('topScores', JSON.stringify(topScores));
      } else {
          topScores = JSON.parse(localStorage.getItem('topScores'));
      }
  }

  function getHighestScore(scores) {
      return scores ? Math.max(...scores) : null;
  }

  function playGame() {
      playerY -= pull;
      player.style.bottom = playerY + 'px';
      player.style.left = playerX + 'px';
  }

  function jump() {
      if (playerY < 500) playerY += 50;
      player.style.bottom = playerY + 'px';
      flapSound.play();
  }

  function control(e) {
      if (e.keyCode === 32) jump();
  }

  document.addEventListener('keyup', control);
  document.addEventListener('click', jump);

  // Obstacle generation and movement
  function createObstacle() {
      let obstacleX = 400;
      let obstacleY = Math.random() * 60;
      const newObstacle = document.createElement('div');
      const topObstacle = document.createElement('div');

      if (!gameOverFlag) {
          newObstacle.classList.add('obstacle');
          topObstacle.classList.add('topObstacle');
      }
      gameArea.appendChild(newObstacle);
      gameArea.appendChild(topObstacle);

      newObstacle.style.left = obstacleX + 'px';
      topObstacle.style.left = obstacleX + 'px';
      newObstacle.style.bottom = obstacleY + 'px';
      topObstacle.style.bottom = obstacleY + obstacleGap + 'px';

      function moveObstacle() {
          obstacleX -= 2;
          newObstacle.style.left = obstacleX + 'px';
          topObstacle.style.left = obstacleX + 'px';

          if (obstacleX === -60) {
              clearInterval(obstacleTimerId);
              gameArea.removeChild(newObstacle);
              gameArea.removeChild(topObstacle);
          }
          if (obstacleX === 40) {
              currentScore++;
              document.getElementById('score').innerText = currentScore;
          }
          checkCollision(obstacleX, obstacleY, newObstacle, topObstacle);
      }

      let obstacleTimerId = setInterval(moveObstacle, scoreInterval);
      if (!gameOverFlag) setTimeout(createObstacle, gameSpeed);
      if (currentScore % 5 === 0 && currentScore !== 0) gameSpeed -= 200;
  }

  function checkCollision(obsX, obsY, obs, topObs) {
      if ((obsX > 100 && obsX < 160 && playerX === 100 &&
          (playerY < obsY + 150 || playerY > obsY + obstacleGap - 200)) ||
          playerY === 0) {
          handleCollision(obs, topObs);
      }
  }

  function handleCollision(obs, topObs) {
      if (bonusCount > 0) {
          decreaseBonusCount(obs, topObs);
      } else {
          endGame(obs, topObs);
      }
  }

  function decreaseBonusCount(obs, topObs) {
      bonusCount--;
      document.getElementById('p3').innerText = bonusCount;
      clearInterval(obstacleTimerId);
      gameArea.removeChild(obs);
      gameArea.removeChild(topObs);
      collisionSound.play();
  }

  function endGame(obs, topObs) {
      collisionSound.play();
      topScores.push(currentScore);
      localStorage.setItem('topScores', JSON.stringify(topScores));
      gameOver(obs, topObs);
  }

  // Heart generation and collision checking
  function createHeart() {
      let heartX = 100;
      let randomY = Math.floor(Math.random() * (400 - 150) + 150);
      bonusY = randomY;
      bonus.classList.add('heart');
      heavens.appendChild(bonus);

      bonus.style.top = bonusY + 'px';
      bonus.style.left = heartX + 'px';

      if (!gameOverFlag) setTimeout(createHeart, 10000);
  }

  function checkHeart() {
      if (playerY > 520 - bonusY && heavens.childNodes.length > 5) {
          collectHeart();
      }
      if (!gameOverFlag) setTimeout(checkHeart, 100);
  }

  function collectHeart() {
      bonusCount++;
      document.getElementById('p3').innerText = bonusCount;
      pointSound.play();
      try {
          heavens.removeChild(bonus);
      } catch (error) {
          console.log(error);
      }
  }

  // Start game functions
  let gameTimerId = setInterval(playGame, 20);
  createObstacle();
  createHeart();
  checkHeart();

  // Game over function
  function gameOver() {
      clearInterval(gameTimerId);
      console.log('Game Over');
      gameOverFlag = true;
      document.removeEventListener('keyup', control);
      document.removeEventListener('click', jump);
      movingGround.classList.add('ground');
      movingGround.classList.remove('ground-moving');
      document.getElementById("gameover").style.display = "block";
      winSound.play();
  }
});
