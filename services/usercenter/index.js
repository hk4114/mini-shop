import { request } from '../../utils/request';

/** 获取二维码 */
export function getQrCode(url) {
  return request({
    url: `/api/front/qrcode/base64`,
    method: 'POST',
    data: { url }
  })
}

// 获取城市树
export function getCity() {
  return request({
    url: `/api/front/city/list`,
    method: 'GET',
  })
}

// 添加收藏产品
export function addCollect(data) {
  return request({
    method: 'POST',
    url: `/api/front/collect/add`,
    data: {
      ...data
    }
  })
}

// 批量添加
export function addAllCollect(data) {
  return request({
    method: 'POST',
    url: `/api/front/collect/all`,
    data: {
      ...data,
    }
  })
}

// 删除
export function delCollect(data) {
  return request({
    method: 'POST',
    url: `/api/front/collect/del`,
    data: {
      ...data
    }
  })
}

// 获取收藏产品
export function fetchCollect(limit, page) {
  return request({
    url: `/api/front/collect/user`,
    method: 'GET',
    data: { limit, page }
  })
}

// 提现银行/提现最低金额
export function fetchBank() {
  return request({
    url: `/api/front/extract/bank`,
    method: 'GET',
  })
}

// 积分记录
export function fetchPoint(limit, page) {
  return request({
    url: `/api/front/integral/list`,
    method: 'GET',
    data: { limit, page }
  })
}

// 获取个人中心菜单
export function fetchUserMenu() {
  return request({
    url: `/api/front/menu/user`,
    method: 'GET'
  })
}

// ------------------------------------------------------
// 我的分享小程序
export function fetchShare() {
  return request({
    url: '/api/front/shareApplet',
    method: 'GET'
  })
}

// 当前登录用户信息
export function fetchUserInfo() {
  return request({
    url: `/api/front/user`,
    method: 'GET'
  })
}

// 经验记录
export function fetchExpList() {
  return request({
    url: `/api/front/user/expList`,
    method: 'GET'
  })
}

// -------------------------------------------
// 修改个人资料
export function editUserInfo(data) {
  return request({
    method: 'POST',
    url: `/api/front/user/edit`,
    data: {
      ...data,
      // "avatar": "string",
      // "nickname": "string"
    }
  })
}

// 手机号修改密码
export function resetPhone(data) {
  return request({
    method: 'POST',
    url: `/api/front/register/reset`,
    data: {
      ...data,
      // "account": "string",
      // "captcha": "string",
      // "password": "string"
    }
  })
}

// 提现申请
export function extractCash() {
  return request({
    method: 'POST',
    url: `/api/front/extract/cash`,
  })
}

// 绑定手机
export function bindPhone(data) {
  return request({
    method: 'POST',
    url: `/api/front/binding`,
    data: {
      ...data
      // "account": "string",
      // "captcha": "string"
    }
  })
}

// 获取图片信息
export function queryImage(type = 5) {
  return request({
    method: 'GET',
    url: `/api/front/customeImage?type=${type}`,
  })
}