const API_URL = `${import.meta.env.VITE_API_URL}/api/employees`;

// GET employees with pagination, search, filter and sorting
export const getEmployees = async ({
  page = 1,
  limit = 10,
  search = "",
  position = "",
  sortBy = "id",
  order = "asc",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    order,
  });

  if (search.trim()) params.append("search", search.trim());
  if (position.trim()) params.append("position", position.trim());

  const response = await fetch(`${API_URL}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch employees");
  }

  return data;
};

// CREATE employee
export const createEmployee = async (employeeData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employeeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create employee");
  }

  return data;
};

// UPDATE employee
export const updateEmployee = async (id, employeeData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employeeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update employee");
  }

  return data;
};

// DELETE employee
export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete employee");
  }

  return data;
};