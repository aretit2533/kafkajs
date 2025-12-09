const { parse, decode } = require('../v4/response')

/**
 * AddPartitionsToTxn Response (Version: 5) => throttle_time_ms [results_by_topic_v3_and_below] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   results_by_topic_v3_and_below => topic [results_by_partition] TAG_BUFFER
 *     topic => COMPACT_STRING
 *     results_by_partition => partition error_code TAG_BUFFER
 *       partition => INT32
 *       error_code => INT16
 */

module.exports = {
  decode,
  parse,
}
