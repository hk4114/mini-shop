import Toast from 'tdesign-miniprogram/toast/index';
import { areaData } from '../../../../config/index';
import { resolveAddress, rejectAddress } from './util';
import { addressParse } from '../../../../utils/addressParse';
import { fetchAddress, saveAddress } from '../../../../services/address/index';

const innerPhoneReg =
  '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';
const innerNameReg = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';

Page({
  options: {
    multipleSlots: true,
  },
  externalClasses: ['theme-wrapper-class'],
  data: {
    id: '',
    locationState: {
      labelIndex: null,
      addressId: '',
      addressTag: '',
      cityCode: '',
      cityName: '',
      countryCode: '',
      countryName: '',
      detailAddress: '',
      districtCode: '',
      districtName: '',
      isDefault: false,
      name: '',
      phone: '',
      provinceCode: '',
      provinceName: '',
      isEdit: false,
      isOrderDetail: false,
      isOrderSure: false,
    },
    areaData: areaData,
    areaPickerVisible: false,
    submitActive: false,
    visible: false,
    labelValue: '',
    columns: 3,
  },
  privateData: {
    verifyTips: '',
  },
  onLoad(options) {
    const { id = '' } = options;
    this.setData({
      id
    }, () => {
      this.init(id);
    })
  },
  onUnload() {
    if (!this.hasSava) {
      rejectAddress();
    }
  },
  hasSava: false,
  init(id) {
    if (id) {
      this.getAddressDetail(Number(id));
    }
  },
  getAddressDetail(id) {
    fetchAddress(id).then(res => {
      if (res.code === 200) {
        const { data } = res;
        this.setData({
          locationState: {
            ...res.data,
            name: data.realName,
            provinceName: data.province,
            cityName: data.city,
            districtName: data.district,
            detailAddress: data.detail,
            isDefault: data.isDefault
          }
        }, () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
          });
          this.privateData.verifyTips = tips;
        })
      }
    })
  },
  onInputValue(e) {
    const { item } = e.currentTarget.dataset;
    const { value = '', areas = [] } = e.detail;
    if (item === 'address') {
      this.setData(
        {
          'locationState.provinceCode': areas[0].code,
          'locationState.provinceName': areas[0].name,
          'locationState.cityName': areas[1].name,
          'locationState.cityCode': areas[1].code,
          'locationState.districtCode': areas[2].code,
          'locationState.districtName': areas[2].name,
          areaPickerVisible: false,
        },
        () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
          });
          this.privateData.verifyTips = tips;
        },
      );
    } else {
      this.setData(
        {
          [`locationState.${item}`]: value,
        },
        () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
          });
          this.privateData.verifyTips = tips;
        },
      );
    }
  },
  onPickArea() {
    this.setData({ areaPickerVisible: true });
  },
  onPickLabels(e) {
    const { item } = e.currentTarget.dataset;
    const {
      locationState: { labelIndex = undefined },
      labels = [],
    } = this.data;
    let payload = {
      labelIndex: item,
      addressTag: labels[item].name,
    };
    if (item === labelIndex) {
      payload = { labelIndex: null, addressTag: '' };
    }
    this.setData({
      'locationState.labelIndex': payload.labelIndex,
    });
    this.triggerEvent('triggerUpdateValue', payload);
  },
  addLabels() {
    this.setData({
      visible: true,
    });
  },
  confirmHandle() {
    const { labels, labelValue } = this.data;
    this.setData({
      visible: false,
      labels: [
        ...labels,
        { id: labels[labels.length - 1].id + 1, name: labelValue },
      ],
      labelValue: '',
    });
  },
  cancelHandle() {
    this.setData({
      visible: false,
      labelValue: '',
    });
  },
  onCheckDefaultAddress({ detail }) {
    const { value } = detail;
    this.setData({
      'locationState.isDefault': value,
    });
  },

  onVerifyInputLegal() {
    const { name, phone, detailAddress, districtName } =
      this.data.locationState;
    const prefixPhoneReg = String(this.properties.phoneReg || innerPhoneReg);
    const prefixNameReg = String(this.properties.nameReg || innerNameReg);
    const nameRegExp = new RegExp(prefixNameReg);
    const phoneRegExp = new RegExp(prefixPhoneReg);

    if (!name || !name.trim()) {
      return {
        isLegal: false,
        tips: '请填写收货人',
      };
    }
    if (!nameRegExp.test(name)) {
      return {
        isLegal: false,
        tips: '收货人仅支持输入中文、英文（区分大小写）、数字',
      };
    }
    if (!phone || !phone.trim()) {
      return {
        isLegal: false,
        tips: '请填写手机号',
      };
    }
    if (!phoneRegExp.test(phone)) {
      return {
        isLegal: false,
        tips: '请填写正确的手机号',
      };
    }
    if (!districtName || !districtName.trim()) {
      return {
        isLegal: false,
        tips: '请选择省市区信息',
      };
    }
    if (!detailAddress || !detailAddress.trim()) {
      return {
        isLegal: false,
        tips: '请完善详细地址',
      };
    }
    if (detailAddress && detailAddress.trim().length > 50) {
      return {
        isLegal: false,
        tips: '详细地址不能超过50个字符',
      };
    }
    return {
      isLegal: true,
      tips: '添加成功',
    };
  },

  builtInSearch({ code, name }) {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting[code] === false) {
            wx.showModal({
              title: `获取${name}失败`,
              content: `获取${name}失败，请在【右上角】-小程序【设置】项中，将【${name}】开启。`,
              confirmText: '去设置',
              confirmColor: '#FA550F',
              cancelColor: '取消',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                    success(settinRes) {
                      if (settinRes.authSetting[code] === true) {
                        resolve();
                      } else {
                        console.warn('用户未打开权限', name, code);
                        reject();
                      }
                    },
                  });
                } else {
                  reject();
                }
              },
              fail() {
                reject();
              },
            });
          } else {
            resolve();
          }
        },
        fail() {
          reject();
        },
      });
    });
  },

  onSearchAddress() {
    const { locationState } = this.data
    this.builtInSearch({ code: 'scope.userLocation', name: '地址位置' }).then(
      () => {
        wx.chooseLocation({
          success: async (res) => {
            if (res.name) {
              let params = locationState;
              const arr = res.address.match(/.+?(省|市|自治区|自治州|县|区)/g);
              const addressDetail = res.address.replace(/.+?(省|市|自治区|自治州|县|区)/g, '');
              let provinceName = '';
              let cityName = '';
              let districtName = '';
              if (arr.length === 3) {
                [provinceName, cityName, districtName] = arr;
              } else if (arr.length === 2) {
                [provinceName, districtName] = arr;
                cityName = provinceName
              }
              const { provinceCode, cityCode, districtCode } = await addressParse(provinceName, cityName, districtName);
              params.provinceName = provinceName;
              params.cityName = cityName;
              params.districtName = districtName;
              params.provinceCode = provinceCode;
              params.cityCode = cityCode;
              params.districtCode = districtCode;
              params.detailAddress = addressDetail + res.name;
              this.setData({
                locationState: params
              })
            } else {
              Toast({
                context: this,
                selector: '#t-toast',
                message: '地点为空，请重新选择',
                icon: '',
                duration: 1000,
              });
            }
          },
          fail: function (res) {
            console.warn(`wx.chooseLocation fail: ${JSON.stringify(res)}`);
            if (res.errMsg !== 'chooseLocation:fail cancel') {
              Toast({
                context: this,
                selector: '#t-toast',
                message: '地点错误，请重新选择',
                icon: '',
                duration: 1000,
              });
            }
          },
        });
      },
    );
  },
  formSubmit() {
    const { submitActive } = this.data;
    if (!submitActive) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: this.privateData.verifyTips,
        icon: '',
        duration: 1000,
      });
      return;
    }
    const { locationState, id } = this.data;

    this.hasSava = true;

    saveAddress({
      id,
      address: {
        provinceCode: locationState.provinceCode,
        province: locationState.provinceName,
        cityCode: locationState.cityCode,
        city: locationState.cityName,
        districtCode: locationState.districtCode,
        district: locationState.districtName
      },
      detail: locationState.detailAddress,
      phone: locationState.phone,
      realName: locationState.name,
      isDefault: !!locationState.isDefault,
    }).then(res => {
      if (res.code === 200) {
        wx.navigateBack({ delta: 1 });
      }
    })
    return false
  },

  getWeixinAddress(e) {
    const { locationState } = this.data;
    const weixinAddress = e.detail;
    this.setData(
      {
        locationState: { ...locationState, ...weixinAddress },
      },
      () => {
        const { isLegal, tips } = this.onVerifyInputLegal();
        this.setData({
          submitActive: isLegal,
        });
        this.privateData.verifyTips = tips;
      },
    );
  },
});
