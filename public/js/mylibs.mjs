export function getQueryParams() {
  const params = {};
  const search = window.location.search;
  if (!search) return params;
  const query = search.substring(1); // 先頭の「?」を除去
  query.split("&").forEach(pair => {
    const [key, value] = pair.split("=");
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || "");
  });
  return params;
}