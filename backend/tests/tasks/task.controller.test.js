
jest.mock("../../src/services/task.service", () => ({
  createTask: jest.fn(),
  editTask: jest.fn(),
  searchTasks: jest.fn(),
  getMyTasks: jest.fn(),
  updateMyTasksStatus: jest.fn(),
  getAssignableUsers: jest.fn(),
}));

const taskService = require("../../src/services/task.service");
const { addTask,editTaskController ,  updateMyTaskStatusController,
getAssignableUsersController, getTasks,getMyTasksController
} = require("../../src/controllers/task.controller");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Task Controller - addTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a task successfully", async () => {
    const task = {
      id: "task-123",
      title: "Complete assessment",
      assignedTo: "123e4567-e89b-42d3-a456-426614174000",
    };

    taskService.createTask.mockResolvedValue(task);

    const req = {
      body: {
        title: "Complete assessment",
        description: "Finish the project",
        priority: "HIGH",
        assignedTo: task.assignedTo,
        dueDate: "2026-11-01",
      },
      user: { userId: "admin-123" },
      app: { get: jest.fn().mockReturnValue(null) },
    };

    const res = mockResponse();

    await addTask(req, res);

    expect(taskService.createTask).toHaveBeenCalledWith(
      {
        title: "Complete assessment",
        description: "Finish the project",
        priority: "HIGH",
        assignedTo: task.assignedTo,
        dueDate: "2026-11-01",
      },
      "admin-123"
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: task,
    });
  });

  it("should return 400 when the title is missing", async () => {
    const req = {
      body: {
        assignedTo: "123e4567-e89b-42d3-a456-426614174000",
      },
      user: { userId: "admin-123" },
      app: { get: jest.fn() },
    };

    const res = mockResponse();

    await addTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it("should return 400 when the assignee is missing", async () => {
    const req = {
      body: { title: "Complete assessment" },
      user: { userId: "admin-123" },
      app: { get: jest.fn() },
    };

    const res = mockResponse();

    await addTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it("should return 404 when the assignee ID is not a valid UUID", async () => {
    const req = {
      body: {
        title: "Complete assessment",
        assignedTo: "invalid-id",
      },
      user: { userId: "admin-123" },
      app: { get: jest.fn() },
    };

    const res = mockResponse();

    await addTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it("should return 404 when the assigned employee is missing or inactive", async () => {
    taskService.createTask.mockRejectedValue(
      new Error("Assigned employee not found or inactive")
    );

    const req = {
      body: {
        title: "Complete assessment",
        assignedTo: "123e4567-e89b-42d3-a456-426614174000",
      },
      user: { userId: "admin-123" },
      app: { get: jest.fn() },
    };

    const res = mockResponse();

    await addTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Assigned employee not found or inactive",
    });
  });

  it("should return 500 when task creation fails unexpectedly", async () => {
    taskService.createTask.mockRejectedValue(new Error("Database error"));

    const req = {
      body: {
        title: "Complete assessment",
        assignedTo: "123e4567-e89b-42d3-a456-426614174000",
      },
      user: { userId: "admin-123" },
      app: { get: jest.fn() },
    };

    const res = mockResponse();

    await addTask(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });



  
it("should emit task:created when Socket.IO is available", async () => {
  const assignedTo = "123e4567-e89b-42d3-a456-426614174000";
  const task = { id: "task-123", assignedTo };

  const io = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  taskService.createTask.mockResolvedValue(task);

  const req = {
    body: { title: "Test task", assignedTo },
    user: { userId: "admin-123" },
    app: { get: jest.fn().mockReturnValue(io) },
  };

  const res = mockResponse();

  await addTask(req, res);

  expect(io.to).toHaveBeenCalledWith(`user:${assignedTo}`);
  expect(io.emit).toHaveBeenCalledWith("task:created", task);
  expect(res.status).toHaveBeenCalledWith(201);
});

it("should create a task when Socket.IO is unavailable", async () => {
  const assignedTo = "123e4567-e89b-42d3-a456-426614174000";
  const task = { id: "task-123", assignedTo };

  taskService.createTask.mockResolvedValue(task);

  const req = {
    body: { title: "Test task", assignedTo },
    user: { userId: "admin-123" },
    app: { get: jest.fn().mockReturnValue(undefined) },
  };

  const res = mockResponse();

  await addTask(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    data: task,
  });
});

});


describe("Task Controller - editTaskController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a task successfully", async () => {
    const task = { id: "task-123", title: "Updated task" };
    taskService.editTask.mockResolvedValue(task);

    const req = {
      params: { id: "task-123" },
      body: { title: "Updated task" },
      app: { get: jest.fn().mockReturnValue(null) },
    };

    const res = mockResponse();

    await editTaskController(req, res);

    expect(taskService.editTask).toHaveBeenCalledWith(
      "task-123",
      { title: "Updated task" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: task,
    });
  });

  it("should emit task:updated when Socket.IO is available", async () => {
    const task = {
      id: "task-123",
      assignedTo: "user-123",
    };

    const io = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    taskService.editTask.mockResolvedValue(task);

    const req = {
      params: { id: "task-123" },
      body: { title: "Updated task" },
      app: { get: jest.fn().mockReturnValue(io) },
    };

    const res = mockResponse();

    await editTaskController(req, res);

    expect(io.to).toHaveBeenCalledWith("user:user-123");
    expect(io.emit).toHaveBeenCalledWith("task:updated", task);
  });

  it("should return 404 when the task does not exist", async () => {
    taskService.editTask.mockRejectedValue(new Error("Task not found"));

    const req = {
      params: { id: "missing-task" },
      body: { title: "Updated task" },
      app: { get: jest.fn().mockReturnValue(null) },
    };

    const res = mockResponse();

    await editTaskController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Task not found",
    });
  });

  it("should return 404 when the new assignee is invalid", async () => {
    taskService.editTask.mockRejectedValue(
      new Error("Assigned employee not found or inactive")
    );

    const req = {
      params: { id: "task-123" },
      body: { assignedTo: "inactive-user" },
      app: { get: jest.fn().mockReturnValue(null) },
    };

    const res = mockResponse();

    await editTaskController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Assigned employee not found or inactive",
    });
  });

  it("should return 500 when an unexpected error occurs", async () => {
    taskService.editTask.mockRejectedValue(new Error("Database error"));

    const req = {
      params: { id: "task-123" },
      body: { title: "Updated task" },
      app: { get: jest.fn().mockReturnValue(null) },
    };

    const res = mockResponse();

    await editTaskController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});



