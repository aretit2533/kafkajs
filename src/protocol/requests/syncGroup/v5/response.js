const { parse, decode } = require('../v4/response')

/**
 * SyncGroup Response (Version: 5) => throttle_time_ms error_code protocol_type protocol_name member_assignment TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   protocol_type => COMPACT_NULLABLE_STRING
 *   protocol_name => COMPACT_NULLABLE_STRING
 *   member_assignment => COMPACT_BYTES
 */

module.exports = {
  decode,
  parse,
}
