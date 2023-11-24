const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('administrative_units', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    full_name_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    short_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    short_name_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_name_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'administrative_units',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "administrative_units_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
