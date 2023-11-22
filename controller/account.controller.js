//File and Directory
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const file = multer({ dest: 'resource/products/' });
var bodyParser = require('body-parser');

//Router
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//Session 
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const cookieParser = require('cookie-parser');
router.use(cookieParser());
//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Account = models.Account;
var Role = models.Role;
var FK_Account_Role = models.FK_Account_Role;
var sessions = [];

router.use(
  session({
    secret: 'ABC', // Key bí mật để ký cookie
    resave: false,
    saveUninitialized: true,
    cookie: { sameSite: 'none', secure: true }, // Chế độ secure: false cho phát triển, true cho production với HTTPS
  })
);
const isAuthenticated = (req, res, next) => {
  if (req.headers.authorization) {
    return next();
  } else {
    return res.status(401).json({ message: 'Access denied !' });
  }
};
router.get('/sessions', async (req, res) => {
  res.send(sessions);
});
router.post('/logout', async (req, res) => {
  const tk = req.headers.authorization
  try {
    sessions.forEach((ss, index) => {
      if (ss.token === tk) {
        sessions.splice(index, 1);
        console.log('Account [' + ss.ssUsername + '] logged out | ' + (new Date()).toLocaleString());
        res.status(200).send('loggout success !');
      }
    });
  } catch (err) {
    console.log(err);
  }
});
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    var account = await Account.findOne({
      where: {
        username: username || null,
        password: password || null
      },
    });
    if (account) {
      req.session.user = username;
      const token = jwt.sign({ username }, 'ABC', { expiresIn: '12h' });
      sessions.push({ token: token, ssAccountId: account.id, ssUsername: username });
      console.log('Account [' + username + '] logged in | ' + (new Date()).toLocaleString());
      console.log('token: ' + token);
      return res.status(200).json({ message: 'Login successful', token: token, account: JSON.stringify(account) });
    }
    else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  catch (err) {
    console.log(req.body);
    console.log(err);
  }
});

router.get('/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'You have access to this protected route' });
});

// GET all accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: {
        model: Role,
        as: 'role_id_Roles'
      }
    });
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET single account by ID
router.get('/:id', async (req, res) => {
  console.log(req.params.id);
  try {
    const account = await Account.findByPk(req.params.id, {
      include: {
        model: Role,
        as: 'role_id_Roles'
      }
    });
    if (!account) {
      return res.status(404).send('Account not found');
    }
    console.log(req.headers);
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create an account
router.post('/', file.single('image'), async (req, res) => {
  try {
    const newAccount = await Account.create(req.body);
    await FK_Account_Role.create({
      account_id: newAccount.id, // id của user vừa tạo
      role_id: 3, // id của từng role
    });
    const filepath = '../resource/accounts';
    const fullPath = path.join(__dirname, filepath, newAccount.id.toString() + '/');
    fs.mkdir(fullPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Không thể tạo thư mục:', err);
      } else {
        console.log('Thư mục đã được tạo thành công!');
      }
    });
    if (req.file) {
      console.log(req.file.originalname);
      var target_path = fullPath + newAccount.id.toString() + '.jpg';
      const tmp_path = req.file.path;
      const src = fs.createReadStream(tmp_path);
      var dest = fs.createWriteStream(target_path);
      src.pipe(dest).once('close', () => {
        src.destroy();
        fs.unlink(path.join(req.file.path), (err) => {
          if (err) {
            console.error('Không thể xoá file tạm thời:', err);
          } else {
            console.log('File tạm thời đã được xoá thành công!');
          }
        });
      });
      Account.findByPk(newAccount.id)
        .then((instance) => {
          if (instance) {
            instance.image = 'http://jul2nd.ddns.net/resource/accounts/' + newAccount.id + '/' + newAccount.id + '.jpg';
            return instance.save();
          } else {
            console.log('Không tìm thấy đối tượng để cập nhật.');
          }
        });
    }
    else {
      console.log('no file uploaded');
    }
    res.json(newAccount);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update an account
router.put('/:id', file.single('image'), async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) {
      return res.status(404).send('Account not found');
    }

    await account.update(req.body);
    if (req.file) {
      var target_path = fullPath + account.id.toString() + '.jpg';
      const tmp_path = req.file.path;
      const src = fs.createReadStream(tmp_path);
      var dest = fs.createWriteStream(target_path);
      src.pipe(dest).once('close', () => {
        src.destroy();
        fs.unlink(path.join(req.file.path), (err) => {
          if (err) {
            console.error('Không thể xoá file tạm thời:', err);
          } else {
            console.log('File tạm thời đã được xoá thành công!');
          }
        });
      });
      Account.findByPk(account.id)
        .then((instance) => {
          if (instance) {
            instance.image = 'http://jul2nd.ddns.net/resource/accounts/' + account.id + '/' + account.id + '.jpg';
            return instance.save();
          } else {
            console.log('Không tìm thấy đối tượng để cập nhật.');
          }
        });
    }
    else {
      console.log('no file uploaded');
    }
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update specific fields of an account
router.patch('/:id', async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) {
      return res.status(404).send('Account not found');
    }
    await account.update(req.body);
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete an account
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) {
      return res.status(404).send('Account not found');
    }
    await account.destroy();
    res.send('Account deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
