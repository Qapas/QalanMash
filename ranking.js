const imgDir = "images/farm%20animals/";
const imgNaming = "avatar";
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
  });
});

function downloadRanking() {
  const rows = [["Rank", "Image", "Elo Rating"]];
  const table = document.getElementById('eloTableBody');
  const rowCount = table.rows.length;

  for (let i = 0; i < rowCount; i++) {
    const row = table.rows[i];
    const rank = row.cells[0].textContent;
    const img = row.cells[1].querySelector('img').src.split('/').pop();
    const rating = row.cells[2].textContent;
    rows.push([rank, img, rating]);
  }

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "elo_ranking.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function submitRatingsToSheet() {
  const ratings = [];

  for (let i = 1; i <= arrayLength; i++) {
    const fileName = `${imgNaming} (${i}).jpg`;
    const ratingValue = parseFloat(sessionStorage.getItem(fileName)) || baseRating;
    ratings.push({
      image: fileName,
      rating: ratingValue.toFixed(3),
      timestamp: new Date().toISOString()
    });
  }

  fetch("https://script.google.com/macros/s/AKfycbxLbY4Nq3Ivu24UiI7n69T_tIH40XZZT-Ecc8uQPAVA68mkirqXYkS7PTiYhx4-P3qaSw/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ allRatings: ratings })
  })
  .then(() => alert("Рейтинги успешно отправлены!"))
  .catch((error) => {
    console.error("Ошибка при отправке:", error);
    alert("Ошибка отправки рейтингов");
  });
}