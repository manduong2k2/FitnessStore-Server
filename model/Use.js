const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Use', {
    id: {
      autoIncrement: true,
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
    tableName: 'Use',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Use",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
