var DOMAIN_KEYWORDS = {
  medical: ["medical", "clinical", "biomedical", "healthcare", "radiology", "pathology", "drug", "disease", "patient", "diagnosis", "ncbi", "pubmed", "mimic", "medication", "anatomy", "cancer", "genomic", "protein"],
  finance: ["finance", "financial", "stock", "trading", "sentiment", "market", "banking", "fintech", "economic", "portfolio", "risk", "credit", "fraud", "invoice", "accounting"],
  legal: ["legal", "law", "court", "contract", "regulation", "compliance", "judicial", "jurisprudence", "statute", "litigation", "lawyer", "attorney", "case-law", "bar"],
  code: ["code", "coding", "programming", "software", "github", "code-generation", "bug-fix", "refactor", "developer", "compiler", "python", "java", "javascript", "rust", "golang"],
  education: ["education", "learning", "teaching", "student", "school", "university", "tutor", "exam", "quiz", "academic", "scholar", "textbook", "curriculum"],
  gaming: ["game", "gaming", "rpg", "npc", "procedural", "level-generation", "dialogue", "quest", "simulation", "avatar", "world-building", "fantasy"],
  ecommerce: ["ecommerce", "e-commerce", "product", "review", "recommendation", "shopping", "catalog", "price", "customer", "retail", "inventory", "supply-chain"],
  science: ["science", "scientific", "research", "physics", "chemistry", "biology", "mathematics", "lab", "experiment", "academic", "paper", "arxiv"],
  automotive: ["automotive", "car", "vehicle", "autonomous", "driving", "sensor", "lidar", "radar", "diagnostic", "engine", "tesla", "self-driving"],
  energy: ["energy", "power", "electricity", "renewable", "solar", "wind", "grid", "battery", "oil", "gas", "sustainability", "carbon"],
  agriculture: ["agriculture", "farming", "crop", "soil", "harvest", "plant", "yield", "irrigation", "pesticide", "livestock", "food", "agri"],
  media: ["media", "video", "audio", "music", "image", "photo", "movie", "animation", "streaming", "podcast", "broadcast", "news", "journalism", "content"]
};

var lastModelResults = [];

