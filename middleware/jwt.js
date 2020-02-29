let jwt = require('jsonwebtoken');
const User = require('../old-models/db')['user'];

let checkToken = async(req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    const userToken = await User.findOne({where:{token: token}});
    if (!userToken) {
      return res.json({
        success: false,
        message: 'Auth token does not exist'
      });
    }
    jwt.verify(token, "epitech", (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        if (userToken.email === decoded.email) {
          req.user = userToken;
          next();
        }
        else {
          return res.json({
            success: false,
            message: 'Token doesn\'t match'
          });
        }
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = {
  checkToken: checkToken
};
