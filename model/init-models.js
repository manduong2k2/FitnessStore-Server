var DataTypes = require("sequelize").DataTypes;
var _Account = require("./Account");
var _Brand = require("./Brand");
var _Category = require("./Category");
var _Comment = require("./Comment");
var _FK_Account_Role = require("./FK_Account_Role");
var _FK_Product_Use = require("./FK_Product_Use");
var _Item = require("./Item");
var _Order = require("./Order");
var _Post = require("./Post");
var _Post_Content = require("./Post_Content");
var _Product = require("./Product");
var _Role = require("./Role");
var _Use = require("./Use");

function initModels(sequelize) {
  var Account = _Account(sequelize, DataTypes);
  var Brand = _Brand(sequelize, DataTypes);
  var Category = _Category(sequelize, DataTypes);
  var Comment = _Comment(sequelize, DataTypes);
  var FK_Account_Role = _FK_Account_Role(sequelize, DataTypes);
  var FK_Product_Use = _FK_Product_Use(sequelize, DataTypes);
  var Item = _Item(sequelize, DataTypes);
  var Order = _Order(sequelize, DataTypes);
  var Post = _Post(sequelize, DataTypes);
  var Post_Content = _Post_Content(sequelize, DataTypes);
  var Product = _Product(sequelize, DataTypes);
  var Role = _Role(sequelize, DataTypes);
  var Use = _Use(sequelize, DataTypes);

  Account.belongsToMany(Role, { as: 'role_id_Roles', through: FK_Account_Role, foreignKey: "account_id", otherKey: "role_id" });
  Order.belongsToMany(Product, { as: 'product_id_Product_Items', through: Item, foreignKey: "order_id", otherKey: "product_id" });
  Product.belongsToMany(Order, { as: 'order_id_Orders', through: Item, foreignKey: "product_id", otherKey: "order_id" });
  Product.belongsToMany(Use, { as: 'use_id_Uses', through: FK_Product_Use, foreignKey: "product_id", otherKey: "use_id" });
  Role.belongsToMany(Account, { as: 'account_id_Accounts', through: FK_Account_Role, foreignKey: "role_id", otherKey: "account_id" });
  Use.belongsToMany(Product, { as: 'product_id_Products', through: FK_Product_Use, foreignKey: "use_id", otherKey: "product_id" });
  Comment.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(Comment, { as: "Comments", foreignKey: "account_id"});
  FK_Account_Role.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(FK_Account_Role, { as: "FK_Account_Roles", foreignKey: "account_id"});
  Order.belongsTo(Account, { as: "account", foreignKey: "account_id"});
  Account.hasMany(Order, { as: "Orders", foreignKey: "account_id"});
  Post.belongsTo(Account, { as: "author", foreignKey: "author_id"});
  Account.hasMany(Post, { as: "Posts", foreignKey: "author_id"});
  Product.belongsTo(Brand, { as: "brand", foreignKey: "brand_id"});
  Brand.hasMany(Product, { as: "Products", foreignKey: "brand_id"});
  Product.belongsTo(Category, { as: "category", foreignKey: "category_id"});
  Category.hasMany(Product, { as: "Products", foreignKey: "category_id"});
  Item.belongsTo(Order, { as: "order", foreignKey: "order_id"});
  Order.hasMany(Item, { as: "Items", foreignKey: "order_id"});
  Comment.belongsTo(Post, { as: "post", foreignKey: "post_id"});
  Post.hasMany(Comment, { as: "Comments", foreignKey: "post_id"});
  Post_Content.belongsTo(Post, { as: "post", foreignKey: "post_id"});
  Post.hasMany(Post_Content, { as: "Post_Contents", foreignKey: "post_id"});
  FK_Product_Use.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(FK_Product_Use, { as: "FK_Product_Uses", foreignKey: "product_id"});
  Item.belongsTo(Product, { as: "product", foreignKey: "product_id"});
  Product.hasMany(Item, { as: "Items", foreignKey: "product_id"});
  FK_Account_Role.belongsTo(Role, { as: "role", foreignKey: "role_id"});
  Role.hasMany(FK_Account_Role, { as: "FK_Account_Roles", foreignKey: "role_id"});
  FK_Product_Use.belongsTo(Use, { as: "use", foreignKey: "use_id"});
  Use.hasMany(FK_Product_Use, { as: "FK_Product_Uses", foreignKey: "use_id"});

  return {
    Account,
    Brand,
    Category,
    Comment,
    FK_Account_Role,
    FK_Product_Use,
    Item,
    Order,
    Post,
    Post_Content,
    Product,
    Role,
    Use,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
