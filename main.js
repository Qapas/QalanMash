const imgDir = "images/farm%20animals/";
const imgNaming = "animal"
const arrayLength = 24;
const imageArray = [], sessionStorageArray = [];
// const current = {left : 1 , right: 30}

let baseRating = 1000;
const k = 32; // K-factor for Elo rating system

function submitAllRatings() {
  const imgNaming = "animal";
  const arrayLength = 30;
  const baseRating = 1000;
  const dataToSend = [];

  for (let i = 1; i <= arrayLength; i++) {
    const fileName = `${imgNaming} (${i}).jpg`;
    const rating = parseFloat(sessionStorage.getItem(fileName)) || baseRating;
    dataToSend.push({ name: fileName, rating: rating.toFixed(3) });
  }

  fetch("https://script.google.com/macros/s/AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw/exec", {
    method: "POST",
    body: JSON.stringify({ allRatings: dataToSend }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => alert("Рейтинги отправлены!"))
  .catch(err => alert("Ошибка отправки рейтингов"));
}

// Get a random item from the array
function getRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return imageArray[randomIndex];
}

// Get img name without extension from element src
function getImgName(url) {
  const lastIndex = url.lastIndexOf('/');
  if (lastIndex !== -1) {
    return url.substring(lastIndex + 1);
  }
  return url;
}

// elo rating formula in chess
function probability(leftRating, rightRating){
  return 1.0*1.0/(1+1.0*Math.pow(10, 1.0*(leftRating-rightRating)/400));
}

function eloRating(leftRating, rightRating, k, win){
  let leftProb = probability(rightRating, leftRating); // left win probability
  let rightProb = probability(leftRating, rightRating); // right win probability
  if (win) { // left wins, right chosen
    leftRating = leftRating + k * (1 - leftProb); // add left rating
    rightRating = rightRating + k * (0 - rightProb); // minus right rating
  } else { // right wins. left chosen
    leftRating = leftRating + k * (0 - leftProb); // minus left rating
    rightRating = rightRating + k * (1 - rightProb); // add  right rating
  }
  return { leftRating, rightRating };
}

// update session value and get new image
function updateEloAndDisplay(leftWin) {
  const leftImage = document.getElementById("leftImg");
  const rightImage = document.getElementById("rightImg");

  const leftImgName = decodeURIComponent(getImgName(leftImage.src));
  const rightImgName = decodeURIComponent(getImgName(rightImage.src));

  if (!sessionStorage.getItem(leftImgName)) {
    sessionStorage.setItem(leftImgName, baseRating);
  }

  if (!sessionStorage.getItem(rightImgName)) {
    sessionStorage.setItem(rightImgName, baseRating);
  }

  const leftRating = parseFloat(sessionStorage.getItem(leftImgName));
  const rightRating = parseFloat(sessionStorage.getItem(rightImgName));

  const result = eloRating(leftRating, rightRating, k, leftWin);

  sessionStorage.setItem(leftImgName, result.leftRating);
  sessionStorage.setItem(rightImgName, result.rightRating);

  let newImgName;
  if (leftWin) {
    // Меняем правую картинку
    do {
      newImgName = getRandomItem(imageArray);
    } while (newImgName === leftImgName);
    rightImage.src = imgDir + encodeURIComponent(newImgName);
  } else {
    // Меняем левую картинку
    do {
      newImgName = getRandomItem(imageArray);
    } while (newImgName === rightImgName);
    leftImage.src = imgDir + encodeURIComponent(newImgName);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Populate the array with filenames
  for (let i = 1; i <= arrayLength; i++) {
    let img = `${imgNaming} (${i}).jpg`;
    imageArray.push(img);
    sessionStorage.setItem(img, baseRating);
  }

  let leftImg, rightImg;
  do {
    leftImg = getRandomItem(imageArray);
    rightImg = getRandomItem(imageArray);
  } while (leftImg === rightImg);

  document.getElementById('leftImg').src = imgDir + encodeURIComponent(leftImg);
  document.getElementById('rightImg').src = imgDir + encodeURIComponent(rightImg);
});

// left wins, right loses
function clickLeft() { 
  updateEloAndDisplay(true);
}

// right wins, left loses
function clickRight() { 
  updateEloAndDisplay(false);
}


//https://script.google.com/macros/s/AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw/exec
//AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw
