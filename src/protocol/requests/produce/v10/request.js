const requestV9 = require('../v9/request')

/**
 * V10 is the same as V9
 *
 * Produce Request (Version: 10) => transactional_id acks timeout [topic_data] TAG_BUFFER
 *   transactional_id => COMPACT_NULLABLE_STRING
 *   acks => INT16
 *   timeout => INT32
 *   topic_data => name [partition_data] TAG_BUFFER
 *     name => COMPACT_STRING
 *     partition_data => index records TAG_BUFFER
 *       index => INT32
 *       records => COMPACT_RECORDS
 */

module.exports = ({
  acks,
  timeout,
  transactionalId,
  producerId,
  producerEpoch,
  compression,
  topicData,
}) =>
  Object.assign(
    requestV9({
      acks,
      timeout,
      transactionalId,
      producerId,
      producerEpoch,
      compression,
      topicData,
    }),
    { apiVersion: 10 }
  )
