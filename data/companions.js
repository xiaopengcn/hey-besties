module.exports = {
  // Companion type definitions
  types: {
    '崽': { type: 'baby', names: ['崽崽', '小奶崽', '糯米崽', '棉花崽'], idPrefix: 'baby-' },
    '喵': { type: 'cat', names: ['喵喵', '小主喵', '奶盖喵', '团子喵'], idPrefix: 'cat-' },
    '汪': { type: 'dog', names: ['汪汪', '乖乖汪', '奶油汪', '卷卷汪'], idPrefix: 'dog-' }
  },

  // Companion outfit options - simplified garment palette
  companionColors: ['奶油白', '蜜桃粉', '薄荷绿', '天空蓝', '奶油黄'],
  companionMaterials: ['棉感', '针织感', '雪纺感'],
  companionAccessories: ['小围兜', '蝴蝶结领', '小领巾', '小帽子', '小铃铛'],

  companionColorClassMap: {
    '奶油白': 'cream',
    '蜜桃粉': 'peach',
    '薄荷绿': 'mint',
    '天空蓝': 'sky',
    '奶油黄': 'butter'
  },

  companionMaterialClassMap: {
    '棉感': 'mat-cotton',
    '针织感': 'mat-knit',
    '雪纺感': 'mat-chiffon'
  },

  companionTextureMap: {
    '棉感': 'cotton-soft',
    '针织感': 'knit-rib',
    '雪纺感': 'chiffon-sheer'
  },

  companionPalettes: {
    '奶油白': { primary: '#fff4dd', className: 'palette-cream' },
    '蜜桃粉': { primary: '#ffb2a6', className: 'palette-peach' },
    '薄荷绿': { primary: '#94ddc8', className: 'palette-mint' },
    '天空蓝': { primary: '#91ccff', className: 'palette-sky' },
    '奶油黄': { primary: '#ffe291', className: 'palette-butter' }
  }
};
