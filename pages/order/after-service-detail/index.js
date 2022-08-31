import Toast from 'tdesign-miniprogram/toast/index';
import { queryRefundOrderDetail } from '../../../services/order/index'

const TopStatusMap = {
  '0': '申请中',
  '1': '退款成功',
  '2': '已拒绝',
  '3': '已撤回'
}

Page({
  data: {
    pageLoading: true,
    serviceRaw: {},
    service: {},
    deliveryButton: {},
    gallery: {
      current: 0,
      show: false,
      proofs: [],
    },
    showProofs: false,
    backRefresh: false,
    pageInfo: {},
    type: null,
    status: null,
    topStatusText: ''
  },

  onLoad(query) {
    this.orderInfoId = query.orderInfoId;
    this.inputDialog = this.selectComponent('#input-dialog');
    this.init();
  },

  onShow() {
    // 当从其他页面返回，并且 backRefresh 被置为 true 时，刷新数据
    if (!this.data.backRefresh) return;
    this.init();
    this.setData({ backRefresh: false });
  },

  // 页面刷新，展示下拉刷新
  onPullDownRefresh_(e) {
    const { callback } = e.detail;
    return this.getService().then(() => callback && callback());
  },

  init() {
    this.setData({ pageLoading: true });
    this.getService().then(() => {
      this.setData({ pageLoading: false });
    });
  },

  getService() {
    return queryRefundOrderDetail(this.orderInfoId).then(({ code, data }) => {
      if (code === 200) {
        const service = {
          id: data.id,
          orderInfoId: this.orderInfoId,
          type: data.refundType,
          refundOrderId: data.refundOrderId,
          refundPrice: data.refundPrice,
          typeDesc: data.refundType == 1 ? '退款' : '退货退款',
          createTime: data.createTime,
          refundReasonWap: data.refundReasonWap,
          goodsList: [{
            thumb: data.productImage,
            title: data.productName,
            specs: [],
            itemRefundAmount: data.price,
            rightsQuantity: data.number,
          }],
          orderNo: data.orderId, // 订单编号
          buttons: [{
            name: '联系客服',
            primary: false,
            type: 8,
          }],
        };
        if (data.status === 0) {
          service.buttons = [
            { name: '修改申请', primary: false, type: 6 },
            { name: '撤销申请', primary: false, type: 7 },
            {
              name: '联系客服',
              primary: false,
              type: 8,
            }]
        }
        this.setData({
          service,
          type: data.refundType,
          status: data.status,
          typeText: data.refundType == 1 ? '仅退款' : '退货退款',
          topStatusText: TopStatusMap[data.status.toString()]
        });
        wx.setNavigationBarTitle({
          title: data.refundType == 1 ? '退款详情' : '退货退款详情',
        });
      }
    });
  },

  onRefresh() {
    this.init();
  },

  onGoodsCardTap(e) {
    return false
    // wx.navigateTo({ url: `/pages/goods/details/index?id=${goods.skuId}` });
  },
});
