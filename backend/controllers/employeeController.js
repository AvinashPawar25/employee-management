const prisma = require("../lib/prisma");

// GET employees with pagination, search, position filter and sorting

const getEmployees = async (req, res, next) => {
  try {
    // Get query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search?.trim() || "";
    const position = req.query.position?.trim() || "";

    const sortBy = req.query.sortBy || "id";
    const order = req.query.order || "asc";

    // Validate pagination
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        message: "Page and limit must be greater than 0",
      });
    }

    // Allowed sorting fields
    const allowedSortFields = [
      "id",
      "firstName",
      "lastName",
      "position",
      "salary",
      "createdAt",
    ];

    // Validate sort field
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sort field",
      });
    }

    // Validate sort order
    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({
        message: "Order must be either asc or desc",
      });
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];

    // Search
    if (search) {
      const searchWords = search
        .split(/\s+/)
        .filter(Boolean);

      if (searchWords.length === 1) {
        conditions.push({
          OR: [
            {
              firstName: {
                contains: searchWords[0],
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: searchWords[0],
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: searchWords[0],
                mode: "insensitive",
              },
            },
            {
              position: {
                contains: searchWords[0],
                mode: "insensitive",
              },
            },
          ],
        });
      } else {
        const firstName = searchWords[0];
        const lastName = searchWords.slice(1).join(" ");

        conditions.push({
          OR: [
            {
              AND: [
                {
                  firstName: {
                    contains: firstName,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: lastName,
                    mode: "insensitive",
                  },
                },
              ],
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              position: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        });
      }
    }

    // Position filter
    if (position) {
      conditions.push({
        position: {
          equals: position,
          mode: "insensitive",
        },
      });
    }

    // Final WHERE condition
    const where =
      conditions.length > 0
        ? {
            AND: conditions,
          }
        : {};

    // Get employees
    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    });

    // Count matching employees
    const totalEmployees = await prisma.employee.count({
      where,
    });

    // Calculate total pages
    const totalPages = Math.ceil(
      totalEmployees / limit
    );

    // Send response
    res.json({
      success: true,
      data: employees,
      pagination: {
        currentPage: page,
        limit,
        totalEmployees,
        totalPages,
      },
      sorting: {
        sortBy,
        order,
      },
    });
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