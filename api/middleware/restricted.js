  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */

const db = require('../../data/dbConfig')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../config')

const restricted = (req, res, next) => {
  const token = req.headers.authorization
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err) {
        next({ status: 401, message: `invalid token: ${err.message}` })
      } else {
        req.decodedJWT = decoded
        next()
      }
    })
  } else {
    next({ status: 402, message: 'token required'})
  }
}

const checkFormat = (req, res, next) => {
  try {
    const { username, password } = req.body
    if (username && password) {
      next();
    } else {
      next({ status:400, message: "username and password required"})
    }
  } catch (err) {
    next(err)
  }
}

const checkNameTaken = async (req, res, next) => {
  try {
    const { username } = req.body
    const [user] = await db('users').where('username', username)
      .select('username')
    if(!user) {
      next()
    } else {
      next({ status: 400, message: "username taken"})
    }
  } catch (err) {
    next(err)
  }
}


module.exports = { restricted, checkFormat, checkNameTaken };
