const Encoder = require('../../../encoder')
const { TxnOffsetCommit: apiKey } = require('../../apiKeys')

/**
 * TxnOffsetCommit Request (Version: 4) => transactional_id group_id producer_id producer_epoch generation_id member_id group_instance_id [topics] TAG_BUFFER
 *   transactional_id => COMPACT_STRING
 *   group_id => COMPACT_STRING
 *   producer_id => INT64
 *   producer_epoch => INT16
 *   generation_id => INT32
 *   member_id => COMPACT_STRING
 *   group_instance_id => COMPACT_NULLABLE_STRING
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition committed_offset committed_leader_epoch committed_metadata TAG_BUFFER
 *       partition => INT32
 *       committed_offset => INT64
 *       committed_leader_epoch => INT32
 *       committed_metadata => COMPACT_NULLABLE_STRING
 */

module.exports = ({
  transactionalId,
  groupId,
  producerId,
  producerEpoch,
  generationId = -1,
  memberId = '',
  groupInstanceId = null,
  topics,
}) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'TxnOffsetCommit',
  encode: async () => {
    return new Encoder()
      .writeCompactString(transactionalId)
      .writeCompactString(groupId)
      .writeInt64(producerId)
      .writeInt16(producerEpoch)
      .writeInt32(generationId)
      .writeCompactString(memberId)
      .writeCompactNullableString(groupInstanceId)
      .writeUVarIntArray(topics, encodeTopic)
      .writeTaggedFields({})
  },
})

const encodeTopic = ({ topic, partitions }) => {
  return new Encoder()
    .writeCompactString(topic)
    .writeUVarIntArray(partitions, encodePartition)
    .writeTaggedFields({})
}

const encodePartition = ({ partition, offset, leaderEpoch = -1, metadata }) => {
  return new Encoder()
    .writeInt32(partition)
    .writeInt64(offset)
    .writeInt32(leaderEpoch)
    .writeCompactNullableString(metadata)
    .writeTaggedFields({})
}
