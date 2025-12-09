const requestV4 = require('../v4/request')

/**
 * AddPartitionsToTxn Request (Version: 5) => transactional_id producer_id producer_epoch [topics] TAG_BUFFER
 *   transactional_id => COMPACT_STRING
 *   producer_id => INT64
 *   producer_epoch => INT16
 *   topics => topic [partitions] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     partitions => INT32
 */

module.exports = params => ({
  ...requestV4(params),
  apiVersion: 5,
})
