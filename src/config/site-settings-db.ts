/** Shared settings/branding database. Existing settings survive the v1 -> v2 upgrade. */
export function openSiteSettingsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let abandoned = false;
    const request = indexedDB.open("inspection-site-settings", 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings");
      if (!db.objectStoreNames.contains("branding-assets")) db.createObjectStore("branding-assets");
    };
    request.onsuccess = () => { if (abandoned) { request.result.close(); return; } request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(new Error("ذخیره‌سازی تنظیمات در دسترس نیست."));
    request.onblocked = () => { abandoned = true; reject(new Error("صفحه‌های دیگر این برنامه را ببندید و دوباره تلاش کنید.")); };
  });
}
