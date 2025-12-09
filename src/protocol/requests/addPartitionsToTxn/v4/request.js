const Encoder = require('../../../encoder')
const { AddPartitionsToTxn: apiKey } = require('../../apiKeys')

/**
 * AddPartitionsToTxn Request (Version: 4) => transactional_id producer_id producer_epoch [topics] TAG_BUFFER
 *   transactional_id => COMPACT_STRING
 *   producer_id => INT64
 *   producer_epoch => INT16
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => INT32
 */

module.exports = ({ transactionalId, producerId, producerEpoch, topics }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'AddPartitionsToTxn',
  encode: async () => {
    return new Encoder()
      .writeCompactString(transactionalId)
      .writeInt64(producerId)
      .writeInt16(producerEpoch)
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

const encodePartition = partition => {
  return new Encoder().writeInt32(partition)
}
