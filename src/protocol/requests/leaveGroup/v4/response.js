const Decoder = require('../../../decoder')
const { failIfVersionNotSupported, failure, createErrorFromCode } = require('../../../error')
const { parse: parseV2 } = require('../v2/response')

/**
 * LeaveGroup Response (Version: 4) => throttle_time_ms error_code [members] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   members => member_id group_instance_id error_code TAG_BUFFER
 *     member_id => COMPACT_STRING
 *     group_instance_id => COMPACT_NULLABLE_STRING
 *     error_code => INT16
 */

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()
  const members = decoder.readCompactArray(decodeMembers)
  decoder.readTaggedFields()

  failIfVersionNotSupported(errorCode)

  return { throttleTime: 0, clientSideThrottleTime: throttleTime, errorCode, members }
}

const decodeMembers = decoder => ({
  memberId: decoder.readCompactString(),
  groupInstanceId: decoder.readCompactNullableString(),
  errorCode: decoder.readInt16(),
  taggedFields: decoder.readTaggedFields(),
})

const parse = async data => {
  const parsed = parseV2(data)

  const memberWithError = data.members.find(member => failure(member.errorCode))
  if (memberWithError) {
    throw createErrorFromCode(memberWithError.errorCode)
  }

  return parsed
}

module.exports = {
  decode,
  parse,
}
