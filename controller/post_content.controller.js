//File and Directory
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const file = multer({ dest: 'resource/contents/' });
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
var Post = models.Post;
var Post_Content = models.Post_Content;

// Create a new post content with content and images upload
router.post('/',file.single('image') , async (req, res) => {
    try {
      const post_content = await Post_Content.create(req.body);
      const filepath = '../resource/contents';
      const fullPath = path.join(__dirname, filepath, post_content.id.toString()+'/');
      fs.mkdir(fullPath, { recursive: true }, (err) => {
        if (err) {
          console.error('Không thể tạo thư mục:', err);
        } else {
          console.log('Thư mục đã được tạo thành công!');
        }
      });
      if(req.file){
        console.log(req.file.originalname);
      var target_path = fullPath + post_content.id.toString()+'.jpg';
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
      Post_Content.findByPk(post_content.id)
      .then((instance) => {
        if (instance) {
          instance.image = 'http://jul2nd.ddns.net/resource/contents/'+post_content.id+'/'+post_content.id+'.jpg';
          return instance.save();
        } else {
          console.log('Không tìm thấy đối tượng để cập nhật.');
        }
      });
      }
      else{
        console.log('no file uploaded');
      }
      res.status(201).json(post_content);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
});
module.exports = router;