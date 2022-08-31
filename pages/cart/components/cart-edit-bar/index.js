Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    isAllSelected: {
      type: Boolean,
      value: false,
    },
    isEdit: {
      type: Boolean,
      value: false,
    }
  },

  methods: {
    handleSelectAll() {
      const { isAllSelected } = this.data;
      this.setData({
        isAllSelected: !isAllSelected,
      });
      this.triggerEvent('handleSelectAll', {
        isAllSelected: isAllSelected,
      });
    },

    handleToEdit() {
      const { isEdit } = this.data;
      this.triggerEvent('handleToEdit', {
        isEdit: !isEdit
      });
    },

    handleToClear() {
      const { isEdit } = this.data;
      this.triggerEvent('handleToClear', {
        isEdit: !isEdit
      });
    }
  },
});