function renderCard(item, type) {
  var task = item.pipeline_tag || (item.tags && item.tags[0]) || "N/A";
  var downloads = formatNumber(item.downloads || 0);
  var likes = formatNumber(item.likes || 0);
  var url = BASE_URL + "/" + item.id;
  var author = item.id.indexOf('/') !== -1 ? item.id.split('/')[0] : '';
  var name = item.id.indexOf('/') !== -1 ? item.id.split('/').pop() : item.id;

  var lib = '';
  if (item.tags) {
    var libs = ['transformers', 'diffusers', 'sentence-transformers', 'pytorch', 'tensorflow', 'jax'];
    for (var i = 0; i < item.tags.length; i++) {
      if (libs.indexOf(item.tags[i]) !== -1) { lib = item.tags[i]; break; }
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
        '<span style="font-size:6px;color:var(--text-secondary)">' + t('downloads') + '</span>' +
      '</div>' +
      '<div class="card-stat stat-likes">' +
        '<span>' + likes + '</span>' +
        '<span style="font-size:6px;color:var(--text-secondary)">' + t('likes') + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderRankingCard(item, rank, type) {
  var task = item.pipeline_tag || (item.tags && item.tags[0]) || "N/A";
  var downloads = formatNumber(item.downloads || 0);
  var likes = formatNumber(item.likes || 0);
  var url = BASE_URL + "/" + item.id;
  var author = item.id.indexOf('/') !== -1 ? item.id.split('/')[0] : '';
  var name = item.id.indexOf('/') !== -1 ? item.id.split('/').pop() : item.id;

  var rankClass = '';
  if (rank === 1) rankClass = 'rank-1';
  else if (rank === 2) rankClass = 'rank-2';
  else if (rank === 3) rankClass = 'rank-3';
  else rankClass = 'rank-other';

  return '<div class="ranking-row">' +
    '<div class="rank ' + rankClass + '">' + rank + '</div>' +
    '<div class="ranking-info">' +
      '<a class="ranking-name" href="' + url + '" target="_blank">' + name + '</a>' +
      (author ? '<div class="item-author">' + author + '</div>' : '') +
      '<span class="badge badge-task">' + task + '</span>' +
    '</div>' +
    '<div class="ranking-stats">' +
      '<div class="card-stat stat-downloads">' +
        '<span>' + downloads + '</span>' +
        '<span style="font-size:6px;color:var(--text-secondary)">' + t('downloads') + '</span>' +
      '</div>' +
      '<div class="card-stat stat-likes">' +
        '<span>' + likes + '</span>' +
        '<span style="font-size:6px;color:var(--text-secondary)">' + t('likes') + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderRanking() {
  var criterion = document.getElementById("sort-rank-filter").value;
  var best3Container = document.getElementById("dev-best3-container");
  var worst3Container = document.getElementById("dev-worst3-container");
  var best3Section = document.getElementById("dev-best3-section");
  var worst3Section = document.getElementById("dev-worst3-section");

  if (!lastModelResults || lastModelResults.length < 2) {
    best3Section.style.display = "none";
    worst3Section.style.display = "none";
    return;
  }

  var sorted = lastModelResults.slice().sort(function(a, b) {
    return (b[criterion] || 0) - (a[criterion] || 0);
  });

  var best3 = sorted.slice(0, 3);
  var worst3 = sorted.slice(-3).reverse();

  best3Section.style.display = "block";
  worst3Section.style.display = "block";

  best3Container.innerHTML = '<div class="ranking-list">' +
    best3.map(function(m, i) { return renderRankingCard(m, i + 1, 'models'); }).join('') +
    '</div>';

  worst3Container.innerHTML = '<div class="ranking-list">' +
    worst3.map(function(m, i) { return renderRankingCard(m, i + 1, 'models'); }).join('') +
    '</div>';
}

async function fetchByKeywords(keywords, fetchFn, filter, limit) {
  var seen = {};
  var allResults = [];

  for (var i = 0; i < keywords.length; i++) {
    try {
      var params = {
        search: keywords[i],
        sort: "downloads",
        limit: limit,
        direction: -1
      };
      if (filter) params.filter = filter;

      var results = await fetchFn(params);
      if (results) {
        for (var j = 0; j < results.length; j++) {
          if (!seen[results[j].id]) {
            seen[results[j].id] = true;
            allResults.push(results[j]);
          }
        }
      }
    } catch (e) {
      // continue with other keywords
    }
  }

  allResults.sort(function(a, b) { return (b.downloads || 0) - (a.downloads || 0); });
  return allResults;
}

async function searchDeveloper() {
  var domain = document.getElementById("domain-filter").value;
  var task = document.getElementById("task-filter").value;
  var modelsContainer = document.getElementById("dev-models-container");
  var datasetsContainer = document.getElementById("dev-datasets-container");

  if (!domain) {
    modelsContainer.innerHTML = '<div class="empty">' + t('select_domain') + '</div>';
    datasetsContainer.innerHTML = '';
    lastModelResults = [];
    document.getElementById("dev-best3-section").style.display = "none";
    document.getElementById("dev-worst3-section").style.display = "none";
    return;
  }

  var keywords = DOMAIN_KEYWORDS[domain] || [];
  var searchKeywords = keywords.slice(0, 5);

  modelsContainer.innerHTML = '<div class="loading"><span class="loading-spinner"></span>' + t('loading') + '</div>';
  datasetsContainer.innerHTML = '<div class="loading"><span class="loading-spinner"></span>' + t('loading') + '</div>';
  document.getElementById("dev-best3-section").style.display = "none";
  document.getElementById("dev-worst3-section").style.display = "none";

  try {
    var modelResults = await fetchByKeywords(searchKeywords, fetchModels, task, 15);
    var datasetResults = await fetchByKeywords(searchKeywords, fetchDatasets, task, 15);

    lastModelResults = modelResults || [];

    if (!modelResults || modelResults.length === 0) {
      modelsContainer.innerHTML = '<div class="empty">' + t('no_models_found') + '</div>';
    } else {
      modelsContainer.innerHTML = '<div class="cards-grid">' + modelResults.slice(0, 20).map(function(m) { return renderCard(m, 'models'); }).join('') + '</div>';
      renderRanking();
    }

    if (!datasetResults || datasetResults.length === 0) {
      datasetsContainer.innerHTML = '<div class="empty">' + t('no_datasets_found') + '</div>';
    } else {
      datasetsContainer.innerHTML = '<div class="cards-grid">' + datasetResults.slice(0, 20).map(function(d) { return renderCard(d, 'datasets'); }).join('') + '</div>';
    }
  } catch (err) {
    modelsContainer.innerHTML = '<div class="error">' + t('api_error') + ': ' + err.message + '</div>';
    datasetsContainer.innerHTML = '';
    lastModelResults = [];
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("search-btn").addEventListener("click", searchDeveloper);
  document.getElementById("domain-filter").addEventListener("change", function() {
    if (this.value) searchDeveloper();
  });
  document.getElementById("task-filter").addEventListener("change", function() {
    if (document.getElementById("domain-filter").value) searchDeveloper();
  });
  document.getElementById("sort-rank-filter").addEventListener("change", function() {
    renderRanking();
  });
});
