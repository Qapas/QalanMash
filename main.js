const imgDir = "images/farm%20animals/";
const imgNaming = "avatar";
const arrayLength = 30;
let tournamentQueue = [];
let currentRound = 1;
let currentMatchIndex = 0;
let isTiebreakerMode = false;
let tiebreakerQueue = [];
let tiebreakerAttempts = 0;
const MAX_TIEBREAKER_ATTEMPTS = 20; // Увеличили количество попыток
const RATING_PRECISION = 0.001; // Увеличили точность сравнения
let baseRating = 1000;
const k = 40; // Увеличили K-фактор для большей динамики рейтингов

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
  
  const winnerProb = probability(loserRating, winnerRating);
  const loserProb = probability(winnerRating, loserRating);
  
  const newWinnerRating = winnerRating + k * (1 - winnerProb);
  const newLoserRating = loserRating + k * (0 - loserProb);
  
  sessionStorage.setItem(winner, Math.max(newWinnerRating, baseRating - 100));
  sessionStorage.setItem(loser, Math.max(newLoserRating, baseRating - 100));
}

function getSortedRatings() {
  const items = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    items.push({
      name: key,
      rating: parseFloat(sessionStorage.getItem(key))
    });
  }
  return items.sort((a, b) => b.rating - a.rating);
}

function hasRatingDuplicates(topN = 10) {
  const sorted = getSortedRatings();
  const top = sorted.slice(0, topN);
  
  // Новая проверка с группировкой
  const ratingsSet = new Set();
  top.forEach(item => {
    const key = item.rating.toFixed(3);
    ratingsSet.add(key);
  });
  
  return ratingsSet.size !== top.length;
}

function prepareTiebreakers() {
  const sorted = getSortedRatings().slice(0, 10); // Берем только топ-10
  const ratingGroups = new Map();
  
  sorted.forEach(item => {
    const key = item.rating.toFixed(3);
    if (!ratingGroups.has(key)) ratingGroups.set(key, []);
    ratingGroups.get(key).push(item.name);
  });

  // Новая логика формирования пар
  tiebreakerQueue = [];
  ratingGroups.forEach(group => {
    if (group.length > 1) {
      // Перемешиваем внутри группы перед созданием пар
      shuffleArray(group);
      for (let i = 0; i < group.length; i += 2) {
        if (i+1 < group.length) {
          tiebreakerQueue.push([group[i], group[i+1]]);
        }
      }
    }
  });
  
  return tiebreakerQueue.length > 0;
}

function updateTiebreakerMatch() {
  if (tiebreakerQueue.length === 0) {
    if (!prepareTiebreakers() || tiebreakerAttempts >= MAX_TIEBREAKER_ATTEMPTS) {
      endTiebreakerMode();
      return;
    }
    tiebreakerAttempts++;
  }
  
  const nextMatch = tiebreakerQueue.shift();
  document.getElementById('leftImg').src = imgDir + encodeURIComponent(nextMatch[0]);
  document.getElementById('rightImg').src = imgDir + encodeURIComponent(nextMatch[1]);
}

function endTiebreakerMode() {
  isTiebreakerMode = false;
  alert('Финальные рейтинги:\n' + 
    getSortedRatings()
      .map((item, index) => `${index+1}. ${item.name}: ${item.rating.toFixed(3)}`)
      .join('\n'));
}

function prepareNextMatch() {
  if (isTiebreakerMode) return true;
  
  if (currentMatchIndex + 1 >= tournamentQueue.length) {
    currentRound++;
    const winners = tournamentQueue.filter((_, i) => i % 2 === 0);
    if (winners.length <= 1) {
      if (hasRatingDuplicates(10)) {
        isTiebreakerMode = true;
        tiebreakerAttempts = 0;
        updateTiebreakerMatch();
        return true;
      }
      endTiebreakerMode();
      return false;
    }
    
    tournamentQueue = [];
    for (let i = 0; i < winners.length; i += 2) {
      tournamentQueue.push([winners[i], winners[i + 1] || null]);
    }
    currentMatchIndex = 0;
  }
  
  const nextMatch = tournamentQueue[currentMatchIndex];
  if (!nextMatch[1]) {
    tournamentQueue.splice(currentMatchIndex, 1);
    return prepareNextMatch();
  }
  
  document.getElementById('leftImg').src = imgDir + encodeURIComponent(nextMatch[0]);
  document.getElementById('rightImg').src = imgDir + encodeURIComponent(nextMatch[1]);
  currentMatchIndex++;
  return true;
}

function handleVote(isLeftWinner) {
  const leftImg = decodeURIComponent(getImgName(
    document.getElementById('leftImg').src));
  const rightImg = decodeURIComponent(getImgName(
    document.getElementById('rightImg').src));
  
  const winner = isLeftWinner ? leftImg : rightImg;
  const loser = isLeftWinner ? rightImg : leftImg;
  
  updateRatings(winner, loser);
  sendResultToServer(winner, loser);

  // Новая логика обработки прогресса
  if (isTiebreakerMode) {
    updateTiebreakerMatch();
    document.getElementById('roundInfo').textContent = 
      `Переголосование #${tiebreakerAttempts+1} (осталось: ${tiebreakerQueue.length})`;
  } else if (!prepareNextMatch()) {
    if (hasRatingDuplicates(10)) {
      isTiebreakerMode = true;
      tiebreakerAttempts = 0;
      updateTiebreakerMatch();
      document.getElementById('roundInfo').textContent = 
        `Переголосование #${tiebreakerAttempts+1}`;
    } else {
      endTiebreakerMode();
    }
  }
}

function sendResultToServer(winner, loser) {
  fetch("https://script.google.com/macros/s/AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw/exec", {
    method: "POST",
    body: JSON.stringify({ winner, loser }),
    headers: { "Content-Type": "application/json" }
  }).catch(console.error);
}

document.addEventListener('DOMContentLoaded', () => {
  const initialArray = Array.from({length: arrayLength}, 
    (_, i) => `${imgNaming} (${i+1}).jpg`);
  shuffleArray(initialArray);
  
  for (let i = 0; i < initialArray.length; i += 2) {
    tournamentQueue.push([initialArray[i], initialArray[i + 1]]);
  }
  
  initialArray.forEach(img => {
    if (!sessionStorage.getItem(img)) {
      sessionStorage.setItem(img, baseRating);
    }
  });

  const roundInfo = document.createElement('div');
  roundInfo.id = 'roundInfo';
  document.body.prepend(roundInfo);
  
  prepareNextMatch();
});

function clickLeft() { handleVote(true); }
function clickRight() { handleVote(false); }