import { addCollect, delCollect, queryImage } from '../../../../../services/usercenter/index';

Component({
  externalClasses: ['wr-sold-out', 'wr-class'],

  options: { multipleSlots: true },

  properties: {
    soldout: {
      // 商品是否下架
      type: Boolean,
      value: false,
    },
    jumpArray: {
      type: Array,
      value: [],
    },
    isStock: {
      type: Boolean,
      value: true,
    }, // 是否有库存
    isSlotButton: {
      type: Boolean,
      value: false,
    }, // 是否开启按钮插槽
    shopCartNum: {
      type: Number, // 购物车气泡数量
    },
    buttonType: {
      type: Number,
      value: 0,
    },
    minDiscountPrice: {
      type: String,
      value: '',
    },
    minSalePrice: {
      type: String,
      value: '',
    },
    details: { // 商品信息
      type: Object,
      value: {},
      observer(details) {
        this.setData({
          isCollected: details.userCollect,
        });
      },
    }
  },

  data: {
    fillPrice: false,
    isCollected: false,
    iskefu: false,
    qrcodeUrl: ''
  },

  methods: {
    toAddCart() {
      const { isStock } = this.properties;
      if (!isStock) return;
      this.triggerEvent('toAddCart');
    },

    toBuyNow(e) {
      const { isStock } = this.properties;
      if (!isStock) return;
      this.triggerEvent('toBuyNow', e);
    },

    toNav(e) {
      const { url } = e.currentTarget.dataset;
      if (!url) return false
      return this.triggerEvent('toNav', {
        e,
        url,
      });
    },

    handleCollect() {
      const { details, isCollected } = this.data;
      const { category = 1, id } = details;
      if (isCollected) {
        delCollect({ id, category })
          .then(res => {
            if (res.code === 200) {
              this.setData({
                isCollected: false
              })
            }
          }).catch(() => {
            wx.showToast({
              title: '取消收藏失败',
            })
          })
      } else {
        addCollect({ id, category })
          .then(res => {
            if (res.code === 200) {
              this.setData({
                isCollected: true
              })
            }
          }).catch(() => {
            wx.showToast({
              title: '添加收藏失败',
            })
          })
      }
    },

    handleKefu() {
      queryImage().then(({ code, data }) => {
        if (code === 200) {
          this.setData({
            iskefu: true,
            qrcodeUrl: data.imgUrl
          })
        }
      })
    },
    handleClose() {
      this.setData({
        iskefu: false
      })
    }
  },
});
