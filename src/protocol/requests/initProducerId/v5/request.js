const requestV4 = require('../v4/request')

/**
 * InitProducerId Request (Version: 5) => transactional_id transaction_timeout_ms producer_id producer_epoch TAG_BUFFER
 *   transactional_id => COMPACT_NULLABLE_STRING
 *   transaction_timeout_ms => INT32
 *   producer_id => INT64
 *   producer_epoch => INT16
 */

module.exports = params => ({
  ...requestV4(params),
  apiVersion: 5,
})
