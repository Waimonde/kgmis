
import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const roles = [
  "Administrator",
  "Games Department",
  "Coach",
  "Viewer",
];

export default function UsersPage() {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Viewer",
  });

  const [saving, setSaving] = useState(false);

  // CHECK ADMINISTRATOR ACCESS
  const isAdministrator =
    currentUser?.role === "Administrator";

  // FETCH USERS
  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load users");
      }

      setUsers(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdministrator && token) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, []);

  // HANDLE FORM INPUTS
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // REGISTER USER
  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setMessage("User created successfully.");

      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "Viewer",
      });

      setShowForm(false);

      await fetchUsers();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // CHANGE USER ROLE
  async function handleRoleChange(userId, newRole) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setMessage("User role updated successfully.");

      await fetchUsers();

    } catch (err) {
      setError(err.message);
    }
  }

  // ACTIVATE OR DEACTIVATE USER
  async function handleStatusChange(user) {
    const newStatus = !user.is_active;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } ${user.full_name}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setMessage(data.message);

      await fetchUsers();

    } catch (err) {
      setError(err.message);
    }
  }

  // ACCESS CONTROL
  if (!isAdministrator) {
    return (
      <div className="users-page">
        <h2>Access Denied</h2>
        <p>Only Administrators can manage system users.</p>
      </div>
    );
  }

  return (
    <div className="users-page">

      {/* PAGE HEADER */}
      <div className="users-header">
        <div>
          <p className="users-eyebrow">
            KGMIS ADMINISTRATION
          </p>

          <h1>User Management</h1>

          <p>
            Manage system accounts, roles and access.
          </p>
        </div>

        <button
          className="users-primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus size={18} />
          {showForm ? "Close Form" : "Add User"}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="users-summary">

        <div className="users-summary-card">
          <Users size={24} />
          <div>
            <strong>{users.length}</strong>
            <span>Total Users</span>
          </div>
        </div>

        <div className="users-summary-card">
          <UserCheck size={24} />
          <div>
            <strong>
              {users.filter((u) => u.is_active).length}
            </strong>
            <span>Active Users</span>
          </div>
        </div>

        <div className="users-summary-card">
          <UserX size={24} />
          <div>
            <strong>
              {users.filter((u) => !u.is_active).length}
            </strong>
            <span>Inactive Users</span>
          </div>
        </div>

        <div className="users-summary-card">
          <ShieldCheck size={24} />
          <div>
            <strong>
              {users.filter(
                (u) => u.role === "Administrator"
              ).length}
            </strong>
            <span>Administrators</span>
          </div>
        </div>

      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="users-error">{error}</div>
      )}

      {message && (
        <div className="users-success">{message}</div>
      )}

      {/* ADD USER FORM */}
      {showForm && (
        <div className="users-form-card">

          <h2>Create New User</h2>

          <form onSubmit={handleSubmit}>

            <div className="users-form-grid">

              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label>Temporary Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label>User Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              type="submit"
              className="users-primary-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create User"}
            </button>

          </form>

        </div>
      )}

      {/* USERS TABLE */}
      <div className="users-table-card">

        <div className="users-table-header">
          <h2>Registered Users</h2>

          <button
            className="users-refresh-button"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr key={user.id}>

                    <td>{user.full_name}</td>

                    <td>{user.email}</td>

                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value
                          )
                        }
                        disabled={user.id === currentUser.id}
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <span
                        className={
                          user.is_active
                            ? "users-status-active"
                            : "users-status-inactive"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="users-action-button"
                        onClick={() => handleStatusChange(user)}
                        disabled={user.id === currentUser.id}
                      >
                        {user.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}
