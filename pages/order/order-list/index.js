import { OrderStatus } from '../config';
import { queryOrderList } from '../../../services/order/index'

Page({
  page: {
    size: 5,
    num: 1,
  },
  data: {
    tabs: [
      { key: '9', text: '全部' },
      { key: OrderStatus.PENDING_PAYMENT, text: '待付款', info: '' },
      { key: OrderStatus.PENDING_DELIVERY, text: '待发货', info: '' },
      { key: OrderStatus.PENDING_RECEIPT, text: '待收货', info: '' },
      { key: OrderStatus.COMPLETE, text: '已完成', info: '' },
    ],
    curTab: '9',
    orderList: [],
    listLoading: 0,
    pullDownRefreshing: false,
    emptyImg:
      'https://cdn-we-retail.ym.tencent.com/miniapp/order/empty-order-list.png',
    backRefresh: false,
    status: -1,
  },

  onLoad(query) {
    let status = parseInt(query.status);
    const nMap = {
      '5': '0',
      '10': '1',
      '40': '2',
      '60': '4'
    }
    status = nMap[status]
    status = this.data.tabs.map((t) => t.key).includes(status) ? status : '9';
    this.init(status);
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({ backRefresh: false });
  },

  onReachBottom() {
    if (this.data.listLoading === 0) {
      this.getOrderList(this.data.curTab);
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_(e) {
    const { callback } = e.detail;
    this.setData({ pullDownRefreshing: true });
    this.refreshList(this.data.curTab)
      .then(() => {
        this.setData({ pullDownRefreshing: false });
        callback && callback();
      })
      .catch((err) => {
        this.setData({ pullDownRefreshing: false });
        Promise.reject(err);
      });
  },

  init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.setData({
      status,
    });
    this.refreshList(status);
  },

  getOrderList(statusCode = '9', reset = false) {
    const params = {
      limit: this.page.size,
      page: this.page.num,
      type: Number(statusCode)
    };
    this.setData({ listLoading: 1 });
    return queryOrderList(params)
      .then(({ code, data }) => {
        let orderList = [];
        const { list, total } = data;
        if (code === 200) {
          this.page.num++;
          orderList = list.map(order => {
            const { orderInfoList, storeOrder } = order;
            const newOrder = {
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
              })),
              buttons: [
                { primary: false, type: 12, name: '订单详情' },
              ],
              freightFee: storeOrder.freightFee, // 运费
            }
            switch (storeOrder.status) {
              case 0: newOrder.buttons = [
                { primary: false, type: 12, name: '订单详情' },
                { primary: true, type: 1, name: '去支付' },
              ]; break;
              case 2: newOrder.buttons = [
                { primary: false, type: 12, name: '订单详情' },
                { primary: true, type: 3, name: '确认收货' },
              ]; break;
            }
            return newOrder
          })
          if (total === 0) {
            console.log(orderList.length, 'sign')
          }
          return new Promise((resolve) => {
            if (reset) {
              this.setData({ orderList: [] }, () => resolve());
            } else resolve();
          }).then(() => {
            const list = this.data.orderList.concat(orderList);
            this.setData({
              orderList: list,
              listLoading: orderList.length < total ? 0 : 2,
            });
          });
        }
      }).catch((err) => {
        this.setData({ listLoading: 3 });
        return Promise.reject(err);
      });
  },

  onReTryLoad() {
    this.getOrderList(this.data.curTab);
  },

  onTabChange(e) {
    const { value } = e.detail;
    this.setData({
      status: value,
    });
    this.refreshList(value);
  },

  refreshList(status = '9') {
    this.page = {
      size: this.page.size,
      num: 1,
    };
    this.setData({ curTab: status, orderList: [] });

    return Promise.all([
      this.getOrderList(status, true),
    ]);
  },

  onRefresh() {
    this.refreshList(this.data.curTab);
  },

  onOrderCardTap(e) {
    const { order } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-detail/index?id=${order.id}`,
    });
  },
});
