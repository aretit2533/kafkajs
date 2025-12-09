const Encoder = require('../../../encoder')
const { ListGroups: apiKey } = require('../../apiKeys')

/**
 * ListGroups Request (Version: 5) => [states_filter] [types_filter] TAG_BUFFER
 *   states_filter => COMPACT_STRING
 *   types_filter => COMPACT_STRING
 */

module.exports = ({ statesFilter = [], typesFilter = [] }) => ({
  apiKey,
  apiVersion: 5,
  apiName: 'ListGroups',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(statesFilter, (encoder, state) => encoder.writeCompactString(state))
      .writeUVarIntArray(typesFilter, (encoder, type) => encoder.writeCompactString(type))
      .writeTaggedFields({})
  },
})
