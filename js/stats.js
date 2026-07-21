async function loadStats() {
  var modelsEl = document.getElementById("stat-models");
  var datasetsEl = document.getElementById("stat-datasets");
  var downloadsEl = document.getElementById("stat-downloads");
  var likesEl = document.getElementById("stat-likes");

  if (!modelsEl) return;

  modelsEl.textContent = "2M+";
  datasetsEl.textContent = "500K+";

  try {
    var topRes = await fetch(BASE_URL + "/api/models?sort=downloads&direction=-1&limit=1000");
    if (topRes.ok) {
      var topModels = await topRes.json();
      var totalDownloads = 0;
      var totalLikes = 0;
      for (var i = 0; i < topModels.length; i++) {
        totalDownloads += topModels[i].downloads || 0;
        totalLikes += topModels[i].likes || 0;
      }
      downloadsEl.textContent = formatNumber(totalDownloads);
      likesEl.textContent = formatNumber(totalLikes);
    }
  } catch (e) {
    downloadsEl.textContent = "-";
    likesEl.textContent = "-";
  }
}

document.addEventListener("DOMContentLoaded", loadStats);
