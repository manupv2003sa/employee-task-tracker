const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
      defaultValue: "MEDIUM",
    },

    status: {
      type: DataTypes.ENUM("TODO", "IN_PROGRESS", "COMPLETED"),
      allowNull: false,
      defaultValue: "TODO",
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "created_by",
    },

    assignedTo: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "assigned_to",
    },
  },
  {
    sequelize: sequelize,
    modelName: "Task",
    tableName: "tasks",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Task;