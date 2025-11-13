"use strict";

// 引入依赖
const e = require("./common/vendor.js");
const t = require("./utils/avatar.js");
const r = require("./utils/tab-cache.js");

// App 配置
const a = {
  // 全局数据
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },

  // 小程序初始化
  onLaunch() {
    // 初始化云开发环境
    // 请务必替换成您自己的环境ID
    wx.cloud.init({
      env: "YOUR_CLOUD_ENV_ID",
      traceUser: true
    });

    try {
      t.ensureUserAvatars && t.ensureUserAvatars().catch((() => {}));
    } catch (e) {}

    try {
      r.scheduleTabWarmup({ immediate: true });
    } catch (e) {}
  },

  onShow() {},

  onHide() {}
};

// 创建 App 实例
function c() {
  return {
    app: e.createSSRApp(a)
  }
}

// 挂载 App
c().app.mount("#app");

// 导出 createApp 方法
exports.createApp = c;
