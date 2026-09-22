const express = require("express");

const router = express.Router();

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags:
 *       - Employees
 *     responses:
 *       200:
 *         description: List of all employees
 *       500:
 *         description: Server error
 */
router.get("/", getEmployees);


/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     tags:
 *       - Employees
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - position
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Rahul
 *               lastName:
 *                 type: string
 *                 example: Patil
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rahul.patil@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               position:
 *                 type: string
 *                 example: Frontend Developer
 *               salary:
 *                 type: number
 *                 example: 45000
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post("/", createEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - position
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Rahul
 *               lastName:
 *                 type: string
 *                 example: Patil
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rahul.patil@example.com
 *               phone:
 *                 type: string
 *                 example: "9999999999"
 *               position:
 *                 type: string
 *                 example: Senior Frontend Developer
 *               salary:
 *                 type: number
 *                 example: 55000
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.put("/:id", updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       400:
 *         description: Invalid employee ID
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteEmployee);

module.exports = router;