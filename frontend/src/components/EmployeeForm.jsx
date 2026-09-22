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
        <div className="form-grid">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={onChange}
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={onChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={onChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={onChange}
          />

          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={onChange}
            required
          />

          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={onChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : editingId !== null
            ? "Update Employee"
            : "Create Employee"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default EmployeeForm;