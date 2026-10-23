
jest.mock("../../src/models", () => ({
  Task: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
}));

const { Task, User } = require("../../src/models");
const taskService = require("../../src/services/task.service");
const { Op } = require("sequelize");

describe("Task Service - createTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a task for an active assigned employee", async () => {
    const data = {
      title: "Complete assessment",
      description: "Finish the project",
      priority: "HIGH",
      assignedTo: "user-123",
      dueDate: "2026-11-01",
    };

    const createdBy = "admin-123";

    User.findOne.mockResolvedValue({
      id: "user-123",
      isActive: true,
    });

    const createdTask = {
      id: "task-123",
      ...data,
      status: "TODO",
      createdBy,
    };

    Task.create.mockResolvedValue(createdTask);

    const result = await taskService.createTask(data, createdBy);

    expect(User.findOne).toHaveBeenCalledWith({
      where: {
        id: "user-123",
        isActive: true,
      },
    });

    expect(Task.create).toHaveBeenCalledWith({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "TODO",
      createdBy,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
    });

    expect(result).toEqual(createdTask);
  });

  it("should set dueDate to null when no due date is provided", async () => {
    const data = {
      title: "Complete assessment",
      description: "Finish the project",
      priority: "MEDIUM",
      assignedTo: "user-123",
    };

    User.findOne.mockResolvedValue({
      id: "user-123",
      isActive: true,
    });

    Task.create.mockResolvedValue({
      ...data,
      status: "TODO",
      createdBy: "admin-123",
      dueDate: null,
    });

    await taskService.createTask(data, "admin-123");

    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "TODO",
        dueDate: null,
      })
    );
  });

  it("should reject when the assigned employee is not found or inactive", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      taskService.createTask(
        {
          title: "Complete assessment",
          assignedTo: "inactive-user",
        },
        "admin-123"
      )
    ).rejects.toThrow("Assigned employee not found or inactive");

    expect(Task.create).not.toHaveBeenCalled();
  });

  it("should propagate an error when task creation fails", async () => {
    User.findOne.mockResolvedValue({
      id: "user-123",
      isActive: true,
    });

    Task.create.mockRejectedValue(new Error("Database error"));

    await expect(
      taskService.createTask(
        {
          title: "Complete assessment",
          assignedTo: "user-123",
        },
        "admin-123"
      )
    ).rejects.toThrow("Database error");
  });
});



