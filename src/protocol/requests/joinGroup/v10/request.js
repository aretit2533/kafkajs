const requestV7 = require('../v7/request')

/**
 * JoinGroup Request (Version: 10) => Same as v7
 */

module.exports = ({
  groupId,
  sessionTimeout,
  rebalanceTimeout,
  memberId,
  groupInstanceId,
  protocolType,
  groupProtocols,
  reason,
}) =>
  Object.assign(
    requestV7({
      groupId,
      sessionTimeout,
      rebalanceTimeout,
      memberId,
      groupInstanceId,
      protocolType,
      groupProtocols,
      reason,
    }),
    { apiVersion: 10 }
  )
