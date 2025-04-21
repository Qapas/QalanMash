const imgDir = "images/farm%20animals/";
const imgNaming = "animal";
const arrayLength = 30;
const baseRating = 1000;

document.addEventListener('DOMContentLoaded', function () {
  const rankingArray = [];

  // Только известные картинки
  for (let i = 1; i <= arrayLength; i++) {
    const fileName = `${imgNaming} (${i}).jpg`;
    const ratingValue = parseFloat(sessionStorage.getItem(fileName)) || baseRating;
    rankingArray.push({ key: fileName, value: ratingValue.toFixed(3) });
  }

  // Сортируем по рейтингу
  rankingArray.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

  const tableBody = document.getElementById('eloTableBody');
  tableBody.innerHTML = '';

  rankingArray.forEach((item, index) => {
    const row = tableBody.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    const imgElement = document.createElement('img');
    imgElement.src = imgDir + item.key;
    imgElement.style.width = '7.5rem';
    imgElement.style.height = '10rem';

    cell1.textContent = index + 1;
    cell2.appendChild(imgElement);
    cell3.textContent = item.value;

    sendEloResult("cow.png", "goat.png", true);
  });
});
