const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Role',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Role",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
