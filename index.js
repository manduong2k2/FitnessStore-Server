const cors = require('cors');
var express = require('express');
const path = require('path');
var app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());
app.use('/resource', express.static(path.join(__dirname, 'resource')));

//controllers 
const accountController = require('./controller/account.controller');
const productController = require('./controller/product.controller');
const categoryController = require('./controller/category.controller');
const brandController = require('./controller/brand.controller');
const roleController = require('./controller/role.controller');
const addressController = require('./controller/address.controller');

app.use('/account',accountController);
app.use('/product',productController);
app.use('/category',categoryController);
app.use('/brand',brandController);
app.use('/role',roleController);
app.use('/address',addressController);

app.listen(80,async()=>{
    console.log('server running on port 80');
})