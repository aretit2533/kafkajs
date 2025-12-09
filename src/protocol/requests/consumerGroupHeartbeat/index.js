const NETWORK_DELAY = 5000

/**
 * ConsumerGroupHeartbeat replaces the classic JoinGroup/SyncGroup/Heartbeat flow
 * in the new consumer group protocol (KIP-848)
 *
 * @see https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol
 */
const requestTimeout = ({ heartbeatIntervalMs = 3000 }) => {
  return Number.isSafeInteger(heartbeatIntervalMs + NETWORK_DELAY)
    ? heartbeatIntervalMs + NETWORK_DELAY
    : heartbeatIntervalMs
}

const versions = {
  0: ({
    groupId,
    memberId,
    memberEpoch,
    instanceId,
    rackId,
    rebalanceTimeoutMs,
    subscribeTopicNames,
    assignedTopicPartitions,
    heartbeatIntervalMs,
  }) => {
    const request = require('./v0/request')
    const response = require('./v0/response')

    return {
      request: request({
        groupId,
        memberId,
        memberEpoch,
        instanceId,
        rackId,
        rebalanceTimeoutMs,
        subscribeTopicNames,
        assignedTopicPartitions,
      }),
      response,
      requestTimeout: requestTimeout({ heartbeatIntervalMs }),
    }
  },
}

module.exports = {
  versions: Object.keys(versions),
  protocol: ({ version }) => versions[version],
}
