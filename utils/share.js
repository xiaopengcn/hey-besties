function createShareMessage(outfit) {
  return {
    title: `今天穿 ${outfit.theme.title}，来陪我挑一套`,
    path: `/pages/result/result?scene=${outfit.scene.id}`
  };
}

module.exports = {
  createShareMessage
};
