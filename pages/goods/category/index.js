import { fetchBasicsCategory, fetchFrontProducts } from '../../../services/good/index'

Page({
  data: {
    list: [],
    activeKey: 0,
    subActiveKey: 0,
    goodsList: [],
    tabs: [],
    hasLoaded: true,
    page: 1,
    goodsListLoadStatus: 0
  },
  async init() {
    try {
      const responce = await fetchBasicsCategory();
      const { data } = responce;
      const _this = this;
      const list = data.reverse();
      this.setData({
        list,
        tabs: list[0].child,
      }, () => {
        _this.queryGoodsList()
      });
    } catch (error) {
      console.error('err:', error);
    }
  },
  onChange({ currentTarget }) {
    const { item } = currentTarget.dataset
    wx.navigateTo({
      url: `/pages/goods/list/index?from=category&cid=${item.id}`,
    });
    return false
  },

  onLoad() {
    this.init(true);
  },

  onShow() {
    this.getTabBar().init();
  },

  scrollBottom() {
    this.queryGoodsList()
  },

  queryGoodsList() {
    let { page, activeKey, subActiveKey, list, goodsList, goodsListLoadStatus } = this.data;
    if (goodsListLoadStatus === 2) {
      return false
    }
    const item = list[activeKey].child[subActiveKey];
    const params = {};
    if (item.id) {
      params.cid = item.id
    } else {
      params.cids = item.cids
    }
    fetchFrontProducts({ ...params, limit: 6, page })
      .then(({ code, data }) => {
        if (code === 200) {
          let result = []
          if (page === 1) {
            result = data.list
          } else {
            result = goodsList.concat(data.list)
          }
          page++
          this.setData({
            page,
            goodsList: result,
            goodsListLoadStatus: data.total <= result.length ? 2 : 0
          })
        }
      })
  },

  gotoGoodsDetail(e) {
    const { id } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?id=${id}`,
    });
  },

  onTabsChange({ detail }) {
    const { list } = this.data;
    const { value } = detail;
    const _this = this;
    console.log()
    this.setData({
      activeKey: value,
      subActiveKey: 0,
      // fix: tab-pannel 组件问题，不更新tab
      tabs: [],
      page: 1,
      goodsListLoadStatus: 0
    }, () => {
      _this.setData({
        tabs: list[value].child
      })
      _this.queryGoodsList()
    })
  },

  onSubTabsChange({ detail }) {
    const { value } = detail;
    this.setData({
      subActiveKey: value,
      page: 1,
      goodsListLoadStatus: 0
    }, () => {
      this.queryGoodsList()
    })
  }
});
