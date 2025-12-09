const requestV10 = require('../v10/request')

/**
 * Metadata Request (Version: 12) => Same as v10
 */

module.exports = ({ topics, allowAutoTopicCreation, includeTopicAuthorizedOperations }) =>
  Object.assign(requestV10({ topics, allowAutoTopicCreation, includeTopicAuthorizedOperations }), {
    apiVersion: 12,
  })
