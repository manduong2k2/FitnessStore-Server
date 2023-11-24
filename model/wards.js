const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('wards', {
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
    district_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'districts',
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
    tableName: 'wards',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "idx_wards_district",
        fields: [
          { name: "district_code" },
        ]
      },
      {
        name: "idx_wards_unit",
        fields: [
          { name: "administrative_unit_id" },
        ]
      },
      {
        name: "wards_pkey",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
};
