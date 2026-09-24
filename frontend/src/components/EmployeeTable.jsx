import React, { useState, useEffect } from "react";

function EmployeeTable({
  employees,
  search,
  positionFilter,
  currentPage,
  totalPages,
  sortBy,
  order,
  onSortByChange,
  onOrderChange,
  onSearchChange,
  onPositionFilterChange,
  onEdit,
  onDelete,
  onPrevious,
  onNext,
  onPageChange,
}) {
  // Cursor चा Focus टिकवून ठेवण्यासाठी Local State + Debounce
  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== search) {
        onSearchChange(searchTerm);
      }
    }, 300); // युझर टाईप करत असताना 300ms थांबून API कॉल होईल

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const positions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "QA Engineer",
    "DevOps Engineer",
    "Software Engineer",
  ];

  return (
    <div className="card">
      <h2>Employees</h2>

      {/* Search + Position + Sorting Dropdowns */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={positionFilter}
          onChange={(e) => onPositionFilterChange(e.target.value)}
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        {/* Sort By Column Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="id">Sort by: ID</option>
          <option value="firstName">Sort by: First Name</option>
          <option value="lastName">Sort by: Last Name</option>
          <option value="position">Sort by: Position</option>
          <option value="salary">Sort by: Salary</option>
        </select>

        {/* Order Dropdown (Asc / Desc) */}
        <select
          value={order}
          onChange={(e) => onOrderChange(e.target.value)}
        >
          <option value="asc">Ascending (A-Z / Low-High)</option>
          <option value="desc">Descending (Z-A / High-Low)</option>
        </select>
      </div>

      {employees.length === 0 ? (
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
                  <td>
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.phone || "-"}</td>
                  <td>
                    <span className="position-badge">{emp.position}</span>
                  </td>
                  <td>
                    {emp.salary !== null &&
                    emp.salary !== undefined &&
                    emp.salary !== ""
                      ? `₹${Number(emp.salary).toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => onDelete(emp.id)}
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
          <div className="pagination">
            <button onClick={onPrevious} disabled={currentPage === 1}>
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={currentPage === page ? "active-page" : ""}
              >
                {page}
              </button>
            ))}
            <button
              onClick={onNext}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTable;