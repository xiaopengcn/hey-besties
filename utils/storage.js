const FAVORITES_KEY = 'favorite-outfits';

function getFavorites() {
  if (typeof wx === 'undefined') {
    return [];
  }
  return wx.getStorageSync(FAVORITES_KEY) || [];
}

function saveFavorite(outfit) {
  if (typeof wx === 'undefined') {
    return [];
  }
  const current = getFavorites();
  const exists = current.some((item) => item.id === outfit.id);
  const next = exists ? current : [outfit, ...current].slice(0, 30);
  wx.setStorageSync(FAVORITES_KEY, next);
  return next;
}

function removeFavorite(outfitId) {
  if (typeof wx === 'undefined') {
    return [];
  }
  const next = getFavorites().filter((item) => item.id !== outfitId);
  wx.setStorageSync(FAVORITES_KEY, next);
  return next;
}

function isFavorite(outfitId) {
  return getFavorites().some((item) => item.id === outfitId);
}

module.exports = {
  FAVORITES_KEY,
  getFavorites,
  saveFavorite,
  removeFavorite,
  isFavorite
};
