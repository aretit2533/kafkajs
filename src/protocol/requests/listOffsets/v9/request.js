const requestV6 = require('../v6/request')

/**
 * ListOffsets Request (Version: 9) => Same as v6
 */
module.exports = ({ replicaId, isolationLevel, topics }) =>
  Object.assign(requestV6({ replicaId, isolationLevel, topics }), { apiVersion: 9 })
