//File and Directory
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const file = multer({ dest: 'resource/posts/' });
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
var Account = models.Account;

// Create a new post with content and images upload
router.post('/',file.single('background') , async (req, res) => {
    try {
      const post = await Post.create(req.body);
      const filepath = '../resource/posts';
      const fullPath = path.join(__dirname, filepath, post.id.toString()+'/');
      fs.mkdir(fullPath, { recursive: true }, (err) => {
        if (err) {
          console.error('Không thể tạo thư mục:', err);
        } else {
          console.log('Thư mục đã được tạo thành công!');
        }
      });
      if(req.file){
        console.log(req.file.originalname);
      var target_path = fullPath + post.id.toString()+'.jpg';
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
      Post.findByPk(post.id)
      .then((instance) => {
        if (instance) {
            instance.background = 'http://jul2nd.ddns.net/resource/posts/'+post.id+'/'+post.id+'.jpg';
            instance.date = new Date();
            return instance.save();
        } else {
          console.log('Không tìm thấy đối tượng để cập nhật.');
        }
      });
      }
      else{
        console.log('no file uploaded');
      }
      res.status(201).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
});
  

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include:[
                {
                    model:Account,
                    as:'author',
                    attributes:['id','name','image']
                },
            ]
        });
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get details of a specific post with contents
router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postId, {
            include: [
                {
                    model:Account,
                    as:'author',
                    attributes:['id','name','image']
                },
                {
                    model:Post_Content,
                    as: 'Post_Contents'  
                }
        ]
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a specific post
router.put('/:postId', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Update post data
        await post.update(req.body.postData);

        // Update contents
        await Post_Content.destroy({ where: { post_id: post.id } });
        const contents = req.body.contents.map(content => ({
            ...content,
            post_id: post.id,
        }));
        await Post_Content.bulkCreate(contents);

        res.status(200).json({ post, contents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a specific post
router.delete('/:postId', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const imagePath = path.join(__dirname, '../resource/posts', post.id.toString());
        fs.rmSync(imagePath, { recursive: true });
        const contents = await Post_Content.findAll({where: {post_id : post.id}});
        contents.forEach(content => {
          const imagePath = path.join(__dirname, '../resource/contents', content.id.toString());
          fs.rmSync(imagePath, { recursive: true });
        });
        // Delete post and its contents
        await post.destroy();

        res.status(204).json({});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;