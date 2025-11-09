// utils/redirect-from-share.js
function redirectIfNeeded(options) {
    if (options && options.redirect === 'login') {
      try {
        wx.reLaunch({ url: '/pages/login/index' });
      } catch (e) {
        wx.navigateTo({ url: '/pages/login/index' });
      }
    }
  }
  
  module.exports = { redirectIfNeeded };
  