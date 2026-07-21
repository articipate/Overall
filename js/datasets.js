async function loadDatasets() {
  const container = document.getElementById("datasets-container");
  const searchInput = document.getElementById("search-input");
  const taskFilter = document.getElementById("task-filter");
  const sortFilter = document.getElementById("sort-filter");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageInfo = document.getElementById("page-info");

  let currentPage = 0;
  const pageSize = 20;
  const fetchLimit = 200;
  let currentSearch = "";
  let currentTask = "";
  let currentSort = "downloads";
  let allData = [];

  async function fetchPage() {
    container.innerHTML = '<div class="loading"><span class="loading-spinner"></span>Yukleniyor</div>';

    try {
      const data = await fetchDatasets({
        search: currentSearch,
        sort: currentSort,
        limit: fetchLimit,
        direction: -1,
        filter: currentTask
      });

      allData = data || [];

      if (allData.length === 0) {
        container.innerHTML = '<div class="empty">Dataset bulunamadi</div>';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = "0 / 0";
        return;
      }

      renderCurrentPage();
    } catch (err) {
      container.innerHTML = '<div class="error">API Hatasi: ' + err.message + '</div>';
    }
  }

  function renderCurrentPage() {
    var start = currentPage * pageSize;
    var end = start + pageSize;
    var pageData = allData.slice(start, end);

    container.innerHTML = '<div class="cards-grid">' + pageData.map(renderDatasetCard).join('') + '</div>';

    var totalPages = Math.ceil(allData.length / pageSize);
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
    pageInfo.textContent = "Sayfa " + (currentPage + 1) + " / " + totalPages;
  }

  function renderDatasetCard(dataset) {
    var task = (dataset.tags && dataset.tags[0]) || "N/A";
    var downloads = formatNumber(dataset.downloads || 0);
    var likes = formatNumber(dataset.likes || 0);
    var url = BASE_URL + "/" + dataset.id;
    var author = dataset.id.indexOf('/') !== -1 ? dataset.id.split('/')[0] : '';
    var name = dataset.id.indexOf('/') !== -1 ? dataset.id.split('/').pop() : dataset.id;
    var lang = '';
    if (dataset.tags) {
      for (var i = 0; i < dataset.tags.length; i++) {
        if (dataset.tags[i].indexOf('language:') === 0) { lang = dataset.tags[i].replace('language:', ''); break; }
      }
    }

    return '<div class="card">' +
      '<div class="card-header">' +
        '<a class="card-title" href="' + url + '" target="_blank">' + name + '</a>' +
      '</div>' +
      (author ? '<div class="item-author" style="margin-bottom:8px">' + author + '</div>' : '') +
      '<div class="card-badges">' +
        '<span class="badge badge-task">' + task + '</span>' +
        (lang ? '<span class="badge badge-library">' + lang + '</span>' : '') +
      '</div>' +
      '<div class="card-stats">' +
        '<div class="card-stat stat-downloads">' +
          '<span>' + downloads + '</span>' +
          '<span style="font-size:6px;color:var(--text-secondary)">indirme</span>' +
        '</div>' +
        '<div class="card-stat stat-likes">' +
          '<span>' + likes + '</span>' +
          '<span style="font-size:6px;color:var(--text-secondary)">begeni</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  var searchTimeout;
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
      currentSearch = searchInput.value.trim();
      currentPage = 0;
      fetchPage();
    }, 400);
  });

  taskFilter.addEventListener("change", function() {
    currentTask = taskFilter.value;
    currentPage = 0;
    fetchPage();
  });

  sortFilter.addEventListener("change", function() {
    currentSort = sortFilter.value;
    currentPage = 0;
    fetchPage();
  });

  prevBtn.addEventListener("click", function() {
    if (currentPage > 0) {
      currentPage--;
      renderCurrentPage();
    }
  });

  nextBtn.addEventListener("click", function() {
    var totalPages = Math.ceil(allData.length / pageSize);
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderCurrentPage();
    }
  });

  fetchPage();
}

document.addEventListener("DOMContentLoaded", loadDatasets);
