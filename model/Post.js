const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Account',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Post',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Post",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
