var sequelize = require('./connect');
const initModels = require('./model/init-models').initModels;
const crypto = require('crypto');
var models = initModels(sequelize);
var Account = models.Account;
var Role = models.Role;

const jwt = require('jsonwebtoken');
var sessions = [];
const isAuthenticated = (req, res, next) => {
  if (req.headers.authorization) {
    return next();
  } else {
    return res.status(401).json({ message: 'Access denied! Unauthentication !' });
  }
};
const isAuthorized = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    console.log(req.headers);
    return res.status(401).json({ message: 'Access denied! Unauthentication' });
  }
  var decodedToken;
  try {
    decodedToken = jwt.verify(token, 'ABC');

    const { roles } = decodedToken;

    if (roles.some((role) => [1, 2].includes(role.id))) {
      return next();
    } else {
      return res.status(403).json({ message: 'Access denied! User does not have required roles.' });
    }
  } catch (error) {
    console.log(error)
    console.log(decodedToken);
    return res.status(401).json({ message: 'Access denied! Invalid token.' });
  }
};

function hashPassword(password, username) {
  try {
    const salt = username;

    const saltedPassword = password + salt;

    const hashedPassword = crypto.createHash('sha256').update(saltedPassword).digest('hex');

    return hashedPassword;
  }catch(err){
    console.log(err);
  }
}
module.exports = {
  sessions,
  isAuthenticated,
  isAuthorized,
  hashPassword
};