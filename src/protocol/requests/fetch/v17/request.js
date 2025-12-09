const requestV15 = require('../v15/request')

/**
 * Fetch Request (Version: 17) => Same as v15
 */

module.exports = ({
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
    requestV15({
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
    { apiVersion: 17 }
  )
