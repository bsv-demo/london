const env = window.location.host.indexOf('localhost') !== -1
  ? 'local'
  : window.location.host.indexOf('staging') !== -1
    ? 'staging'
    : 'prod'

// export const host = env === 'local' ? 'http://localhost:4444' : 'https://botcrafter-backend.babbage.systems'
export const host = 'https://botcrafter-backend.babbage.systems'
