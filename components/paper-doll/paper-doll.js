Component({
  properties: {
    look: {
      type: Object,
      value: null
    },
    companion: {
      type: Object,
      value: null
    },
    companionOutfit: {
      type: Object,
      value: null
    }
  },
  methods: {
    layerClass(layer) {
      if (!layer) {
        return '';
      }
      return `${layer.colorClass} ${layer.materialClass}`;
    }
  }
});
