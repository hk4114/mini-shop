import { request } from '../../utils/request';

/** 获取首页数据 */
export function fetchHome() {
  return request({
    url: `/api/front/index`,
    method: 'GET',
  })
}

// 热门搜索
export function fetchHotKeywords() {
  return request({
    url: `/api/front/search/hotKeywords`,
    method: 'GET'
  })
}

// 首页热门商品列表
export function fetchNewPoplarList(data) {
  return request({
    url: `/api/front/productsPage`,
    method: 'GET',
    data: {
      limit: 10,
      ...data
    }
  })
}