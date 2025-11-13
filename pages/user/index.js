"use strict";
const e = require("../../common/vendor.js"),
  o = require("../../utils/useSafeArea.js"),
  u = require("../../utils/navigation.js");

const d = {
  __name: "index",
  setup(c) {
    const {
      safeTop: v,
      safeBottom: d
    } = o.useSafeArea(),
    f = o.rpxToPx(24) || 12,
    p = e.ref(null), // For user info
    g = e.computed((() => {
      const e = Math.max(0, v.value || 0),
        t = Math.max(0, d.value || 0);
      return {
        paddingTop: `${e + f}px`,
        paddingLeft: `${f}px`,
        paddingRight: `${f}px`,
        paddingBottom: `${f + t}px`,
        minHeight: "100vh",
        boxSizing: "border-box"
      }
    }));

    // Logout function
    function logout() {
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success(res) {
          if (res.confirm) {
            const app = getApp();
            app.globalData.userInfo = null;
            app.globalData.isLoggedIn = false;

            wx.reLaunch({
              url: '/pages/login/index',
            });
          }
        }
      });
    }

    e.onShow((() => {
      const app = getApp();
      if (!app.globalData.isLoggedIn || !app.globalData.userInfo) {
        wx.reLaunch({
          url: '/pages/login/index'
        });
      } else {
        p.value = app.globalData.userInfo;
      }
    }));

    return (t, a) => e.e({
      a: e.p({
        title: "个人中心",
        "show-back": !0,
        "with-safe-top": !1,
        "back-to-index": !0
      }),
      b: p.value
    }, p.value ? {
      c: p.value.avatarUrl,
      d: e.t(p.value.nickName)
    } : {}, {
      e: e.o(logout),
      f: e.s(g.value)
    })
  }
};

const f = e._export_sfc(d);
wx.createPage(f);
