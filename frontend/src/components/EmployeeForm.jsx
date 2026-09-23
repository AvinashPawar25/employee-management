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
          <label>First Name <span className="required">*</span></label>
          <input
            type="text"
            name="firstName"
            placeholder="e.g. Rahul"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name <span className="required">*</span></label>
          <input
            type="text"
            name="lastName"
            placeholder="e.g. Patil"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address <span className="required">*</span></label>
          <input
            type="email"
            name="email"
            placeholder="e.g. rahul@example.com"
            value={formData.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label>Position / Role <span className="required">*</span></label>
          <input
            type="text"
            name="position"
            placeholder="e.g. Software Engineer"
            value={formData.position}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Salary (₹)</label>
          <input
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