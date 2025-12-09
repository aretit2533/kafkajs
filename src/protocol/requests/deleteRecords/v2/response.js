const Decoder = require('../../../decoder')
const { KafkaJSDeleteTopicRecordsError } = require('../../../../errors')
const { failure, createErrorFromCode } = require('../../../error')

/**
 * DeleteRecords Response (Version: 2) => throttle_time_ms [topics] TAG_BUFFER
 *  throttle_time_ms => INT32
 *  topics => name [partitions] TAG_BUFFER
 *    name => COMPACT_STRING
 *    partitions => partition low_watermark error_code TAG_BUFFER
 *      partition => INT32
 *      low_watermark => INT64
 *      error_code => INT16
 */

const topicNameComparator = (a, b) => a.topic.localeCompare(b.topic)

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const topics = decoder.readCompactArray(decoder => ({
    topic: decoder.readCompactString(),
    partitions: decoder.readCompactArray(decoder => {
      const partition = decoder.readInt32()
      const lowWatermark = decoder.readInt64()
      const errorCode = decoder.readInt16()
      decoder.readTaggedFields()
      return {
        partition,
        lowWatermark,
        errorCode,
      }
    }),
    taggedFields: decoder.readTaggedFields(),
  }))
  decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    topics: topics.sort(topicNameComparator),
  }
}

const parse = requestTopics => async data => {
  const topicsWithErrors = data.topics
    .map(({ partitions }) => ({
      partitionsWithErrors: partitions.filter(({ errorCode }) => failure(errorCode)),
    }))
    .filter(({ partitionsWithErrors }) => partitionsWithErrors.length)

  if (topicsWithErrors.length > 0) {
    const [{ topic }] = data.topics
    const [{ partitions: requestPartitions }] = requestTopics
    const [{ partitionsWithErrors }] = topicsWithErrors

    throw new KafkaJSDeleteTopicRecordsError({
      topic,
      partitions: partitionsWithErrors.map(({ partition, errorCode }) => ({
        partition,
        error: createErrorFromCode(errorCode),
        offset: requestPartitions.find(p => p.partition === partition).offset,
      })),
    })
  }

  return data
}

module.exports = ({ topics }) => ({
  decode,
  parse: parse(topics),
})
