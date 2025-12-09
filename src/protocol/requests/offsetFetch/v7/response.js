const Decoder = require('../../../decoder')
const { parse: parseV1 } = require('../v1/response')

/**
 * OffsetFetch Response (Version: 7) => throttle_time_ms [topics] error_code TAG_BUFFER
 *   throttle_time_ms => INT32
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition committed_offset committed_leader_epoch metadata error_code TAG_BUFFER
 *       partition => INT32
 *       committed_offset => INT64
 *       committed_leader_epoch => INT32
 *       metadata => COMPACT_NULLABLE_STRING
 *       error_code => INT16
 *   error_code => INT16
 */

const decodePartition = decoder => ({
  partition: decoder.readInt32(),
  offset: decoder.readInt64().toString(),
  leaderEpoch: decoder.readInt32(),
  metadata: decoder.readCompactNullableString(),
  errorCode: decoder.readInt16(),
  _taggedFields: decoder.readTaggedFields(),
})

const decodeTopic = decoder => ({
  topic: decoder.readCompactString(),
  partitions: decoder.readCompactArray(decodePartition),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const responses = decoder.readCompactArray(decodeTopic)
  const errorCode = decoder.readInt16()
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime,
    responses,
    errorCode,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV1,
}
