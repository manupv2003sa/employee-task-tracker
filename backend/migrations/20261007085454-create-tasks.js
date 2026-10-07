'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },

        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        priority: {
          type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH"),
          allowNull: false,
          defaultValue: "MEDIUM",
        },

        status: {
          type: Sequelize.ENUM("TODO", "IN_PROGRESS", "COMPLETED"),
          allowNull: false,
          defaultValue: "TODO",
        },

        created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      assigned_to: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },


      });
    },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("tasks");

  }
};
