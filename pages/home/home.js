import { fetchHome, fetchNewPoplarList } from '../../services/home/index';
import { queryImage } from '../../services/usercenter/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    imgSrcs: [],
    goodsList: [],
    categoriesList: [],
    pageLoading: false,
    autoplay: true,
    duration: 500,
    interval: 5000,
    navigation: {
      type: 'dots'
    },
    showType: 'card',
    current: 1,
    goodsListLoadStatus: 0,
    posterUrl: ''
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
    this.queryPoplarGoodsList()
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading({
      success: (res) => {
        Toast({ context: this, selector: '#t-toast', message: '刷新成功' });
      },
    })
    this.init();
    this.setData({
      goodsList: [],
      current: 1,
      goodsListLoadStatus: 0
    }, () => {
      this.queryPoplarGoodsList()
    })
  },

  init() {
    this.loadHomePage();
    queryImage(3).then(res => {
      this.setData({
        posterUrl: res.data.imgUrl
      })
    })
  },

  loadHomePage() {
    this.setData({
      pageLoading: true,
    });
    fetchHome().then((res) => {
      if (res.code === 200) {
        const { bannerList, functionCategoriesList, productList } = res.data;
        this.setData({
          imgSrcs: bannerList,
          categoriesList: functionCategoriesList,
          goodsList: productList || [],
          pageLoading: false,
        });
      }
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh()
    });
  },

  switchGoodlistShowType() {
    this.setData({
      showType: this.data.showType === 'card' ? 'list' : 'card'
    })
  },

  goodListClickHandle(e) {
    const { index } = e.detail;
    const { id } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?id=${id}`,
    });
  },

  navToSearchPage() {
    wx.navigateTo({
      url: '/pages/goods/search/index'
    });
  },

  onHandleBanner({ currentTarget }) {
    const { productLabel, specialType, title, proId } = currentTarget.dataset.item;
    if (specialType === 0) {
      return false
    } else if (specialType === 1) {
      wx.navigateTo({
        url: `/pages/goods/details/index?id=${proId}`,
      })
    } else {
      wx.navigateTo({
        url: `/pages/goods/list/index?cid=${productLabel}&from=home&categoriesName=${escape(title)}`,
      })
    }
  },

  queryPoplarGoodsList() {
    const { current, goodsList, goodsListLoadStatus } = this.data;
    if (goodsListLoadStatus === 2) return false;
    fetchNewPoplarList({ page: current })
      .then(({ code, data }) => {
        if (code === 200) {
          let newlist = []
          if (goodsList.length === 0) {
            newlist = data.list
          } else {
            newlist = goodsList.concat(data.list)
          }
          this.setData({
            goodsList: newlist,
            current: current + 1,
            goodsListLoadStatus: data.list.length === 0 ? 2 : 0
          })
        }
      })
  },

  onReachBottom() {
    this.queryPoplarGoodsList()
  },

  onShareAppMessage() {
    const { posterUrl } = this.data
    const customInfo = {
      imageUrl: posterUrl,
      title: '繁兔营养商城',
      path: `/pages/home/home`,
    };
    return customInfo;
  },

  onShareTimeline() {
    const { posterUrl } = this.data
    const customInfo = {
      imageUrl: posterUrl,
      title: '繁兔营养商城',
      path: `/pages/home/home`,
    };
    return customInfo;
  },
});