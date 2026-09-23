function EmployeeTable({
  employees,
  search,
  positionFilter,
  currentPage,
  employeesPerPage,
  onSearchChange,
  onPositionFilterChange,
  onEdit,
  onDelete,
  onPrevious,
  onNext,
  onPageChange,
}) {
  const query = search.trim().toLowerCase();

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      !query ||
      employee.firstName?.toLowerCase().includes(query) ||
      employee.lastName?.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.position?.toLowerCase().includes(query);

    const matchesPosition =
      positionFilter === "" || employee.position === positionFilter;

    return matchesSearch && matchesPosition;
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);
  const positions = [...new Set(employees.map((e) => e.position).filter(Boolean))];

  return (
    <div className="card">
      <h2>Employees</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={onSearchChange}
        />
        <select value={positionFilter} onChange={onPositionFilterChange}>
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : filteredEmployees.length === 0 ? (
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
    {currentEmployees.map((emp) => (
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
            <button onClick={onPrevious} disabled={currentPage === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={currentPage === page ? "active-page" : ""}
              >
                {page}
              </button>
            ))}
            <button onClick={onNext} disabled={currentPage === totalPages || totalPages === 0}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTable;