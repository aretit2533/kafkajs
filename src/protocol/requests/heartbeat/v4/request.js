const Encoder = require('../../../encoder')
const { Heartbeat: apiKey } = require('../../apiKeys')

/**
 * Heartbeat Request (Version: 4) => group_id generation_id member_id group_instance_id TAG_BUFFER
 *   group_id => COMPACT_STRING
 *   generation_id => INT32
 *   member_id => COMPACT_STRING
 *   group_instance_id => COMPACT_NULLABLE_STRING
 */

module.exports = ({ groupId, groupGenerationId, memberId, groupInstanceId = null }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'Heartbeat',
  encode: async () => {
    return new Encoder()
      .writeCompactString(groupId)
      .writeInt32(groupGenerationId)
      .writeCompactString(memberId)
      .writeCompactNullableString(groupInstanceId)
      .writeTaggedFields({})
  },
})
