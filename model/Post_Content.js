const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Post_Content', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    subheading: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    contents: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    imageNote: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Post',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Post_Content',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Post_Content",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
