const requestV7 = require('../v7/request')

/**
 * OffsetFetch Request (Version: 8) => Same as v7
 */

module.exports = ({ groupId, topics }) =>
  Object.assign(requestV7({ groupId, topics }), { apiVersion: 8 })
