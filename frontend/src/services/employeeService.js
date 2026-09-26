const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/employees`;

// =========================
// GET AUTH TOKEN
// =========================
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authorization token is required");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// =========================
// GET EMPLOYEES
// =========================
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

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (position.trim()) {
    params.append("position", position.trim());
  }

  const response = await fetch(
    `${API_URL}?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch employees"
    );
  }

  return data;
};

// =========================
// CREATE EMPLOYEE
// =========================
export const createEmployee = async (employeeData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(employeeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create employee"
    );
  }

  return data;
};

// =========================
// UPDATE EMPLOYEE
// =========================
export const updateEmployee = async (
  id,
  employeeData
) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update employee"
    );
  }

  return data;
};

// =========================
// DELETE EMPLOYEE
// =========================
export const deleteEmployee = async (id) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete employee"
    );
  }

  return data;
};