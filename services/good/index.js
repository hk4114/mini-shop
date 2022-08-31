
import { request } from '../../utils/request';
// 获取基础性产品分类
export function fetchBasicsCategory() {
  return request({
    url: `/api/front/basicsCategory`,
    method: 'GET',
  })
}

// 获取功能性产品分类
export function fetchCategory() {
  return request({
    url: `/api/front/category`,
    method: 'GET',
  })
}

// 获取商品详情
export function fetchProductDetail(id) {
  return request({
    url: `/api/front/product/detail/${id}`,
    method: 'GET',
  })
}

// 首页-为你推荐
export function fetchHotProduct(limit, page) {
  return request({
    url: `/api/front/product/hot`,
    method: 'GET',
    data: {
      limit, page
    }
  })
}

// 首页-商品列表
export function fetchFrontProducts(data) {
  return request({
    url: `/api/front/products`,
    method: 'GET',
    data,
    showLoading: true
  })
}