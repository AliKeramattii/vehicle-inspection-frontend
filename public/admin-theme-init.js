/* Operations preference only; customer branding is unaffected. Runs before hydration. */
(function () {
  var preference = "system";
  try { preference = localStorage.getItem("inspection-admin-theme") || "system"; } catch {}
  document.documentElement.dataset.adminTheme = preference === "dark" || preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
})();
