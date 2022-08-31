import { fetchHotKeywords } from '../../../services/home/index';

Page({
  data: {
    historyWords: [],
    popularWords: [],
    searchValue: '',
    dialog: {
      title: '确认删除当前历史记录',
      showCancelButton: true,
      message: '',
    },
    dialogShow: false,
  },

  deleteType: 0,
  deleteIndex: '',

  onShow() {
    this.queryHistory();
    this.queryPopular();
  },

  async queryHistory() {
    const searchHistory = wx.getStorageSync('searchHistory');
    if (searchHistory) {
      this.setData({
        historyWords: searchHistory.split(','),
      })
    }
  },

  async queryPopular() {
    try {
      const result = await fetchHotKeywords();
      if (result.code === 200) {
        this.setData({
          popularWords: result.data.map(v => v.content)
        })
      }
    } catch (error) {
      console.error(error);
    }
  },

  confirm() {
    const { historyWords } = this.data;
    const { deleteType, deleteIndex } = this;
    historyWords.splice(deleteIndex, 1);
    if (deleteType === 0) {
      this.setData({
        historyWords,
        dialogShow: false,
      });
    } else {
      this.setData({ historyWords: [], dialogShow: false });
      wx.setStorageSync('searchHistory', '')
    }
  },

  close() {
    this.setData({ dialogShow: false });
  },

  handleClearHistory() {
    const { dialog } = this.data;
    this.deleteType = 1;
    // 
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除所有历史记录',
      },
      dialogShow: true,
    });
  },

  deleteCurr(e) {
    const { index } = e.currentTarget.dataset;
    const { dialog, historyWords } = this.data;
    historyWords.splice(index, 1)
    wx.setStorageSync('searchHistory', historyWords.join(','))
    this.setData({
      historyWords,
      dialog: {
        ...dialog,
        message: '确认删除当前历史记录',
        deleteType: 0,
      },
      dialogShow: true,
    });
  },

  handleHistoryTap(e) {
    const { historyWords, popularWords } = this.data;
    const { dataset } = e.currentTarget;
    const words = dataset.type === 'hot' ? popularWords : historyWords;
    const _searchValue = words[dataset.index || 0] || '';
    if (_searchValue) {
      this.saveKeyword(_searchValue)
      wx.navigateTo({
        url: `/pages/goods/result/index?searchValue=${escape(_searchValue)}`,
      })
    }
  },

  handleSubmit(e) {
    const { value } = e.detail;
    if (value.length === 0) return;
    this.saveKeyword(value);
    wx.navigateTo({ url: `/pages/goods/result/index?searchValue=${escape(value)}` })
  },

  saveKeyword(value) {
    const searchHistory = wx.getStorageSync('searchHistory');
    if (searchHistory) {
      const arr = searchHistory.split(',');
      arr.unshift(value);
      const data = [...new Set(arr)]
      this.setData({
        historyWords: data
      })
      wx.setStorageSync('searchHistory', data.join(','))
    } else {
      this.setData({
        historyWords: [value]
      })
      wx.setStorageSync('searchHistory', value)
    }
  }
});
