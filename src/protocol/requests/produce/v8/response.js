const Decoder = require('../../../decoder')
const { failure, createErrorFromCode } = require('../../../error')
const { parse: parseV7 } = require('../v7/response')

/**
 * Produce Response (Version: 8) => [responses] throttle_time_ms
 *   responses => topic [partition_responses]
 *     topic => STRING
 *     partition_responses => partition error_code base_offset log_append_time log_start_offset [record_errors] error_message
 *       partition => INT32
 *       error_code => INT16
 *       base_offset => INT64
 *       log_append_time => INT64
 *       log_start_offset => INT64
 *       record_errors => batch_index batch_index_error_message
 *         batch_index => INT32
 *         batch_index_error_message => NULLABLE_STRING
 *       error_message => NULLABLE_STRING
 *   throttle_time_ms => INT32
 */

const decodeRecordErrors = decoder => ({
  batchIndex: decoder.readInt32(),
  batchIndexErrorMessage: decoder.readString(),
})

const decodePartition = decoder => ({
  partition: decoder.readInt32(),
  errorCode: decoder.readInt16(),
  baseOffset: decoder.readInt64().toString(),
  logAppendTime: decoder.readInt64().toString(),
  logStartOffset: decoder.readInt64().toString(),
  recordErrors: decoder.readArray(decodeRecordErrors),
  errorMessage: decoder.readString(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const topics = decoder.readArray(decoder => ({
    topicName: decoder.readString(),
    partitions: decoder.readArray(decodePartition),
  }))

  const throttleTime = decoder.readInt32()

  return {
    topics,
    throttleTime,
  }
}

const parse = async data => {
  const topicsWithPartitionErrors = data.topics.map(({ topicName, partitions }) => {
    const partitionsWithErrors = partitions.map(
      ({ errorCode, partition, recordErrors, errorMessage, ...props }) => {
        return {
          partition,
          errorCode,
          recordErrors,
          errorMessage,
          ...props,
          ...(errorCode !== 0 ? failure(createErrorFromCode(errorCode)) : {}),
        }
      }
    )

    return {
      topicName,
      partitions: partitionsWithErrors,
    }
  })

  return {
    topics: topicsWithPartitionErrors,
    throttleTime: data.throttleTime,
  }
}

module.exports = {
  decode,
  parse,
}
