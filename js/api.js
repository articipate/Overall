async function fetchModels({ search = "", sort = "downloads", limit = 20, direction = -1, filter = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (limit) params.set("limit", limit);
  if (direction) params.set("direction", direction);
  if (filter) params.set("filter", filter);

  const res = await fetch(`${BASE_URL}/api/models?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchDatasets({ search = "", sort = "downloads", limit = 20, direction = -1, filter = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (limit) params.set("limit", limit);
  if (direction) params.set("direction", direction);
  if (filter) params.set("filter", filter);

  const res = await fetch(`${BASE_URL}/api/datasets?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}
