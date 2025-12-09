const requestV6 = require('../v6/request')

/**
 * ListOffsets Request (Version: 8) => Same as v6
 */
module.exports = ({ replicaId, isolationLevel, topics }) =>
  Object.assign(requestV6({ replicaId, isolationLevel, topics }), { apiVersion: 8 })
