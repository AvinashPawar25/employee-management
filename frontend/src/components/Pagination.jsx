import React from "react";

function Pagination({ currentPage, totalPages, onPrevious, onNext, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button 
        type="button" 
        onClick={onPrevious} 
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={currentPage === page ? "active-page" : ""}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        ›
      </button>
    </div>
  );
}

export default Pagination;