import { request } from '../../utils/request';

// 支付宝
export function resetCart() {
  return request({
    method: 'POST',
    url: '/api/payment/callback/alipay'
  })
}

// 微信支付回调
export function fetchCartList() {
  return request({
    url: '/api/payment/callback/wechat',
    method: 'POST',
  })
}

// 查询账户明细列表
export function fetchAccountInfo(data) {
  return request({
    url: `/api/front/accountInfo/list`,
    method: 'GET',
    data: {
      ...data
      // id 账户明细ID
      // limit
      // page
      // tradeType 交易类型(1消费 2充值 3退款 4提现)
      // uid 用户id
      // orderId 订单号
    }
  })
}

// 订单取消
export function cancelOrder(id) {
  return request({
    url: `/api/front/order/cancel?id=${id}`,
    method: 'POST',
    data: { id }
  })
}

// 生成订单
export function createOrder(key) {
  return request({
    url: `/api/front/order/create/${key}`,
    method: 'POST',
  })
}

// 删除订单
export function delOrder(id) {
  return request({
    url: `/api/front/order/del`,
    method: 'POST',
    data: { id }
  })
}

// 支付
export function payOrder(data) {
  return request({
    url: `/api/front/order/pay`,
    method: 'POST',
    data: {
      ...data
    }
  })
}

// 订单收货
export function recieveOrder(id) {
  return request({
    url: `/api/front/order/take?id=${id}`,
    method: 'POST',
    data: { id }
  })
}

// 物流信息
export function fetchTransInfo(orderId) {
  return request({
    url: `/api/front/order/express/${orderId}`,
    method: 'GET',
  })
}

// 退款
export function refundOrder(data) {
  return request({
    url: '/api/front/order/refund',
    method: 'POST',
    data
  })
}

// 订单退款理由
export function refundReason() {
  return request({
    url: `/api/front/order/refund/reason`,
    method: 'GET',
  })
}

// 查询订单列表数据
export function queryListByCartIds(ids) {
  return request({
    url: `/api/front/cart/listByCartIds?ids=` + ids,
    method: 'GET'
  })
}

// 查询订单
export function queryOrderList(data) {
  return request({
    url: `/api/front/order/list`,
    method: 'GET',
    data
  })
}

// 订单详情
export function queryOrderDetail(id) {
  return request({
    url: `/api/front/order/detail/${id}`,
    method: 'GET',
  })
}

// 退款列表
export function queryRefundOrder(data) {
  return request({
    url: '/api/front/refundOrder/list',
    method: 'GET',
    data
  })
}

// 退款详情
export function queryRefundOrderDetail(id) {
  return request({
    url: '/api/front/refundOrder/detail/' + id,
    method: 'GET',
  })
}

// 退款详情 by OrderInfoId
export function queryRefundOrderDetailByOrderInfoId(OrderInfoId) {
  return request({
    url: '/api/front/refundOrder/detailByOrderInfoId/' + OrderInfoId,
    method: 'GET',
  })
}

// 更新退款信息
export function updateRefundOrder(data) {
  return request({
    url: '/api/front/refundOrder/update',
    method: 'POST',
    data
  })
}