describe("Task Service - editTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update task fields successfully", async () => {
    const task = {
      id: "task-123",
      title: "Old title",
      description: "Old description",
      priority: "LOW",
      status: "TODO",
      dueDate: null,
      assignedTo: "user-123",
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findByPk.mockResolvedValue(task);

    const updates = {
      title: "Updated title",
      description: "Updated description",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: "2026-11-01",
    };

    const result = await taskService.editTask("task-123", updates);

    expect(Task.findByPk).toHaveBeenCalledWith("task-123");
    expect(task.title).toBe("Updated title");
    expect(task.description).toBe("Updated description");
    expect(task.priority).toBe("HIGH");
    expect(task.status).toBe("IN_PROGRESS");
    expect(task.dueDate).toBe("2026-11-01");
    expect(task.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(task);
  });

  it("should throw an error when the task does not exist", async () => {
    Task.findByPk.mockResolvedValue(null);

    await expect(
      taskService.editTask("missing-task", { title: "Updated title" })
    ).rejects.toThrow("Task not found");

    expect(Task.findByPk).toHaveBeenCalledWith("missing-task");
  });

  it("should update the assignee when the employee is active", async () => {
    const task = {
      id: "task-123",
      title: "Test task",
      assignedTo: "old-user",
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findByPk.mockResolvedValue(task);
    User.findOne.mockResolvedValue({
      id: "new-user",
      isActive: true,
    });

    const result = await taskService.editTask("task-123", {
      assignedTo: "new-user",
    });

    expect(User.findOne).toHaveBeenCalledWith({
      where: {
        id: "new-user",
        isActive: true,
      },
    });
    expect(task.assignedTo).toBe("new-user");
    expect(task.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(task);
  });

  it("should reject when the new assignee is missing or inactive", async () => {
    const task = {
      id: "task-123",
      assignedTo: "old-user",
      save: jest.fn(),
    };

    Task.findByPk.mockResolvedValue(task);
    User.findOne.mockResolvedValue(null);

    await expect(
      taskService.editTask("task-123", {
        assignedTo: "inactive-user",
      })
    ).rejects.toThrow("Assigned employee not found or inactive");

    expect(task.assignedTo).toBe("old-user");
    expect(task.save).not.toHaveBeenCalled();
  });

  it("should save the task even when no editable fields are provided", async () => {
    const task = {
      id: "task-123",
      title: "Existing title",
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findByPk.mockResolvedValue(task);

    const result = await taskService.editTask("task-123", {});

    expect(task.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(task);
  });

  it("should propagate an error when saving the task fails", async () => {
    const task = {
      id: "task-123",
      title: "Existing title",
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    };

    Task.findByPk.mockResolvedValue(task);

    await expect(
      taskService.editTask("task-123", { title: "Updated title" })
    ).rejects.toThrow("Database error");
  });
});



describe("Task Service - searchTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all tasks with default sorting", async () => {
    const tasks = [{ id: "task-1" }, { id: "task-2" }];
    Task.findAll.mockResolvedValue(tasks);

    const result = await taskService.searchTasks();

    expect(Task.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        order: [["createdAt", "DESC"]],
      })
    );
    expect(result).toEqual(tasks);
  });

  it("should search task titles and descriptions", async () => {
    Task.findAll.mockResolvedValue([]);

    await taskService.searchTasks("report");

    const query = Task.findAll.mock.calls[0][0];

    expect(query.where[Op.or]).toEqual([
      { title: { [Op.iLike]: "%report%" } },
      { description: { [Op.iLike]: "%report%" } },
    ]);
  });

  it("should filter tasks by status and priority", async () => {
    Task.findAll.mockResolvedValue([]);

    await taskService.searchTasks(
      undefined,
      "IN_PROGRESS",
      "HIGH"
    );

    expect(Task.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "IN_PROGRESS",
          priority: "HIGH",
        },
      })
    );
  });

  it("should sort by title in ascending order", async () => {
    Task.findAll.mockResolvedValue([]);

    await taskService.searchTasks(
      undefined,
      undefined,
      undefined,
      "title",
      "asc"
    );

    expect(Task.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: [["title", "ASC"]],
      })
    );
  });

  it("should include assignee details", async () => {
    Task.findAll.mockResolvedValue([]);

    await taskService.searchTasks();

    expect(Task.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: [
          {
            model: User,
            as: "assignee",
            attributes: ["id", "name", "profilePicture"],
          },
        ],
      })
    );
  });

  it("should reject an invalid status", async () => {
    await expect(
      taskService.searchTasks(undefined, "INVALID")
    ).rejects.toThrow("Invalid status");

    expect(Task.findAll).not.toHaveBeenCalled();
  });

  it("should reject an invalid priority", async () => {
    await expect(
      taskService.searchTasks(
        undefined,
        undefined,
        "URGENT"
      )
    ).rejects.toThrow("Invalid priority");

    expect(Task.findAll).not.toHaveBeenCalled();
  });

  it("should reject an invalid sort field", async () => {
    await expect(
      taskService.searchTasks(
        undefined,
        undefined,
        undefined,
        "password"
      )
    ).rejects.toThrow("Invalid sort field");

    expect(Task.findAll).not.toHaveBeenCalled();
  });

  it("should reject an invalid sort order", async () => {
    await expect(
      taskService.searchTasks(
        undefined,
        undefined,
        undefined,
        "title",
        "sideways"
      )
    ).rejects.toThrow("Invalid sort order");

    expect(Task.findAll).not.toHaveBeenCalled();
  });
});


