const cors = require('cors');
var express = require('express');
const path = require('path');
var app = express();
const bodyParser = require('body-parser');




app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());
app.use('/resource', express.static(path.join(__dirname, 'resource')));


//Servicess 
const accountServices = require('./service/account.services');
const productServices = require('./service/product.services');
const categoryServices = require('./service/category.services');
const brandServices = require('./service/brand.services');
const roleServices = require('./service/role.services');
const addressServices = require('./service/address.services');
const cartServices = require('./service/cart.services');
const postServices = require('./service/post.services');
const post_contentServices = require('./service/post_content.services');
const orderServices = require('./service/order.services');
const recommendServices = require('./service/recommend.services');
const statistic = require('./service/product.statistics');

app.use('/account',accountServices);
app.use('/product',productServices);
app.use('/category',categoryServices);
app.use('/brand',brandServices);
app.use('/role',roleServices);
app.use('/address',addressServices);
app.use('/cart',cartServices);
app.use('/post',postServices);
app.use('/post_content',post_contentServices);
app.use('/order',orderServices);
app.use('/recommend',recommendServices);
app.use('/statistic',statistic);

app.listen(80,async()=>{
    console.log('server running on port 80');
})


