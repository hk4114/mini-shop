Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    id: {
      type: String,
      value: '',
      observer(id) {
        this.genIndependentID(id);
        if (this.properties.thresholds?.length) {
          this.createIntersectionObserverHandle();
        }
      },
    },
    data: {
      type: Object,
      observer(data) {
        if (!data) {
          return;
        }
        this.setData({
          goods: data,
        });
      },
    },
    currency: {
      type: String,
      value: '¥',
    },
    showType: {
      type: String,
      value: 'card',
    },
  },

  data: {
    independentID: '',
    goods: {
      id: '',
    },
    isValidityLinePrice: false,
  },
  methods: {
    clickHandle() {
      this.triggerEvent('click', {
        goods: this.data.goods,
      });
    },
  },
});
