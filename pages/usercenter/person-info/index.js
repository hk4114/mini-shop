import { phoneEncryption } from '../../../utils/util';
import Toast from 'tdesign-miniprogram/toast/index';
import { editUserInfo } from '../../../services/usercenter/index'

Page({
  data: {
    personInfo: {
      avatar: '',
      nickname: '',
      phone: '',
    },
  },
  onLoad() {
    this.init();
  },
  init() {
    const userInfo = wx.getStorageSync('user');
    this.setData({
      personInfo: userInfo,
      'personInfo.phone': userInfo.phone ? phoneEncryption(userInfo.phone) : '',
    });
  },
  onClickCell({ currentTarget }) {
    const { dataset } = currentTarget;

    switch (dataset.type) {
      case 'phoneNumber':
        wx.navigateTo({
          url: `/pages/usercenter/phonebtn/index`,
        });
        break;
      case 'avatarUrl':
        this.toModifyAvatar();
        break;
      default: {
        break;
      }
    }
  },
  onClose() {
    this.setData({
      typeVisible: false,
    });
  },
  changeName({ detail }) {
    this.setData({
      'personInfo.nickname': detail.value
    })
  },
  onConfirm() {
    const { personInfo } = this.data;
    editUserInfo({
      avatar: personInfo.avatar,
      nickname: personInfo.nickname
    }).then(({ code }) => {
      if (code === 200) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '修改成功',
          theme: 'success',
        });
        wx.setStorageSync('user', personInfo)
        wx.switchTab({
          url: '/pages/usercenter/index',
        });
      }
    })
      .catch(err => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: err.message || err.msg || '修改出错了',
          theme: 'fail',
        });
      })
  },
  async toModifyAvatar() {
    try {
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const { path, size } = res.tempFiles[0];
            if (size <= 10485760) {
              resolve(path);
            } else {
              reject({ errMsg: '图片大小超出限制，请重新上传' });
            }
          },
          fail: (err) => reject(err),
        });
      });
      const _this = this;
      wx.uploadFile({
        url: 'https://api.fanto.cn/api/front/upload/comUpload',
        filePath: tempFilePath,
        header: {
          'Authori-zation': wx.getStorageSync('token')
        },
        name: 'file',
        success({ statusCode, data }) {
          if (statusCode === 200) {
            const result = JSON.parse(data);
            const { url } = result.data;
            _this.setData({
              'personInfo.avatar': url
            })
          }
        }
      })
    } catch (error) {
      if (error.errMsg === 'chooseImage:fail cancel') return;
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.errMsg || error.msg || '修改头像出错了',
        theme: 'fail',
      });
    }
  },
});
