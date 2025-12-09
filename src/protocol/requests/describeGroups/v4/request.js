const Encoder = require('../../../encoder')
const { DescribeGroups: apiKey } = require('../../apiKeys')

/**
 * DescribeGroups Request (Version: 4) => [groups] include_authorized_operations TAG_BUFFER
 *   groups => COMPACT_STRING
 *   include_authorized_operations => BOOLEAN
 */

module.exports = ({ groupIds, includeAuthorizedOperations = false }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'DescribeGroups',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(groupIds, (encoder, groupId) => encoder.writeCompactString(groupId))
      .writeBoolean(includeAuthorizedOperations)
      .writeTaggedFields({})
  },
})
