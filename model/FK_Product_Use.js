const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FK_Product_Use', {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Product',
        key: 'id'
      }
    },
    use_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Use',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'FK_Product_Use',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_FK_Product_Use",
        unique: true,
        fields: [
          { name: "product_id" },
          { name: "use_id" },
        ]
      },
    ]
  });
};
