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
  const searchText = search.toLowerCase();

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchText) ||
      employee.lastName.toLowerCase().includes(searchText) ||
      employee.email.toLowerCase().includes(searchText) ||
      employee.position.toLowerCase().includes(searchText);

    const matchesPosition =
      positionFilter === "" ||
      employee.position === positionFilter;

    return matchesSearch && matchesPosition;
  });

  const totalPages = Math.ceil(
    filteredEmployees.length / employeesPerPage
  );

  const startIndex =
    (currentPage - 1) * employeesPerPage;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  const positions = [
    ...new Set(
      employees.map((employee) => employee.position)
    ),
  ];

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

        <select
          value={positionFilter}
          onChange={onPositionFilterChange}
        >
          <option value="">All Positions</option>

          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : filteredEmployees.length === 0 ? (
        <p>No matching employees found.</p>
      ) : (
        <div className="table-container">
          <table>
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
              {currentEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>

                  <td>
                    {employee.firstName}{" "}
                    {employee.lastName}
                  </td>

                  <td>{employee.email}</td>

                  <td>{employee.phone || "-"}</td>

                  <td>{employee.position}</td>

                  <td>
                    {employee.salary !== null &&
                    employee.salary !== undefined
                      ? `₹${Number(employee.salary).toLocaleString(
                          "en-IN"
                        )}`
                      : "-"}
                  </td>

                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(employee)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        onDelete(employee.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={onPrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => (
                <button
                  key={index + 1}
                  onClick={() =>
                    onPageChange(index + 1)
                  }
                  className={
                    currentPage === index + 1
                      ? "active-page"
                      : ""
                  }
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              onClick={onNext}
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTable;