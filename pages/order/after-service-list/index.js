import { AfterServiceStatus } from '../config';
import { queryRefundOrder } from '../../../services/order/index'

Page({
  page: {
    size: 10,
    num: 1,
  },

  data: {
    tabs: [
      {
        key: -1,
        text: '全部',
      },
      {
        key: AfterServiceStatus.TO_AUDIT,
        text: '待审核',
      },
      {
        key: AfterServiceStatus.THE_APPROVED,
        text: '已审核',
      },
      {
        key: AfterServiceStatus.COMPLETE,
        text: '已完成',
      },
      {
        key: AfterServiceStatus.CLOSED,
        text: '已关闭',
      },
    ],
    curTab: -1,
    dataList: [],
    listLoading: 0, // 0-未加载，1-加载中，2-已全部加载
    pullDownRefreshing: false, // 下拉刷新时不显示load-more
    emptyImg:
      'https://cdn-we-retail.ym.tencent.com/miniapp/order/empty-order-list.png',
    backRefresh: false,
  },

  onLoad(query) {
    let status = parseInt(query.status);
    status = this.data.tabs.map((t) => t.key).includes(status) ? status : -1;
    this.init(status);
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    // 当从其他页面返回，并且 backRefresh 被置为 true 时，刷新数据
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({
      backRefresh: false,
    });
  },

  onReachBottom() {
    if (this.data.listLoading === 0) {
      this.getAfterServiceList(this.data.curTab);
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_(e) {
    const { callback } = e.detail;
    this.setData({
      pullDownRefreshing: true,
    }); // 下拉刷新时不显示load-more
    this.refreshList(this.data.curTab)
      .then(() => {
        this.setData({
          pullDownRefreshing: false,
        });
        callback && callback();
      })
      .catch((err) => {
        this.setData({
          pullDownRefreshing: false,
        });
        Promise.reject(err);
      });
  },

  init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.refreshList(status);
  },

  getAfterServiceList(statusCode = -1, reset = false) {
    const params = {
      parameter: {
        pageSize: this.page.size,
        pageNum: this.page.num,
      },
    };
    const p = {
      limit: this.page.size,
      page: this.page.num
    }
    this.setData({
      listLoading: 1,
    });

    return queryRefundOrder(p).then(({ code, data }) => {
      let dataList = [];
      this.page.num++;
      const { total, list } = data;
      if (code === 200) {
        dataList = list.map(item => {
          return {
            ...item,
            type: item.refundType,
            typeDesc: item.refundType == 1 ? '退款' : '退货退款',
            createTime: item.createTime,
            goodsList: [{
              thumb: item.productImage,
              title: item.productName,
              specs: [],
              itemRefundAmount: item.price,
              rightsQuantity: item.number,
            }],
            buttons: [{
              name: '查看详情',
              primary: false,
              type: 10,
            }],
          }
        })
      }
      return new Promise((resolve) => {
        if (reset) {
          this.setData(
            {
              dataList: [],
            },
            () => resolve(),
          );
        } else resolve();
      }).then(() => {
        const result = this.data.dataList.concat(dataList)
        this.setData({
          dataList: result,
          listLoading: dataList.length >= total ? 2 : 0,
        });
      });
    }).catch((err) => {
      this.setData({
        listLoading: 3,
      });
      return Promise.reject(err);
    });
  },

  onReTryLoad() {
    this.getAfterServiceList(this.data.curTab);
  },

  refreshList(status = -1) {
    this.page = {
      size: 10,
      num: 1,
    };
    this.setData({
      curTab: status,
      dataList: [],
    });
    return this.getAfterServiceList(status, true);
  },

  onRefresh() {
    this.refreshList(this.data.curTab);
  },

  // 点击订单卡片
  onAfterServiceCardTap(e) {
    // wx.navigateTo({
    //   url: `/pages/order/after-service-detail/index?rightsNo=${e.currentTarget.dataset.order.id}`,
    // });
    return false
  },
});
