const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('districts', {
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    full_name_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    province_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'provinces',
        key: 'code'
      }
    },
    administrative_unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'administrative_units',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'districts',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "districts_pkey",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "idx_districts_province",
        fields: [
          { name: "province_code" },
        ]
      },
      {
        name: "idx_districts_unit",
        fields: [
          { name: "administrative_unit_id" },
        ]
      },
    ]
  });
};
