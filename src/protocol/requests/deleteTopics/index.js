const versions = {
  0: ({ topics, timeout }) => {
    const request = require('./v0/request')
    const response = require('./v0/response')
    return { request: request({ topics, timeout }), response }
  },
  1: ({ topics, timeout }) => {
    const request = require('./v1/request')
    const response = require('./v1/response')
    return { request: request({ topics, timeout }), response }
  },
  5: ({ topics, timeout }) => {
    const request = require('./v5/request')
    const response = require('./v5/response')
    return { request: request({ topics, timeout }), response }
  },
  6: ({ topics, timeout }) => {
    const request = require('./v6/request')
    const response = require('./v6/response')
    return { request: request({ topics, timeout }), response }
  },
  7: ({ topics, timeout }) => {
    const request = require('./v7/request')
    const response = require('./v7/response')
    return { request: request({ topics, timeout }), response }
  },
}

module.exports = {
  versions: Object.keys(versions),
  protocol: ({ version }) => versions[version],
}
