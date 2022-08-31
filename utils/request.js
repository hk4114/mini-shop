const BASE_URL = 'https://api.fanto.cn';
import ui from './util';

const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) =>
    result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`),
  );
  return result.join('&');
};

function request(obj) {
  return new Promise(function (resolve, reject) {
    if (obj.showLoading) {
      ui.showLoading(obj.message ? obj.message : '加载中...');
    }
    var data = {};
    if (obj.data) {
      data = obj.data;
    }
    var contentType = 'application/json';
    if (obj.contentType) {
      contentType = obj.contentType;
    }

    var method = 'GET';
    if (obj.method) {
      method = obj.method;
    }

    wx.request({
      url: BASE_URL + obj.url,
      data: data,
      method: method,
      header: {
        'Content-Type': contentType,
        'Authori-zation': wx.getStorageSync('token')
      },
      //请求成功
      success: function (res) {
        ui.hideLoading();
        if (res.statusCode == 200 && res.data.code === 200) {
          resolve(res.data);
        } else if (res.statusCode == 401 || res.data.code === 401) {
          //授权失效
          reject('登录已过期');
          jumpToLogin(); //跳转到登录页
        } else {
          const { data } = res;
          //请求失败
          reject(data);
        }
      },
      fail: function (err) {
        ui.hideLoading();
        wx.showToast({
          title: err.message,
        })
        reject('服务器连接异常，请检查网络再试');
      },
      complete: function () {
        ui.hideLoading();
      },
    });
  });
}

//跳转到登录页
function jumpToLogin() {
  let page = getCurrentPages().slice(-1)[0];
  if (page.is === 'pages/newcart/index') {
    const arr = getCurrentPages();
    page = arr[arr.length - 2]
  }
  const { options } = page;
  let str = '';
  if (Object.keys(options).length > 0) {
    str = '?' + obj2Params(page.options, true)
  }
  wx.setStorageSync('backpath', page.is + str)
  wx.reLaunch({
    url: '/pages/login/login',
  });
}

module.exports = {
  request,
};
