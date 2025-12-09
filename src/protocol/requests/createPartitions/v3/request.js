const Encoder = require('../../../encoder')
const { CreatePartitions: apiKey } = require('../../apiKeys')

/**
 * CreatePartitions Request (Version: 3) => [topics] timeout_ms validate_only TAG_BUFFER
 *   topics => name count [assignments] TAG_BUFFER
 *     name => COMPACT_STRING
 *     count => INT32
 *     assignments => COMPACT_ARRAY(INT32)
 *   timeout_ms => INT32
 *   validate_only => BOOLEAN
 */

module.exports = ({ topicPartitions, validateOnly = false, timeout = 5000 }) => ({
  apiKey,
  apiVersion: 3,
  apiName: 'CreatePartitions',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topicPartitions, encodeTopicPartitions)
      .writeInt32(timeout)
      .writeBoolean(validateOnly)
      .writeTaggedFields({})
  },
})

const encodeTopicPartitions = ({ topic, count, assignments = [] }) => {
  return new Encoder()
    .writeCompactString(topic)
    .writeInt32(count)
    .writeUVarInt(assignments.length === 0 ? 0 : assignments.length + 1)
    .write(
      assignments.length === 0 ? Buffer.alloc(0) : Buffer.concat(assignments.map(encodeAssignments))
    )
    .writeTaggedFields({})
}

const encodeAssignments = brokerIds => {
  const encoder = new Encoder()
  encoder.writeUVarInt(brokerIds.length + 1)
  brokerIds.forEach(brokerId => encoder.writeInt32(brokerId))
  return encoder.buffer
}