describe("Task Controller - getTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return tasks successfully", async () => {
    const tasks = [{ id: "task-1" }, { id: "task-2" }];
    taskService.searchTasks.mockResolvedValue(tasks);

    const req = {
      query: {
        search: "report",
        status: "TODO",
        priority: "HIGH",
        sortBy: "title",
        order: "asc",
      },
    };

    const res = mockResponse();

    await getTasks(req, res);

    expect(taskService.searchTasks).toHaveBeenCalledWith(
      "report", "TODO", "HIGH", "title", "asc"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: tasks,
    });
  });

  it("should return 400 for invalid filters", async () => {
    taskService.searchTasks.mockRejectedValue(new Error("Invalid status"));

    const req = { query: { status: "INVALID" } };
    const res = mockResponse();

    await getTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid status",
    });
  });

  it("should return 400 when task searching fails", async () => {
    taskService.searchTasks.mockRejectedValue(new Error("Database error"));

    const req = { query: {} };
    const res = mockResponse();

    await getTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Database error",
    });
  });
});


describe("Task Controller - getMyTasksController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the logged-in user's tasks", async () => {
    const tasks = [{ id: "task-1" }];
    taskService.getMyTasks.mockResolvedValue(tasks);

    const req = { user: { userId: "user-123" } };
    const res = mockResponse();

    await getMyTasksController(req, res);

    expect(taskService.getMyTasks).toHaveBeenCalledWith("user-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: tasks,
    });
  });

  it("should return 500 when retrieving tasks fails", async () => {
    taskService.getMyTasks.mockRejectedValue(new Error("Database error"));

    const req = { user: { userId: "user-123" } };
    const res = mockResponse();

    await getMyTasksController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to retrieve your tasks",
    });
  });
});


