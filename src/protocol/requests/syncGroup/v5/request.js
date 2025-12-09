const requestV4 = require('../v4/request')

/**
 * SyncGroup Request (Version: 5) => group_id generation_id member_id group_instance_id [group_assignment] TAG_BUFFER
 *   group_id => COMPACT_STRING
 *   generation_id => INT32
 *   member_id => COMPACT_STRING
 *   group_instance_id => COMPACT_NULLABLE_STRING
 *   group_assignment => member_id member_assignment TAG_BUFFER
 *     member_id => COMPACT_STRING
 *     member_assignment => COMPACT_BYTES
 */

module.exports = params => ({
  ...requestV4(params),
  apiVersion: 5,
})
