const Encoder = require('../../../encoder')
const { OffsetFetch: apiKey } = require('../../apiKeys')

/**
 * OffsetFetch Request (Version: 7) => group_id [topics] TAG_BUFFER
 *   group_id => COMPACT_STRING
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition TAG_BUFFER
 *       partition => INT32
 */

module.exports = ({ groupId, topics }) => ({
  apiKey,
  apiVersion: 7,
  apiName: 'OffsetFetch',
  encode: async () => {
    return new Encoder()
      .writeCompactString(groupId)
      .writeUVarIntArray(topics || [], (encoder, topic) => encoder.writeEncoder(encodeTopic(topic)))
      .writeTaggedFields({})
  },
})

const encodeTopic = ({ topic, partitions }) => {
  return new Encoder()
    .writeCompactString(topic)
    .writeUVarIntArray(partitions, (encoder, partition) =>
      encoder.writeEncoder(encodePartition(partition))
    )
    .writeTaggedFields({})
}

const encodePartition = ({ partition }) => {
  return new Encoder().writeInt32(partition).writeTaggedFields({})
}
