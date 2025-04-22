const imgDir = "images/farm%20animals/";
const imgNaming = "avatar";
const arrayLength = 30;
let tournamentQueue = [];
let currentRound = 1;
let currentMatchIndex = 0;

let baseRating = 1000;
const k = 32;

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getImgName(url) {
  const lastIndex = url.lastIndexOf('/');
  return lastIndex !== -1 ? url.substring(lastIndex + 1) : url;
}

function probability(a, b) {
  return 1 / (1 + Math.pow(10, (a - b) / 400));
}

function updateRatings(winner, loser) {
  const winnerRating = parseFloat(sessionStorage.getItem(winner)) || baseRating;
  const loserRating = parseFloat(sessionStorage.getItem(loser)) || baseRating;
  
  const expectedWin = probability(loserRating, winnerRating);
  const newWinnerRating = winnerRating + k * (1 - expectedWin);
  const newLoserRating = loserRating + k * (0 - (1 - expectedWin));
  
  sessionStorage.setItem(winner, newWinnerRating);
  sessionStorage.setItem(loser, newLoserRating);
}

function prepareNextMatch() {
  if (currentMatchIndex + 1 >= tournamentQueue.length) {
    // Переход к следующему раунду
    currentRound++;
    const winners = tournamentQueue.filter((_, i) => i % 2 === 0); // Берем первых из пар
    if (winners.length <= 1) {
      alert(`Tournament finished! Winner: ${winners[0]}`);
      return false;
    }
    
    tournamentQueue = [];
    for (let i = 0; i < winners.length; i += 2) {
      tournamentQueue.push([winners[i], winners[i + 1] || null]);
    }
    currentMatchIndex = 0;
  }
  
  const nextMatch = tournamentQueue[currentMatchIndex];
  if (!nextMatch[1]) { // Нечетное количество участников
    tournamentQueue.splice(currentMatchIndex, 1);
    return prepareNextMatch();
  }
  
  document.getElementById('leftImg').src = imgDir + encodeURIComponent(nextMatch[0]);
  document.getElementById('rightImg').src = imgDir + encodeURIComponent(nextMatch[1]);
  currentMatchIndex++;
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация и перемешивание
  const initialArray = Array.from({length: arrayLength}, 
    (_, i) => `${imgNaming} (${i+1}).jpg`);
  shuffleArray(initialArray);
  
  // Формируем пары первого раунда
  for (let i = 0; i < initialArray.length; i += 2) {
    tournamentQueue.push([initialArray[i], initialArray[i + 1]]);
  }
  
  // Инициализируем sessionStorage
  initialArray.forEach(img => {
    if (!sessionStorage.getItem(img)) {
      sessionStorage.setItem(img, baseRating);
    }
  });

  prepareNextMatch();
});

function handleVote(isLeftWinner) {
  const leftImg = decodeURIComponent(getImgName(
    document.getElementById('leftImg').src));
  const rightImg = decodeURIComponent(getImgName(
    document.getElementById('rightImg').src));
  
  const winner = isLeftWinner ? leftImg : rightImg;
  const loser = isLeftWinner ? rightImg : leftImg;
  
  updateRatings(winner, loser);
  sendResultToServer(winner, loser);
  
  if (!prepareNextMatch()) {
    document.getElementById('leftImg').style.display = 'none';
    document.getElementById('rightImg').style.display = 'none';
  }
}

function sendResultToServer(winner, loser) {
  fetch("https://script.google.com/macros/s/AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw/exec", {
    method: "POST",
    body: JSON.stringify({ winner, loser }),
    headers: { "Content-Type": "application/json" }
  }).catch(console.error);
}

// Обработчики кликов
function clickLeft() { handleVote(true); }
function clickRight() { handleVote(false); }

//https://script.google.com/macros/s/AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw/exec
//AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw
