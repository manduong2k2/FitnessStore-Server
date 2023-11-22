const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Cart', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Account',
        key: 'id'
      }
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Cart',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Cart",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
