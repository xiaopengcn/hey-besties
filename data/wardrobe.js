module.exports = {
  tops: [
    { id: 'shirt-soft', name: '软衬衫', shape: 'shirt', materials: ['麻料感', '棉感', '雪纺感'] },
    { id: 'tee-baby', name: '短袖上衣', shape: 'tee', materials: ['棉感', '针织感'] },
    { id: 'knit-slim', name: '针织上衣', shape: 'knit', materials: ['针织感'] },
    { id: 'blouse-puff', name: '泡泡袖上衣', shape: 'blouse-puff', materials: ['雪纺感', '棉感'] },
    { id: 'cardigan-crop', name: '短开衫', shape: 'cardigan-crop', materials: ['针织感'] },
    { id: 'tank-layered', name: '背心叠穿', shape: 'tank-layered', materials: ['棉感', '针织感'] },
    { id: 'tee-print', name: '印花短 Tee', shape: 'tee-print', materials: ['棉感'] }
  ],
  bottoms: [
    { id: 'pants-wide', name: '长裤', shape: 'wide-pants', materials: ['牛仔感', '麻料感', '棉感'] },
    { id: 'shorts-mini', name: '短裤', shape: 'shorts', materials: ['牛仔感', '棉感'] },
    { id: 'skirt-midi', name: '长裙', shape: 'midi-skirt', materials: ['麻料感', '雪纺感', '针织感'] },
    { id: 'skirt-mini', name: '短裙', shape: 'mini-skirt', materials: ['棉感', '牛仔感', '雪纺感'] },
    { id: 'skirt-pleated', name: '百褶短裙', shape: 'pleated-skirt', materials: ['棉感', '雪纺感'] },
    { id: 'skirt-a-line', name: 'A 字短裙', shape: 'a-line-skirt', materials: ['棉感', '麻料感'] },
    { id: 'skirt-denim', name: '牛仔半裙', shape: 'denim-skirt', materials: ['牛仔感'] },
    { id: 'pants-tailored', name: '阔腿西裤', shape: 'tailored-pants', materials: ['棉感', '麻料感'] }
  ],
  dresses: [
    { id: 'dress-mini', name: '短裙连衣裙', shape: 'mini-dress', materials: ['雪纺感', '棉感'] },
    { id: 'dress-maxi', name: '长裙连衣裙', shape: 'maxi-dress', materials: ['雪纺感', '针织感', '麻料感'] },
    { id: 'dress-slip', name: '吊带连衣裙', shape: 'slip-dress', materials: ['缎面感', '雪纺感'] },
    { id: 'dress-tea', name: '茶歇裙', shape: 'tea-dress', materials: ['雪纺感', '棉感'] },
    { id: 'dress-shirt', name: '衬衫裙', shape: 'shirt-dress', materials: ['麻料感', '棉感'] }
  ],
  outerwear: [
    { id: 'outer-cardigan', name: '薄开衫', shape: 'outer-cardigan', materials: ['针织感', '棉感'] },
    { id: 'outer-denim', name: '牛仔外搭', shape: 'outer-denim', materials: ['牛仔感'] }
  ],
  accessories: [
    { id: 'bow', name: '蝴蝶结', shape: 'bow' },
    { id: 'bag', name: '小包包', shape: 'mini-bag' },
    { id: 'clip', name: '发卡', shape: 'hair-clip' },
    { id: 'pearl', name: '珍珠点缀', shape: 'pearl' },
    { id: 'underarm-bag', name: '腋下包', shape: 'underarm-bag' },
    { id: 'cap', name: '棒球帽', shape: 'cap' },
    { id: 'heart-earring', name: '爱心耳饰', shape: 'heart-earring' },
    { id: 'badge', name: '漫画徽章', shape: 'badge' }
  ],
  palettes: {
    '奶油白': { primary: '#fff4dd', secondary: '#fff8ec', accent: '#e9cfa4', line: '#b6956c', className: 'palette-cream' },
    '玫瑰红': { primary: '#ff7c98', secondary: '#ffafbf', accent: '#ffd9e2', line: '#b54569', className: 'palette-rose' },
    '蜜桃粉': { primary: '#ffb2a6', secondary: '#ffd1c8', accent: '#fff0ea', line: '#c97770', className: 'palette-peach' },
    '焦糖杏': { primary: '#d7a269', secondary: '#e6bb8e', accent: '#f9e2ca', line: '#9a6538', className: 'palette-caramel' },
    '薄荷绿': { primary: '#94ddc8', secondary: '#c2f0e2', accent: '#f2fff9', line: '#4d9b88', className: 'palette-mint' },
    '天空蓝': { primary: '#91ccff', secondary: '#c7e5ff', accent: '#f3f9ff', line: '#4f86b6', className: 'palette-sky' },
    '珊瑚粉': { primary: '#ff95a6', secondary: '#ffc7cf', accent: '#fff1f4', line: '#c75c72', className: 'palette-coral' },
    '奶油黄': { primary: '#ffe291', secondary: '#fff0bf', accent: '#fff9e8', line: '#c79a2d', className: 'palette-butter' },
    '雾灰': { primary: '#b8b0b6', secondary: '#d7d2d6', accent: '#f4f1f4', line: '#7d7279', className: 'palette-fog' },
    '燕麦白': { primary: '#ede2cf', secondary: '#f6eedf', accent: '#fffaf1', line: '#a59272', className: 'palette-oat' },
    '牛仔蓝': { primary: '#7ea7da', secondary: '#aac5ea', accent: '#edf5ff', line: '#466b9b', className: 'palette-denim' },
    '抹茶绿': { primary: '#93c08a', secondary: '#bdd9b7', accent: '#f2fbf0', line: '#5e8258', className: 'palette-matcha' },
    '奶茶棕': { primary: '#b89074', secondary: '#d4b39d', accent: '#f7ede6', line: '#815942', className: 'palette-tea' }
  },
  colorClassMap: {
    '奶油白': 'cream',
    '玫瑰红': 'rose',
    '蜜桃粉': 'peach',
    '焦糖杏': 'caramel',
    '薄荷绿': 'mint',
    '天空蓝': 'sky',
    '珊瑚粉': 'coral',
    '奶油黄': 'butter',
    '雾灰': 'fog',
    '燕麦白': 'oat',
    '牛仔蓝': 'denim',
    '抹茶绿': 'matcha',
    '奶茶棕': 'tea'
  },
  materialClassMap: {
    '麻料感': 'mat-linen',
    '牛仔感': 'mat-denim',
    '棉感': 'mat-cotton',
    '针织感': 'mat-knit',
    '雪纺感': 'mat-chiffon',
    '缎面感': 'mat-satin'
  },
  textureKeyMap: {
    '麻料感': 'linen-grid',
    '牛仔感': 'denim-diagonal',
    '棉感': 'cotton-soft',
    '针织感': 'knit-rib',
    '雪纺感': 'chiffon-sheer',
    '缎面感': 'satin-shine'
  },
  accessoryMap: {
    '蝴蝶结': 'bow',
    '珍珠配饰': 'pearl',
    '小方包': 'mini-bag',
    '细带元素': 'heart-earring',
    '卡通贴纸感': 'badge',
    '发卡': 'hair-clip',
    '帆布包': 'underarm-bag',
    '彩色袜子': 'cap',
    '大耳环': 'heart-earring',
    '托特包': 'underarm-bag',
    '复古眼镜': 'badge',
    '细条纹': 'cap',
    '发箍': 'hair-clip',
    '小珍珠': 'pearl',
    '迷你包': 'mini-bag',
    '圆头鞋感': 'bow'
  }
};
