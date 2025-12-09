const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * ListOffsets Response (Version: 6) => throttle_time_ms [topics] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition error_code timestamp offset leader_epoch TAG_BUFFER
 *       partition => INT32
 *       error_code => INT16
 *       timestamp => INT64
 *       offset => INT64
 *       leader_epoch => INT32
 */

const decodePartition = decoder => ({
  partition: decoder.readInt32(),
  errorCode: decoder.readInt16(),
  timestamp: decoder.readInt64().toString(),
  offset: decoder.readInt64().toString(),
  leaderEpoch: decoder.readInt32(),
  _taggedFields: decoder.readTaggedFields(),
})

const decodeTopic = decoder => ({
  topicName: decoder.readCompactString(),
  partitions: decoder.readCompactArray(decodePartition),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const responses = decoder.readCompactArray(decodeTopic)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    responses,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
