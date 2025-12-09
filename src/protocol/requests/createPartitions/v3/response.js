const Decoder = require('../../../decoder')
const { failure, createErrorFromCode } = require('../../../error')

/**
 * CreatePartitions Response (Version: 3) => throttle_time_ms [results] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   results => name error_code error_message TAG_BUFFER
 *     name => COMPACT_STRING
 *     error_code => INT16
 *     error_message => COMPACT_NULLABLE_STRING
 */

const topicNameComparator = (a, b) => a.topic.localeCompare(b.topic)

const topicErrors = decoder => {
  const topic = decoder.readCompactString()
  const errorCode = decoder.readInt16()
  const errorMessage = decoder.readCompactNullableString()
  decoder.readTaggedFields()

  return {
    topic,
    errorCode,
    errorMessage,
  }
}

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const topicErrors = decoder.readCompactArray(topicErrors).sort(topicNameComparator)
  decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    topicErrors,
  }
}

const parse = async data => {
  const topicsWithError = data.topicErrors.filter(({ errorCode }) => failure(errorCode))
  if (topicsWithError.length > 0) {
    throw createErrorFromCode(topicsWithError[0].errorCode)
  }

  return data
}

module.exports = {
  decode,
  parse,
}
