const requestV3 = require('../v3/request')

/**
 * ApiVersions Request (Version: 4) => client_software_name client_software_version TAG_BUFFER
 *   client_software_name => COMPACT_STRING
 *   client_software_version => COMPACT_STRING
 */

module.exports = params => ({
  ...requestV3(params),
  apiVersion: 4,
})
