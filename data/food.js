// Food options curated for Chinese young women's daily dining scenarios.
// Each category maps to a pool of specific dishes with emoji and mood tags.
module.exports = {
  participantNames: ['我', '小桃', '小薄荷'],

  // Food pools by category - each participant picks from their own pool
  pools: {
    '我': {
      categories: ['comfort', 'trendy', 'healthy'],
      options: [
        { id: 'my-hotpot', name: '火锅局', emoji: '🍲', tags: ['热乎', '氛围感'] },
        { id: 'my-burger', name: '汉堡薯条', emoji: '🍔', tags: ['爽快', '上镜'] },
        { id: 'my-salad', name: '轻食沙拉碗', emoji: '🥗', tags: ['轻盈', '元气'] },
        { id: 'my-ramen', name: '拉面一碗', emoji: '🍜', tags: ['暖胃', '快手'] },
        { id: 'my-bbq', name: '烤肉走起', emoji: '🥩', tags: ['满足', '热闹'] },
        { id: 'my-sushi', name: '寿司拼盘', emoji: '🍣', tags: ['精致', '不油腻'] },
        { id: 'my-ricebowl', name: '盖饭定食', emoji: '🍚', tags: ['扎实', '不纠结'] },
        { id: 'my-sandwich', name: '三明治+咖啡', emoji: '🥪', tags: ['利落', 'city感'] }
      ]
    },
    '小桃': {
      categories: ['sweet', 'trendy', 'light'],
      options: [
        { id: 'tao-crepe', name: '可丽饼+果茶', emoji: '🫓', tags: ['甜软', '好拍'] },
        { id: 'tao-pasta', name: '奶油意面', emoji: '🍝', tags: ['温柔', '治愈'] },
        { id: 'tao-dimsum', name: '点心小笼', emoji: '🥟', tags: ['暖糯', '小确幸'] },
        { id: 'tao-pancake', name: '松饼brunch', emoji: '🥞', tags: ['松弛', '甜滋滋'] },
        { id: 'tao-tacos', name: '塔可小食', emoji: '🌮', tags: ['俏皮', '有画面'] },
        { id: 'tao-smoothie', name: '酸奶碗+果昔', emoji: '🥣', tags: ['清爽', '不负担'] },
        { id: 'tao-dumpling', name: '水饺汤面', emoji: '🥟', tags: ['暖和', '家常'] },
        { id: 'tao-toast', name: '法式吐司拼盘', emoji: '🍞', tags: ['甜软', '上镜'] }
      ]
    },
    '小薄荷': {
      categories: ['fresh', 'bold', 'unique'],
      options: [
        { id: 'mint-curry', name: '咖喱饭', emoji: '🍛', tags: ['浓郁', '开心'] },
        { id: 'mint-noodle', name: '麻辣拌面', emoji: '🍝', tags: ['过瘾', '够味'] },
        { id: 'mint-bibimbap', name: '韩式拌饭', emoji: '🍚', tags: ['多彩', '扎实'] },
        { id: 'mint-skewers', name: '烤串儿', emoji: '🍢', tags: ['街头', '随性'] },
        { id: 'mint-fish', name: '酸菜鱼', emoji: '🐟', tags: ['酸辣', '开胃'] },
        { id: 'mint-poke', name: '波奇饭', emoji: '🍣', tags: ['新鲜', '高颜值'] },
        { id: 'mint-tteokbokki', name: '炒年糕', emoji: '🍢', tags: ['甜辣', '满足'] },
        { id: 'mint-burrito', name: '墨西哥卷', emoji: '🌯', tags: ['扎实', '异国感'] }
      ]
    }
  }
};
