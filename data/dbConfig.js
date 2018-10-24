// Defines the production database connection properties
module.exports = {
  user          : `${process.ENV.APP_USER}`,
  password      : `${process.ENV.APP_PASS}`,
  connectString : `${process.ENV.DB_CONN}`
};