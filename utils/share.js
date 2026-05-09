function createShareMessage(outfit) {
  return {
    title: `今天想穿 ${outfit.theme.title}，来陪我抽一套出门灵感`,
    path: `/pages/result/result?scene=${outfit.scene.id}`
  };
}

module.exports = {
  createShareMessage
};
