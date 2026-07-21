async function loadModels() {
  const container = document.getElementById("models-container");
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
      const data = await fetchModels({
        search: currentSearch,
        sort: currentSort,
        limit: fetchLimit,
        direction: -1,
        filter: currentTask
      });

      allData = data || [];

      if (allData.length === 0) {
        container.innerHTML = '<div class="empty">Model bulunamadi</div>';
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

    container.innerHTML = '<div class="cards-grid">' + pageData.map(renderModelCard).join('') + '</div>';

    var totalPages = Math.ceil(allData.length / pageSize);
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
    pageInfo.textContent = "Sayfa " + (currentPage + 1) + " / " + totalPages;
  }

  function renderModelCard(model) {
    var task = model.pipeline_tag || "N/A";
    var downloads = formatNumber(model.downloads || 0);
    var likes = formatNumber(model.likes || 0);
    var url = BASE_URL + "/" + model.id;
    var author = model.id.indexOf('/') !== -1 ? model.id.split('/')[0] : '';
    var name = model.id.indexOf('/') !== -1 ? model.id.split('/').pop() : model.id;
    var lib = '';
    if (model.tags) {
      var libs = ['transformers', 'diffusers', 'sentence-transformers', 'pytorch', 'tensorflow', 'jax'];
      for (var i = 0; i < model.tags.length; i++) {
        if (libs.indexOf(model.tags[i]) !== -1) { lib = model.tags[i]; break; }
      }
    }

    return '<div class="card">' +
      '<div class="card-header">' +
        '<a class="card-title" href="' + url + '" target="_blank">' + name + '</a>' +
      '</div>' +
      (author ? '<div class="item-author" style="margin-bottom:8px">' + author + '</div>' : '') +
      '<div class="card-badges">' +
        '<span class="badge badge-task">' + task + '</span>' +
        (lib ? '<span class="badge badge-library">' + lib + '</span>' : '') +
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

document.addEventListener("DOMContentLoaded", loadModels);
