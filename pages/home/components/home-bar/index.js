Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    barList: {
      type: Array,
      value: [],
    },
  },

  methods: {
    handleToSettle() {
      this.triggerEvent('handleToSettle');
    },

    changCategory({ currentTarget }) {
      const { index } = currentTarget.dataset;
      const item = this.properties.barList[index];
      wx.navigateTo({
        url: `/pages/goods/list/index?cid=${item.id}&from=home&categoriesName=${escape(item.categoriesName)}`,
      })
    }
  },
});
