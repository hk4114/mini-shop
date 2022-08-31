import Toast from 'tdesign-miniprogram/toast/index';
import { wechatPayOrder } from './pay';

import { fetchDefaultAddress, fetchAddress } from '../../../services/address/index';
import { payOrder, queryListByCartIds, queryOrderDetail } from '../../../services/order/index';
import { fetchProductDetail } from '../../../services/good/index';

const stripeImg = `https://cdn-we-retail.ym.tencent.com/miniapp/order/stripe.png`;

const params2Obj = (obj) => {
  Object.keys(obj).forEach((key) => {
    obj[key] = decodeURIComponent(obj[key])
  });
  return obj;
};

const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) =>
    result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`),
  );
  return result.join('&');
};

const calcSettleDetailData = (list) => {
  let result = {
    totalGoodsCount: 0, // 商品数量
    totalSalePrice: 0,// 商品总价
    totalDeliveryFee: 0 // 运费
  }
  result = list.reduce((prev, next) => {
    let { totalGoodsCount, totalSalePrice, totalDeliveryFee } = prev;
    totalGoodsCount += Number(next.number)
    totalSalePrice += next.number * next.price
    totalDeliveryFee += next.deliveryFee || 0;
    return {
      totalGoodsCount,
      totalSalePrice,
      totalDeliveryFee
    }
  }, result)
  return {
    ...result,
    totalSalePrice: result.totalSalePrice.toFixed(2)
  }
}

Page({
  data: {
    placeholder: '备注信息',
    stripeImg,
    loading: false,
    settleDetailData: {
      totalGoodsCount: 0, // 商品数量
      totalSalePrice: 0,// 商品总价
      totalDeliveryFee: 0 // 运费
    }, // 获取结算页详情 data
    orderCardList: [], // 仅用于商品卡片展示
    invoiceData: {
      email: '', // 发票发送邮箱
      buyerTaxNo: '', // 税号
      invoiceType: null, // 开票类型  1：增值税专用发票； 2：增值税普通发票； 3：增值税电子发票；4：增值税卷式发票；5：区块链电子发票。
      buyerPhone: '', //手机号
      buyerName: '', //个人或公司名称
      titleType: '', // 发票抬头 1-公司 2-个人
      contentType: '', //发票内容 1-明细 2-类别
    },
    goodsRequestList: [],
    userAddressReq: null,
    popupShow: false, // 不在配送范围 失效 库存不足 商品展示弹框
    notesPosition: 'center',
    storeInfoList: [],
    storeNoteIndex: 0, //当前填写备注门店index
    promotionGoodsList: [], //当前门店商品列表(优惠券)
    currentStoreId: null, //当前优惠券storeId
    userAddress: null,
    urlParams: null,
    goodsList: [],
    settleType: 0
  },

  payLock: false,
  noteInfo: [],
  tempNoteInfo: [],

  onLoad(options) {
    this.setData({
      loading: true,
      urlParams: params2Obj(options)
    }, () => this.handleOptionsParams(options));
  },

  // 处理不同情况下跳转到结算页时需要的参数
  handleOptionsParams(options) {
    const { urlParams } = this.data
    // 详情页直接下单
    if (options.type == 1) {
      this.fetchAddress(options.addressId)
      fetchProductDetail(options.productId)
        .then(({ code, data }) => {
          if (code === 200) {
            const goodsList = [{
              ...urlParams,
              image: data.image,
              price: data.retailPrice,
              productName: data.productName
            }]
            this.setData({
              goodsList,
              loading: false,
              settleDetailData: calcSettleDetailData(goodsList)
            })
          }
        })
      return
    }
    if (options.type == 2) {
      this.fetchAddress(options.addressId)
      const { cartIds } = options;
      queryListByCartIds(cartIds.replace(/\-/g, ',')).then(({ code, data }) => {
        if (code === 200) {
          const goodsList = data.map(v => {
            const { productInfo, cartNum } = v;
            return {
              image: productInfo.image,
              price: productInfo.retailPrice,
              productName: productInfo.productName,
              number: cartNum
            }
          })
          this.setData({
            goodsList,
            loading: false,
            settleDetailData: calcSettleDetailData(goodsList)
          })
        }
      })
      return
    }
    if (options.type == 3) {
      this.fetchAddress(options.addressId)
      const { id } = options;
      queryOrderDetail(id)
        .then(({ code, data }) => {
          if (code === 200) {
            const { orderInfoList } = data;
            const goodsList = orderInfoList.map(goods => {
              return {
                image: goods.info,
                price: goods.price,
                productName: goods.storeName,
                number: goods.number
              }
            })
            this.setData({
              goodsList,
              loading: false,
              settleDetailData: calcSettleDetailData(goodsList)
            })
          }
        })
    }
  },

  fetchAddress(addressId) {
    if (addressId) {
      fetchAddress(addressId).then(({ code, data }) => {
        if (code === 200) {
          this.setData({
            settleType: 1,
            userAddress: data
          })
        }
      })
    } else {
      fetchDefaultAddress()
        .then(({ code, data }) => {
          if (code === 200) {
            this.setData({ settleType: 1, userAddress: data })
          }
        })
    }
  },

  handleError() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '结算异常, 请稍后重试',
      duration: 2000,
      icon: '',
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
    this.setData({
      loading: false,
    });
  },

  getRequestGoodsList(storeGoodsList) {
    const filterStoreGoodsList = [];
    storeGoodsList &&
      storeGoodsList.forEach((store) => {
        const { storeName } = store;
        store.skuDetailVos &&
          store.skuDetailVos.forEach((goods) => {
            const data = goods;
            data.storeName = storeName;
            filterStoreGoodsList.push(data);
          });
      });
    return filterStoreGoodsList;
  },

  onGotoAddress() {
    const { userAddress, urlParams } = this.data;
    const { productName, ...other } = urlParams;
    const params = {
      selectMode: 1,
      isOrderSure: 1,
      ...(userAddress ? { id: userAddress.id } : null),
      ...other
    }
    wx.redirectTo({
      url: `/pages/usercenter/address/list/index?${obj2Params(params)}`,
    });
  },

  onNotes(e) {
    const { storenoteindex: storeNoteIndex } = e.currentTarget.dataset;
    // 添加备注信息
    this.setData({
      dialogShow: true,
      storeNoteIndex,
    });
  },

  onInput(e) {
    const { storeNoteIndex } = this.data;
    this.noteInfo[storeNoteIndex] = e.detail.value;
  },

  onBlur() {
    this.setData({
      notesPosition: 'center',
    });
  },

  onFocus() {
    this.setData({
      notesPosition: 'self',
    });
  },

  onTap() {
    this.setData({
      placeholder: '',
    });
  },

  onNoteConfirm() {
    // 备注信息 确认按钮
    const { storeInfoList, storeNoteIndex } = this.data;
    this.tempNoteInfo[storeNoteIndex] = this.noteInfo[storeNoteIndex];
    storeInfoList[storeNoteIndex].remark = this.noteInfo[storeNoteIndex];

    this.setData({
      dialogShow: false,
      storeInfoList,
    });
  },

  onNoteCancel() {
    // 备注信息 取消按钮
    const { storeNoteIndex } = this.data;
    this.noteInfo[storeNoteIndex] = this.tempNoteInfo[storeNoteIndex];
    this.setData({
      dialogShow: false,
    });
  },

  // 提交订单
  submitOrder() {
    const { urlParams, userAddress } = this.data;
    const { from, productName, isOrderSure, selectMode, ...other } = urlParams;
    if (!userAddress || !userAddress.id) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请填写收货地址',
        duration: 2000,
        icon: '',
      });
      return false
    }
    if (other.cartIds) {
      delete other.id
      other.cartIds = other.cartIds.replace(/\-/g, ',')
    }
    payOrder({
      ...other,
      payType: 2,
      addressId: userAddress.id
    }).then(({ code, data }) => {
      if (code === 200) {
        wechatPayOrder(data);
      }
    }).catch(err => {
      Toast({
        context: this,
        selector: '#t-toast',
        message: err.message || '结算异常, 请稍后重试',
        duration: 2000,
      });
    })
    return false;
  }
});
