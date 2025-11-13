"use strict";
const e = require("../../common/vendor.js"),
  r = require("../../utils/hints.js"),
  n = require("../../utils/edge-exit.js"),
  u = require("../../utils/navigation.js"),
  i = require("../../utils/stats.js"),
  o = require("../../utils/useSafeArea.js"),
  share = require("../../utils/share.js");
Math || (v + c)();
const c = () => "../../components/MiniBar.js",
  v = () => "../../components/AppNavBar.js",
  d = {
    __name: "index",
    setup(c) {
      const {
        safeTop: v,
        safeBottom: d
      } = o.useSafeArea(),
      f = o.rpxToPx(24) || 12,
        m = e.computed((() => {
          const e = Math.max(0, v.value || 0),
            t = Math.max(0, d.value || 0);
          return {
            paddingTop: `${e+f}px`,
            paddingLeft: `${f}px`,
            paddingRight: `${f}px`,
            paddingBottom: `${f+t}px`,
            display: "flex",
            flexDirection: "column",
            rowGap: "18rpx",
            backgroundColor: "#f8fafc",
            boxSizing: "border-box",
            minHeight: "calc(var(--vh, 1vh) * 100)"
          }
        })),
        p = e.ref(null), // Current user info
        h = e.ref(1);
      e.ref("all");

      const {
        hintState: w,
        showHint: S,
        hideHint: T
      } = r.useFloatingHint(), k = n.useEdgeExit({
        showHint: S,
        onExit: () => {
          u.navigateToHome()
        }
      });
      share.enablePageShare(e);
      e.onBackPress((() => (u.navigateToHome(), !0)));

      const N = e.ref({
        totals: {
          total: 0,
          success: 0,
          fail: 0
        },
        days: {},
        rounds: [],
        agg: {}
      });

      const A = e.computed((() => {
        var e, t;
        try {
          return ((null == (t = null == (e = Y.value) ? void 0 : e.items) ? void 0 : t.length) || 0) >= 1
        } catch (a) {
          return !1
        }
      }));

      // Fetches stats from the cloud
      function fetchStats() {
        wx.showLoading({ title: '加载中...' });
        wx.cloud.callFunction({
          name: 'data',
          data: { action: 'getStats' }
        }).then(res => {
          wx.hideLoading();
          if (res.result.code === 200 && res.result.data) {
            N.value = res.result.data;
          } else {
            S('获取数据失败', 1500);
          }
        }).catch(err => {
          wx.hideLoading();
          S('网络错误，请重试', 1500);
          console.error(err);
        });
      }

      function W(e = 0) {
        h.value = 0 === arguments.length ? 1 : e
      }

      function E() {
        const e = new Date;
        return e.setHours(0, 0, 0, 0), e.getTime()
      }

      function B() {
        const e = Number(h.value);
        if (!e || e <= 0) return 0;
        return E() - 864e5 * (e - 1)
      }

      function L(e) {
        try {
          const t = new Date(e);
          return `${t.getMonth()+1}/${t.getDate()} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`
        } catch (t) {
          return "-"
        }
      }

      function K(e) {
        if (!Number.isFinite(e)) return "-";
        if (e < 1e3) return e + "ms";
        const t = e / 1e3;
        if (t < 60) return t.toFixed(1) + "s";
        return `${Math.floor(t/60)}m${Math.round(t%60)}s`
      }

      function z(e) {
        if (Number.isFinite(e)) return e;
        const t = Number(e);
        if (Number.isFinite(t)) return t;
        if ("string" == typeof e) {
          const t = e.trim().toUpperCase();
          if ("A" === t) return 1;
          if ("J" === t) return 11;
          if ("Q" === t) return 12;
          if ("K" === t) return 13
        }
        return null
      }

      function J(e) {
        try {
          const t = function (e) {
            return e && "object" == typeof e ? Array.isArray(e.cards) ? e.cards.map(z).filter((e => Number.isFinite(e))) : e.hand && Array.isArray(e.hand.cards) ? e.hand.cards.map((e => z(null == e ? void 0 : e.rank))).filter((e => Number.isFinite(e))) : Array.isArray(e.nums) ? e.nums.map(z).filter((e => Number.isFinite(e))) : [] : []
          }(e);
          return t.length ? t.map((e => String(Math.trunc(e)))).join(",") : "-"
        } catch (t) {
          return "-"
        }
      }
      e.onMounted((() => {
        try {
          e.index.hideTabBar && e.index.hideTabBar()
        } catch (a) {}
        const app = getApp();
        if (!app.globalData.isLoggedIn || !app.globalData.userInfo) {
            wx.reLaunch({ url: '/pages/login/index' });
            return;
        }
        p.value = app.globalData.userInfo;
        fetchStats();
      }));

      e.onShow((() => {
        const app = getApp();
        if (!app.globalData.isLoggedIn || !app.globalData.userInfo) {
            wx.reLaunch({ url: '/pages/login/index' });
            return;
        }
        p.value = app.globalData.userInfo;
        fetchStats();
      }));

      e.onPullDownRefresh((() => {
        try {
          fetchStats();
        } finally {
          try {
            e.index.stopPullDownRefresh && e.index.stopPullDownRefresh()
          } catch (t) {}
        }
      }));

      const U = e.computed((() => {
        return (N.value.rounds || []).map((t => ({ ...t })));
      })),
      I = e.computed((() => {
        const e = U.value,
          t = B();
        return e.filter((e => !t || (e.ts || 0) >= t))
      })),
      G = e.computed((() => I.value.slice().sort(((e, t) => (t.ts || 0) - (e.ts || 0))).slice(0, 12).map((e => ({ ...e, user: p.value, cardsText: J(e) }))).reverse()));

      function Q(e) {
        const t = new Date(e);
        return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`
      }
      const Y = e.computed((() => {
        const e = I.value,
          t = new Map;
        for (const o of e) {
          const e = Q(o.ts || 0),
            a = t.get(e) || {
              total: 0,
              success: 0
            };
          a.total += 1, o.success && (a.success += 1), t.set(e, a)
        }
        const a = E(),
          r = Q(a);
        let n = [];
        if (h.value > 0) {
          for (let e = a - 864e5 * ((Number(h.value) || 1) - 1); e <= a; e += 864e5) n.push(Q(e))
        } else n = Array.from(t.keys()), n.includes(r) || n.push(r), n.sort(), n.length > 30 && (n = n.slice(-30));
        const s = n.map((e => {
            const a = t.get(e) || {
              total: 0,
              success: 0
            }, r = a.total || 0, n = a.success || 0;
            return {
              key: e,
              total: r,
              success: n,
              winRate: r ? n / r : 0
            }
          })),
          u = Math.max(1, ...s.map((e => e.total))),
          i = s.map((e => {
            const t = e.total ? Math.max(4, Math.round(e.total / u * 160)) : 0,
              a = e.total ? Math.round(t * e.winRate) : 0,
              r = Math.max(0, t - a);
            return {
              label: e.key,
              shortLabel: (n = e.key, n ? n.slice(5).replace("-", "/") : ""),
              totalHeight: t,
              successHeight: a,
              failHeight: r
            };
            var n
          }));
        return {
          items: i,
          barWidth: 24,
          gap: 12,
          chartHeight: 160,
          width: i.length ? 36 * i.length - 12 : 0
        }
      }));

      const X = e.computed((() => {
        const e = N.value.rounds || [],
          t = B();
        return t > 0 ? e.filter((e => (e.ts || 0) >= t)) : e.slice()
      }));

      const Z = e.computed((() => i.summarizeNearMisses(X.value)));
      const ee = e.computed((() => {
        const e = ["+", "-", "×", "÷"],
          t = Object.fromEntries(e.map((e => [e, {
            total: 0,
            success: 0
          }]))),
          a = Object.fromEntries(e.map((e => [e, 0])));
        for (const u of X.value) {
          const e = Array.isArray(null == u ? void 0 : u.ops) ? u.ops : [];
          if (e.length) {
            const a = e[0];
            t[a] && (t[a].total += 1, u.success && (t[a].success += 1))
          }
          for (const t of e) null != a[t] && (a[t] += 1)
        }
        const r = Object.values(a).reduce(((e, t) => e + t), 0);
        let n = 0;
        if (r > 0)
          for (const u of e) {
            const e = a[u] / r;
            e > 0 && (n += -e * Math.log2(e))
          }
        const s = Math.log2(4);
        return {
          first: t,
          allCounts: a,
          totalOps: r,
          entropy: n,
          entropyPct: s ? Math.round(n / s * 100) : 0
        }
      }));
      const te = e.computed((() => {
        const e = (X.value || []).slice().sort(((e, t) => (e.ts || 0) - (t.ts || 0)));
        let t = 0,
          a = 0,
          r = 0,
          n = 0;
        for (const s of e) s.success ? (t += 1, t > a && (a = t), r = 0) : (r += 1, r > n && (n = r), t = 0);
        return {
          curWin: t,
          maxWin: a,
          curLose: r,
          maxLose: n
        }
      }));

      const ue = e.computed((() => i.computeSpeedBuckets(X.value).map((e => {
        const t = e.total || 0,
          a = e.success || 0,
          r = e.fail || 0,
          n = Number.isFinite(e.avgTimeMs) ? e.avgTimeMs : null,
          s = t ? Math.round(a / t * 100) : 0;
        return {
          label: e.label,
          total: t,
          success: a,
          fail: r,
          successRate: s,
          avgTimeMs: n,
          avgTimeText: null != n ? K(n) : "-"
        }
      }))));

      return (t, a) => e.e({
        a: e.p({
          title: "历史统计",
          "show-back": !0,
          "with-safe-top": !1,
          "back-to-index": !0
        }),
        b: 1 === h.value ? 1 : "",
        c: e.o((e => W(1))),
        d: 3 === h.value ? 1 : "",
        e: e.o((e => W(3))),
        f: 7 === h.value ? 1 : "",
        g: e.o((e => W(7))),
        h: 30 === h.value ? 1 : "",
        i: e.o((e => W(30))),
        j: 0 === h.value ? 1 : "",
        k: e.o((e => W(0))),
        l: Y.value.items.length
      }, Y.value.items.length ? {
        m: e.f(Y.value.items, ((e, t, a) => ({
          a: e.failHeight + "rpx",
          b: e.successHeight + "rpx",
          c: e.totalHeight + "rpx",
          d: e.label || t
        }))),
        n: Y.value.barWidth + "rpx",
        o: Y.value.gap + "rpx",
        p: Y.value.width ? Y.value.width + "rpx" : "100%",
        q: Y.value.width ? Y.value.width + "rpx" : "100%",
        r: Y.value.chartHeight + "rpx",
        s: e.f(Y.value.items, ((t, a, r) => ({
          a: e.t(t.shortLabel),
          b: "label-" + a
        }))),
        t: Y.value.barWidth + "rpx",
        v: A.value ? 1 : "",
        w: Y.value.gap + "rpx",
        x: Y.value.width ? Y.value.width + "rpx" : "100%",
        y: e.t(te.value.curWin),
        z: e.t(te.value.maxWin),
        A: e.t(te.value.curLose),
        B: e.t(te.value.maxLose)
      } : {}, {
        C: G.value.length
      }, G.value.length ? {
        D: e.f((G.value || []).slice().reverse(), ((t, a, r) => ({
          a: e.t(L(t.ts)),
          b: e.t(t.success ? "成功" : "失败"),
          c: t.success ? 1 : "",
          d: t.success ? "" : 1,
          e: e.t(null != t.timeMs && Number.isFinite(t.timeMs) ? (t.timeMs / 1e3).toFixed(1) + "s" : "-"),
          f: e.t(t.cardsText),
          g: t.id
        })))
      } : {}, {
        E: ue.value.length
      }, ue.value.length ? {
        F: e.f(ue.value, ((t, a, r) => ({
          a: e.t(t.label),
          b: e.t(t.total),
          c: e.t(t.success),
          d: e.t(t.fail),
          e: "f179e625-1-" + r,
          f: e.p({ pct: t.successRate }),
          g: e.t(t.avgTimeText),
          h: t.label
        })))
      } : {}, {
        G: e.unref(w).visible
      }, e.unref(w).visible ? {
        H: e.t(e.unref(w).text),
        I: e.o((() => {})),
        J: e.unref(w).interactive ? 1 : "",
        K: e.o(((...t) => e.unref(T) && e.unref(T)(...t)))
      } : {}, {
        L: e.s(m.value),
        M: e.o(((...t) => e.unref(k).handleTouchStart && e.unref(k).handleTouchStart(...t))),
        N: e.o(((...t) => e.unref(k).handleTouchMove && e.unref(k).handleTouchMove(...t))),
        O: e.o(((...t) => e.unref(k).handleTouchEnd && e.unref(k).handleTouchEnd(...t))),
        P: e.o(((...t) => e.unref(k).handleTouchCancel && e.unref(k).handleTouchCancel(...t)))
      })
    }
  },
  f = e._export_sfc(d, [
    ["__scopeId", "data-v-f179e625"]
  ]);
wx.createPage(f);
