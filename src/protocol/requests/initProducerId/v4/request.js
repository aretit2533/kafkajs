const Encoder = require('../../../encoder')
const { InitProducerId: apiKey } = require('../../apiKeys')

/**
 * InitProducerId Request (Version: 4) => transactional_id transaction_timeout_ms producer_id producer_epoch TAG_BUFFER
 *   transactional_id => COMPACT_NULLABLE_STRING
 *   transaction_timeout_ms => INT32
 *   producer_id => INT64
 *   producer_epoch => INT16
 */

module.exports = ({
  transactionalId,
  transactionTimeout,
  producerId = -1,
  producerEpoch = -1,
}) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'InitProducerId',
  encode: async () => {
    return new Encoder()
      .writeCompactNullableString(transactionalId)
      .writeInt32(transactionTimeout)
      .writeInt64(producerId)
      .writeInt16(producerEpoch)
      .writeTaggedFields({})
  },
})
