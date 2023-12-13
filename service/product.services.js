//File and Directory
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const file = multer({ dest: 'resource/products/' });
var bodyParser = require('body-parser');
const { Op } = require('sequelize');
//Router
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const { sessions, isAuthenticated, isAuthorized } = require('../token.authorizer');

//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Product = models.Product;
var Brand = models.Brand;
var Category = models.Category;
var Use = models.Use;
var Item = models.Item;
var Watch = models.Watch;


// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: Brand,
        as: 'brand'
      },
      {
        model: Category,
        as: 'category'
      }
      ]
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/search/:name', async (req, res) => {
  try {
    const searchName = req.params.name;
    const products = await Product.findAll({
      where: {
        name: {
          [Op.like]: `%${searchName}%`
        }
      },
      include: [
        {
          model: Brand,
          as: 'brand'
        },
        {
          model: Category,
          as: 'category'
        }
      ]
    });
    if (!products) {
      res.status(404).send('Không tìm thấy sản phẩm !');
    }
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/watch/:id', async (req,res) =>{
  try{
    var product_id = req.params.id;
    var account_id = jwt.verify(req.headers.authorization, 'ABC').account.id;
    const watch = await Watch.findOne({
      where: {
        product_id: product_id,
        account_id: account_id,
      },
    });
    if(watch){
      await watch.increment('times');
      res.status(200).send('success');
    }else{
      await Watch.create({
        product_id: product_id,
        account_id: account_id,
        times: 1, 
      });
    }
  }catch(err){
    console.log(err);
    res.json('Server Error');
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      },
      {
        model: Use,
        as: 'use_id_Uses',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }
      ]
    });
    const totalQuantity = await Item.sum('quantity', {
      where: { product_id: req.params.id },
    });
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.json({ product, solds: totalQuantity });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create a product
router.post('/', isAuthorized, file.single('image'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const filepath = '../resource/products';
    const fullPath = path.join(__dirname, filepath, product.id.toString() + '/');
    fs.mkdir(fullPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Không thể tạo thư mục:', err);
      } else {
        console.log('Thư mục đã được tạo thành công!');
      }
    });
    if (req.file) {
      console.log(req.file.originalname);
      var target_path = fullPath + product.id.toString() + '.jpg';
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
      Product.update(
        { image: 'http://jul2nd.ddns.net/resource/products/' + product.id + '/' + product.id + '.jpg' },
        { where: { id: product.id } }
      ).then(() => {
        console.log('Đường dẫn ảnh đã được cập nhật thành công!');
      }).catch((updateError) => {
        console.error('Lỗi khi cập nhật đường dẫn ảnh:', updateError);
      });
    }
    else {
      console.log('no file uploaded');
    }
    res.status(201).json(product);
  } catch (err) {
    console.error('error: ' + err);
    res.status(500).send('Server Error');
  }
});

// Update a product
router.put('/:id', isAuthorized, file.single('image'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    await product.update(req.body);
    const filepath = '../resource/products';
    const fullPath = path.join(__dirname, filepath, product.id.toString() + '/');
    if (req.file) {
      console.log(req.file.originalname);
      var target_path = fullPath + product.id.toString() + '.jpg';
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
      Product.findByPk(product.id)
        .then((instance) => {
          if (instance) {
            instance.image = 'http://jul2nd.ddns.net/resource/products/' + product.id + '/' + product.id + '.jpg';
            return instance.save();
          } else {
            console.log('Không tìm thấy đối tượng để cập nhật.');
          }
        });
    }
    else {
      console.log('no file uploaded');
    }
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update specific fields of a product
router.patch('/:id', isAuthorized, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a product
router.delete('/:id', isAuthorized, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    const imagePath = path.join(__dirname, '../resource/products', product.id.toString());
    fs.rmSync(imagePath, { recursive: true });
    await product.destroy();
    res.send('Product deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
