import Toast from 'tdesign-miniprogram/toast/index';

export const paySuccess = (payOrderInfo) => {
  const { order } = payOrderInfo;
  // 支付成功
  Toast({
    context: this,
    selector: '#t-toast',
    message: '支付成功',
    duration: 2000,
    icon: 'check-circle',
  });

  const params = {
    cost: order.cost,
    orderId: order.orderId,
  };

  const paramsStr = Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  // 跳转支付结果页面
  wx.redirectTo({ url: `/pages/order/pay-result/index?${paramsStr}` });
};

export const payFail = (resultMsg) => {
  if (resultMsg === 'requestPayment:fail cancel') {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '支付取消',
      duration: 2000,
      icon: 'close-circle',
    });
  } else {
    Toast({
      context: this,
      selector: '#t-toast',
      message: `支付失败：${resultMsg}`,
      duration: 2000,
      icon: 'close-circle',
    });
  }
  setTimeout(() => {
    wx.redirectTo({ url: '/pages/order/order-list/index' });
  }, 2000);
};

// 微信支付方式
export const wechatPayOrder = (payOrderInfo) => {
  const { timeStamp, nonceStr, sign, signType = "MD5", package: newP } = payOrderInfo;
  const params = {
    timeStamp,
    nonceStr,
    package: newP,
    signType,
    paySign: sign,
  }
  return wx.requestPayment({
    ...params,
    success: function () {
      paySuccess(payOrderInfo);
    },
    fail: function (err) {
      payFail(err.errMsg);
    },
  });
};
