const { parse, decode } = require('../v4/response')

/**
 * InitProducerId Response (Version: 6) => throttle_time_ms error_code producer_id producer_epoch TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   producer_id => INT64
 *   producer_epoch => INT16
 */

module.exports = {
  decode,
  parse,
}
