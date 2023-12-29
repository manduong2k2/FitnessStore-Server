//File and Directory
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const file = multer({ dest: 'resource/products/' });
var bodyParser = require('body-parser');

//Mail
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'manduong2k2@gmail.com', 
    pass: 'kzihyxskesrhkeht', 
  },
});
var verificationCodes = [];
//Router
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const { sessions, isAuthenticated, isAuthorized , hashPassword } = require('../token.authorizer');

//Model
var sequelize = require('../connect');
const { where } = require('sequelize');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Account = models.Account;
var Role = models.Role;
var FK_Account_Role = models.FK_Account_Role;
var Ward = models.wards;
var Province = models.provinces;
var District = models.districts;

router.get('/codes', async (req, res) => {
  res.send(verificationCodes);
});
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization
  try {
    console.log('Account [' + jwt.verify(token, 'ABC').account.username + '] logged out | ' + (new Date()).toLocaleString());
    res.status(200).send('Account [' + jwt.verify(token, 'ABC').account.username + '] logged out | ' + (new Date()).toLocaleString());
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
        password: hashPassword(password,username) || null
      },
      include: {
        model: Role,
        as: 'role_id_Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }
    });
    if(!account){
      account = await Account.findOne({
        where: {
          email: username || null,
          password: password || null
        },
        include: {
          model: Role,
          as: 'role_id_Roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      });
    }
    if (account) {
      const roles = account.role_id_Roles.map(role => ({ id: role.id, name: role.name }));
      const token = jwt.sign({ account: { id: account.id, username: account.username }, roles }, 'ABC');
      sessions.push({ token: token, ssAccountId: account.id, ssRoles: account.role_id_Roles });
      console.log('Account [' + username + '] logged in | ' + (new Date()).toLocaleString());
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
        as: 'role_id_Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] }
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
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{
        model: Role,
        as: 'role_id_Roles',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }, {
        model: Ward,
        as: 'ward_code_ward',
        attributes: ['code', 'full_name'],
        include: [
          {
            model: District,
            as: 'district_code_district',
            attributes: ['code', 'full_name'],
            include: [
              {
                model: Province,
                as: 'province_code_province',
                attributes: ['code', 'full_name'],
              },
            ],
          },
        ]
      }
      ]
    });
    if (!account) {
      return res.status(404).send('Account not found');
    }
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
    //Mã hoá mật khẩu
    Account.findByPk(newAccount.id)
        .then((instance) => {
          if (instance) {
            instance.password = hashPassword(instance.password , instance.username);
            return instance.save();
          } else {
            console.log('Không tìm thấy đối tượng để cập nhật.');
          }
        });
    await FK_Account_Role.create({
      account_id: newAccount.id, 
      role_id: 3,
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
    const filepath = '../resource/accounts';
    const fullPath = path.join(__dirname, filepath, account.id.toString() + '/');
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
// recover account
router.patch('/:email', async (req, res) => {
  try {
    var account;
    account = await Account.findOne({
      where: {
        email: req.params.email,
      }
    });
    if(!account) {
      account = await Account.findOne({
        where: {
          username: req.params.email,
        }
      });
    }
    if (!account) {
      return res.status(404).send('Account not found');
    }
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    const mailOptions = {
      from: 'manduong2k2@gmail.com',
      to: account.email,
      subject: 'Khôi phục mật khẩu',
      text: 'Xin chào ' + account.username + ' , đây là mã xác nhận mật khẩu của bạn , vui lòng không gửi mã này cho bất cứ ai: ' + randomNumber,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        return res.status(500).send('Error sending email');
      } else {
        verificationCodes.push({ _email: req.params.email, _code: randomNumber });
        console.log();
        return res.status(200).send('Đã gửi mã xác thực đến email : [' + account.email + '] của bạn , vui lòng kiểm tra để lấy mã ');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const verificationPair = verificationCodes.find(pair => pair._email === email && pair._code.toString() === code.toString());
    console.log(verificationPair);
    if (verificationPair) {
      verificationCodes.splice(verificationCodes.indexOf(verificationPair), 1);
      const account = await Account.findOne({
        where: {
          email: email,
        }
      });
      if (!account) {
        return res.status(404).send('Account not found');
      }
      else {
        const token = jwt.sign({account}, 'ABC');
        return res.status(200).json({ success: true, token: token });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Verification failed' });
    }
  }catch(err){
    console.log(err);
  }
});

router.put('/',async (req,res)=>{
  try{
    const { password , token } = req.body;
    const decodedToken = jwt.verify(token, 'ABC');
    const account = decodedToken.account;
    if(!account){
      console.log('Invalid token!');
      res.status(404).send('Invalid token');
    }
    await Account.update({ password:hashPassword(password,account.username) }, { where: { id: account.id } });
    res.status(200).send('Change password success');
  }catch(err){
    console.log(err);
  }
});
router.post('/changePassword',async (req,res)=>{
  try{
    const account_id = jwt.verify(req.headers.authorization,'ABC').account.id;
    const account = await Account.findByPk(parseInt(account_id));
    if(!account) res.status(404).send('Invalid or expired token');
    const { oldPass , newPass } = req.body;
    if(hashPassword(oldPass,account.username)!==account.password) res.status(401).send('Incorrect old password'); 
    await Account.update({ password:hashPassword(newPass,account.username) }, { where: { id: account.id } });
    res.status(200).send('Change password success');
  }catch(err){
    console.log(err);
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) {
      return res.status(404).send('Account not found');
    }
    const imagePath = path.join(__dirname, '../resource/accounts', account.id.toString());
    fs.rmSync(imagePath, { recursive: true });
    await account.destroy();
    res.send('Account deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
