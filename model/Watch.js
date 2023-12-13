const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Watch', {
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Account',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Product',
        key: 'id'
      }
    },
    times: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Watch',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Watch",
        unique: true,
        fields: [
          { name: "account_id" },
          { name: "product_id" },
        ]
      },
    ]
  });
};
