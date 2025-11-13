// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;

  const usersCollection = db.collection('users');
  const statsCollection = db.collection('stats');

  // 检查用户是否已存在
  const userRecord = await usersCollection.where({
    _openid: openid
  }).get();

  if (userRecord.data.length > 0) {
    // 用户已存在，直接返回用户信息
    return {
      code: 200,
      message: '登录成功',
      data: userRecord.data[0]
    }
  } else {
    // 用户不存在
    if (event.userInfo) {
      // 如果前端提供了用户信息，则创建新用户
      const newUser = {
        _openid: openid,
        ...event.userInfo,
        createdAt: db.serverDate(),
        lastLoginAt: db.serverDate()
      };

      const addUserResult = await usersCollection.add({
        data: newUser
      });

      // 同时在 stats 集合中为新用户创建一条空的统计记录
      await statsCollection.add({
        data: {
          _openid: openid,
          userId: addUserResult._id, // 关联 users 表的 _id
          totals: { total: 0, success: 0, fail: 0 },
          days: {},
          rounds: [],
          agg: {}
        }
      });

      // 返回新创建的用户信息
      const newUserRecord = await usersCollection.doc(addUserResult._id).get();

      return {
        code: 201, // 201 表示资源被创建
        message: '用户创建成功',
        data: newUserRecord.data
      }

    } else {
      // 前端未提供用户信息，告知前端需要授权
      return {
        code: 404, // 404 表示未找到用户
        message: '用户不存在，需要授权'
      }
    }
  }
}
