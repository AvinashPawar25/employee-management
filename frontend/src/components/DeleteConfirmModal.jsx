import React from "react";

function DeleteConfirmModal({ employee, loading, onConfirm, onCancel }) {
  if (!employee) return null;

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    `Employee #${employee.id}`;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div
        className="delete-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="delete-modal-icon-wrapper">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </div>

        <div className="delete-modal-content">
          <h3 id="delete-modal-title">Delete Employee?</h3>
          <p>
            Are you sure you want to delete <strong>{fullName}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-modal-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Deleting...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
