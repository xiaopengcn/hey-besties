function promisifyAuthorize(scope) {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope,
      success: resolve,
      fail: reject
    });
  });
}

function promisifyCanvasToTempFilePath(options) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      ...options,
      success: resolve,
      fail: reject
    });
  });
}

function promisifySaveImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: resolve,
      fail: reject
    });
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawFallbackDecoration(ctx, item) {
  ctx.save();
  ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  for (let i = 0; i < 5; i += 1) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.fillRect(-4, item.height * -0.35, 8, item.height * 0.3);
  }
  ctx.restore();
}

async function loadImage(canvas, src) {
  if (!src) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const image = canvas.createImage();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderPoster(canvas, ctx, poster) {
  const width = poster.layout.canvasWidth;
  const height = poster.layout.canvasHeight;
  canvas.width = width;
  canvas.height = height;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff92ad');
  gradient.addColorStop(0.52, '#ffc77c');
  gradient.addColorStop(1, '#fff1cf');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(640, 140, 150, 0, Math.PI * 2);
  ctx.arc(110, 1180, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (const item of poster.decorations) {
    try {
      const image = await loadImage(canvas, item.imagePath);
      if (image) {
        ctx.drawImage(image, item.x, item.y, item.width, item.height);
      } else {
        drawFallbackDecoration(ctx, item);
      }
    } catch (error) {
      drawFallbackDecoration(ctx, item);
    }
  }

  drawRoundedRect(ctx, 42, 40, 666, 1254, 42);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();

  drawRoundedRect(ctx, 58, 58, 634, 1218, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  drawRoundedRect(ctx, 86, 96, 160, 58, 29);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px sans-serif';
  ctx.fillText(poster.sceneName, 116, 134);

  ctx.fillStyle = '#2f1f28';
  ctx.font = '700 54px sans-serif';
  ctx.fillText(poster.themeTitle, 86, 230);

  ctx.fillStyle = 'rgba(47,31,40,0.68)';
  ctx.font = '400 26px sans-serif';
  ctx.fillText(poster.themeVibe, 88, 276);

  let tagX = 86;
  poster.tags.forEach((tag) => {
    drawRoundedRect(ctx, tagX, 306, 146, 48, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.76)';
    ctx.fill();
    ctx.fillStyle = '#7b5563';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(tag, tagX + 20, 336);
    tagX += 158;
  });

  drawRoundedRect(ctx, poster.layout.dollBox.x, poster.layout.dollBox.y, poster.layout.dollBox.width, poster.layout.dollBox.height, 42);
  ctx.fillStyle = 'rgba(255,247,244,0.82)';
  ctx.fill();

  ctx.fillStyle = poster.palette.primary;
  ctx.beginPath();
  ctx.arc(374, 638, 124, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#40303a';
  ctx.beginPath();
  ctx.arc(374, 482, 74, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffd7c5';
  ctx.beginPath();
  ctx.arc(374, 496, 54, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = poster.palette.primary;
  drawRoundedRect(ctx, 312, 548, 124, 220, 36);
  ctx.fill();

  if (poster.look.layers.outerwear) {
    ctx.fillStyle = poster.palette.secondary;
    drawRoundedRect(ctx, 292, 534, 164, 240, 32);
    ctx.fill();
  }

  if (poster.look.route === 'separates') {
    ctx.fillStyle = poster.palette.secondary;
    drawRoundedRect(ctx, 306, 766, 136, 180, 28);
    ctx.fill();
  } else {
    ctx.fillStyle = poster.palette.secondary;
    drawRoundedRect(ctx, 298, 734, 152, 250, 38);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(47,31,40,0.7)';
  ctx.font = '500 24px sans-serif';
  ctx.fillText(poster.copyLines[0], 88, 1044);
  ctx.fillText(poster.copyLines[1], 88, 1086);
  ctx.fillText(poster.copyLines[2], 88, 1188);
}

async function exportPosterImage(page, poster) {
  const query = wx.createSelectorQuery().in(page);
  const canvasInfo = await new Promise((resolve, reject) => {
    query.select('#posterCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res && res[0] && res[0].node) {
        resolve(res[0]);
      } else {
        reject(new Error('canvas not ready'));
      }
    });
  });

  const canvas = canvasInfo.node;
  const ctx = canvas.getContext('2d');
  const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio || 1 : 1;
  canvas.width = poster.layout.canvasWidth * dpr;
  canvas.height = poster.layout.canvasHeight * dpr;
  ctx.scale(dpr, dpr);

  await renderPoster(canvas, ctx, poster);

  const temp = await promisifyCanvasToTempFilePath({
    canvas,
    width: poster.layout.canvasWidth,
    height: poster.layout.canvasHeight,
    destWidth: poster.layout.canvasWidth,
    destHeight: poster.layout.canvasHeight,
    fileType: 'png'
  });

  return temp.tempFilePath;
}

async function savePosterImage(page, poster) {
  try {
    await promisifyAuthorize('scope.writePhotosAlbum');
  } catch (error) {
    // Let save continue; some environments prompt on save directly.
  }
  const tempFilePath = await exportPosterImage(page, poster);
  await promisifySaveImage(tempFilePath);
  return tempFilePath;
}

module.exports = {
  exportPosterImage,
  savePosterImage
};
