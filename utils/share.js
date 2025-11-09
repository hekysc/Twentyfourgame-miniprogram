/**
 * 分享工具方法
 * 统一管理分享配置、菜单和生命周期注入
 */

const SHARE_CONFIG = {
  default: {
    title: '秒算24点，等你来挑战',
    path: '/pages/index/index',
    imageUrl: '',
    query: ''
  }
};

const DEFAULT_SHARE_MENUS = ['shareAppMessage', 'shareTimeline'];

function resolveShareOptions(options = {}) {
  return {
    title: options.title || SHARE_CONFIG.default.title,
    path: options.path || SHARE_CONFIG.default.path,
    imageUrl: options.imageUrl || SHARE_CONFIG.default.imageUrl || '',
    query: options.query || SHARE_CONFIG.default.query || ''
  };
}

function getShareAppMessage(options = {}) {
  const resolved = resolveShareOptions(options);
  return {
    title: resolved.title,
    path: resolved.path,
    imageUrl: resolved.imageUrl
  };
}

function getShareTimeline(options = {}) {
  const resolved = resolveShareOptions(options);
  return {
    title: resolved.title,
    query: resolved.query,
    imageUrl: resolved.imageUrl
  };
}

function createShareAppMessageHandler(options = {}) {
  return function () {
    return getShareAppMessage(options);
  };
}

function createShareTimelineHandler(options = {}) {
  return function () {
    return getShareTimeline(options);
  };
}

function showShareMenuSafe(target, menus = DEFAULT_SHARE_MENUS) {
  const payload = {
    withShareTicket: true,
    menus
  };
  try {
    if (target && typeof target.showShareMenu === 'function') {
      target.showShareMenu(payload);
      return true;
    }
  } catch (err) {}
  try {
    if (typeof wx !== 'undefined' && wx && typeof wx.showShareMenu === 'function') {
      wx.showShareMenu(payload);
      return true;
    }
  } catch (err) {}
  return false;
}

function enablePageShare(pageHooks, options = {}) {
  if (!pageHooks) return;
  const resolved = resolveShareOptions(options);
  const menus = options.menus || DEFAULT_SHARE_MENUS;
  const ensureMenu = () => showShareMenuSafe(pageHooks.index, menus);

  if (typeof pageHooks.onLoad === 'function') {
    pageHooks.onLoad(ensureMenu);
  } else {
    ensureMenu();
  }

  if (typeof pageHooks.onShow === 'function') {
    pageHooks.onShow(ensureMenu);
  }

  if (typeof pageHooks.onShareAppMessage === 'function') {
    pageHooks.onShareAppMessage(() => getShareAppMessage(resolved));
  }

  if (typeof pageHooks.onShareTimeline === 'function') {
    pageHooks.onShareTimeline(() => getShareTimeline({
      title: resolved.title,
      query: resolved.query,
      imageUrl: resolved.imageUrl
    }));
  }
}

function addShareToPage(pageInstance, options = {}) {
  if (!pageInstance) return;

  if (typeof pageInstance.onShareAppMessage === 'function') {
    pageInstance.onShareAppMessage(createShareAppMessageHandler(options));
  }

  if (typeof pageInstance.onShareTimeline === 'function') {
    pageInstance.onShareTimeline(createShareTimelineHandler(options));
  }
}

module.exports = {
  SHARE_CONFIG,
  DEFAULT_SHARE_MENUS,
  resolveShareOptions,
  getShareAppMessage,
  getShareTimeline,
  createShareAppMessageHandler,
  createShareTimelineHandler,
  showShareMenuSafe,
  enablePageShare,
  addShareToPage
};