describe("Task Controller - updateMyTaskStatusController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeRequest = (status = "COMPLETED") => ({
    params: { id: "task-123" },
    body: { status },
    user: { userId: "user-123" },
    app: { get: jest.fn().mockReturnValue(null) },
  });

  it("should update task status successfully", async () => {
    const task = { id: "task-123", status: "COMPLETED" };
    taskService.updateMyTasksStatus.mockResolvedValue(task);

    const req = makeRequest();
    const res = mockResponse();

    await updateMyTaskStatusController(req, res);

    expect(taskService.updateMyTasksStatus).toHaveBeenCalledWith(
      "task-123",
      "user-123",
      "COMPLETED"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  });

  it("should return 400 when status is missing", async () => {
    const req = makeRequest(undefined);
    req.body = {};
    const res = mockResponse();

    await updateMyTaskStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(taskService.updateMyTasksStatus).not.toHaveBeenCalled();
  });

  it("should return 404 when the task does not exist", async () => {
    taskService.updateMyTasksStatus.mockRejectedValue(
      new Error("Task not found")
    );

    const res = mockResponse();
    await updateMyTaskStatusController(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 when the task belongs to another user", async () => {
    taskService.updateMyTasksStatus.mockRejectedValue(
      new Error("You are not authorized to update this task")
    );

    const res = mockResponse();
    await updateMyTaskStatusController(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should return 400 for an invalid task status", async () => {
    taskService.updateMyTasksStatus.mockRejectedValue(
      new Error("Invalid task status")
    );

    const res = mockResponse();
    await updateMyTaskStatusController(makeRequest("INVALID"), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 500 for unexpected errors", async () => {
    taskService.updateMyTasksStatus.mockRejectedValue(
      new Error("Database error")
    );

    const res = mockResponse();
    await updateMyTaskStatusController(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("should notify admins and managers when Socket.IO is available", async () => {
    const task = { id: "task-123", status: "COMPLETED" };
    const io = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    taskService.updateMyTasksStatus.mockResolvedValue(task);

    const req = makeRequest();
    req.app.get.mockReturnValue(io);
    const res = mockResponse();

    await updateMyTaskStatusController(req, res);

    expect(io.to).toHaveBeenCalledWith("role:ADMIN");
    expect(io.to).toHaveBeenCalledWith("role:MANAGER");
    expect(io.emit).toHaveBeenCalledWith("task:status-updated", task);
    expect(io.emit).toHaveBeenCalledTimes(2);
  });
});

describe("Task Controller - getAssignableUsersController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return assignable users successfully", async () => {
    const users = [{ id: "user-1", name: "Alice" }];
    taskService.getAssignableUsers.mockResolvedValue(users);

    const req = { user: { userId: "admin-123" } };
    const res = mockResponse();

    await getAssignableUsersController(req, res);

    expect(taskService.getAssignableUsers).toHaveBeenCalledWith("admin-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Employees loaded successfully",
      data: users,
    });
  });

  it("should return 404 when the requesting user does not exist", async () => {
    taskService.getAssignableUsers.mockRejectedValue(
      new Error("User not found")
    );

    const req = { user: { userId: "missing-user" } };
    const res = mockResponse();

    await getAssignableUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 500 for unexpected errors", async () => {
    taskService.getAssignableUsers.mockRejectedValue(
      new Error("Database error")
    );

    const req = { user: { userId: "admin-123" } };
    const res = mockResponse();

    await getAssignableUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to load users",
    });
  });
});
