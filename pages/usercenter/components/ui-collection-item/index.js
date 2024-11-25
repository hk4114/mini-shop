Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true,
  },
  properties: {
    good: {
      type: Object,
      value: {},
    },
    customIcon: {
      type: String,
      value: 'edit-1',
    },
    extraSpace: {
      type: Boolean,
      value: true,
    },
    isDrawLine: {
      type: Boolean,
      value: true,
    },
  },
  externalClasses: [
    'item-wrapper-class',
    'title-class',
    'default-tag-class',
    'normal-tag-class',
    'good-info-class',
    'delete-class',
  ],
  methods: {
    onDelete(e) {
      const { item } = e.currentTarget.dataset;
      this.triggerEvent('onDelete', item);
    },
    onSelect(e) {
      const { item } = e.currentTarget.dataset;
      this.triggerEvent('onSelect', item);
    },
  },
});
