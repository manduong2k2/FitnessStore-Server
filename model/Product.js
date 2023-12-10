const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Product', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Category',
        key: 'id'
      }
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Brand',
        key: 'id'
      }
    },
    image: {
      type: DataTypes.CHAR(100),
      allowNull: true
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    solds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'Product',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Product",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
