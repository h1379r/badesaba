export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'develompent',
  port: parseInt(process.env.PORT) || 3000,
  pathPrefix: process.env.PATH_PREFIX,
  domain: process.env.DOMAIN,

  // kafka
  kafka: {
    broker: process.env.KAFKA_BROKER,
    clientId: process.env.KAFKA_CLIENT_ID,
  },

  // mongodb
  mongo: {
    uri: process.env.MONGO_URI,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
  },

  // access token
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
  },

  // zibal
  zibal: {
    baseUrl: process.env.ZIBAL_BASE_URL,
    merchant: process.env.ZIBAL_MERCHANT,
  },

  // inter service communication
  isc: {
    secret: process.env.ISC_SECRET,
  },
});
