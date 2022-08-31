import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';

import { ServiceButtonTypes } from '../../config';

import { updateRefundOrder } from '../../../../services/order/index'
import { queryImage } from '../../../../services/usercenter/index'

Component({
  properties: {
    service: {
      type: Object,
      observer(service) {
        const buttonsRight = service.buttons || service.buttonVOs || [];
        this.setData({
          buttons: {
            left: [],
            right: buttonsRight,
          },
        });
      },
    },
  },

  data: {
    service: {},
    buttons: {
      left: [],
      right: [],
    },
    qrcodeUrl: '',
    iskefu: false
  },

  methods: {
    // 点击【订单操作】按钮，根据按钮类型分发
    onServiceBtnTap(e) {
      const { type } = e.currentTarget.dataset;
      switch (type) {
        case ServiceButtonTypes.REVOKE:
          this.onConfirm(this.data.service);
          break;
        case ServiceButtonTypes.FILL_TRACKING_NO:
          this.onFillTrackingNo(this.data.service);
          break;
        case ServiceButtonTypes.CHANGE_TRACKING_NO:
          this.onChangeTrackingNo(this.data.service);
          break;
        case ServiceButtonTypes.VIEW_DELIVERY:
          this.viewDelivery(this.data.service);
          break;
        case 6:
          this.updateRefundInfo(this.data.service);
          break;
        case 7:
          this.cancelRefund(this.data.service);
          break;
        case 8:
          this.onKefu(this.data.service)
          break
        default:
          this.viewDetail(this.data.service)
          break
      }
    },

    // 修改退款
    updateRefundInfo(service) {
      wx.navigateTo({
        url: `/pages/order/apply-service/index?id=${service.orderInfoId}&type=update`,
      })
      return false
    },

    // 撤销申请
    cancelRefund(service) {
      Dialog.confirm({
        title: '是否撤销退货申请？',
        content: '',
        confirmBtn: '撤销申请',
        cancelBtn: '不撤销',
      }).then(() => {
        const params = {
          id: service.id,
          text: service.refundReasonWap,
          refundType: service.type,
          status: 3
        };
        return updateRefundOrder(params)
          .then(({ code }) => {
            if (code === 200) {
              Toast({
                context: this,
                selector: '#t-toast',
                message: '撤销申请成功',
              });
              const timer = setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/order/after-service-list/index',
                })
                clearTimeout(timer)
              }, 500)
            }
          }).catch(err => {
            Toast({
              context: this,
              selector: '#t-toast',
              message: err.message || '撤销申请失败',
            });
          });
      });
    },

    // 联系客服
    onKefu() {
      queryImage().then(({ code, data }) => {
        if (code === 200) {
          this.setData({
            qrcodeUrl: data.imgUrl,
            iskefu: true
          })
        }
      })
    },

    handleClose() {
      this.setData({
        iskefu: false
      })
    },

    viewDetail(service) {
      wx.navigateTo({
        url: `/pages/order/after-service-detail/index?orderInfoId=${service.id}`,
      });
      return false
    },

    onFillTrackingNo(service) {
      wx.navigateTo({
        url: `/pages/order/fill-tracking-no/index?rightsNo=${service.id}`,
      });
    },

    viewDelivery(service) {
      wx.navigateTo({
        url: `/pages/order/delivery-detail/index?data=${JSON.stringify(
          service.logistics || service.logisticsVO,
        )}&source=2`,
      });
    },

    onChangeTrackingNo(service) {
      wx.navigateTo({
        url: `/pages/order/fill-tracking-no/index?rightsNo=${service.id
          }&logisticsNo=${service.logisticsNo}&logisticsCompanyName=${service.logisticsCompanyName
          }&logisticsCompanyCode=${service.logisticsCompanyCode}&remark=${service.remark || ''
          }`,
      });
    },

    onConfirm() {
      // Dialog.confirm({
      //   title: '是否撤销退货申请？',
      //   content: '',
      //   confirmBtn: '撤销申请',
      //   cancelBtn: '不撤销',
      // }).then(() => {
      //   const params = { rightsNo: this.data.service.id };
      //   return cancelRights(params).then(() => {
      //     Toast({
      //       context: this,
      //       selector: '#t-toast',
      //       message: '你确认撤销申请',
      //     });
      //   });
      // });
    },
  },
});
