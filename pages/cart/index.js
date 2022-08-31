import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { fetchCartList, deleteCart, updateCart, editCartChecked } from '../../services/cart/index';

const calcSettleDetailData = (list) => {
  let isAllSelected = true
  let result = {
    totalAmount: 0,
    selectedGoodsCount: 0
  }
  result = list.filter(v => v.status).reduce((prev, next) => {
    let { totalAmount, selectedGoodsCount } = prev;
    const { quantity, isSelected, price } = next;
    if (!isSelected) {
      isAllSelected = false
    }
    selectedGoodsCount += isSelected ? quantity : 0;
    totalAmount += isSelected ? quantity * price : 0;
    return {
      selectedGoodsCount,
      totalAmount
    }
  }, result);
  return {
    ...result,
    totalAmount: result.totalAmount.toFixed(2),
    isAllSelected
  }
}

Page({
  data: {
    isEdit: false,
    cartGroupData: null,
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  onShow() {
    this.getTabBar().init();
    this.refreshData();
  },

  onHide() {
    const { cartGroupData } = this.data;
    const { goodsPromotionList } = cartGroupData.storeGoods[0].promotionGoodsList[0];
    const params = {
      cartIds: goodsPromotionList.filter(v => v.isSelected).map(v => v.cartId),
      checked: true
    };
    const otherparams = {
      cartIds: goodsPromotionList.filter(v => !v.isSelected).map(v => v.cartId),
      checked: false
    };
    if (params.cartIds.length) {
      editCartChecked(params)
    }
    if (otherparams.cartIds.length) {
      editCartChecked(otherparams)
    }
    return false
  },

  refreshData() {
    fetchCartList().then(({ code, data }) => {
      if (code === 200) {
        const { list } = data;
        const listdata = list.map(item => {
          const { productInfo, uid, productId, cartNum, id, status, checked } = item;
          return {
            uid,
            storeId: '1',
            isSelected: checked,
            spuId: productId,
            thumb: productInfo.image,
            title: productInfo.productName,
            quantity: cartNum,
            price: productInfo.retailPrice,
            specInfo: [],
            cartId: id,
            status,
            stock: productInfo.stock
          }
        });

        const cartGroupData = {
          isNotEmpty: !!list.length,
          // invalidGoodItems: [],
          storeGoods: [{
            storeId: '1',
            storeName: 'fantu',
            storeStatus: 1,
            promotionGoodsList: [{
              title: null,
              promotionCode: 'MERCHANT',
              promotionSubCode: 'MYJ',
              promotionId: '01',
              tagText: [],
              promotionStatus: 3,
              tag: '满减',
              description: '',
              goodsPromotionList: listdata.filter(v => v.status)
            }],
            shortageGoodsList: listdata.filter(v => !v.status)
          }],
          ...calcSettleDetailData(listdata)
        };
        this.setData({ cartGroupData });
      }
    })
    return false
  },

  // 全选门店
  // 注：实际场景时应该调用接口更改选中状态
  selectStoreService({ storeId, isSelected }) {
    const currentStore = this.data.cartGroupData.storeGoods.find(
      (s) => s.storeId === storeId,
    );
    currentStore.isSelected = isSelected;
    currentStore.promotionGoodsList.forEach((activity) => {
      activity.goodsPromotionList.forEach((goods) => {
        goods.isSelected = isSelected;
      });
    });
    return Promise.resolve();
  },

  onGoodsSelect(e) {
    const {
      goods: { spuId },
      isSelected,
    } = e.detail;
    let { cartGroupData } = this.data;
    cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList = cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList.map(item => {
      if (item.spuId === spuId) {
        item.isSelected = isSelected ? 1 : 0;
      }
      return item
    });
    cartGroupData = {
      ...cartGroupData,
      ...calcSettleDetailData(cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList)
    }
    this.setData({ cartGroupData })
    return false
  },

  onStoreSelect(e) {
    const {
      store: { storeId },
      isSelected,
    } = e.detail;
    this.selectStoreService({ storeId, isSelected }).then(() =>
      this.refreshData(),
    );
  },

  onQuantityChange(e) {
    const {
      goods: { cartId, stock },
      quantity,
    } = e.detail;
    updateCart(cartId, quantity)
      .then(({ code }) => {
        if (code === 200) {
          this.refreshData()
        }
      })
      .catch((err) => {
        Toast({ context: this, selector: '#t-toast', message: err.message });
        updateCart(cartId, stock).then(({ code }) => {
          if (code === 200) {
            this.refreshData()
          }
          return false
        })
      })
    return false
  },

  onEdit({ detail }) {
    const { isEdit } = detail;
    this.setData({ isEdit })
  },

  onClear() {
    const { cartGroupData } = this.data;
    const { shortageGoodsList } = cartGroupData.storeGoods[0];
    if (!shortageGoodsList.length) {
      return false
    }
    Dialog.confirm({
      content: '确认清空无货商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      deleteCart(shortageGoodsList.map(v => v.cartId)).then(({ code }) => {
        if (code === 200) {
          Toast({ context: this, selector: '#t-toast', message: '商品清空成功' });
          this.refreshData();
        }
      })
    });
  },

  goGoodsDetail(e) {
    const { spuId } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?id=${spuId}`,
    });
  },

  onGoodsDelete(e) {
    const {
      goods: { cartId },
    } = e.detail;
    Dialog.confirm({
      content: '确认删除该商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      deleteCart([cartId]).then(({ code }) => {
        if (code === 200) {
          Toast({ context: this, selector: '#t-toast', message: '商品删除成功' });
          this.refreshData();
        }
      })
    });
  },

  onSelectAll(event) {
    const { isAllSelected } = event?.detail ?? {};
    let { cartGroupData } = this.data;
    cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList = cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList.map(item => {
      item.isSelected = isAllSelected ? 0 : 1;
      return item
    });
    cartGroupData = {
      ...cartGroupData,
      ...calcSettleDetailData(cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList)
    }
    this.setData({ cartGroupData })
    return false
  },

  onBtnClick() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  },

  onToSettle() {
    const { cartGroupData } = this.data;
    const ids = cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList.filter(v => v.isSelected).map(v => v.cartId);
    wx.navigateTo({ url: '/pages/order/order-confirm/index?type=2&from=cart&cartIds=' + ids.join('-') });
  },

  onToDelete() {
    const { cartGroupData } = this.data;
    const ids = cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList.filter(v => v.isSelected).map(v => v.cartId);
    Dialog.confirm({
      content: '确认删除商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      deleteCart(ids).then(({ code }) => {
        if (code === 200) {
          Toast({ context: this, selector: '#t-toast', message: '商品删除成功' });
          this.refreshData();
        }
      })
    });
  }
});
