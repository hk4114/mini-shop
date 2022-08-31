import { request } from '../../utils/request';

/** 获取短信验证码 */
export function fetchCode(phone) {
  return request({
    url: `/api/front/sendCode`,
    method: 'GET',
    data: {
      phone,
    }
  })
}

/** 通过验证码登录 */
export function loginByCode(data) {
  return request({
    method: 'POST',
    url: `/api/front/login/mobile`,
    data
  })
}

/** 通过微信授权登录 */
export function loginByWX(code, data) {
  return request({
    url: `/api/front/wechat/authorize/program/login?code=${code}`,
    showLoading: true,
    method: 'POST',
    data
  })
}

// 获取微信手机号
export function getPhone(data) {
  return request({
    url: `/api/front/wechat/authorize/program/getPhone`,
    showLoading: true,
    method: 'POST',
    data
  })
}
