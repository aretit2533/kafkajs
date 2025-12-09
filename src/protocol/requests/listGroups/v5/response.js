const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * ListGroups Response (Version: 5) => throttle_time_ms error_code [groups] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   groups => group_id protocol_type group_state group_type TAG_BUFFER
 *     group_id => COMPACT_STRING
 *     protocol_type => COMPACT_STRING
 *     group_state => COMPACT_STRING
 *     group_type => COMPACT_STRING
 */

const decodeGroup = decoder => ({
  groupId: decoder.readCompactString(),
  protocolType: decoder.readCompactString(),
  groupState: decoder.readCompactString(),
  groupType: decoder.readCompactString(),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()
  const groups = decoder.readCompactArray(decodeGroup)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    errorCode,
    groups,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
