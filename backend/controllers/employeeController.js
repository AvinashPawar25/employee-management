const prisma = require("../lib/prisma");

// GET all employees
const getEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(employees);
  } catch (error) {
    next(error);
  }
};

// CREATE employee
const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      salary,
    } = req.body;

    // Required field validation
    if (!firstName || !lastName || !email || !position) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // Email validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Salary validation
    if (salary !== undefined && salary !== null && salary !== "") {
      if (Number(salary) < 0) {
        return res.status(400).json({
          message: "Salary cannot be negative",
        });
      }
    }

    // Check duplicate email
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        email: email,
      },
    });

  if (existingEmployee) {
  return res.status(409).json({
    message: "Email already exists",
  });
}

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        salary:
          salary !== undefined && salary !== null && salary !== ""
            ? Number(salary)
            : null,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
  next(error);
}
};

// UPDATE employee
// UPDATE employee

const updateEmployee = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Validate ID
    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    // Check whether employee exists
    const existingEmployeeById =
      await prisma.employee.findUnique({
        where: {
          id: id,
        },
      });

    if (!existingEmployeeById) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      salary,
    } = req.body;

    // Required field validation
    if (!firstName || !lastName || !email || !position) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Salary validation
    if (
      salary !== undefined &&
      salary !== null &&
      salary !== "" &&
      Number(salary) < 0
    ) {
      return res.status(400).json({
        message: "Salary cannot be negative",
      });
    }

    // Check whether another employee already has this email
    const existingEmployee =
      await prisma.employee.findFirst({
        where: {
          email: email,
          NOT: {
            id: id,
          },
        },
      });

    if (existingEmployee) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Update employee
    const employee = await prisma.employee.update({
      where: {
        id: id,
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        salary:
          salary !== undefined &&
          salary !== null &&
          salary !== ""
            ? Number(salary)
            : null,
      },
    });

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

// DELETE employee
const deleteEmployee = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    const existingEmployee =
      await prisma.employee.findUnique({
        where: {
          id: id,
        },
      });

    if (!existingEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    await prisma.employee.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};