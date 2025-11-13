// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 生成一个唯一的回合ID
function generateRoundId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// 推送一局游戏记录
async function pushRound(openid, roundData) {
  const statsCollection = db.collection('stats');
  const userStats = await statsCollection.where({ _openid: openid }).get();

  if (userStats.data.length === 0) {
    return { code: 404, message: '未找到该用户的统计数据' };
  }

  const statsId = userStats.data[0]._id;
  const today = new Date().toISOString().slice(0, 10);
  const isSuccess = roundData.success;

  const newRound = {
    id: generateRoundId(),
    ts: db.serverDate(),
    ...roundData
  };

  // 使用原子操作更新数据，确保数据一致性
  const updateResult = await statsCollection.doc(statsId).update({
    data: {
      'totals.total': _.inc(1),
      'totals.success': isSuccess ? _.inc(1) : _.inc(0),
      'totals.fail': !isSuccess ? _.inc(1) : _.inc(0),
      [`days.${today}.total`]: _.inc(1),
      [`days.${today}.success`]: isSuccess ? _.inc(1) : _.inc(0),
      [`days.${today}.fail`]: !isSuccess ? _.inc(1) : _.inc(0),
      rounds: _.push({
        each: [newRound],
        slice: -1000 // 最多保留最近1000条记录
      }),
      // 更新最佳时间和连胜记录 (agg)
      'agg.currentStreak': isSuccess ? _.inc(1) : 0,
    }
  });

  // 处理最长连胜和最佳时间，这需要先读取再写入
  const updatedStats = await statsCollection.doc(statsId).get();
  const agg = updatedStats.data.agg || {};
  const currentStreak = agg.currentStreak || 0;
  const longestStreak = agg.longestStreak || 0;

  const finalUpdate = {};

  if (currentStreak > longestStreak) {
    finalUpdate['agg.longestStreak'] = currentStreak;
  }

  if (isSuccess && roundData.timeMs) {
      const bestTimeMs = agg.bestTimeMs;
      if (!bestTimeMs || roundData.timeMs < bestTimeMs) {
          finalUpdate['agg.bestTimeMs'] = roundData.timeMs;
      }
  }

  if (Object.keys(finalUpdate).length > 0) {
      await statsCollection.doc(statsId).update({ data: finalUpdate });
  }

  return { code: 200, message: '记录推送成功', data: updateResult };
}

// 获取统计数据
async function getStats(openid) {
  const statsCollection = db.collection('stats');
  const userStats = await statsCollection.where({
    _openid: openid
  }).get();

  if (userStats.data.length > 0) {
    return {
      code: 200,
      message: '获取统计数据成功',
      data: userStats.data[0]
    }
  } else {
    return {
      code: 404,
      message: '未找到该用户的统计数据'
    }
  }
}


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;

  const { action, data } = event;

  switch (action) {
    case 'pushRound':
      return await pushRound(openid, data);
    case 'getStats':
      return await getStats(openid);
    // 可以在这里添加更多的case来处理不同的数据请求
    default:
      return {
        code: 400,
        message: '无效的操作'
      }
  }
}
