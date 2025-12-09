const { parse, decode } = require('../v3/response')

/**
 * ApiVersions Response (Version: 4) => error_code [api_versions] throttle_time_ms TAG_BUFFER
 *   error_code => INT16
 *   api_versions => api_key min_version max_version TAG_BUFFER
 *     api_key => INT16
 *     min_version => INT16
 *     max_version => INT16
 *   throttle_time_ms => INT32
 */

module.exports = {
  decode,
  parse,
}
