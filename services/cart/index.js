import { request } from '../../utils/request';

export function getCount() {
  return request({
    method: 'GET',
    url: '/api/front/cart/count'
  })
}

// 删除
export function deleteCart(ids) {
  return request({
    method: 'POST',
    url: `/api/front/cart/delete`,
    data: {
      ids
    },
  })
}

// 新增
export function addCart(data) {
  return request({
    method: 'POST',
    url: '/api/front/cart/save',
    data: {
      ...data
      // cartNum 商品数量
      // isNew 是否为立即购买
      // productId 商品ID
    }
  })
}

// 修改
export function updateCart(id, number) {
  return request({
    method: 'POST',
    url: '/api/front/cart/num',
    data: { id, number }
  })
}

// 重置
export function resetCart() {
  return request({
    method: 'POST',
    url: '/api/front/cart/resetcart'
  })
}

// 保存购物车状态
export function editCartChecked(data) {
  return request({
    method: 'POST',
    url: '/api/front/cart/editCartChecked',
    data
  })
}

// 分页列表
export function fetchCartList(data) {
  return request({
    url: '/api/front/cart/list',
    method: 'GET',
    data: {
      ...data,
      // areaType 
      // limit
      // page
      // isValid 是否有效
    }
  })
}