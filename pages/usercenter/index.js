import { fetchUserInfo, queryImage } from '../../services/usercenter/index';
import Toast from 'tdesign-miniprogram/toast/index';


Page({
  data: {
    showMakePhone: false,
    visible: false,
    userInfo: {
      avatarUrl: '',
      nickName: '正在登录...',
      phoneNumber: '',
    },
    menuData: [
      [{
        title: '收货地址',
        tit: '',
        url: '',
        type: 'address',
      },
      {
        title: '我的收藏',
        tit: '',
        url: '',
        type: 'favorite',
      },
      {
        title: '我的客服',
        tit: '',
        url: '',
        type: 'help-center',
      },
      ],
    ],
    orderTagInfos: [{
      code: 'noBuy',
      title: '待付款',
      iconName: 'wallet',
      orderNum: 0,
      tabType: 5,
      status: 1,
    },
    {
      code: 'noPostage',
      title: '待发货',
      iconName: 'deliver',
      orderNum: 0,
      tabType: 10,
      status: 1,
    },
    {
      code: 'noTake',
      title: '待收货',
      iconName: 'package',
      orderNum: 0,
      tabType: 40,
      status: 1,
    },
    {
      code: 'done',
      title: '已完成',
      iconName: 'comment',
      orderNum: 0,
      tabType: 60,
      status: 1,
    },
    {
      code: 'noRefund',
      title: '退款/售后',
      iconName: 'exchang',
      orderNum: 0,
      tabType: 0,
      status: 1,
    },
    ],
    customerServiceInfo: {},
    currAuthStep: 1,
    versionNo: '',
    posterUrl: '',
    qrCodeUrl: '',
    kefuUrl: '',
    iskefu: false,
  },

  onLoad() { },

  onShow() {
    this.getTabBar().init();
    this.init();
  },

  init() {
    this.fetUseriInfoHandle();
    queryImage(3).then(res => {
      this.setData({
        posterUrl: res.data.imgUrl
      })
    })
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

  handleClose() {
    this.setData({
      iskefu: false
    })
  },

  fetUseriInfoHandle() {
    const { orderTagInfos } = this.data;
    fetchUserInfo().then(({ code, data }) => {
      if (code === 200) {
        const { orderStatusNum, ...userInfo } = data;
        orderTagInfos.map(item => {
          item.orderNum = orderStatusNum[item.code] ? orderStatusNum[item.code] : 0
          return item
        })
        this.setData({
          userInfo,
          currAuthStep: 2,
          orderTagInfos
        });
        wx.stopPullDownRefresh();
      }
    })
  },

  onClickCell({
    currentTarget
  }) {
    const {
      type
    } = currentTarget.dataset;

    switch (type) {
      case 'address': {
        wx.navigateTo({
          url: '/pages/usercenter/address/list/index'
        });
        break;
      }
      case 'service': {
        this.openMakePhone();
        break;
      }
      case 'help-center': {
        queryImage().then(({ code, data }) => {
          if (code === 200) {
            this.setData({
              kefuUrl: data.imgUrl,
              iskefu: true
            })
          }
        })
        break;
      }
      case 'favorite': {
        wx.navigateTo({
          url: '/pages/usercenter/collection/collection'
        });
        break;
      }
      case 'share': {
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;
    if (status === 0) {
      wx.navigateTo({
        url: '/pages/order/after-service-list/index'
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/order-list/index?status=${status}`
      });
    }
  },

  jumpAllOrder() {
    wx.navigateTo({
      url: '/pages/order/order-list/index'
    });
  },

  openMakePhone() {
    this.setData({
      showMakePhone: true
    });
  },

  closeMakePhone() {
    this.setData({
      showMakePhone: false
    });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const {
      currAuthStep
    } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({
        url: '/pages/usercenter/person-info/index'
      });
    } else {
      this.fetUseriInfoHandle();
    }
  },

  onVisibleChange(e) {
    this.setData({
      visible: e.detail.visible,
    });
  },
});