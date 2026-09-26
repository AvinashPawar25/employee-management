import React from "react";

const SUGGESTED_POSITIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "HR Executive",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
];

function EmployeeForm({
  formData,
  editingId,
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = editingId !== null;

  return (
    <div className="employee-form-container">
      <form onSubmit={onSubmit} noValidate>
        {/* SECTION 1: Personal Information */}
        <div className="form-section">
          <div className="form-section-title">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Personal Information
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
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
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
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
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="e.g. avinash@company.com"
                  value={formData.email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={onChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Employment & Compensation */}
        <div className="form-section">
          <div className="form-section-title">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
            </svg>
            Role &amp; Compensation
          </div>

          <div className="form-group">
            <label htmlFor="position">
              Job Position / Title <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
              <input
                id="position"
                type="text"
                name="position"
                placeholder="e.g. Software Engineer"
                value={formData.position}
                onChange={onChange}
                autoComplete="off"
                required
              />
            </div>

            {/* Position Quick-select Pills */}
            <div className="position-suggestions">
              <span className="suggestions-label">Quick select role:</span>
              <div className="suggestions-chips">
                {SUGGESTED_POSITIONS.slice(0, 5).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`chip-btn ${formData.position === pos ? "active" : ""}`}
                    onClick={() =>
                      onChange({
                        target: { name: "position", value: pos },
                      })
                    }
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Monthly Salary (₹)</label>
            <div className="input-with-icon">
              <span className="input-currency-symbol">₹</span>
              <input
                id="salary"
                type="number"
                name="salary"
                placeholder="e.g. 50000"
                value={formData.salary}
                onChange={onChange}
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            {loading ? (
              <>
                <span className="btn-spinner" />
                Saving...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                {isEditing ? "Update Employee" : "Create Employee"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;