const Encoder = require('../../../encoder')
const { AddOffsetsToTxn: apiKey } = require('../../apiKeys')

/**
 * AddOffsetsToTxn Request (Version: 4) => transactional_id producer_id producer_epoch group_id TAG_BUFFER
 *   transactional_id => COMPACT_STRING
 *   producer_id => INT64
 *   producer_epoch => INT16
 *   group_id => COMPACT_STRING
 */

module.exports = ({ transactionalId, producerId, producerEpoch, groupId }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'AddOffsetsToTxn',
  encode: async () => {
    return new Encoder()
      .writeCompactString(transactionalId)
      .writeInt64(producerId)
      .writeInt16(producerEpoch)
      .writeCompactString(groupId)
      .writeTaggedFields({})
  },
})
