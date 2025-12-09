const Decoder = require('../../../decoder')
const { failure, createErrorFromCode } = require('../../../error')

/**
 * AddPartitionsToTxn Response (Version: 4) => throttle_time_ms [results_by_topic_v3_and_below] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   results_by_topic_v3_and_below => topic [results_by_partition] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     results_by_partition => partition error_code TAG_BUFFER
 *       partition => INT32
 *       error_code => INT16
 */

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errors = await decoder.readCompactArrayAsync(decodeError)
  decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    errors,
  }
}

const decodeError = async decoder => {
  const topic = decoder.readCompactString()
  const partitionErrors = await decoder.readCompactArrayAsync(decodePartitionError)
  decoder.readTaggedFields()

  return {
    topic,
    partitionErrors,
  }
}

const decodePartitionError = decoder => {
  const partition = decoder.readInt32()
  const errorCode = decoder.readInt16()
  decoder.readTaggedFields()

  return {
    partition,
    errorCode,
  }
}

const parse = async data => {
  const topicsWithErrors = data.errors
    .map(({ partitionErrors }) => ({
      partitionsWithErrors: partitionErrors.filter(({ errorCode }) => failure(errorCode)),
    }))
    .filter(({ partitionsWithErrors }) => partitionsWithErrors.length)

  if (topicsWithErrors.length > 0) {
    throw createErrorFromCode(topicsWithErrors[0].partitionsWithErrors[0].errorCode)
  }

  return data
}

module.exports = {
  decode,
  parse,
}
