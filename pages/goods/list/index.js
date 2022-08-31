import { fetchFrontProducts } from '../../../services/good/index';
import Toast from 'tdesign-miniprogram/toast/index';

const initFilters = {
  sorts: '',
  layout: 0,
};

Page({
  data: {
    cid: '',
    productLabel: '',
    from: '',
    goodsList: [],
    layout: 0,
    sorts: '',
    show: false,
    minVal: '',
    maxVal: '',
    filter: initFilters,
    hasLoaded: false,
    loadMoreStatus: 0,
    loading: true,
  },

  pageNum: 1,
  pageSize: 30,
  total: 0,

  onLoad(options) {
    const text = options.categoriesName
      ? unescape(options.categoriesName)
      : '商品列表';
    wx.setNavigationBarTitle({
      title: text,
    });
    const { cid, from } = options;
    this.setData(
      {
        from,
        [from === 'home' ? 'productLabel' : 'cid']: cid,
      },
      () => this.init(true),
    );
  },

  async init(reset = true) {
    const {
      loadMoreStatus,
      goodsList = [],
      cid,
      productLabel,
      from,
      sorts,
      minVal,
      maxVal,
    } = this.data;
    if (loadMoreStatus !== 0) return;
    this.setData({
      loadMoreStatus: 1,
      loading: true,
    });

    try {
      const params = from === 'home' ? { productLabel } : { cid };
      if (sorts) {
        const ps = sorts.split('-');
        params[`${ps[0]}Order`] = ps[1];
      }
      if (minVal) {
        params.minPrice = minVal;
      }
      if (maxVal) {
        params.maxPrice = maxVal;
      }
      const responce = await fetchFrontProducts({
        ...params,
        limit: 6,
        page: this.pageNum,
      });
      if (responce.code === 200) {
        const { data } = responce;
        const { list, total = 0 } = data;
        if (total === 0 && reset) {
          this.total = total;
          this.setData({
            emptyInfo: {
              tip: '抱歉，未找到相关商品',
            },
            hasLoaded: true,
            loadMoreStatus: 0,
            loading: false,
            goodsList: [],
          });
          return;
        }
        const _goodsList = reset ? list : goodsList.concat(list);
        const _loadMoreStatus = _goodsList.length === total ? 2 : 0;
        this.setData({
          goodsList: _goodsList,
          loadMoreStatus: _loadMoreStatus,
        });
      } else {
        this.setData({
          loading: false,
        });
        wx.showToast({
          title: '查询失败，请稍候重试',
        });
      }
    } catch (error) {
      this.setData({
        loading: false,
      });
    }
    this.setData({
      hasLoaded: true,
      loading: false,
    });
  },

  handleFilterChange({ detail }) {
    const { layout, sorts } = detail;
    this.pageNum = 1;
    this.setData({
      layout,
      sorts,
      loadMoreStatus: 0,
    });
    this.init(true);
  },

  onReachBottom() {
    const { goodsList } = this.data;
    const { total = 0 } = this;
    if (goodsList.length === total) {
      this.setData({
        loadMoreStatus: 2,
      });
      return;
    }
    this.pageNum++;
    this.init(false);
  },

  gotoGoodsDetail(e) {
    const { id } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?id=${id}`,
    });
  },

  showFilterPopup() {
    this.setData({
      show: true,
    });
  },

  showFilterPopupClose() {
    this.setData({
      show: false,
    });
  },

  onMinValAction(e) {
    const { value } = e.detail;
    this.setData({ minVal: value });
  },

  onMaxValAction(e) {
    const { value } = e.detail;
    this.setData({ maxVal: value });
  },

  reset() {
    this.setData({ minVal: '', maxVal: '' });
  },

  confirm() {
    const { minVal, maxVal } = this.data;
    let message = '';
    if (minVal && !maxVal) {
      message = `价格最小是${minVal}`;
    } else if (!minVal && maxVal) {
      message = `价格范围是0-${minVal}`;
    } else if (minVal && maxVal && minVal <= maxVal) {
      message = `价格范围${minVal}-${this.data.maxVal}`;
    } else {
      message = '请输入正确范围';
    }
    if (message) {
      Toast({
        context: this,
        selector: '#t-toast',
        message,
      });
    }
    this.pageNum = 1;
    this.setData(
      {
        show: false,
        minVal,
        goodsList: [],
        loadMoreStatus: 0,
        maxVal,
      },
      () => {
        this.init();
      },
    );
  },
});
