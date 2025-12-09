const Encoder = require('../../../encoder')
const { EndTxn: apiKey } = require('../../apiKeys')

/**
 * EndTxn Request (Version: 4) => transactional_id producer_id producer_epoch committed TAG_BUFFER
 *   transactional_id => COMPACT_STRING
 *   producer_id => INT64
 *   producer_epoch => INT16
 *   committed => BOOLEAN
 */

module.exports = ({ transactionalId, producerId, producerEpoch, transactionResult }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'EndTxn',
  encode: async () => {
    return new Encoder()
      .writeCompactString(transactionalId)
      .writeInt64(producerId)
      .writeInt16(producerEpoch)
      .writeBoolean(transactionResult)
      .writeTaggedFields({})
  },
})
