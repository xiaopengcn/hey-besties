function buildPosterModel(outfit) {
  const copyLines = [
    `今日主打：${outfit.theme.title}`,
    `小元素：${outfit.elements.join(' / ')}`
  ];

  if (outfit.weatherSummary) {
    copyLines.push(outfit.weatherSummary);
  }

  copyLines.push('今日出门灵感 · 和姐妹一起挑漂亮');

  return {
    id: outfit.id,
    sceneName: outfit.scene.name,
    sceneMood: outfit.scene.mood,
    themeTitle: outfit.theme.title,
    themeVibe: outfit.theme.vibe,
    tags: outfit.elements,
    lookSummary: {
      route: outfit.look.route,
      palette: outfit.palette,
      accessory: outfit.look.layers.accessory
    },
    copyLines,
    decorations: [
      {
        key: 'spark-heart',
        imagePath: '/assets/poster/spark-heart.png',
        x: 42,
        y: 54,
        width: 104,
        height: 104
      },
      {
        key: 'comic-star',
        imagePath: '/assets/poster/comic-star.png',
        x: 574,
        y: 160,
        width: 96,
        height: 96
      }
    ],
    layout: {
      canvasWidth: 750,
      canvasHeight: 1334,
      dollBox: {
        x: 78,
        y: 344,
        width: 594,
        height: 620
      }
    },
    palette: outfit.palette,
    look: outfit.look
  };
}

module.exports = {
  buildPosterModel
};
