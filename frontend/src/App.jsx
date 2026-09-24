import { useEffect, useState, useRef } from "react";
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

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  // Sort by default empty
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("asc");
  const employeesPerPage = 10;

  // Custom Dropdown State for Positions
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const positionDropdownRef = useRef(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Search Debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close custom position dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        positionDropdownRef.current &&
        !positionDropdownRef.current.contains(event.target)
      ) {
        setIsPositionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch employees
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

  // Dynamic positions from employees list
  const dynamicPositions = [
    ...new Set(employees.map((e) => e.position).filter(Boolean)),
  ];

  // Check if any filter is active
  const isAnyFilterActive =
    searchTerm.trim() !== "" ||
    positionFilter !== "" ||
    sortBy !== "";

  // Reset all filters function
  const handleClearFilters = () => {
    setSearchTerm("");
    setSearch("");
    setPositionFilter("");
    setSortBy("");
    setOrder("asc");
    setCurrentPage(1);
  };

  // Dashboard Calculations
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
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <h1>Employee Management System</h1>

      {/* 1. Dashboard */}
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

      {/* 2. Top Header & Action */}
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

      {/* 3. Search, Filters, Sorting & Table Section */}
      <div className="card">
        <h2>Employees</h2>

        <div className="search-container">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name, email, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Custom Positions Dropdown: बरोबर ५ दिसतील आणि स्क्रोल होईल */}
          <div className="custom-dropdown" ref={positionDropdownRef}>
            <button
              type="button"
              className="dropdown-trigger"
              onClick={() => setIsPositionDropdownOpen((prev) => !prev)}
            >
              <span>{positionFilter || "All Positions"}</span>
              <span className="dropdown-arrow">▾</span>
            </button>

            {isPositionDropdownOpen && (
              <div className="dropdown-menu scrollable-positions">
                <div
                  className={`dropdown-item ${positionFilter === "" ? "selected" : ""}`}
                  onClick={() => {
                    setPositionFilter("");
                    setCurrentPage(1);
                    setIsPositionDropdownOpen(false);
                  }}
                >
                  All Positions
                </div>
                {dynamicPositions.map((pos) => (
                  <div
                    key={pos}
                    className={`dropdown-item ${positionFilter === pos ? "selected" : ""}`}
                    onClick={() => {
                      setPositionFilter(pos);
                      setCurrentPage(1);
                      setIsPositionDropdownOpen(false);
                    }}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown (Default Empty) */}
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

          {/* Order Dropdown: फक्त Sort by सिलेक्ट असेल तरच दिसेल */}
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

          {/* Clear Filters Button: कोणताही फिल्टर भरला असल्यास दिसेल */}
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

        {employeesLoading ? (
          <p>Loading employees...</p>
        ) : error ? (
          <div className="error-card">
            <p>{error}</p>
            <button type="button" onClick={fetchEmployees}>Try Again</button>
          </div>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div className="table-container">
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

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* 4. Sidebar */}
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