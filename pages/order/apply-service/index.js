import Toast from 'tdesign-miniprogram/toast/index';
import { batchUpload } from '../../../utils/util';
import reasonSheet from '../components/reason-sheet/reasonSheet';
import { refundOrder, queryRefundOrderDetail, updateRefundOrder, queryRefundOrderDetailByOrderInfoId } from '../../../services/order/index';

Page({
  query: {},
  data: {
    uploading: false, // 凭证上传状态
    canApplyReturn: true, // 是否可退货
    goodsInfo: {},
    receiptStatusList: [
      { desc: '未收到货', status: 'tuikuan' },
      { desc: '已收到货', status: 'tuihuotuikuan' },
    ],
    applyReasons: [],
    serviceType: null, // 20-仅退款，10-退货退款
    serviceFrom: {
      receiptStatus: { desc: '请选择', status: null },
      applyReason: { desc: '请选择', type: null },
      remark: '',
      rightsImageUrls: [],
    },
    amountTip: '',
    showReceiptStatusDialog: false,
    validateRes: {
      valid: false,
      msg: '',
    },
    submitting: false,
    uploadGridConfig: {
      column: 3,
      width: 212,
      height: 212,
    },
    status: null,
  },

  onLoad(query) {
    this.query = query;
    this.init()
  },

  async init() {
    const { id, type } = this.query;
    const fetchFn = type !== 'update' ? queryRefundOrderDetailByOrderInfoId : queryRefundOrderDetail;
    fetchFn(id).then(({ code, data }) => {
      if (code === 200) {
        let imgs = []
        if (data.reasonImage) {
          imgs = data.reasonImage.split(',').map((v) => ({ url: v, name: 'file', type: 'image' }))
        }
        this.setData({
          serviceFrom: {
            receiptStatus: {
              desc: data.refundType === 1 ? '未收到货' : '已收到货',
              status: data.refundType === 1 ? 'tuikuan' : 'tuihuotuikuan'
            },
            applyReason: { desc: data.refundReasonWap, type: null },
            remark: data.explains,
            rightsImageUrls: imgs,
          },
          status: data.status,
          applyReasons: this.getApplyReasons(data.refundType === 1 ? 'tuikuan' : 'tuihuotuikuan')
        })
      }
    })
  },

  onApplyReturnGoodsStatus() {
    const { serviceFrom } = this.data;
    if (!serviceFrom.receiptStatus.status) {
      return false
    }
    reasonSheet({
      show: true,
      title: '选择退款原因',
      options: this.data.applyReasons.map((r) => ({
        title: r.desc,
      })),
      showConfirmButton: true,
      showCancelButton: true,
      emptyTip: '请选择退款原因',
    }).then((indexes) => {
      this.setData({
        'serviceFrom.applyReason': this.data.applyReasons[indexes[0]],
      });
    });
  },

  onApplyGoodsStatus() {
    const _this = this;
    reasonSheet({
      show: true,
      title: '请选择收货状态',
      options: this.data.receiptStatusList.map((r) => ({
        title: r.desc,
      })),
      showConfirmButton: true,
      emptyTip: '请选择收货状态',
    }).then((indexes) => {
      this.setData({
        'serviceFrom.receiptStatus': this.data.receiptStatusList[indexes[0]],
        'serviceFrom.applyReason': { desc: '请选择', type: null },
        applyReasons: _this.getApplyReasons(this.data.receiptStatusList[indexes[0]].status)
      });
    });
  },

  switchReceiptStatus(index) {
    const statusItem = this.data.receiptStatusList[index];
    // 没有找到对应的状态，则清空/初始化
    if (!statusItem) {
      this.setData({
        showReceiptStatusDialog: false,
        'serviceFrom.receiptStatus': { desc: '请选择', status: null },
        'serviceFrom.applyReason': { desc: '请选择', type: null }, // 收货状态改变时，初始化申请原因
        applyReasons: [],
      });
      return;
    }
    // 仅选中项与当前项不一致时，才切换申请原因列表applyReasons
    if (
      !statusItem ||
      statusItem.status === this.data.serviceFrom.receiptStatus.status
    ) {
      this.setData({ showReceiptStatusDialog: false });
      return;
    }
    this.getApplyReasons(statusItem.status).then((reasons) => {
      this.setData({
        showReceiptStatusDialog: false,
        'serviceFrom.receiptStatus': statusItem,
        'serviceFrom.applyReason': { desc: '请选择', type: null }, // 收货状态改变时，重置申请原因
        applyReasons: reasons,
      });
    });
  },

  getApplyReasons(receiptStatus) {
    const listmap = {
      tuikuan: [
        { type: '1', desc: '多拍/错拍/不想要' },
        { type: '2', desc: '快递一直未送达' },
        { type: '3', desc: '未按约定时间发货' },
        { type: '4', desc: '空包裹/少货' },
        { type: '5', desc: '其他' },
      ],
      tuihuotuikuan: [
        { type: '9', desc: '效果不好/不喜欢/不想要' },
        { type: '10', desc: '成分不符' },
        { type: '11', desc: '发错货' },
        { type: '12', desc: '包装破损' },
      ]
    }
    return listmap[receiptStatus]
  },

  onReceiptStatusDialogConfirm(e) {
    const { index } = e.currentTarget.dataset;
    this.switchReceiptStatus(index);
  },

  onRemarkChange(e) {
    const { value } = e.detail;
    this.setData({
      'serviceFrom.remark': value,
    });
  },

  // 发起申请售后请求
  onSubmit() {
    const { id, type } = this.query;
    const { serviceFrom } = this.data;
    const { applyReason, receiptStatus } = serviceFrom;
    if (!applyReason.desc || !receiptStatus.status) {
      wx.showToast({
        title: '请完善退货信息',
        icon: 'none'
      })
      return false
    }

    let params = {
      explains: serviceFrom.remark,
      reasonImage: serviceFrom.rightsImageUrls.map(v => v.url).join(','),
      orderInfoId: id,
      refundType: serviceFrom.receiptStatus.status === 'tuikuan' ? 1 : 0,
      text: serviceFrom.applyReason.desc
    }
    if (type === 'update') {
      params.id = id;
      delete params.orderInfoId
      updateRefundOrder(params)
        .then(({ code }) => {
          if (code === 200) {
            wx.showToast({
              title: '退款申请提交成功',
            })
            const timer = setTimeout(() => {
              wx.redirectTo({
                url: '/pages/order/after-service-list/index',
              })
              clearTimeout(timer)
            }, 500)
          }
        })
      return false
    }
    refundOrder(params).then(({ code }) => {
      if (code === 200) {
        wx.showToast({
          title: '退款申请提交成功',
        })
        const timer = setTimeout(() => {
          wx.redirectTo({
            url: '/pages/order/after-service-list/index',
          })
          clearTimeout(timer)
        }, 500)
      }
    })
  },

  handleSuccess(e) {
    const { files } = e.detail;
    const cdnImgs = files.filter(v => !v.type);
    const postImgs = files.filter(v => v.type)
    const params = {
      uploadUrl: 'https://api.fanto.cn/api/front/upload/comUpload',
      imgPaths: postImgs.map(img => img.url)
    }
    batchUpload(params, batchUpload, (res) => {
      const { imgPaths } = res;
      this.setData({
        'serviceFrom.rightsImageUrls': cdnImgs.concat(imgPaths.map(v => ({ name: 'file', url: v }))),
      });
    })

  },

  handleRemove(e) {
    const { index } = e.detail;
    const {
      serviceFrom: { rightsImageUrls },
    } = this.data;
    rightsImageUrls.splice(index, 1);
    this.setData({
      'serviceFrom.rightsImageUrls': rightsImageUrls,
    });
  },

  handleComplete() {
    this.setData({
      uploading: false,
    });
  },

  handleSelectChange() {
    this.setData({
      uploading: true,
    });
  },
});
