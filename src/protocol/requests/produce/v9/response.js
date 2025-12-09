const Decoder = require('../../../decoder')
const { failure, createErrorFromCode } = require('../../../error')

/**
 * Produce Response (Version: 9) => [responses] throttle_time_ms TAG_BUFFER
 *   responses => name [partition_responses] TAG_BUFFER
 *     name => COMPACT_STRING
 *     partition_responses => index error_code base_offset log_append_time log_start_offset [record_errors] error_message TAG_BUFFER
 *       index => INT32
 *       error_code => INT16
 *       base_offset => INT64
 *       log_append_time => INT64
 *       log_start_offset => INT64
 *       record_errors => batch_index batch_index_error_message TAG_BUFFER
 *         batch_index => INT32
 *         batch_index_error_message => COMPACT_NULLABLE_STRING
 *       error_message => COMPACT_NULLABLE_STRING
 *   throttle_time_ms => INT32
 */

const decodeRecordErrors = decoder => ({
  batchIndex: decoder.readInt32(),
  batchIndexErrorMessage: decoder.readCompactNullableString(),
  _taggedFields: decoder.readTaggedFields(),
})

const decodePartition = decoder => ({
  partition: decoder.readInt32(),
  errorCode: decoder.readInt16(),
  baseOffset: decoder.readInt64().toString(),
  logAppendTime: decoder.readInt64().toString(),
  logStartOffset: decoder.readInt64().toString(),
  recordErrors: decoder.readCompactArray(decodeRecordErrors),
  errorMessage: decoder.readCompactNullableString(),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const topics = decoder.readCompactArray(decoder => ({
    topicName: decoder.readCompactString(),
    partitions: decoder.readCompactArray(decodePartition),
    _taggedFields: decoder.readTaggedFields(),
  }))

  const throttleTime = decoder.readInt32()
  const taggedFields = decoder.readTaggedFields()

  return {
    topics,
    throttleTime,
    _taggedFields: taggedFields,
  }
}

const parse = async data => {
  const topicsWithPartitionErrors = data.topics.map(({ topicName, partitions, _taggedFields }) => {
    const partitionsWithErrors = partitions.map(
      ({
        errorCode,
        partition,
        recordErrors,
        errorMessage,
        _taggedFields: partTaggedFields,
        ...props
      }) => {
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
