const Encoder = require('../../../encoder')
const { OffsetCommit: apiKey } = require('../../apiKeys')

/**
 * OffsetCommit Request (Version: 7) => group_id generation_id member_id [topics] TAG_BUFFER
 *   group_id => COMPACT_STRING
 *   generation_id => INT32
 *   member_id => COMPACT_STRING
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition committed_offset committed_leader_epoch committed_metadata TAG_BUFFER
 *       partition => INT32
 *       committed_offset => INT64
 *       committed_leader_epoch => INT32
 *       committed_metadata => COMPACT_NULLABLE_STRING
 */

module.exports = ({ groupId, groupGenerationId, memberId, topics }) => ({
  apiKey,
  apiVersion: 7,
  apiName: 'OffsetCommit',
  encode: async () => {
    return new Encoder()
      .writeCompactString(groupId)
      .writeInt32(groupGenerationId)
      .writeCompactString(memberId)
      .writeUVarIntArray(topics, (encoder, topic) => encoder.writeEncoder(encodeTopic(topic)))
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

const encodePartition = ({ partition, offset, leaderEpoch = -1, metadata = null }) => {
  return new Encoder()
    .writeInt32(partition)
    .writeInt64(offset)
    .writeInt32(leaderEpoch)
    .writeCompactNullableString(metadata)
    .writeTaggedFields({})
}
