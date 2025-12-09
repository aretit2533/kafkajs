const requestV6 = require('../v6/request')

/**
 * ListOffsets Request (Version: 7) => replica_id isolation_level [topics] TAG_BUFFER
 *   replica_id => INT32
 *   isolation_level => INT8
 *   topics => topic_id [partitions] TAG_BUFFER
 *     topic_id => UUID
 *     partitions => partition current_leader_epoch timestamp TAG_BUFFER
 *       partition => INT32
 *       current_leader_epoch => INT32
 *       timestamp => INT64
 */
module.exports = ({ replicaId, isolationLevel, topics }) =>
  Object.assign(requestV6({ replicaId, isolationLevel, topics }), { apiVersion: 7 })
