//File and Directory
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const file = multer({ dest: 'resource/brands/' });
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
var Brand = models.Brand;

// GET all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json(brands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET a specific brand by ID
router.get('/:id', async (req, res) => {
  const brandId = req.params.id;
  try {
    const brand = await Brand.findByPk(brandId);
    if (brand) {
      res.json(brand);
    } else {
      res.status(404).json({ error: 'Brand not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new brand
router.post('/', file.single('image'), async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    const filepath = '../resource/brands';
    const fullPath = path.join(__dirname, filepath, newBrand.id.toString() + '/');
    fs.mkdir(fullPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Không thể tạo thư mục:', err);
      } else {
        console.log('Thư mục đã được tạo thành công!');
      }
    });
    if (req.file) {
      var target_path = fullPath + newBrand.id.toString() + '.jpg';
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
      Brand.findByPk(newBrand.id)
        .then((instance) => {
          if (instance) {
            instance.image = 'http://jul2nd.ddns.net/resource/brands/' + newBrand.id + '/' + newBrand.id + '.jpg';
            return instance.save();
          } else {
            console.log('Không tìm thấy đối tượng để cập nhật.');
          }
        });
    }
    else {
      console.log('no file uploaded');
    }
    res.status(201).json(newBrand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT (update) a brand
router.put('/:id',file.single('image'), async (req, res) => {
  try {
    const newBrand = await Brand.findByPk(req.params.id);
    const filepath = '../resource/brands';
    const fullPath = path.join(__dirname, filepath, newBrand.id.toString() + '/');
    if (!newBrand) {
      res.status(404).json({ error: 'Brand not found' });
    }
    await newBrand.update(req.body);
    if (req.file) {
      var target_path = fullPath + newBrand.id.toString() + '.jpg';
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
      Brand.findByPk(newBrand.id)
        .then((instance) => {
          if (instance) {
            instance.image = 'http://jul2nd.ddns.net/resource/brands/' + newBrand.id + '/' + newBrand.id + '.jpg';
            return instance.save();
          } else {
            console.log('Không tìm thấy đối tượng để cập nhật.');
          }
        });
    }
    else {
      console.log('no file uploaded');
    }
    res.json(newBrand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH (partial update) a brand
router.patch('/:id', async (req, res) => {
  try {
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
    }
    await brand.update(req.body);
    res.json(brand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a brand
router.delete('/:id', async (req, res) => {
  const brandId = req.params.id;
  try {
    const brand = await Brand.findByPk(brandId);
    if (brand) {
      const imagePath = path.join(__dirname, '../resource/brands', brandId.toString());
      fs.rmdirSync(imagePath, { recursive: true });
      await brand.destroy();
      res.json({ message: 'Brand deleted successfully' });
    } else {
      res.status(404).json({ error: 'Brand not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
