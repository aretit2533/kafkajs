const Decoder = require('../../../decoder')
const { KafkaJSMemberIdRequired } = require('../../../../errors')
const {
  failure,
  createErrorFromCode,
  errorCodes,
  failIfVersionNotSupported,
} = require('../../../error')

/**
 * JoinGroup Response (Version: 6) => throttle_time_ms error_code generation_id protocol_type protocol_name leader member_id [members] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   generation_id => INT32
 *   protocol_type => COMPACT_NULLABLE_STRING
 *   protocol_name => COMPACT_NULLABLE_STRING
 *   leader => COMPACT_STRING
 *   member_id => COMPACT_STRING
 *   members => member_id group_instance_id metadata TAG_BUFFER
 *     member_id => COMPACT_STRING
 *     group_instance_id => COMPACT_NULLABLE_STRING
 *     metadata => COMPACT_BYTES
 */
const { code: MEMBER_ID_REQUIRED_ERROR_CODE } = errorCodes.find(
  e => e.type === 'MEMBER_ID_REQUIRED'
)

const parse = async data => {
  if (failure(data.errorCode)) {
    if (data.errorCode === MEMBER_ID_REQUIRED_ERROR_CODE) {
      throw new KafkaJSMemberIdRequired(createErrorFromCode(data.errorCode), {
        memberId: data.memberId,
      })
    }

    throw createErrorFromCode(data.errorCode)
  }

  return data
}

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()

  failIfVersionNotSupported(errorCode)

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    errorCode,
    generationId: decoder.readInt32(),
    protocolType: decoder.readCompactNullableString(),
    groupProtocol: decoder.readCompactNullableString(),
    leaderId: decoder.readCompactString(),
    memberId: decoder.readCompactString(),
    members: decoder.readCompactArray(decoder => ({
      memberId: decoder.readCompactString(),
      groupInstanceId: decoder.readCompactNullableString(),
      memberMetadata: decoder.readCompactBytes(),
      _taggedFields: decoder.readTaggedFields(),
    })),
    _taggedFields: decoder.readTaggedFields(),
  }
}

module.exports = {
  decode,
  parse,
}
