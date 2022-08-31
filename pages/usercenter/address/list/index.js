/* eslint-disable no-param-reassign */
import Toast from 'tdesign-miniprogram/toast/index';
import { fetchAddressList, delAddress, saveAddress } from '../../../../services/address/index'

const params2Obj = (obj) => {
  Object.keys(obj).forEach((key) => {
    obj[key] = decodeURIComponent(obj[key])
  });
  return obj;
};

const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) =>
    result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`),
  );
  return result.join('&');
};

Page({
  data: {
    addressList: [],
    deleteID: '',
    showDeleteConfirm: false,
    isOrderSure: false,
    urlParams: {}
  },

  /** 选择模式 */
  selectMode: false,
  /** 是否已经选择地址，不置为true的话页面离开时会触发取消选择行为 */
  hasSelect: false,
  onLoad(query) {
    const { selectMode = '', isOrderSure = '', id = '' } = query;
    this.setData({
      isOrderSure: !!isOrderSure,
      extraSpace: !!isOrderSure,
      id,
      urlParams: params2Obj(query)
    });
    this.selectMode = !!selectMode;
  },

  onShow() {
    this.getAddressList();
  },

  addAddress() {
    wx.navigateTo({
      url: '/pages/usercenter/address/edit/index',
    });
  },
  onEdit(e) {
    wx.navigateTo({
      url: `/pages/usercenter/address/edit/index?id=${e.detail.id}`,
    });
  },

  getAddressList() {
    const { urlParams } = this.data;
    fetchAddressList().then(res => {
      wx.hideLoading()
      if (res.code === 200 && res.data) {
        const { list } = res.data;
        list.forEach((address) => {
          const { province, city, district, detail } = address;
          address.address = Array.from(new Set([province, city, district, detail])).join('')
          if (address.id == urlParams.addressId) {
            address.checked = true;
          }
        });
        this.setData({ addressList: list });
      }
    })
  },
  getWXAddressHandle() {
    wx.chooseAddress({
      success: (res) => {
        if (res.errMsg.indexOf('ok') === -1) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.errMsg,
            icon: '',
            duration: 1000,
          });
          return;
        }
        Toast({
          context: this,
          selector: '#t-toast',
          message: '添加成功',
          icon: '',
          duration: 1000,
        });
        const { length: len } = this.data.addressList;
        this.setData({
          [`addressList[${len}]`]: {
            name: res.userName,
            phoneNumber: res.telNumber,
            address: `${res.provinceName}${res.cityName}${res.countryName}${res.detailInfo}`,
            isDefault: 0,
            tag: '微信地址',
            id: len,
          },
        });
      },
    });
  },

  deleteAddressHandle(e) {
    const { id } = e.currentTarget.dataset;
    delAddress(id).then(res => {
      if (res.code === 200) {
        this.setData({
          addressList: this.data.addressList.filter((address) => address.id !== id),
          deleteID: id,
          showDeleteConfirm: true
        }, () => {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '地址删除成功',
            theme: 'success',
            duration: 1000,
          });
        });
      }
    })
  },
  editAddressHandle({ detail }) {
    this.waitForNewAddress();
    const { id } = detail || {};
    wx.navigateTo({ url: `/pages/usercenter/address/edit/index?id=${id}` });
  },

  selectHandle({ detail }) {
    if (this.selectMode) {
      this.hasSelect = true;
      const { urlParams } = this.data;
      const params = {
        ...urlParams,
        addressId: detail.id
      }
      wx.redirectTo({
        url: `/pages/order/order-confirm/index?${obj2Params(params)}`,
      })
    } else {
      this.editAddressHandle({ detail });
    }
  },
  createHandle() {
    this.waitForNewAddress();
    wx.navigateTo({ url: '/pages/usercenter/address/edit/index' });
  },
  getWeixinAddress({ detail }) {
    saveAddress({
      address: {
        provinceCode: detail.provinceCode,
        province: detail.provinceName,
        cityCode: detail.cityCode,
        city: detail.cityName,
        districtCode: detail.districtCode,
        district: detail.districtName
      },
      detail: detail.detailAddress,
      phone: detail.phone,
      realName: detail.name,
      isDefault: false,
    })
  },

  waitForNewAddress() {
    this.getAddressList()
  },
});
