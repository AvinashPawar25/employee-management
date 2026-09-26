import { useEffect, useRef, useState } from "react";

function PositionFilterSelect({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuOptions = [
    { value: "", label: "All positions" },
    ...options.map((position) => ({
      value: position,
      label: position,
    })),
  ];

  const selectedLabel =
    menuOptions.find((option) => option.value === value)?.label ||
    "All positions";

  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>

      <div className="filter-custom-select" ref={rootRef}>
        <button
          type="button"
          id={id}
          className="filter-custom-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="filter-custom-select-value">{selectedLabel}</span>
          <svg
            className="filter-select-chevron"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        {open && (
          <ul className="filter-custom-select-menu" role="listbox">
            {menuOptions.map((option) => (
              <li key={option.value || "__all__"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  className={`filter-custom-select-option ${
                    value === option.value ? "is-selected" : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PositionFilterSelect;
