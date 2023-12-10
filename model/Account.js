const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Account', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "UQ_Account_Username"
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
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
    tableName: 'Account',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Account",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ_Account_Username",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
