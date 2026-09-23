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
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      setError("");
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message || "Failed to load employees");
      toast.error(err.message || "Failed to load employees");
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
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
    await fetchEmployees();
  } catch (err) {
    toast.error(err.message || "Failed to delete employee");
  }
};

  return (
    <div className="container">
      <Toaster position="top-right" reverseOrder={false} />
      <h1>Employee Management System</h1>

      <Dashboard employees={employees} />

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

      {employeesLoading ? (
        <div className="card"><p>Loading employees...</p></div>
      ) : error ? (
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
          employeesPerPage={employeesPerPage}
          onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          onPositionFilterChange={(e) => { setPositionFilter(e.target.value); setCurrentPage(1); }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => p + 1)}
          onPageChange={setCurrentPage}
        />
      )}

      {isCreateOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <div className="create-sidebar">
            <div className="sidebar-header">
              <h2>{editingId !== null ? "Update Employee" : "Create Employee"}</h2>
              <button type="button" className="close-sidebar-btn" onClick={closeSidebar}>×</button>
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