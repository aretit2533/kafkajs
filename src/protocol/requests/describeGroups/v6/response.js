const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * DescribeGroups Response (Version: 6) => throttle_time_ms [groups] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   groups => error_code group_id group_state state_description protocol_type protocol [members] authorized_operations TAG_BUFFER
 *     error_code => INT16
 *     group_id => COMPACT_STRING
 *     group_state => COMPACT_STRING
 *     state_description => COMPACT_NULLABLE_STRING
 *     protocol_type => COMPACT_STRING
 *     protocol => COMPACT_STRING
 *     members => member_id group_instance_id client_id client_host member_metadata member_assignment TAG_BUFFER
 *       member_id => COMPACT_STRING
 *       group_instance_id => COMPACT_NULLABLE_STRING
 *       client_id => COMPACT_STRING
 *       client_host => COMPACT_STRING
 *       member_metadata => COMPACT_BYTES
 *       member_assignment => COMPACT_BYTES
 *     authorized_operations => INT32
 */

const decoderMember = decoder => ({
  memberId: decoder.readCompactString(),
  groupInstanceId: decoder.readCompactNullableString(),
  clientId: decoder.readCompactString(),
  clientHost: decoder.readCompactString(),
  memberMetadata: decoder.readCompactBytes(),
  memberAssignment: decoder.readCompactBytes(),
  _taggedFields: decoder.readTaggedFields(),
})

const decodeGroup = decoder => ({
  errorCode: decoder.readInt16(),
  groupId: decoder.readCompactString(),
  state: decoder.readCompactString(),
  stateDescription: decoder.readCompactNullableString(),
  protocolType: decoder.readCompactString(),
  protocol: decoder.readCompactString(),
  members: decoder.readCompactArray(decoderMember),
  authorizedOperations: decoder.readInt32(),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const groups = decoder.readCompactArray(decodeGroup)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    groups,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
