const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * DeleteTopics Response (Version: 6) => throttle_time_ms [responses] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   responses => name topic_id error_code error_message TAG_BUFFER
 *     name => COMPACT_NULLABLE_STRING
 *     topic_id => UUID
 *     error_code => INT16
 *     error_message => COMPACT_NULLABLE_STRING
 */

const topicNameComparator = (a, b) => (a.topic || '').localeCompare(b.topic || '')

const topicErrors = decoder => ({
  topic: decoder.readCompactNullableString(),
  topicId: decoder.readUUID(),
  errorCode: decoder.readInt16(),
  errorMessage: decoder.readCompactNullableString(),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const responses = decoder.readCompactArray(topicErrors).sort(topicNameComparator)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    topicErrors: responses,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
