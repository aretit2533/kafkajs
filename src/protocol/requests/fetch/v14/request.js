const requestV13 = require('../v13/request')

/**
 * Fetch Request (Version: 14) => Same as v13
 */

module.exports = ({
  replicaId,
  maxWaitTime,
  minBytes,
  maxBytes,
  topics,
  rackId,
  isolationLevel,
  sessionId,
  sessionEpoch,
  forgottenTopics,
}) =>
  Object.assign(
    requestV13({
      replicaId,
      maxWaitTime,
      minBytes,
      maxBytes,
      topics,
      rackId,
      isolationLevel,
      sessionId,
      sessionEpoch,
      forgottenTopics,
    }),
    { apiVersion: 14 }
  )
