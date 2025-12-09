const Encoder = require('../../../encoder')
const { DeleteRecords: apiKey } = require('../../apiKeys')

/**
 * DeleteRecords Request (Version: 2) => [topics] timeout_ms TAG_BUFFER
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition offset TAG_BUFFER
 *       partition => INT32
 *       offset => INT64
 *   timeout => INT32
 */

module.exports = ({ topics, timeout = 5000 }) => ({
  apiKey,
  apiVersion: 2,
  apiName: 'DeleteRecords',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics, encodeTopic)
      .writeInt32(timeout)
      .writeTaggedFields({})
  },
})

const encodeTopic = ({ topic, partitions }) => {
  return new Encoder()
    .writeCompactString(topic)
    .writeUVarIntArray(partitions, encodePartition)
    .writeTaggedFields({})
}

const encodePartition = ({ partition, offset }) => {
  return new Encoder()
    .writeInt32(partition)
    .writeInt64(offset)
    .writeTaggedFields({})
}
