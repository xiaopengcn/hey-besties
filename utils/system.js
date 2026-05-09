function getSystemMetrics() {
  const fallback = {
    statusBarHeight: 20,
    navBarHeight: 88,
    navBarTop: 20,
    capsuleHeight: 32,
    capsuleWidth: 96,
    safeAreaBottom: 0
  };

  if (typeof wx === 'undefined') {
    return fallback;
  }

  const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
  const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
  const statusBarHeight = windowInfo.statusBarHeight || fallback.statusBarHeight;

  if (!menuButton) {
    return fallback;
  }

  const gap = menuButton.top - statusBarHeight;
  const navBarHeight = statusBarHeight + gap * 2 + menuButton.height;

  return {
    statusBarHeight,
    navBarHeight,
    navBarTop: statusBarHeight,
    capsuleHeight: menuButton.height,
    capsuleWidth: menuButton.width,
    safeAreaBottom: windowInfo.safeArea ? Math.max(windowInfo.screenHeight - windowInfo.safeArea.bottom, 0) : 0
  };
}

module.exports = {
  getSystemMetrics
};
