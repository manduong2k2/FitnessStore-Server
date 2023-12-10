const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Category', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Category',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Category",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
