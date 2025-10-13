const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis.config');
const { JWT_SECRET } = require('../config/server.config');
const customError = require('../utils/error.handle');
const { try_catch } = require('../utils/tryCatch.handle');


const authenticate = try_catch(
  async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new customError('Token not provided', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const redisKey = `${decoded.id}`;
    const storedToken = await redisClient.get(redisKey);
    if (!storedToken) {
      throw new customError('You are already logged out or session expired', 403);
    }
    if (token !== storedToken) {

      throw new customError('Session expired. Please login again', 403);
    }

    req.user = decoded;
    next();
  }
);


module.exports = authenticate;