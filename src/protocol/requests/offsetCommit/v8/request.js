const requestV7 = require('../v7/request')

/**
 * OffsetCommit Request (Version: 8) => Same as v7
 */

module.exports = ({ groupId, groupGenerationId, memberId, topics }) =>
  Object.assign(requestV7({ groupId, groupGenerationId, memberId, topics }), { apiVersion: 8 })
