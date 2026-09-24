import React from "react";

function Dashboard({ employees, totalEmployeesCount }) {
  const totalEmployees = totalEmployeesCount !== undefined ? totalEmployeesCount : employees.length;
  const totalPositions = new Set(employees.map((e) => e.position)).size;

  const employeesWithSalary = employees.filter(
    (e) => e.salary !== null && e.salary !== undefined && e.salary !== ""
  );

  const averageSalary =
    employeesWithSalary.length > 0
      ? employeesWithSalary.reduce((sum, e) => sum + Number(e.salary), 0) / employeesWithSalary.length
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
        <p>₹{averageSalary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
      </div>
    </div>
  );
}

export default Dashboard;