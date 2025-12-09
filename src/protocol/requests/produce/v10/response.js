const { decode, parse } = require('../v9/response')

/**
 * Produce Response (Version: 10) => [responses] throttle_time_ms TAG_BUFFER
 *   responses => name [partition_responses] TAG_BUFFER
 *     name => COMPACT_STRING
 *     partition_responses => index error_code base_offset log_append_time log_start_offset [record_errors] error_message TAG_BUFFER
 *       index => INT32
 *       error_code => INT16
 *       base_offset => INT64
 *       log_append_time => INT64
 *       log_start_offset => INT64
 *       record_errors => batch_index batch_index_error_message TAG_BUFFER
 *         batch_index => INT32
 *         batch_index_error_message => COMPACT_NULLABLE_STRING
 *       error_message => COMPACT_NULLABLE_STRING
 *   throttle_time_ms => INT32
 */

module.exports = {
  decode,
  parse,
}
