const Encoder = require('../../../encoder')
const { JoinGroup: apiKey } = require('../../apiKeys')

/**
 * JoinGroup Request (Version: 6) => group_id session_timeout rebalance_timeout member_id group_instance_id protocol_type [protocols] TAG_BUFFER
 *   group_id => COMPACT_STRING
 *   session_timeout => INT32
 *   rebalance_timeout => INT32
 *   member_id => COMPACT_STRING
 *   group_instance_id => COMPACT_NULLABLE_STRING
 *   protocol_type => COMPACT_STRING
 *   protocols => name metadata TAG_BUFFER
 *     name => COMPACT_STRING
 *     metadata => COMPACT_BYTES
 */

module.exports = ({
  groupId,
  sessionTimeout,
  rebalanceTimeout,
  memberId,
  groupInstanceId = null,
  protocolType,
  groupProtocols,
}) => ({
  apiKey,
  apiVersion: 6,
  apiName: 'JoinGroup',
  encode: async () => {
    return new Encoder()
      .writeCompactString(groupId)
      .writeInt32(sessionTimeout)
      .writeInt32(rebalanceTimeout)
      .writeCompactString(memberId)
      .writeCompactNullableString(groupInstanceId)
      .writeCompactString(protocolType)
      .writeUVarIntArray(groupProtocols, (encoder, protocol) =>
        encoder.writeEncoder(encodeGroupProtocols(protocol))
      )
      .writeTaggedFields({})
  },
})

const encodeGroupProtocols = ({ name, metadata = Buffer.alloc(0) }) => {
  return new Encoder()
    .writeCompactString(name)
    .writeCompactBytes(metadata)
    .writeTaggedFields({})
}
