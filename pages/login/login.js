import util from '../../utils/util';
import { fetchCode, loginByCode, loginByWX, getPhone } from '../../services/login/fetchLogin'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mobile: '',
    code: '',
    showCountDownTime: false,
    disabled: true,
    btnstate: 'default',
    countDownTime: null,
    visible: false,
    canIUseGetUserProfile: false,
    logo: ''
  },
  onShow() {
    // queryImage(4).then(res => {
    //   this.setData({
    //     logo: res.data.imgUrl
    //   })
    // })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  mobileblur: function ({ detail }) {
    this.setData({
      mobile: detail.value,
    });
  },

  getCode: function () {
    if (!this.data.mobile || !util.phoneRegCheck(this.data.mobile)) {
      util.showToast('请填入正确手机号码');
      return false;
    }
    fetchCode(this.data.mobile).then(res => {
      if (res.code === 200) {
        this.setData({
          showCountDownTime: true,
          countDownTime: 300 * 1000,
        });
      }
    })
  },

  formSubmit: function ({ detail }) {
    if (!detail.value.mobile || !detail.value.code) return false;
    const { value } = detail;
    const _this = this
    loginByCode({
      account: value.mobile,
      captcha: value.code,
    }).then((res) => {
      if (res.code === 200) {
        const { data } = res;
        wx.setStorageSync('user', data.user);
        wx.setStorageSync('token', data.token);
        wx.setStorageSync('expiresTime', data.expiresTime);
        wx.showToast({
          title: '注册成功',
          inco: 'success',
          duration: 1000,
          success: function () {
            _this.toPage()
          },
        });
      }
    });
  },

  getUserProfile() {
    const _this = this;
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const { userInfo } = res;
        wx.login({
          success(res) {
            if (res.code) {
              loginByWX(res.code, {
                avatar: userInfo.avatarUrl,
                nickName: userInfo.nickName,
              }).then((result) => {
                const { data, code } = result;
                if (code === 200) {
                  wx.showToast({
                    inco: 'success',
                    title: '登录成功',
                    duration: 1000,
                  });
                  wx.setStorageSync('user', data.user);
                  wx.setStorageSync('token', data.token);
                  wx.setStorageSync('sessionKey', data.sessionKey);
                  if (data.user.phone) {
                    _this.toPage()
                    return false
                  }
                  _this.setData({
                    visible: true
                  })
                }
              })
            }
          }
        })
      }
    })
  },

  bindGetUserInfo: function ({ detail }) {
    const _this = this;
    wx.login({
      success(res) {
        const { gender, ...userInfo } = detail.userInfo;
        if (res.code) {
          loginByWX(res.code, {
            avatar: userInfo.avatarUrl,
            nickName: userInfo.nickName,
          }).then((result) => {
            const { data, code } = result;
            if (code === 200) {
              wx.setStorageSync('user', data.user);
              wx.setStorageSync('token', data.token);
              wx.setStorageSync('sessionKey', data.sessionKey);
              wx.showToast({
                inco: 'success',
                title: '登录成功',
                duration: 1000,
                success: function () {
                  if (data.user.phone) {
                    _this.toPage()
                    return false
                  }
                  _this.setData({
                    visible: true
                  })
                  return false
                },
              });
            }
          });
        } else {
          console.log(`登录失败！${res.errMsg}`);
        }
      },
    });
  },

  onReject() {
    this.setData({
      visible: false
    })
    this.toPage()
  },

  getPhoneNumber({ detail }) {
    const sessionKey = wx.getStorageSync('sessionKey');
    const { uid } = wx.getStorageSync('user');
    const { encryptedData, iv } = detail;
    const _this = this;
    getPhone({
      uid,
      sessionKey,
      encryptedData,
      iv
    }).then(({ code }) => {
      if (code === 200) {
        wx.showToast({
          inco: 'success',
          title: '获取成功',
        });
        _this.setData({
          visible: false
        })
        _this.toPage()
      }
    })
  },

  toPage() {
    const path = wx.getStorageSync('backpath');
    if (path === 'pages/usercenter/index' || path === 'pages/cart/index') {
      wx.switchTab({
        url: '/' + path,
      });
      return false
    }
    wx.redirectTo({
      url: '/' + path,
    })
    return false
  }
});
