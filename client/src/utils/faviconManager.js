/**
 * Favicon Manager
 * Dynamically updates favicon based on settings
 */

export const updateFavicon = (faviconUrl, faviconData) => {
  const favicon = faviconData || faviconUrl;
  if (!favicon) return;

  // Update all favicon links
  const links = document.querySelectorAll('link[rel*="icon"]');
  links.forEach(link => {
    if (link.rel === 'icon' || link.rel === 'shortcut icon') {
      link.href = favicon;
    }
  });

  // If no favicon link exists, create one
  if (links.length === 0) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon;
    document.head.appendChild(link);
  }
};

export const updatePageTitle = (storeName) => {
  if (storeName) {
    document.title = `${storeName} - POS System`;
  }
};

export const updateThemeColor = (color) => {
  if (!color) return;

  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.content = color;
};
