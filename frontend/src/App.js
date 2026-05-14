import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const API = "https://job-tracker-fullstack-production-2577.up.railway.app/api";

function App() {

  // ================= STATE =================

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    status: "Applied",
    notes: "",
    applyLink: "",
  });

  const [jobs, setJobs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [auth, setAuth] = useState({
    username: "",
    password: "",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    sort: "newest",
  });

  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  const jobsPerPage = 5;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // ================= FETCH JOBS =================

  const fetchJobs = useCallback(async () => {

    try {

      setLoading(true);

      if (!user || !token) {
        setJobs([]);
        return;
      }

      const res = await fetch(`${API}/jobs/user?username=${user}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setJobs(data || []);

    } catch {

      toast.error("Failed to load jobs");

    } finally {

      setLoading(false);

    }

  }, [user, token]);

  // ================= EFFECTS =================

  useEffect(() => {

    if (user && token) {
      setIsLoggedIn(true);
    }

  }, [user, token]);

  useEffect(() => {

    if (isLoggedIn) {
      fetchJobs();
    }

  }, [isLoggedIn, fetchJobs]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {

  const savedTheme =
    localStorage.getItem("darkMode");

  if (savedTheme === "true") {
    setDarkMode(true);
  }

}, []);

  // ================= FILTER + SORT =================

  const filteredJobs = jobs
    .filter((job) => {

      const text = filters.search.toLowerCase();

      return (
        (job.title || "").toLowerCase().includes(text) ||
        (job.company || "").toLowerCase().includes(text)
      );

    })
    .filter((job) =>
      filters.status === "All"
        ? true
        : job.status === filters.status
    )
    .sort((a, b) =>
      filters.sort === "newest"
        ? b.id - a.id
        : a.id - b.id
    );

  // ================= PAGINATION =================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / jobsPerPage)
  );

  const indexLast = page * jobsPerPage;

  const currentJobs = filteredJobs.slice(
    indexLast - jobsPerPage,
    indexLast
  );

  // ================= HANDLERS =================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const handleAuthChange = (e) => {

    setAuth({
      ...auth,
      [e.target.name]: e.target.value,
    });

  };

  // ================= SAVE JOB =================

  const saveJob = async () => {

    if (!form.title || !form.company || !form.location) {
      toast.error("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const payload = {
        ...form,
        username: user,
      };

      // Add date only for NEW jobs
      if (!editId) {
        payload.date = new Date().toLocaleDateString();
      }

      const res = await fetch(
        editId ? `${API}/jobs/${editId}` : `${API}/jobs`,
        {
          method: editId ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      toast.success(
        editId
          ? "Job Updated Successfully"
          : "Job Added Successfully"
      );

      setForm({
        title: "",
        company: "",
        location: "",
        status: "Applied",
        notes: "",
        applyLink: "",
      });

      setEditId(null);

      fetchJobs();

    } catch {

      toast.error("Error saving job");

    } finally {

      setLoading(false);

    }

  };

  // ================= DELETE JOB =================

  const deleteJob = async (id) => {

    if (!window.confirm("Delete this job?")) {
      return;
    }

    try {

      const res = await fetch(`${API}/jobs/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Job Deleted");

      fetchJobs();

    } catch {

      toast.error("Delete Failed");

    }

  };

  // ================= LOGIN =================

  const handleLogin = async () => {

    if (!auth.username || !auth.password) {
      toast.error("Enter username and password");
      return;
    }

    try {

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(auth),
      });

      const data = await res.text();

      if (!res.ok || data.includes("Invalid")) {
        toast.error("Invalid Login");
        return;
      }

      localStorage.setItem("user", auth.username);
      localStorage.setItem("token", data);

      setIsLoggedIn(true);

      toast.success("Login Success");

    } catch {

      toast.error("Login Failed");

    }

  };

  // ================= REGISTER =================

  const handleRegister = async () => {

    if (!auth.username || !auth.password) {
      toast.error("Enter username and password");
      return;
    }

    try {

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(auth),
      });

      const data = await res.text();

      toast.success(data);

    } catch {

      toast.error("Registration Failed");

    }

  };

  // ================= LOGOUT =================

  const logout = () => {

    localStorage.clear();

    setIsLoggedIn(false);

    setJobs([]);

    toast.info("Logged Out");

  };

  // ================= CHARTS =================

  const chartData = {
  labels: ["Applied", "Interview", "Selected", "Rejected"],

  datasets: [
    {
      label: "Jobs",

      data: [
        jobs.filter((j) => j.status === "Applied").length,

        jobs.filter((j) => j.status === "Interview").length,

        jobs.filter((j) => j.status === "Selected").length,

        jobs.filter((j) => j.status === "Rejected").length,
      ],

      backgroundColor: [
        "#ffc107",
        "#0dcaf0",
        "#198754",
        "#dc3545",
      ],

      borderWidth: 1,
    },
  ],
  };

  // ================= LOGIN PAGE =================

  if (!isLoggedIn) {

    return (

      <div className="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center">

        <div
          className="card shadow-lg border-0 p-4"
          style={{ width: "400px", borderRadius: "20px" }}
        >

          <h2 className="text-center text-primary fw-bold mb-4">
            Job Tracker
          </h2>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="form-control mb-3"
            onChange={handleAuthChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-control mb-3"
            onChange={handleAuthChange}
          />

          <button
            className="btn btn-primary w-100 mb-2"
            onClick={handleLogin}
          >
            Login
          </button>

          <button
            className="btn btn-outline-primary w-100"
            onClick={handleRegister}
          >
            Register
          </button>

        </div>

        <ToastContainer />

      </div>

    );

  }

  // ================= MAIN PAGE =================

  return (

    <div
      className={`container-fluid py-4 px-3 px-md-5 ${
        darkMode
          ? "bg-dark text-light"
          : "bg-light text-dark"
      }`}
      style={{ minHeight: "100vh" }}
    >

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h1 className="fw-bold text-primary">
            Job Tracker Dashboard
          </h1>

          <p className={darkMode ? "text-light" : "text-muted"}>
            Welcome, {user}
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-secondary"
            onClick={() => {

              setDarkMode(!darkMode);

              localStorage.setItem(
                "darkMode",
                !darkMode
              );

            }}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>

          <button
            className="btn btn-danger"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* FILTERS */}

      <div className="card shadow-sm border-0 p-4 mb-4">

        <div className="row g-3">

          <div className="col-md-4">

            <input
              className={`form-control ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              placeholder="Search by title/company"
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />

          </div>

          <div className="col-md-4">

            <select
              className={`form-select ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
            >

              <option>All</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Selected</option>
              <option>Rejected</option>

            </select>

          </div>

          <div className="col-md-4">

            <select
              className="form-select"
              value={filters.sort}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sort: e.target.value,
                })
              }
            >

              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>

            </select>

          </div>

        </div>

      </div>

      {/* DASHBOARD */}

      <div className="row mb-4">

        <div className="col-md-3 mb-3">

          <div className="card shadow-sm border-0 text-center p-4">

            <h5>Total Jobs</h5>

            <h1 className="text-primary">
              {jobs.length}
            </h1>

          </div>

        </div>

        <div className="col-md-3 mb-3">

          <div className="card shadow-sm border-0 text-center p-4">

            <h5>Applied</h5>

            <h1 className="text-warning">
              {jobs.filter((j) => j.status === "Applied").length}
            </h1>

          </div>

        </div>

        <div className="col-md-3 mb-3">

          <div className="card shadow-sm border-0 text-center p-4">

            <h5>Interview</h5>

            <h1 className="text-info">
              {jobs.filter((j) => j.status === "Interview").length}
            </h1>

          </div>

        </div>

        <div className="col-md-3 mb-3">

          <div className="card shadow-sm border-0 text-center p-4">

            <h5>Selected</h5>

            <h1 className="text-success">
              {jobs.filter((j) => j.status === "Selected").length}
            </h1>

          </div>

        </div>

        <div className="col-md-3 mb-3">

          <div className="card shadow-sm border-0 text-center p-4">

            <h5>Rejected</h5>

            <h1 className="text-danger">
              {jobs.filter((j) => j.status === "Rejected").length}
            </h1>

          </div>

        </div>

      </div>

      {/* CHART */}

      <div className="card shadow-sm border-0 p-4 mb-5">

        <h4 className="mb-4 text-center">
          Job Status Analytics
        </h4>

        <div
          style={{
            width: "350px",
            margin: "0 auto",
          }}
        >
          <Pie data={chartData} />
        </div>

      </div>

      {/* ADD JOB FORM */}

      <div className="card shadow-sm border-0 p-4 mb-5">

        <h4 className="mb-4">

          {editId
            ? "Update Job"
            : "Add New Job"}

        </h4>

        <div className="row g-3">

          <div className="col-md-6">

            <input
              type="text"
              name="title"
              placeholder="Job Title"
              className={`form-control ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              value={form.title}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6">

            <input
              type="text"
              name="company"
              placeholder="Company"
              className={`form-control ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              value={form.company}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6">

            <input
              type="text"
              name="location"
              placeholder="Location"
              className={`form-control ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              value={form.location}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6">

            <input
              type="text"
              name="applyLink"
              placeholder="Apply Link"
              className={`form-control ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              value={form.applyLink}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6">

            <textarea
              name="notes"
              placeholder="Notes"
              rows="2"
              className={`form-control ${
                darkMode
                  ? "bg-dark text-light border-secondary"
                  : ""
              }`}
              value={form.notes}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-4">

            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >

              <option>Applied</option>
              <option>Interview</option>
              <option>Selected</option>
              <option>Rejected</option>

            </select>

          </div>

          <div className="col-md-2">

            <button
              className="btn btn-primary w-100"
              onClick={saveJob}
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : editId
                ? "Update"
                : "Add"}

            </button>

          </div>

        </div>

      </div>

      {loading && (
        <div className="text-center mb-4">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {/* JOB LIST */}

      <div className="row">

        {currentJobs.length === 0 ? (

          <div className="text-center">

            <h4 className="text-muted">
              No Jobs Found
            </h4>

          </div>

        ) : (

          currentJobs.map((job) => (

            <div
              className="col-md-6 mb-4"
              key={job.id}
            >

              <div className="card shadow-sm border-0 h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between">

                    <h4 className="text-primary d-flex align-items-center gap-2">
                      <FaBriefcase />
                      {job.title}
                    </h4>

                    <span
                      className={`badge px-3 py-2 ${
                        job.status === "Applied"
                          ? "bg-warning text-dark"
                          : job.status === "Interview"
                          ? "bg-info text-dark"
                          : job.status === "Selected"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {job.status}
                    </span>

                  </div>

                  <h6 className="mt-3 d-flex align-items-center gap-2">
                    <FaBuilding />
                    {job.company}
                  </h6>

                  <p className="text-muted mb-2 d-flex align-items-center gap-2">
                    <FaMapMarkerAlt />
                    {job.location}
                  </p>

                  <p className="small text-secondary">
                    Applied On: {job.date || "N/A"}
                  </p>

                  <p className="small">
                    <strong>Notes:</strong> {job.notes || "No Notes"}
                  </p>

                  <div className="d-flex gap-2 mt-3">

                    <button
                      className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                      onClick={() => {

                        setEditId(job.id);

                        setForm({
                          title: job.title,
                          company: job.company,
                          location: job.location,
                          status: job.status,
                          notes: job.notes || "",
                          applyLink: job.applyLink || "",
                        });

                      }}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                      onClick={() => deleteJob(job.id)}
                    >
                      <FaTrash />
                      Delete
                    </button>

                    {job.applyLink && (
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Apply
                      </a>
                    )}

                  </div>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

      {/* PAGINATION */}

      <div className="d-flex justify-content-center align-items-center gap-3 mt-4">

        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span className="fw-bold">
          {page} / {totalPages}
        </span>

        <button
          className="btn btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>

      </div>

      <ToastContainer />

    </div>

  );

}

export default App;