const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Brand', {
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
    image: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    info: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Brand',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Brand",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
