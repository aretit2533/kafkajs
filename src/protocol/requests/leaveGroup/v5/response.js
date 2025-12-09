const { parse, decode } = require('../v4/response')

/**
 * LeaveGroup Response (Version: 5) => throttle_time_ms error_code [members] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   members => member_id group_instance_id error_code TAG_BUFFER
 *     member_id => COMPACT_STRING
 *     group_instance_id => COMPACT_NULLABLE_STRING
 *     error_code => INT16
 */

module.exports = {
  decode,
  parse,
}
