import { fetchFrontProducts } from '../../../services/good/index';
import Toast from 'tdesign-miniprogram/toast/index';

const initFilters = {
  sorts: '',
};

Page({
  data: {
    goodsList: [],
    sorts: '',
    show: false,
    minVal: '',
    maxVal: '',
    minSalePriceFocus: false,
    maxSalePriceFocus: false,
    filter: initFilters,
    hasLoaded: false,
    keywords: '',
    loadMoreStatus: 0,
    loading: true,
  },

  total: 0,
  pageNum: 1,
  pageSize: 30,

  onLoad(options) {
    const { searchValue = '' } = options || {};
    wx.setNavigationBarTitle({
      title: unescape(searchValue) || '搜索',
    })
    this.setData({ keywords: unescape(searchValue) }, () => this.init(true));
  },

  async init(reset = true, searchValue) {
    const { loadMoreStatus, goodsList = [], keywords, sorts, minVal, maxVal } = this.data;
    if (loadMoreStatus !== 0) return;
    this.setData({
      loadMoreStatus: 1,
      loading: true,
    });
    try {
      const params = { keyWord: searchValue ? searchValue : keywords };
      if (sorts) {
        const ps = sorts.split('-');
        params[`${ps[0]}Order`] = ps[1];
      }
      if (minVal) {
        params.minPrice = minVal
      }
      if (maxVal) {
        params.maxPrice = maxVal
      }
      const result = await fetchFrontProducts(params);
      if (result.code === 200) {
        const { list, total = 0, page = 1 } = result.data;
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
        this.pageNum = page || 1;
        this.total = total;
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

  changeHandle({ detail }) {
    const { value } = detail;
    this.setData({
      keywords: value
    })
  },

  handleSubmit({ detail }) {
    this.saveKeyword(detail.value)
    this.setData(
      {
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        this.init(true, detail.value);
      },
    );
  },

  saveKeyword(value) {
    const searchHistory = wx.getStorageSync('searchHistory');
    if (searchHistory) {
      const arr = searchHistory.split(',');
      arr.unshift(value);
      const data = [...new Set(arr)]
      wx.setStorageSync('searchHistory', data.join(','))
    } else {
      wx.setStorageSync('searchHistory', value)
    }
  },

  // onReachBottom() {
  //   const { goodsList } = this.data;
  //   const { total = 0 } = this;
  //   if (goodsList.length === total) {
  //     this.setData({
  //       loadMoreStatus: 2,
  //     });
  //     return;
  //   }
  //   this.init(false);
  // },

  gotoGoodsDetail(e) {
    const { index } = e.detail;
    const { id } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?id=${id}`,
    });
  },

  handleFilterChange({ detail }) {
    const { sorts } = detail;
    const _filter = {
      sorts,
    };
    this.setData({
      filter: _filter,
      sorts,
    });

    this.pageNum = 1;
    this.setData(
      {
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        this.init(true);
      },
    );
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
    const { keywords } = this.data;
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
