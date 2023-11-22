const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FK_Account_Role', {
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Account',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Role',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'FK_Account_Role',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_FK_Account_Role",
        unique: true,
        fields: [
          { name: "account_id" },
          { name: "role_id" },
        ]
      },
    ]
  });
};
