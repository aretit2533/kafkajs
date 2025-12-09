const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * Metadata Response (Version: 7) => throttle_time_ms [brokers] cluster_id controller_id [topics] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   brokers => node_id host port rack TAG_BUFFER
 *     node_id => INT32
 *     host => COMPACT_STRING
 *     port => INT32
 *     rack => COMPACT_NULLABLE_STRING
 *   cluster_id => COMPACT_NULLABLE_STRING
 *   controller_id => INT32
 *   topics => error_code topic_id is_internal [partitions] TAG_BUFFER
 *     error_code => INT16
 *     topic_id => UUID
 *     is_internal => BOOLEAN
 *     partitions => error_code partition leader leader_epoch [replicas] [isr] [offline_replicas] TAG_BUFFER
 *       error_code => INT16
 *       partition => INT32
 *       leader => INT32
 *       leader_epoch => INT32
 *       replicas => INT32
 *       isr => INT32
 *       offline_replicas => INT32
 */

const broker = decoder => ({
  nodeId: decoder.readInt32(),
  host: decoder.readCompactString(),
  port: decoder.readInt32(),
  rack: decoder.readCompactNullableString(),
  _taggedFields: decoder.readTaggedFields(),
})

const topicMetadata = decoder => ({
  topicErrorCode: decoder.readInt16(),
  topicId: decoder.readUUID(),
  isInternal: decoder.readBoolean(),
  partitionMetadata: decoder.readCompactArray(partitionMetadata),
  _taggedFields: decoder.readTaggedFields(),
})

const partitionMetadata = decoder => ({
  partitionErrorCode: decoder.readInt16(),
  partitionId: decoder.readInt32(),
  leader: decoder.readInt32(),
  leaderEpoch: decoder.readInt32(),
  replicas: decoder.readCompactArray(d => d.readInt32()),
  isr: decoder.readCompactArray(d => d.readInt32()),
  offlineReplicas: decoder.readCompactArray(d => d.readInt32()),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const brokers = decoder.readCompactArray(broker)
  const clusterId = decoder.readCompactNullableString()
  const controllerId = decoder.readInt32()
  const topicMetadata = decoder.readCompactArray(topicMetadata)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime,
    clientSideThrottleTime: throttleTime,
    brokers,
    clusterId,
    controllerId,
    topicMetadata,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
