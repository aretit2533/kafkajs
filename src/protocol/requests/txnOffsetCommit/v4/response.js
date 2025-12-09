const Decoder = require('../../../decoder')
const { failure, createErrorFromCode } = require('../../../error')

/**
 * TxnOffsetCommit Response (Version: 4) => throttle_time_ms [topics] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition error_code TAG_BUFFER
 *       partition => INT32
 *       error_code => INT16
 */

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const topics = await decoder.readCompactArrayAsync(decodeTopic)
  decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    topics,
  }
}

const decodeTopic = async decoder => {
  const topic = decoder.readCompactString()
  const partitions = await decoder.readCompactArrayAsync(decodePartition)
  decoder.readTaggedFields()

  return {
    topic,
    partitions,
  }
}

const decodePartition = decoder => {
  const partition = decoder.readInt32()
  const errorCode = decoder.readInt16()
  decoder.readTaggedFields()

  return {
    partition,
    errorCode,
  }
}

const parse = async data => {
  const topicsWithErrors = data.topics
    .map(({ partitions }) => ({
      partitionsWithErrors: partitions.filter(({ errorCode }) => failure(errorCode)),
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
