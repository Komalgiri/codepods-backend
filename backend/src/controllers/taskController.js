import prisma from "../utils/prismaClient.js";

// POST /pods/:id/tasks - Create task
export const createTask = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const { title, description, assignedTo, dueAt } = req.body;
    const userId = req.user.id; // From authMiddleware

    // Check if user is a member of the pod
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this pod",
      });
    }

    // Check if pod exists
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
    });

    if (!pod) {
      return res.status(404).json({ error: "Pod not found" });
    }

    // If assignedTo is provided, verify the user is a member of the pod
    if (assignedTo) {
      const assignedMembership = await prisma.podMember.findUnique({
        where: {
          userId_podId: {
            userId: assignedTo,
            podId,
          },
        },
      });

      if (!assignedMembership) {
        return res.status(400).json({
          error: "Assigned user is not a member of this pod",
        });
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        podId,
        assignedTo: assignedTo || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pod: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Task created successfully 🚀.",
      task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /tasks/:id/status - Update task progress
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id; // From authMiddleware

    // Validate status
    const validStatuses = ["pending", "in-progress", "done"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        podId: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user is a member of the pod
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId: task.podId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this pod",
      });
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pod: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Task status updated successfully 🚀.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /pods/:id/tasks - Get all tasks for a pod
export const getTasksByPod = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id; // From authMiddleware

    // Check if user is a member of the pod
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this pod",
      });
    }

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: { podId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
