const Decoder = require('../../../decoder')
const { parse: parseV1 } = require('../v1/response')
const decodeMessages = require('../v4/decodeMessages')

/**
 * Fetch Response (Version: 12) => throttle_time_ms error_code session_id [responses] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   session_id => INT32
 *   responses => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition_header record_set
 *       partition_header => partition error_code high_watermark last_stable_offset log_start_offset [aborted_transactions] preferred_read_replica TAG_BUFFER
 *         partition => INT32
 *         error_code => INT16
 *         high_watermark => INT64
 *         last_stable_offset => INT64
 *         log_start_offset => INT64
 *         aborted_transactions => producer_id first_offset TAG_BUFFER
 *           producer_id => INT64
 *           first_offset => INT64
 *         preferred_read_replica => INT32
 *       record_set => COMPACT_RECORDS
 */

const decodeAbortedTransactions = decoder => ({
  producerId: decoder.readInt64().toString(),
  firstOffset: decoder.readInt64().toString(),
  _taggedFields: decoder.readTaggedFields(),
})

const decodePartition = async decoder => ({
  partition: decoder.readInt32(),
  errorCode: decoder.readInt16(),
  highWatermark: decoder.readInt64().toString(),
  lastStableOffset: decoder.readInt64().toString(),
  lastStartOffset: decoder.readInt64().toString(),
  abortedTransactions: decoder.readCompactArray(decodeAbortedTransactions),
  preferredReadReplica: decoder.readInt32(),
  _taggedFields: decoder.readTaggedFields(),
  messages: await decodeMessages(decoder),
})

const decodeResponse = async decoder => ({
  topicName: decoder.readCompactString(),
  partitions: await decoder.readArrayAsync(decodePartition),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const clientSideThrottleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()
  const sessionId = decoder.readInt32()
  const responses = await decoder.readArrayAsync(decodeResponse)
  const taggedFields = decoder.readTaggedFields()

  return {
    clientSideThrottleTime,
    errorCode,
    sessionId,
    responses,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV1,
}
