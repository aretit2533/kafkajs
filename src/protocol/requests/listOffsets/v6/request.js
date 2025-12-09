const Encoder = require('../../../encoder')
const { ListOffsets: apiKey } = require('../../apiKeys')

/**
 * ListOffsets Request (Version: 6) => replica_id isolation_level [topics] TAG_BUFFER
 *   replica_id => INT32
 *   isolation_level => INT8
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => partition current_leader_epoch timestamp TAG_BUFFER
 *       partition => INT32
 *       current_leader_epoch => INT32
 *       timestamp => INT64
 */
module.exports = ({ replicaId, isolationLevel, topics }) => ({
  apiKey,
  apiVersion: 6,
  apiName: 'ListOffsets',
  encode: async () => {
    return new Encoder()
      .writeInt32(replicaId)
      .writeInt8(isolationLevel)
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

const encodePartition = ({ partition, currentLeaderEpoch = -1, timestamp = -1 }) => {
  return new Encoder()
    .writeInt32(partition)
    .writeInt32(currentLeaderEpoch)
    .writeInt64(timestamp)
    .writeTaggedFields({})
}
