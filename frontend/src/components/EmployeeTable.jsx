import React, { useState, useEffect } from "react";

function EmployeeTable({
  employees = [],
  search = "",
  positionFilter = "",
  currentPage = 1,
  totalPages = 1,
  sortBy = "id",
  order = "asc",
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
  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== search) {
        onSearchChange(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Frontend Fallback Filter & Sort (Backend जुना असला तरीही स्क्रीनवर फिल्टर १००% चालेल)
  const query = (search || "").trim().toLowerCase();

  const filteredList = employees
    .filter((emp) => {
      const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
      const email = (emp.email || "").toLowerCase();
      const pos = (emp.position || "").toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        (emp.firstName || "").toLowerCase().includes(query) ||
        (emp.lastName || "").toLowerCase().includes(query) ||
        email.includes(query) ||
        pos.includes(query);

      const matchesPosition =
        !positionFilter || pos === positionFilter.toLowerCase();

      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "salary" || sortBy === "id") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

  // Unique Positions
  const availablePositions = [
    ...new Set(employees.map((e) => e.position).filter(Boolean)),
  ];

  return (
    <div className="card">
      <h2>Employees</h2>

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
          {availablePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

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

        <select
          value={order}
          onChange={(e) => onOrderChange(e.target.value)}
        >
          <option value="asc">Ascending (A-Z / Low-High)</option>
          <option value="desc">Descending (Z-A / High-Low)</option>
        </select>
      </div>

      {filteredList.length === 0 ? (
        <p>No matching employees found.</p>
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
              {/* इथे filteredList मॅप केली आहे */}
              {filteredList.map((emp) => (
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