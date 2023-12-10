const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Order', {
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
      allowNull: false,
      references: {
        model: 'Account',
        key: 'id'
      }
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ward_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'wards',
        key: 'code'
      }
    }
  }, {
    sequelize,
    tableName: 'Order',
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
