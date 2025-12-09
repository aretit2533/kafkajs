const Decoder = require('../../../decoder')
const { failure, createErrorFromCode, failIfVersionNotSupported } = require('../../../error')

/**
 * ConsumerGroupHeartbeat Response (Version: 0) => throttle_time_ms error_code error_message member_id member_epoch
 *   heartbeat_interval_ms assignment
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   error_message => COMPACT_NULLABLE_STRING
 *   member_id => COMPACT_STRING
 *   member_epoch => INT32
 *   heartbeat_interval_ms => INT32
 *   assignment => TopicPartitions
 *     TopicPartitions => topic_id partitions
 *       topic_id => UUID
 *       partitions => COMPACT_ARRAY<INT32>
 */

const topicPartitionsDecoder = decoder => {
  const topicId = decoder.readUUID()
  const partitionsCount = decoder.readVarInt()
  const partitions = []
  for (let i = 0; i < partitionsCount; i++) {
    partitions.push(decoder.readInt32())
  }

  return {
    topicId,
    partitions,
  }
}

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTimeMs = decoder.readInt32()
  const errorCode = decoder.readInt16()

  failIfVersionNotSupported(errorCode)

  const errorMessage = decoder.readVarIntString()
  const memberId = decoder.readVarIntString()
  const memberEpoch = decoder.readInt32()
  const heartbeatIntervalMs = decoder.readInt32()

  const assignmentCount = decoder.readVarInt()
  const assignment = []
  for (let i = 0; i < assignmentCount; i++) {
    assignment.push(topicPartitionsDecoder(decoder))
  }

  // Read tagged fields
  decoder.readVarInt()

  return {
    throttleTimeMs,
    errorCode,
    errorMessage,
    memberId,
    memberEpoch,
    heartbeatIntervalMs,
    assignment,
  }
}

const parse = async data => {
  if (failure(data.errorCode)) {
    throw createErrorFromCode(data.errorCode)
  }

  return data
}

module.exports = {
  decode,
  parse,
}
