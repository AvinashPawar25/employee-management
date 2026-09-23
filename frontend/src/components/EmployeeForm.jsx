import React from "react";

function EmployeeForm({
  formData,
  editingId,
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="employee-form">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">
            First Name <span className="required">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            placeholder="e.g. Avinash"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">
            Last Name <span className="required">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            placeholder="e.g. Pawar"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="e.g. avinash@example.com"
            value={formData.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="text"
            name="phone"
            placeholder="e.g. 9736543210"
            value={formData.phone}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="position">
            Position / Role <span className="required">*</span>
          </label>
          <input
            id="position"
            type="text"
            name="position"
            placeholder="e.g. Software Engineer"
            value={formData.position}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="salary">Salary (₹)</label>
          <input
            id="salary"
            type="number"
            name="salary"
            placeholder="e.g. 50000"
            value={formData.salary}
            onChange={onChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingId !== null
              ? "Update Employee"
              : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;