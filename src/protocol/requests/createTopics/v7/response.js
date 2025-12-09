const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * CreateTopics Response (Version: 7) => throttle_time_ms [topics] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   topics => name topic_id error_code error_message num_partitions replication_factor [configs] TAG_BUFFER
 *     name => COMPACT_STRING
 *     topic_id => UUID
 *     error_code => INT16
 *     error_message => COMPACT_NULLABLE_STRING
 *     num_partitions => INT32
 *     replication_factor => INT16
 *     configs => name value read_only config_source is_sensitive TAG_BUFFER
 *       name => COMPACT_STRING
 *       value => COMPACT_NULLABLE_STRING
 *       read_only => BOOLEAN
 *       config_source => INT8
 *       is_sensitive => BOOLEAN
 */

const decodeConfig = decoder => ({
  name: decoder.readCompactString(),
  value: decoder.readCompactNullableString(),
  readOnly: decoder.readBoolean(),
  configSource: decoder.readInt8(),
  isSensitive: decoder.readBoolean(),
  _taggedFields: decoder.readTaggedFields(),
})

const decodeTopic = decoder => ({
  topicName: decoder.readCompactString(),
  topicId: decoder.readUUID(),
  errorCode: decoder.readInt16(),
  errorMessage: decoder.readCompactNullableString(),
  numPartitions: decoder.readInt32(),
  replicationFactor: decoder.readInt16(),
  configs: decoder.readCompactArray(decodeConfig),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const topics = decoder.readCompactArray(decodeTopic)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    topics,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
