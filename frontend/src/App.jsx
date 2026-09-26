import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

import EmployeeForm from "./components/EmployeeForm";
import Pagination from "./components/Pagination";
import PositionFilterSelect from "./components/PositionFilterSelect";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./services/employeeService";

import Login from "./pages/Login";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  salary: "",
};

function App() {
  // =========================
  // AUTH
  // =========================

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return "?";
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // =========================
  // EMPLOYEE STATES
  // =========================

  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("desc");

  const employeesPerPage = 10;

  // =========================
  // FORM STATES
  // =========================

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // =========================
  // SEARCH DEBOUNCE
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // =========================
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setEmployeesLoading(false);
      setError("Please login first.");
      return;
    }

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

      const employeeList = Array.isArray(res)
        ? res
        : res?.data || [];

      setEmployees(employeeList);

      if (res?.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalEmployees(res.pagination.totalEmployees || 0);
      } else {
        setTotalEmployees(employeeList.length);

        setTotalPages(
          Math.ceil(employeeList.length / employeesPerPage) || 1
        );
      }
    } catch (err) {
      console.error("Fetch employees error:", err);

      const message =
        err.message || "Failed to load employees";

      setError(message);

      toast.error(message);

      // If JWT expired / unauthorized
      if (
        message.toLowerCase().includes("unauthorized") ||
        message.includes("401") ||
        message.toLowerCase().includes("token")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

        toast.error("Session expired. Please login again.");
      }
    } finally {
      setEmployeesLoading(false);
    }
  };

  // =========================
  // LOAD EMPLOYEES
  // =========================

  useEffect(() => {
    if (token) {
      fetchEmployees();
    } else {
      setEmployeesLoading(false);
    }
  }, [
    token,
    currentPage,
    search,
    positionFilter,
    sortBy,
    order,
  ]);

  // =========================
  // POSITIONS
  // =========================

  const dynamicPositions = [
    ...new Set(
      employees
        .map((employee) => employee.position)
        .filter(Boolean)
    ),
  ];

  // =========================
  // FILTER STATUS
  // =========================

  const isAnyFilterActive =
    searchTerm.trim() !== "" ||
    positionFilter !== "" ||
    sortBy !== "";

  const sortFieldLabels = {
    id: "ID",
    firstName: "First Name",
    lastName: "Last Name",
    position: "Position",
    salary: "Salary",
  };

  // =========================
  // CLEAR FILTERS
  // =========================

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearch("");

    setPositionFilter("");

    setSortBy("");
    setOrder("asc");

    setCurrentPage(1);
  };

  // =========================
  // DASHBOARD DATA
  // =========================

  const totalPositionsCount = dynamicPositions.length;

  const employeesWithSalary = employees.filter(
    (employee) =>
      employee.salary !== null &&
      employee.salary !== undefined &&
      employee.salary !== ""
  );

  const averageSalary =
    employeesWithSalary.length > 0
      ? employeesWithSalary.reduce(
          (sum, employee) =>
            sum + Number(employee.salary),
          0
        ) / employeesWithSalary.length
      : 0;

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  // =========================
  // CLOSE SIDEBAR
  // =========================

  const closeSidebar = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE / UPDATE EMPLOYEE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Authentication check
    if (!token) {
      toast.error("Please login first.");
      return;
    }

    // Required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.position
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Salary validation
    if (
      formData.salary !== "" &&
      Number(formData.salary) < 0
    ) {
      toast.error("Salary cannot be negative");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,

        salary:
          formData.salary !== ""
            ? Number(formData.salary)
            : null,
      };

      if (editingId !== null) {
        // UPDATE
        await updateEmployee(
          editingId,
          payload
        );

        toast.success(
          "Employee updated successfully!"
        );
      } else {
        // CREATE
        await createEmployee(payload);

        toast.success(
          "Employee created successfully!"
        );

        setCurrentPage(1);
        setOrder("desc");
      }

      closeSidebar();

      // Refresh table
      await fetchEmployees();
    } catch (err) {
      console.error("Employee save error:", err);

      toast.error(
        err.message || "Something went wrong"
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

  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (employee) => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }
    setDeletingEmployee(employee);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;

    try {
      setDeleteLoading(true);
      await deleteEmployee(deletingEmployee.id);

      toast.success("Employee deleted successfully!");
      setDeletingEmployee(null);

      // If last employee on current page
      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchEmployees();
      }
    } catch (err) {
      console.error("Delete employee error:", err);
      toast.error(err.message || "Failed to delete employee");
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    toast.dismiss();
    toast.success("Logged out successfully! See you soon.", {
      duration: 4000,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setEmployees([]);
  };

  // =========================
  // MAIN RENDER
  // =========================

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          duration: 4000,
        }}
      />

      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app-layout">

      {/* =========================
          HEADER
      ========================= */}

      <header className="fixed-top-section">
        <div className="app-topbar">
          <div className="app-topbar-brand">
            <div className="app-topbar-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
            </div>
            <div>
              <h1>Employee Management</h1>
            </div>
          </div>

          <div className="app-topbar-actions">
            {user && (
              <div className="user-pill">
                <span className="user-avatar">{getInitials(user.name)}</span>
                <div className="user-pill-text">
                  <span className="user-pill-label">Signed in as</span>
                  <span className="user-pill-name">{user.name}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard">
          <div className="dashboard-card stat-card-employees">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="stat-card-body">
              <h3>Total Employees</h3>
              <p>{totalEmployees}</p>
            </div>
          </div>

          <div className="dashboard-card stat-card-positions">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
            </div>
            <div className="stat-card-body">
              <h3>Total Positions</h3>
              <p>{totalPositionsCount}</p>
            </div>
          </div>

          <div className="dashboard-card stat-card-salary">
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <div className="stat-card-body">
              <h3>Average Salary</h3>
              <p>
                ₹
                {averageSalary.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =========================
          TABLE SECTION
      ========================= */}

      <main className="table-wrapper-section">

        <div className="card table-card-container">

          {/* FILTERS */}

          <div className="table-card-header">
            <div className="table-section-header">
              <div>
                <h2>Employee directory</h2>
                <p className="table-section-subtitle">
                  {totalEmployees} record{totalEmployees === 1 ? "" : "s"} in
                  the system
                </p>
              </div>

              <button
                type="button"
                className="create-employee-btn"
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
              >
                + Add Employee
              </button>
            </div>

            <div className="filters-panel">
              <div
                className={`filters-grid${
                  sortBy ? " has-order" : ""
                }${isAnyFilterActive ? " has-clear" : ""}`}
              >
                <div className="filter-field filter-field-search">
                  <label htmlFor="employee-search">Search</label>
                  <div className="search-input-wrapper">
                    <svg
                      className="search-input-icon"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <input
                      id="employee-search"
                      type="text"
                      placeholder="Name, email, or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <PositionFilterSelect
                  id="position-filter"
                  label="Position"
                  value={positionFilter}
                  options={dynamicPositions}
                  onChange={(nextValue) => {
                    setPositionFilter(nextValue);
                    setCurrentPage(1);
                  }}
                />

                <div className="filter-field">
                  <label htmlFor="sort-by">Sort by</label>
                  <div className="filter-select-wrapper">
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">Default</option>
                      <option value="firstName">First name</option>
                      <option value="lastName">Last name</option>
                      <option value="position">Position</option>
                      <option value="salary">Salary</option>
                    </select>
                    <svg
                      className="filter-select-chevron"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>

                {sortBy && (
                  <div className="filter-field">
                    <label htmlFor="sort-order">Order</label>
                    <div className="filter-select-wrapper">
                      <select
                        id="sort-order"
                        value={order}
                        onChange={(e) => {
                          setOrder(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                      <svg
                        className="filter-select-chevron"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </div>
                  </div>
                )}

                {isAnyFilterActive && (
                  <div className="filter-field filter-field-clear">
                    <span className="filter-field-clear-spacer" aria-hidden="true">
                      &nbsp;
                    </span>
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={handleClearFilters}
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* =========================
              TABLE
          ========================= */}

          <div className="table-scroll-area">

            {employeesLoading ? (
              <div className="table-status-msg">
                <span className="dashboard-spinner" />
                Loading employees...
              </div>
            ) : error ? (
              <div className="table-status-msg table-status-error">
                <p>{error}</p>
                <button
                  type="button"
                  className="retry-btn"
                  onClick={fetchEmployees}
                >
                  Try again
                </button>
              </div>
            ) : employees.length === 0 ? (
              <div className="table-status-msg table-status-empty">
                <p>No employees found.</p>
                <span>Try adjusting your search or filters.</span>
              </div>
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

                  {employees.map((employee) => (

                    <tr key={employee.id}>

                      <td>
                        {employee.id}
                      </td>

                      <td>
                        <div className="employee-name-cell">
                          <span className="employee-avatar">
                            {getInitials(
                              `${employee.firstName} ${employee.lastName}`
                            )}
                          </span>
                          <span className="employee-name-text">
                            {employee.firstName} {employee.lastName}
                          </span>
                        </div>
                      </td>

                      <td>
                        {employee.email}
                      </td>

                      <td>
                        {employee.phone || "-"}
                      </td>

                      <td>
                        <span className="position-badge">
                          {employee.position}
                        </span>
                      </td>

                      <td>
                        {employee.salary !==
                          null &&
                        employee.salary !==
                          undefined &&
                        employee.salary !== ""
                          ? `₹${Number(
                              employee.salary
                            ).toLocaleString(
                              "en-IN"
                            )}`
                          : "-"}
                      </td>

                      <td>

                        <div className="actions">

                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() =>
                              handleEdit(
                                employee
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() =>
                              handleDeleteClick(
                                employee
                              )
                            }
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

          {/* =========================
              PAGINATION
          ========================= */}

          <div className="table-footer-pagination">

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              onNext={() =>
                setCurrentPage((page) =>
                  Math.min(
                    page + 1,
                    totalPages
                  )
                )
              }
              onPageChange={(page) =>
                setCurrentPage(page)
              }
            />

          </div>

        </div>

      </main>

      {/* =========================
          CREATE / UPDATE SIDEBAR
      ========================= */}

      {isCreateOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={closeSidebar}
          />

          <div className="create-sidebar">

            <div className="sidebar-header">
              <div className="sidebar-header-title">
                <div className="sidebar-header-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <h2>
                    {editingId !== null
                      ? "Edit Employee Details"
                      : "Add New Employee"}
                  </h2>
                  <p>
                    {editingId !== null
                      ? "Update existing record in the system"
                      : "Fill in the details below to add a new record"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="close-sidebar-btn"
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                ✕
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
  )}
      {/* =========================
          DELETE CONFIRMATION MODAL
      ========================= */}
      <DeleteConfirmModal
        employee={deletingEmployee}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEmployee(null)}
      />
    </>
  );
}

export default App;