describe("Task Service - getMyTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return tasks assigned to the specified user", async () => {
    const tasks = [
      { id: "task-1", assignedTo: "user-123" },
      { id: "task-2", assignedTo: "user-123" },
    ];

    Task.findAll.mockResolvedValue(tasks);

    const result = await taskService.getMyTasks("user-123");

    expect(Task.findAll).toHaveBeenCalledWith({
      where: { assignedTo: "user-123" },
      order: [["createdAt", "DESC"]],
    });

    expect(result).toEqual(tasks);
  });

  it("should return an empty array when the user has no tasks", async () => {
    Task.findAll.mockResolvedValue([]);

    const result = await taskService.getMyTasks("user-123");

    expect(result).toEqual([]);
  });

  it("should propagate database errors", async () => {
    Task.findAll.mockRejectedValue(new Error("Database error"));

    await expect(
      taskService.getMyTasks("user-123")
    ).rejects.toThrow("Database error");
  });
});


describe("Task Service - updateMyTasksStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the status of the user's own task", async () => {
    const task = {
      id: "task-1",
      assignedTo: "user-123",
      status: "TODO",
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findByPk.mockResolvedValue(task);

    const result = await taskService.updateMyTasksStatus(
      "task-1",
      "user-123",
      "COMPLETED"
    );

    expect(Task.findByPk).toHaveBeenCalledWith("task-1");
    expect(task.status).toBe("COMPLETED");
    expect(task.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(task);
  });

  it("should reject an invalid status", async () => {
    await expect(
      taskService.updateMyTasksStatus(
        "task-1",
        "user-123",
        "INVALID"
      )
    ).rejects.toThrow("Invalid task status");

    expect(Task.findByPk).not.toHaveBeenCalled();
  });

  it("should reject when the task does not exist", async () => {
    Task.findByPk.mockResolvedValue(null);

    await expect(
      taskService.updateMyTasksStatus(
        "missing-task",
        "user-123",
        "IN_PROGRESS"
      )
    ).rejects.toThrow("Task not found");
  });

  it("should reject when the task belongs to another user", async () => {
    Task.findByPk.mockResolvedValue({
      id: "task-1",
      assignedTo: "another-user",
      status: "TODO",
      save: jest.fn(),
    });

    await expect(
      taskService.updateMyTasksStatus(
        "task-1",
        "user-123",
        "COMPLETED"
      )
    ).rejects.toThrow(
      "You are not authorized to update this task"
    );
  });

  it("should propagate an error when saving fails", async () => {
    const task = {
      id: "task-1",
      assignedTo: "user-123",
      status: "TODO",
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    };

    Task.findByPk.mockResolvedValue(task);

    await expect(
      taskService.updateMyTasksStatus(
        "task-1",
        "user-123",
        "IN_PROGRESS"
      )
    ).rejects.toThrow("Database error");
  });
});

describe("Task Service - getAssignableUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return active users and managers for an existing user", async () => {
    const users = [
      { id: "user-1", name: "Alice", email: "alice@example.com" },
      { id: "manager-1", name: "Bob", email: "bob@example.com" },
    ];

    User.findByPk.mockResolvedValue({ id: "admin-1" });
    User.findAll.mockResolvedValue(users);

    const result = await taskService.getAssignableUsers("admin-1");

    expect(User.findByPk).toHaveBeenCalledWith("admin-1");
    expect(User.findAll).toHaveBeenCalledWith({
      attributes: ["id", "name", "email"],
      where: {
        role: ["USER", "MANAGER"],
        isActive: true,
      },
      order: [["name", "ASC"]],
    });

    expect(result).toEqual(users);
  });

  it("should reject when the requesting user does not exist", async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(
      taskService.getAssignableUsers("missing-user")
    ).rejects.toThrow("User not found");

    expect(User.findAll).not.toHaveBeenCalled();
  });

  it("should propagate database errors", async () => {
    User.findByPk.mockResolvedValue({ id: "admin-1" });
    User.findAll.mockRejectedValue(new Error("Database error"));

    await expect(
      taskService.getAssignableUsers("admin-1")
    ).rejects.toThrow("Database error");
  });
});
