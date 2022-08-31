import { request } from '../../utils/request';

// 获取默认地址
export function fetchDefaultAddress() {
  return request({
    url: '/api/front/address/default'
  })
}

// 设置默认地址
export function setDefaultAddress(id) {
  return request({
    url: '/api/front/address/default/set',
    method: 'POST',
    data: { id }
  })
}

// 删除
export function delAddress(id) {
  return request({
    url: '/api/front/address/del',
    method: 'POST',
    data: { id }
  })
}

// 获取单个地址
export function fetchAddress(id) {
  return request({
    url: `/api/front/address/detail/${id}`,
    method: 'GET',
  })
}

// 保存
export function saveAddress(data) {
  return request({
    url: '/api/front/address/edit',
    method: 'POST',
    data: {
      ...data
    }
  })
}

// 列表  
export function fetchAddressList(areaType = '') {
  return request({
    url: '/api/front/address/list',
    method: 'GET',
    data: { areaType }
  })
}

// 城市服务
export function fetchCityList() {
  return request({
    url: '/api/front/city/list',
    method: 'GET'
  })
}