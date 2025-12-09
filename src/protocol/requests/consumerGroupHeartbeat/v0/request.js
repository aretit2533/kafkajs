const Encoder = require('../../../encoder')
const { ConsumerGroupHeartbeat: apiKey } = require('../../apiKeys')

/**
 * ConsumerGroupHeartbeat Request (Version: 0) => group_id member_id member_epoch instance_id rack_id rebalance_timeout_ms
 *   subscribe_topic_names assigned_topic_partitions
 *   group_id => COMPACT_STRING
 *   member_id => COMPACT_STRING
 *   member_epoch => INT32
 *   instance_id => COMPACT_NULLABLE_STRING
 *   rack_id => COMPACT_NULLABLE_STRING
 *   rebalance_timeout_ms => INT32
 *   subscribe_topic_names => COMPACT_ARRAY<COMPACT_STRING>
 *   assigned_topic_partitions => COMPACT_ARRAY<TopicPartition>
 *     TopicPartition => topic_id partitions
 *       topic_id => UUID
 *       partitions => COMPACT_ARRAY<INT32>
 */

module.exports = ({
  groupId,
  memberId = '',
  memberEpoch = -1,
  instanceId = null,
  rackId = null,
  rebalanceTimeoutMs = 60000,
  subscribeTopicNames = [],
  assignedTopicPartitions = [],
}) => ({
  apiKey,
  apiVersion: 0,
  apiName: 'ConsumerGroupHeartbeat',
  encode: async () => {
    const encoder = new Encoder()
      .writeVarIntString(groupId)
      .writeVarIntString(memberId)
      .writeInt32(memberEpoch)
      .writeVarIntString(instanceId)
      .writeVarIntString(rackId)
      .writeInt32(rebalanceTimeoutMs)

    // Write subscribe topic names
    encoder.writeVarInt(subscribeTopicNames.length)
    subscribeTopicNames.forEach(topic => {
      encoder.writeVarIntString(topic)
    })

    // Write assigned topic partitions
    encoder.writeVarInt(assignedTopicPartitions.length)
    assignedTopicPartitions.forEach(({ topicId, partitions }) => {
      encoder.writeUUID(topicId)
      encoder.writeVarInt(partitions.length)
      partitions.forEach(partition => {
        encoder.writeInt32(partition)
      })
    })

    // Write tagged fields (empty for v0)
    encoder.writeVarInt(0)

    return encoder
  },
})
