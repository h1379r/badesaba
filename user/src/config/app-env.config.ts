export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'develompent',
  port: parseInt(process.env.PORT) || 3000,
  pathPrefix: process.env.PATH_PREFIX,

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

  // refresh token
  refreshToken: {
    expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 86400, // seconds
    secret: process.env.REFRESH_TOKEN_SECRET,
  },

  // access token
  accessToken: {
    expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) || 600, // seconds
    secret: process.env.ACCESS_TOKEN_SECRET,
  },

  // redis
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },

  // reCaptcha
  reCaptcha: {
    siteKey: process.env.RE_CAPTCHA_SITE_KEY,
    secretKey: process.env.RE_CAPTCHA_SECRET_KEY,
  },

  // super admin
  superAdmin: {
    mobile: process.env.SUPER_ADMIN_MOBILE,
  },

  // inter service communication
  isc: {
    secret: process.env.ISC_SECRET,
  },

  // transaction
  transaction: {
    baseUrl: process.env.TRANSACTION_BASE_URL,
  },
});
