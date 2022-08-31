import { queryOrderDetail } from '../../../services/order/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    pageLoading: true,
    order: {}, // 后台返回的原始数据
    _order: {}, // 内部使用和提供给 order-card 的数据
    backRefresh: false, // 用于接收其他页面back时的状态
    formatCreateTime: '', //格式化订单创建时间
    orderHasCommented: false,
    addressDetail: {}
  },

  onLoad(query) {
    this.id = query.id;
    this.init();
    this.navbar = this.selectComponent('#navbar');
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    // 当从其他页面返回，并且 backRefresh 被置为 true 时，刷新数据
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({ backRefresh: false });
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onImgError(e) {
    if (e.detail) {
      console.error('img 加载失败');
    }
  },

  // 页面初始化，会展示pageLoading
  init() {
    this.setData({ pageLoading: true });
    this.getDetail()
      .then(() => {
        this.setData({ pageLoading: false });
      })
      .catch((e) => {
        console.error(e);
      });
  },

  // 页面刷新，展示下拉刷新
  onRefresh() {
    this.init();
    // 如果上一页为订单列表，通知其刷新数据
    const pages = getCurrentPages();
    const lastPage = pages[pages.length - 2];
    if (lastPage) {
      lastPage.data.backRefresh = true;
    }
  },

  // 页面刷新，展示下拉刷新
  onPullDownRefresh_(e) {
    const { callback } = e.detail;
    return this.getDetail().then(() => callback && callback());
  },

  onToRefund({ currentTarget }) {
    const { id, price, num } = currentTarget.dataset.item
    wx.navigateTo({ url: `/pages/order/apply-service/index?id=${id}&price=${price}&num=${num}` });
  },

  getDetail() {
    return queryOrderDetail(this.id)
      .then(({ code, data }) => {
        if (code === 200) {
          const { orderInfoList, storeOrder } = data;
          const _order = {
            id: storeOrder.id,
            orderId: storeOrder.orderId,
            status: storeOrder.status.toString(),
            statusDesc: storeOrder.statusText,
            amount: storeOrder.cost,
            createTime: storeOrder.createTime,
            addressId: storeOrder.addressId,
            goodsList: (orderInfoList || []).map((goods) => ({
              id: goods.id,
              thumb: goods.info,
              title: goods.storeName,
              price: goods.price,
              num: goods.number,
              status: goods.status,
              productId: goods.productId
            })),
            buttons: [],
            paid: storeOrder.paid,
            freightFee: storeOrder.freightFee, // 运费
          };
          switch (storeOrder.status) {
            case 0: _order.buttons = [ // 待支付 取消 支付 练习客服
              { primary: false, type: 2, name: '取消订单' },
              { primary: true, type: 1, name: '去支付' },
              { primary: false, type: 1024, name: '联系客服' },
            ];
              break;
            case 1: _order.buttons = [ // 待发货 联系客服
              // { primary: true, type: 4, name: '申请退款' },
              { primary: false, type: 1024, name: '联系客服' },
            ];
              break;
            case 2: _order.buttons = [ // 待收货 查看物流 确认收货 联系客服
              { primary: true, type: 3, name: '确认收货' },
              { primary: false, type: 250, name: '查看物流' },
              { primary: false, type: 1024, name: '联系客服' },
            ];
              break;
            case 4: _order.buttons = [ // 已完成 查看物流 联系客服
              { primary: false, type: 250, name: '查看物流' },
              { primary: false, type: 1024, name: '联系客服' },
            ];
              break;
            case 5: _order.buttons = [ // 已取消 联系客服
              { primary: false, type: 1024, name: '联系客服' },
            ];
              break;
          }
          this.setData({
            _order,
            formatCreateTime: _order.createTime,
            isPaid: _order.paid,
            addressDetail: {
              address: storeOrder.province + storeOrder.city + storeOrder.district + storeOrder.userAddress,
              realName: storeOrder.realName,
              phone: storeOrder.userPhone
            }
          });
        }
      })
  },

  onGoodsCardTap(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data._order.goodsList[index];
    wx.navigateTo({ url: `/pages/goods/details/index?id=${goods.productId}` });
  },

  onOrderNumCopy() {
    wx.setClipboardData({
      data: this.data._order.orderId,
    });
  },

  clickService() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '您点击了联系客服',
    });
  },
});
