function createShareMessage(outfit) {
  return {
    title: `今天是 ${outfit.theme.title}，你也来抽一套穿搭灵感吧`,
    path: `/pages/result/result?scene=${outfit.scene.id}`
  };
}

module.exports = {
  createShareMessage
};
