function createShareMessage(outfit) {
  return {
    title: `今天穿 ${outfit.theme.title}，来陪我挑一套`,
    path: `/pages/result/result?scene=${outfit.scene.id}`
  };
}

function createStageShareMessage(stageId, sceneId) {
  return {
    title: '来闺蜜舞台，一起挑今天的衣服',
    path: `/pages/stage/stage?stageId=${stageId}&scene=${sceneId}`
  };
}

module.exports = {
  createShareMessage,
  createStageShareMessage
};
