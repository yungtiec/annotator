"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("version_questions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      version_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "version",
          key: "id"
        }
      },
      order_in_version: {
        type: Sequelize.INTEGER
      },
      markdown: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      latest: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }, // sequelize hierarchy
      hierarchyLevel: {
        type: Sequelize.INTEGER
      },
      parentId: {
        type: Sequelize.INTEGER,
        references: {
          model: "version_answer",
          key: "id"
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("version_questions");
  }
};
