const requestV4 = require('../v4/request')

/**
 * LeaveGroup Request (Version: 5) => group_id [members] TAG_BUFFER
 *   group_id => COMPACT_STRING
 *   members => member_id group_instance_id reason TAG_BUFFER
 *     member_id => COMPACT_STRING
 *     group_instance_id => COMPACT_NULLABLE_STRING
 *     reason => COMPACT_NULLABLE_STRING
 */

module.exports = params => ({
  ...requestV4(params),
  apiVersion: 5,
})
