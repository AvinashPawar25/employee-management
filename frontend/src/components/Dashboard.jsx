function Dashboard({ employees }) {
  const totalEmployees = employees.length;

  const totalPositions = new Set(
    employees.map((employee) => employee.position)
  ).size;

  const employeesWithSalary = employees.filter(
    (employee) =>
      employee.salary !== null &&
      employee.salary !== undefined
  );

  const averageSalary =
    employeesWithSalary.length > 0
      ? employeesWithSalary.reduce(
          (total, employee) =>
            total + Number(employee.salary),
          0
        ) / employeesWithSalary.length
      : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h3>Total Employees</h3>
        <p>{totalEmployees}</p>
      </div>

      <div className="dashboard-card">
        <h3>Total Positions</h3>
        <p>{totalPositions}</p>
      </div>

      <div className="dashboard-card">
        <h3>Average Salary</h3>
        <p>
          ₹
          {averageSalary.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;