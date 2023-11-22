//File and Directory
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const file = multer({dest: 'resource/products/'});
var bodyParser = require('body-parser');

//Router
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//Model
var sequelize = require('../connect');
const initModels = require('../model/init-models').initModels;
var models = initModels(sequelize);
var Product = models.Product;
var Brand = models.Brand;
var Category = models.Category;



// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include:[{
        model:Brand,
        as: 'brand'
      },
      {
        model:Category,
        as:'category'
      }
    ]
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create a product
router.post('/',file.single('image') , async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const filepath = '../resource/products';
    const fullPath = path.join(__dirname, filepath, product.id.toString()+'/');
    fs.mkdir(fullPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Không thể tạo thư mục:', err);
      } else {
        console.log('Thư mục đã được tạo thành công!');
      }
    });
    if(req.file){
      console.log(req.file.originalname);
    var target_path = fullPath + product.id.toString()+'.jpg';
    const tmp_path = req.file.path;
    const src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);
    src.pipe(dest).once('close',()=>{
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
        instance.image = 'http://jul2nd.ddns.net/resource/products/'+product.id+'/'+product.id+'.jpg';
        return instance.save();
      } else {
        console.log('Không tìm thấy đối tượng để cập nhật.');
      }
    });
    }
    else{
      console.log('no file uploaded');
    }
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update a product
router.put('/:id', async (req, res) => {
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

// Update specific fields of a product
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    await product.destroy();
    res.send('Product deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
