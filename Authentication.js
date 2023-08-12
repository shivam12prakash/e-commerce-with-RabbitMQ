const jwt = require('jsonwebtoken')

module.exports = async function isAuthenitcated(req, res, next) {
  let token = req.header('Authorization')

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft()
  }

  jwt.verify(token, 'microsecret', (error, user) => {
    if (error) {
      return res.json({ message: error })
    } else {
      req.user = user
      next()
    }
  })
}
