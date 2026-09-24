import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

import EmployeeForm from "./components/EmployeeForm";
import Pagination from "./components/Pagination";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./services/employeeService";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  salary: "",
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("asc");
  const employeesPerPage = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      setError("");

      const res = await getEmployees({
        page: currentPage,
        limit: employeesPerPage,
        search,
        position: positionFilter,
        sortBy: sortBy || "id",
        order: order || "asc",
      });

      const employeeList = Array.isArray(res) ? res : res?.data || [];
      setEmployees(employeeList);

      if (res?.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalEmployees(res.pagination.totalEmployees || 0);
      } else {
        setTotalEmployees(employeeList.length);
        setTotalPages(Math.ceil(employeeList.length / employeesPerPage) || 1);
      }
    } catch (err) {
      setError(err.message || "Failed to load employees");
      toast.error(err.message || "Failed to load employees");
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, search, positionFilter, sortBy, order]);

  const dynamicPositions = [
    ...new Set(employees.map((e) => e.position).filter(Boolean)),
  ];

  const isAnyFilterActive =
    searchTerm.trim() !== "" || positionFilter !== "" || sortBy !== "";

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearch("");
    setPositionFilter("");
    setSortBy("");
    setOrder("asc");
    setCurrentPage(1);
  };

  const totalPositionsCount = dynamicPositions.length;
  const employeesWithSalary = employees.filter(
    (e) => e.salary !== null && e.salary !== undefined && e.salary !== ""
  );
  const averageSalary =
    employeesWithSalary.length > 0
      ? employeesWithSalary.reduce((sum, e) => sum + Number(e.salary), 0) /
        employeesWithSalary.length
      : 0;

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const closeSidebar = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.position
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.salary && Number(formData.salary) < 0) {
      toast.error("Salary cannot be negative");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        salary: formData.salary !== "" ? Number(formData.salary) : null,
      };

      if (editingId !== null) {
        await updateEmployee(editingId, payload);
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(payload);
        toast.success("Employee created successfully!");
      }

      closeSidebar();
      await fetchEmployees();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await deleteEmployee(id);
      toast.success("Employee deleted successfully!");

      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchEmployees();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete employee");
    }
  };

  return (
    <div className="app-layout">
      <Toaster position="top-right" reverseOrder={false} />

      {/* 1. FIXED TOP HEADER SECTION */}
      <header className="fixed-top-section">
        <h1>Employee Management System</h1>

        <div className="dashboard">
          <div className="dashboard-card">
            <h3>Total Employees</h3>
            <p>{totalEmployees}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Positions</h3>
            <p>{totalPositionsCount}</p>
          </div>
          <div className="dashboard-card">
            <h3>Average Salary</h3>
            <p>₹{averageSalary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="employee-header">
          <h2>Employee Management</h2>
          <button
            type="button"
            className="create-employee-btn"
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
          >
            + Create Employee
          </button>
        </div>
      </header>

      {/* 2. TABLE & FILTERS SECTION (Sticky Filters + Fixed Height Table Area) */}
      <main className="table-wrapper-section">
        <div className="card table-card-container">
          <div className="table-card-header">

            {/* STICKY FILTERS */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name, email, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Positions</option>
                {dynamicPositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Sort by</option>
                <option value="id">ID</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="position">Position</option>
                <option value="salary">Salary</option>
              </select>

              {sortBy && (
                <select
                  value={order}
                  onChange={(e) => {
                    setOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="asc">Ascending (A-Z / Low-High)</option>
                  <option value="desc">Descending (Z-A / High-Low)</option>
                </select>
              )}

              {isAnyFilterActive && (
                <button
                  type="button"
                  className="clear-filters-btn"
                  onClick={handleClearFilters}
                  title="Clear all filters"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* TABLE SCROLLABLE BODY (Outer border removed, fixed height maintained) */}
          <div className="table-scroll-area">
            {employeesLoading ? (
              <div className="table-status-msg">Loading employees...</div>
            ) : error ? (
              <div className="table-status-msg error-msg">
                <p>{error}</p>
                <button type="button" onClick={fetchEmployees}>Try Again</button>
              </div>
            ) : employees.length === 0 ? (
              <div className="table-status-msg">No employees found.</div>
            ) : (
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Position</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone || "-"}</td>
                      <td>
                        <span className="position-badge">{emp.position}</span>
                      </td>
                      <td>
                        {emp.salary !== null && emp.salary !== undefined && emp.salary !== ""
                          ? `₹${Number(emp.salary).toLocaleString("en-IN")}`
                          : "-"}
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(emp)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(emp.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 3. PAGINATION (Fixed at bottom under the table) */}
          <div className="table-footer-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </main>

      {/* 4. SIDEBAR */}
      {isCreateOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <div className="create-sidebar">
            <div className="sidebar-header">
              <h2>{editingId !== null ? "Update Employee" : "Create Employee"}</h2>
              <button
                type="button"
                className="close-sidebar-btn"
                onClick={closeSidebar}
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
                onSubmit={handleSubmit}
                onCancel={closeSidebar}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;