const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    // 将来可以从globalData中获取用户信息并显示
    // userInfo: null
  },

  onLoad: function () {
    // 尝试自动登录
    this.autoLogin();
  },

  autoLogin: function () {
    wx.showLoading({
      title: '正在登录...',
    });

    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      wx.hideLoading();
      if (res.result.code === 200) {
        // 老用户，登录成功
        this.handleLoginSuccess(res.result.data);
      } else if (res.result.code === 404) {
        // 新用户，停留在登录页，等待用户授权
        console.log('新用户，等待授权');
      } else {
        // 其他错误
        wx.showToast({
          title: res.result.message || '登录失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '登录调用失败',
        icon: 'none'
      });
      console.error('登录云函数调用失败', err);
    });
  },

  onGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '正在注册...',
      });

      // 用户同意授权，调用云函数创建新用户
      wx.cloud.callFunction({
        name: 'login',
        data: {
          userInfo: e.detail.userInfo
        }
      }).then(res => {
        wx.hideLoading();
        if (res.result.code === 201) {
          // 用户创建成功
          this.handleLoginSuccess(res.result.data);
        } else {
          wx.showToast({
            title: res.result.message || '注册失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '注册调用失败',
          icon: 'none'
        });
        console.error('注册云函数调用失败', err);
      });
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '您拒绝了授权',
        icon: 'none'
      });
    }
  },

  handleLoginSuccess: function (userData) {
    this.setData({
      isLoggedIn: true,
    });

    // 将用户信息存储到全局
    app.globalData.userInfo = userData;
    app.globalData.isLoggedIn = true;

    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });

    // 延时跳转到主页
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/index/index',
      });
    }, 1500);
  }
});
