const COORDINATOR_TYPES = require('../../coordinatorTypes')

const versions = {
  0: ({ groupId }) => {
    const request = require('./v0/request')
    const response = require('./v0/response')
    return { request: request({ groupId }), response }
  },
  1: ({ groupId, coordinatorType = COORDINATOR_TYPES.GROUP }) => {
    const request = require('./v1/request')
    const response = require('./v1/response')
    return { request: request({ coordinatorKey: groupId, coordinatorType }), response }
  },
  2: ({ groupId, coordinatorType = COORDINATOR_TYPES.GROUP }) => {
    const request = require('./v2/request')
    const response = require('./v2/response')
    return { request: request({ coordinatorKey: groupId, coordinatorType }), response }
  },
  3: ({ groupId, coordinatorKey, coordinatorType = COORDINATOR_TYPES.GROUP }) => {
    const request = require('./v3/request')
    const response = require('./v3/response')
    return {
      request: request({ coordinatorKey: coordinatorKey || groupId, coordinatorType }),
      response,
    }
  },
  4: ({ groupId, coordinatorKey, coordinatorKeys, coordinatorType = COORDINATOR_TYPES.GROUP }) => {
    const request = require('./v4/request')
    const response = require('./v4/response')
    return {
      request: request({
        coordinatorKeys: coordinatorKeys || coordinatorKey || groupId,
        coordinatorType,
      }),
      response,
    }
  },
  5: ({ groupId, coordinatorKey, coordinatorKeys, coordinatorType = COORDINATOR_TYPES.GROUP }) => {
    const request = require('./v5/request')
    const response = require('./v5/response')
    return {
      request: request({
        coordinatorKeys: coordinatorKeys || coordinatorKey || groupId,
        coordinatorType,
      }),
      response,
    }
  },
}

module.exports = {
  versions: Object.keys(versions),
  protocol: ({ version }) => versions[version],
}
