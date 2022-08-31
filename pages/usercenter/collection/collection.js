import { fetchCollect, delCollect } from '../../../services/usercenter/index'
import Toast from 'tdesign-miniprogram/toast/index';

// pages/collection.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    collection: []
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.queryList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  deleteHandle({ detail }) {
    const { id, category = 1 } = detail;
    delCollect({ id, category }).then(res => {
      if (res.code === 200) {
        Toast({ context: this, selector: '#t-toast', message: '删除成功' });
        this.queryList()
      }
    })
  },

  selectHandle({ detail }) {
    const { id } = detail;
    wx.navigateTo({
      url: `/pages/goods/details/index?id=${id}`
    })
    return false
  },

  queryList() {
    fetchCollect(10, 1).then(res => {
      if (res.code === 200) {
        const { data } = res;
        this.setData({
          collection: data.list
        })
      }
    })
  }
})