import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { OrderButtonTypes } from '../../config';
import { cancelOrder, recieveOrder, fetchTransInfo, payOrder } from '../../../../services/order/index'
import { wechatPayOrder } from '../../order-confirm/pay';
import { queryImage } from '../../../../services/usercenter/index'

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    order: {
      type: Object,
      observer(order) {
        // 判定有传goodsIndex ，则认为是商品button bar, 仅显示申请售后按钮
        if (this.properties?.goodsIndex !== null) {
          const goods = order.goodsList[Number(this.properties.goodsIndex)];
          this.setData({
            buttons: {
              left: [],
              right: (goods.buttons || []).filter(
                (b) => b.type == OrderButtonTypes.APPLY_REFUND,
              ),
            },
          });
          return;
        }
        // 订单的button bar 不显示申请售后按钮
        const buttonsRight = (order.buttons || [])
          // .filter((b) => b.type !== OrderButtonTypes.APPLY_REFUND)
          .map((button) => {
            //邀请好友拼团按钮
            if (
              button.type === OrderButtonTypes.INVITE_GROUPON &&
              order.groupInfoVo
            ) {
              const {
                groupInfoVo: { groupId, promotionId, remainMember, groupPrice },
                goodsList,
              } = order;
              const goodsImg = goodsList[0] && goodsList[0].imgUrl;
              const goodsName = goodsList[0] && goodsList[0].name;
              return {
                ...button,
                openType: 'share',
                dataShare: {
                  goodsImg,
                  goodsName,
                  groupId,
                  promotionId,
                  remainMember,
                  groupPrice,
                  storeId: order.storeId,
                },
              };
            }
            return button;
          });
        // 删除订单按钮单独挪到左侧
        const deleteBtnIndex = buttonsRight.findIndex(
          (b) => b.type === OrderButtonTypes.DELETE,
        );
        let buttonsLeft = [];
        if (deleteBtnIndex > -1) {
          buttonsLeft = buttonsRight.splice(deleteBtnIndex, 1);
        }
        this.setData({
          buttons: {
            left: buttonsLeft,
            right: buttonsRight,
          },
        });
      },
    },
    goodsIndex: {
      type: Number,
      value: null,
    },
    isBtnMax: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    order: {},
    expressDialog: false,
    expressInfo: null,
    buttons: {
      left: [],
      right: [],
    },
    iskefu: false,
    qrcodeUrl: ''
  },

  methods: {
    // 点击【订单操作】按钮，根据按钮类型分发
    onOrderBtnTap(e) {
      const { type } = e.currentTarget.dataset;
      switch (type) {
        case OrderButtonTypes.DELETE:
          this.onDelete(this.data.order);
          break;
        case OrderButtonTypes.CANCEL:
          this.onCancel(this.data.order);
          break;
        case OrderButtonTypes.CONFIRM:
          this.onConfirm(this.data.order);
          break;
        case OrderButtonTypes.PAY:
          this.onPay(this.data.order);
          break;
        case OrderButtonTypes.APPLY_REFUND:
          this.onApplyRefund(this.data.order);
          break;
        case OrderButtonTypes.VIEW_REFUND:
          this.onViewRefund(this.data.order);
          break;
        case OrderButtonTypes.INVITE_GROUPON:
          //分享邀请好友拼团
          break;
        case OrderButtonTypes.REBUY:
          this.onBuyAgain(this.data.order);
          break;
        case 1024:
          this.onCall(this.data.order);
          break;
        case 250:
          this.showExpress(this.data.order)
          break;
        default:
          this.onViewDetail(this.data.order)
          break;
      }
    },

    showExpress(order) {
      fetchTransInfo(order.orderId)
        .then(({ code, data }) => {
          if (code === 200 && data) {
            this.setData({
              expressDialog: true,
              expressInfo: data.order
            })
          }
          return false
        }).catch(err => {
          wx.showToast({
            icon: 'error',
            title: err.message || '获取物流失败',
          })
        })
    },

    confirmHandle() {
      this.setData({
        expressDialog: false
      })
    },

    onCopy() {
      wx.setClipboardData({
        data: `${this.data.expressInfo.deliveryId}`,
      });
    },

    onCancel(order) {
      Dialog.confirm({
        title: '确认是否取消订单？',
        confirmBtn: '确认',
        cancelBtn: '取消',
      })
        .then(() => {
          cancelOrder(order.id).then(({ code }) => {
            if (code === 200) {
              Toast({
                context: this,
                selector: '#t-toast',
                message: '你取消了订单',
                icon: 'check-circle',
              });
              wx.redirectTo({
                url: '/pages/order/order-list/index',
              })
            }
          })
        })
        .catch(() => {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '取消订单失败',
            icon: 'check-circle',
          });
        });

    },

    onConfirm(order) {
      Dialog.confirm({
        title: '确认是否已经收到货？',
        content: '',
        confirmBtn: '确认收货',
        cancelBtn: '取消',
      })
        .then(() => {
          recieveOrder(order.id).then(({ code }) => {
            if (code === 200) {
              Toast({
                context: this,
                selector: '#t-toast',
                message: '你确认了确认收货',
                icon: 'check-circle',
              });
              wx.redirectTo({
                url: '/pages/order/order-list/index',
              })
            }
          })
            .catch(() => {
              Toast({
                context: this,
                selector: '#t-toast',
                message: '确认收货失败',
                icon: 'check-circle',
              });
            })
        })
    },

    onPay(order) {
      const { addressId, id } = order;
      payOrder({
        addressId,
        id,
        type: 3,
        payType: 2,
      }).then(({ code, data }) => {
        if (code === 200) {
          wechatPayOrder(data);
        }
      }).catch((err) => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: err.message || '结算异常, 请稍后重试',
          duration: 2000,
        });
      })
      // wx.navigateTo({ url: `/pages/order/order-confirm/index?type=3&from=order&id=${order.id}&addressId=${order.addressId}` });
      return false
    },

    onCall(order) {
      queryImage().then(res => {
        this.setData({
          iskefu: true,
          qrcodeUrl: res.data.imgUrl
        })
      })
    },

    handleClose() {
      this.setData({
        iskefu: false
      })
    },

    onBuyAgain() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '你点击了再次购买',
        icon: 'check-circle',
      });
    },

    onApplyRefund(order) {
      wx.navigateTo({ url: `/pages/order/apply-service/index?id=${order.id}` });
    },

    onViewRefund() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '你点击了查看退款',
        icon: '',
      });
    },

    onViewDetail(order) {
      wx.navigateTo({ url: `/pages/order/order-detail/index?id=${order.id}` });
      return false
    },
  },
});
