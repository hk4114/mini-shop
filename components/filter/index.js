Component({
  externalClasses: ['wr-class'],

  options: {
    multipleSlots: true,
  },

  properties: {
    layout: {
      type: Number,
      value: 1,
      observer(layout) {
        this.setData({
          layout,
        });
      },
    },
    sorts: {
      type: String,
      value: '',
      observer(sorts) {
        this.setData({
          sorts,
        });
      },
    },
    color: {
      type: String,
      value: '#FA550F',
    },
  },

  data: {
    layout: 1,
    sorts: '',
  },

  methods: {
    onChangeShowAction() {
      const { layout } = this.data;
      const nextLayout = layout === 1 ? 0 : 1;
      this.triggerEvent('change', { ...this.properties, layout: nextLayout });
    },

    handlePriseSort() {
      const { sorts } = this.data;
      this.triggerEvent('change', {
        ...this.properties,
        sorts: sorts === 'price-desc' ? 'price-asc' : 'price-desc',
      });
    },

    handleSalesSort() {
      const { sorts } = this.data;
      this.triggerEvent('change', {
        ...this.properties,
        sorts: sorts === 'sales-desc' ? 'sales-asc' : 'sales-desc',
      });
    },

    open() {
      this.triggerEvent('showFilterPopup', {
        show: true,
      });
    },
  },
});
