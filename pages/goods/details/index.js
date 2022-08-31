import { fetchProductDetail } from '../../../services/good/index';
import { addCart } from '../../../services/cart/index'
import Toast from 'tdesign-miniprogram/toast/index';

const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) =>
    result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`),
  );
  return result.join('&');
};

Page({
  data: {
    popupshow: false,
    popupInfo: {},
    isShowPromotionPop: false,
    activityList: [],
    details: {},
    goodsTabArray: [{
      name: '商品',
      value: '', // 空字符串代表置顶
    },
    {
      name: '详情',
      value: 'goods-page',
    },
    ],
    jumpArray: [{
      title: '客服',
      type: 'kefu',
      iconName: 'service',
    },
    {
      title: '收藏',
      iconName: 'star',
      type: 'collect'
    },
    {
      title: '购物车',
      url: '/pages/newcart/index',
      iconName: 'cart',
      showCartNum: true,
    },
    ],
    isStock: true,
    cartNum: 0,
    soldout: false,
    buttonType: 1,
    buyNum: 1,
    selectedAttrStr: '',
    skuArray: [],
    primaryImage: '',
    specImg: '',
    isSpuSelectPopupShow: false,
    isAllSelectedSku: false,
    buyType: 0,
    outOperateStatus: false, // 是否外层加入购物车
    operateType: 0,
    selectSkuSellsPrice: 0,
    maxLinePrice: 0,
    minSalePrice: 0,
    maxSalePrice: 0,
    list: [],
    spuId: '',
    navigation: {
      type: 'fraction'
    },
    current: 0,
    autoplay: true,
    duration: 500,
    interval: 5000,
    soldNum: 0, // 已售数量
  },
  handlePopupHide() {
    this.setData({
      isSpuSelectPopupShow: false,
    });
  },

  onClose() {
    this.setData({
      popupshow: false,
    });
  },

  showPopup({ currentTarget }) {
    const { content, title } = currentTarget.dataset;
    if (!content) {
      return false
    }
    this.setData({
      popupshow: true,
      popupInfo: {
        title,
        content: content.replace(/↵/g, '\n')
      }
    })
  },

  showSkuSelectPopup(type) {
    this.setData({
      buyType: type || 0,
      outOperateStatus: type >= 1,
      isSpuSelectPopupShow: true,
    });
  },

  buyItNow() {
    const { soldout } = this.data;
    if (soldout) return false;
    this.showSkuSelectPopup(1);
  },

  toAddCart() {
    const { soldout } = this.data;
    if (soldout) return false;
    this.showSkuSelectPopup(2);
  },

  toNav(e) {
    const {
      url
    } = e.detail;
    wx.navigateTo({
      url: url,
    });
  },

  showCurImg(e) {
    const {
      index
    } = e.detail;
    const {
      sliderImages
    } = this.data.details;
    wx.previewImage({
      current: sliderImages[index],
      urls: sliderImages, // 需要预览的图片http链接列表
    });
  },

  onPageScroll({
    scrollTop
  }) {
    const goodsTab = this.selectComponent('#goodsTab');
    goodsTab && goodsTab.onScroll(scrollTop);
  },

  chooseSpecItem(e) {
    const {
      specList
    } = this.data.details;
    const {
      selectedSku,
      isAllSelectedSku
    } = e.detail;
    if (!isAllSelectedSku) {
      this.setData({
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      isAllSelectedSku,
    });
    this.getSkuItem(specList, selectedSku);
  },

  getSkuItem(specList, selectedSku) {
    const {
      skuArray,
      primaryImage
    } = this.data;
    const selectedSkuValues = this.getSelectedSkuValues(specList, selectedSku);
    let selectedAttrStr = ` 件  `;
    selectedSkuValues.forEach((item) => {
      selectedAttrStr += `，${item.specValue}  `;
    });
    // eslint-disable-next-line array-callback-return
    const skuItem = skuArray.filter((item) => {
      let status = true;
      (item.specInfo || []).forEach((subItem) => {
        if (
          !selectedSku[subItem.specId] ||
          selectedSku[subItem.specId] !== subItem.specValueId
        ) {
          status = false;
        }
      });
      if (status) return item;
    });
    this.selectSpecsName(selectedSkuValues.length > 0 ? selectedAttrStr : '');
    if (skuItem) {
      this.setData({
        selectItem: skuItem,
        selectSkuSellsPrice: skuItem.price || 0,
      });
    } else {
      this.setData({
        selectItem: null,
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      specImg: skuItem && skuItem.skuImage ? skuItem.skuImage : primaryImage,
    });
  },


  selectSpecsName(selectSpecsName) {
    if (selectSpecsName) {
      this.setData({
        selectedAttrStr: selectSpecsName,
      });
    } else {
      this.setData({
        selectedAttrStr: '',
      });
    }
  },

  addCart() {
    const { buyNum, details } = this.data;
    if (buyNum > details.stock) {
      Toast({ context: this, selector: '#t-toast', message: '库存只有' + details.stock });
      this.setData({
        buyNum: details.stock
      })
      return false
    }
    addCart({ cartNum: buyNum, isNew: false, productId: details.id })
      .then(({ code }) => {
        if (code === 200) {
          this.handlePopupHide()
          wx.showToast({
            inco: 'success',
            title: '添加成功',
          });
          this.setData({ buyNum: 1 })
          return;
        }
        return false
      })
    return false
  },

  gotoBuy() {
    const { buyNum, details } = this.data;
    if (buyNum > details.stock) {
      Toast({ context: this, selector: '#t-toast', message: '库存只有' + details.stock });
      this.setData({
        buyNum: details.stock
      })
      return false
    }
    const query = {
      from: 'detail',
      type: 1,
      number: buyNum,
      productId: details.id
    };
    let urlQueryStr = obj2Params(query, true);
    const path = `/pages/order/order-confirm/index?${urlQueryStr}`;
    wx.navigateTo({
      url: path,
    });
  },

  specsConfirm() {
    const {
      buyType
    } = this.data;
    if (buyType === 1) {
      this.gotoBuy();
    } else {
      this.addCart();
    }
  },

  changeNum(e) {
    this.setData({
      buyNum: e.detail.buyNum,
    });
  },

  showPromotionPopup() {
    this.setData({
      isShowPromotionPop: true,
    });
  },

  async getDetail(id) {
    const { code, data } = await fetchProductDetail(id)
    if (code !== 200) return false;
    const soldout = data.isShow === 'N' || !data.stock;
    this.setData({
      soldout,
      details: data,
    })
  },

  onShareAppMessage() {
    // 自定义的返回信息
    const {
      selectedAttrStr
    } = this.data;
    let shareSubTitle = '';
    if (selectedAttrStr.indexOf('件') > -1) {
      const count = selectedAttrStr.indexOf('件');
      shareSubTitle = selectedAttrStr.slice(count + 1, selectedAttrStr.length);
    }
    const customInfo = {
      imageUrl: this.data.details.primaryImage,
      title: this.data.details.productName + shareSubTitle,
      path: `/pages/goods/details/index?spuId=${this.data.spuId}`,
    };
    return customInfo;
  },

  onLoad(query) {
    const { id, spuId } = query;
    this.setData({
      spuId: spuId || id,
    }, () => {
      this.getDetail(this.data.spuId)
    });
  },
});