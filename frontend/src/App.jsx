import { useEffect, useState } from "react";

import "./App.css";

import Dashboard from "./components/Dashboard";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeTable from "./components/EmployeeTable";


import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./services/employeeService";


function App() {
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [positionFilter, setPositionFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const employeesPerPage = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    salary: "",
  });

  const [loading, setLoading] = useState(false);

  const [employeesLoading, setEmployeesLoading] = useState(true);
const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================
  // GET EMPLOYEES
  // =========================

const fetchEmployees = async () => {
  try {
    setEmployeesLoading(true);
    setError("");

    const data = await getEmployees();

    setEmployees(data);
  } catch (error) {
    console.error("Error fetching employees:", error);

    setError(
      error.message || "Failed to load employees"
    );
  } finally {
    setEmployeesLoading(false);
  }
};

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // CREATE / UPDATE EMPLOYEE
  // =========================

const handleSubmit = async (e) => {
  e.preventDefault();

  // Required validation
  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    !formData.position
  ) {
    alert("Please fill all required fields");
    return;
  }

  // Email validation
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.email)) {
    alert("Please enter valid email");
    return;
  }

  // Salary validation
  if (
    formData.salary &&
    Number(formData.salary) < 0
  ) {
    alert("Salary cannot be negative");
    return;
  }

  try {
    setLoading(true);

    const isEditing = editingId !== null;

    const employeeData = {
      ...formData,
      salary:
        formData.salary !== ""
          ? Number(formData.salary)
          : null,
    };

    if (isEditing) {
      await updateEmployee(
        editingId,
        employeeData
      );

      alert("Employee updated successfully!");
    } else {
      await createEmployee(employeeData);

      alert("Employee created successfully!");
    }

    resetForm();

    await fetchEmployees();

  } catch (error) {
    console.error("Error:", error);

    alert(
      error.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  // =========================
  // EDIT EMPLOYEE
  // =========================

const handleEdit = (employee) => {
  setEditingId(employee.id);

  setFormData({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    email: employee.email || "",
    phone: employee.phone || "",
    position: employee.position || "",
    salary: employee.salary ?? "",
  });

  setIsCreateOpen(true);
};

  // =========================
  // DELETE EMPLOYEE
  // =========================

const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this employee?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await deleteEmployee(id);

    alert("Employee deleted successfully!");

    await fetchEmployees();

  } catch (error) {
    console.error(
      "Error deleting employee:",
      error
    );

    alert(
      error.message ||
        "Failed to delete employee"
    );
  }
};

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      salary: "",
    });
  };

  // =========================
  // SEARCH
  // =========================

  const handleSearchChange = (e) => {
    setSearch(e.target.value);

    setCurrentPage(1);
  };

  // =========================
  // POSITION FILTER
  // =========================

  const handlePositionFilterChange = (e) => {
    setPositionFilter(e.target.value);

    setCurrentPage(1);
  };

  // =========================
  // PAGINATION
  // =========================

  const handlePrevious = () => {
    setCurrentPage((page) =>
      Math.max(page - 1, 1)
    );
  };

  const handleNext = () => {
    setCurrentPage((page) => page + 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // =========================
  // UI
  // =========================

return (
  <div className="container">

    <h1>Employee Management System</h1>

    {/* Dashboard */}
    <Dashboard employees={employees} />

    {/* Employee Header */}
    <div className="employee-header">
      <h2>Employee Management</h2>

      <button
        className="create-employee-btn"
        onClick={() => {
          resetForm();
          setIsCreateOpen(true);
        }}
      >
        + Create Employee
      </button>
    </div>

    {/* Employee Table */}
    {employeesLoading ? (
      <div className="card">
        <p>Loading employees...</p>
      </div>
    ) : error ? (
      <div className="card error-card">
        <p>{error}</p>

        <button onClick={fetchEmployees}>
          Try Again
        </button>
      </div>
    ) : (
      <EmployeeTable
        employees={employees}
        search={search}
        positionFilter={positionFilter}
        currentPage={currentPage}
        employeesPerPage={employeesPerPage}
        onSearchChange={handleSearchChange}
        onPositionFilterChange={
          handlePositionFilterChange
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPageChange={handlePageChange}
      />
    )}

    {/* Sidebar */}
    {isCreateOpen && (
      <>
        <div
          className="sidebar-overlay"
          onClick={() => {
            setIsCreateOpen(false);
            resetForm();
          }}
        />

        <div className="create-sidebar">

          <div className="sidebar-header">
            <h2>
              {editingId !== null
                ? "Update Employee"
                : "Create Employee"}
            </h2>

            <button
              type="button"
              className="close-sidebar-btn"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
            >
              ×
            </button>
          </div>

          <div className="sidebar-body">

            <EmployeeForm
              formData={formData}
              editingId={editingId}
              loading={loading}
              onChange={handleChange}
              onSubmit={async (e) => {
                await handleSubmit(e);
              }}
              onCancel={() => {
                resetForm();
                setIsCreateOpen(false);
              }}
            />

          </div>
        </div>
      </>
    )}

  </div>
);
}

export default App; 