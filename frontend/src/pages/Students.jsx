
import { useState } from "react";

const emptyStudent = {
  regNo: "",
  name: "",
  gender: "",
  phone: "",
  faculty: "",
  course: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyStudent);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const registrationNumber = form.regNo.trim();

    if (
      students.some(
        (student) =>
          student.regNo.toLowerCase() ===
          registrationNumber.toLowerCase()
      )
    ) {
      setError("This student registration number already exists.");
      return;
    }

    setStudents((previous) => [
      ...previous,
      {
        ...form,
        regNo: registrationNumber,
        name: form.name.trim(),
        id: crypto.randomUUID(),
      },
    ]);

    setForm(emptyStudent);
    setError("");
  }

  function deleteStudent(id) {
    setStudents((previous) =>
      previous.filter((student) => student.id !== id)
    );
  }

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.regNo} ${student.course}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="players-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STUDENT RECORDS</p>
          <h1>Student Management</h1>
          <p className="muted">
            Register and manage student information.
          </p>
        </div>
      </div>

      <section className="players-panel">
        <div className="players-panel-heading">
          <div>
            <h3>Register Student</h3>
            <p>Enter the student's information below.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="player-form-grid">
            <label>
              Registration Number *
              <input
                name="regNo"
                value={form.regNo}
                onChange={handleChange}
                required
                maxLength={40}
                placeholder="Student registration number"
              />
            </label>

            <label>
              Full Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Student's full name"
              />
            </label>

            <label>
              Gender *
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={20}
                placeholder="Phone number"
              />
            </label>

            <label>
              Faculty / School *
              <input
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Faculty or school"
              />
            </label>

            <label>
              Course *
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="e.g. BSc Computer Science"
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-btn">
            Register Student
          </button>
        </form>
      </section>

      <section className="players-panel">
        <div className="players-panel-heading">
          <div>
            <h3>Registered Students</h3>
            <p>{filteredStudents.length} student(s)</p>
          </div>
        </div>

        <div className="player-toolbar">
          <div className="player-search">
            <input
              type="search"
              placeholder="Search name, registration number or course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table className="players-table">
            <thead>
              <tr>
                <th>REGISTRATION NO.</th>
                <th>STUDENT NAME</th>
                <th>GENDER</th>
                <th>FACULTY</th>
                <th>COURSE</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.regNo}</td>
                  <td>{student.name}</td>
                  <td>{student.gender}</td>
                  <td>{student.faculty}</td>
                  <td>{student.course}</td>
                  <td>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => deleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-table">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}