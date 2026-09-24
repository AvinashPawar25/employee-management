import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  const [positionFilter, setPositionFilter] = useState("");

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const employeesPerPage = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

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
        sortBy,
        order,
      });

      // Handle both formats: Direct Array vs Object with .data
      const employeeList = Array.isArray(res) ? res : res?.data || [];
      setEmployees(employeeList);

      if (res?.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalEmployees(res.pagination.totalEmployees || 0);
      } else {
        // Fallback for direct array response
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

      <Dashboard employees={employees} totalEmployeesCount={totalEmployees} />

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

      {error ? (
        <div className="card error-card">
          <p>{error}</p>
          <button onClick={fetchEmployees}>Try Again</button>
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          search={search}
          positionFilter={positionFilter}
          currentPage={currentPage}
          totalPages={totalPages}
          sortBy={sortBy}
          order={order}
          onSortByChange={(val) => {
            setSortBy(val);
            setCurrentPage(1);
          }}
          onOrderChange={(val) => {
            setOrder(val);
            setCurrentPage(1);
          }}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onPositionFilterChange={(val) => {
            setPositionFilter(val);
            setCurrentPage(1);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {isCreateOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <div className="create-sidebar">
            <div className="sidebar-header">
              <h2>
                {editingId !== null ? "Update Employee" : "Create Employee"}
              </h2>
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