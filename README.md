# Games Management Information System (KGMIS)

A classroom full-stack web application project for managing the university
sports activities. The project is developed collaboratively by student groups as one integrated system.

## Technology Stack

-   **Frontend:** React, Vite, React Router, Lucide React
-   **Backend:** Node.js, Express.js
-   **Database:** PostgreSQL
-   **API communication:** REST endpoints using JSON

## Project Structure

``` text
kgmis/
├── frontend/        # React + Vite user interface
└── backend/         # Express REST API and PostgreSQL connection
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── .env    
    └── .gitignore
```

## Main System Modules

The intended system contains five connected modules:

1.  **Student and Player Management** --- register and manage
    student/player records.
2.  **Teams and Coaches** --- manage teams, coaches, and player
    assignments.
3.  **Fixtures and Results** --- schedule games and record results.
4.  **Events and Attendance** --- manage sports events and attendance.
5.  **Administration and Reporting** --- administration functions and
    system reports.

The current working reference module is Player Management. It supports
loading and registering player records through the backend API.
Database-backed editing is a planned next step.

## Requirements

Install the following on your computer:

-   Node.js and npm
-   PostgreSQL
-   Git
-   A code editor such as Visual Studio Code

Check your installations in a terminal:

``` powershell
node --version
npm --version
psql --version
git --version
```

## 1. Clone the Repository

``` bash
git clone https://github.com/Waimonde/kgmis.git
cd kgmis
```

## 2. Set Up the PostgreSQL Database

Connect to PostgreSQL:

``` powershell
psql -U postgres -h 127.0.0.1 -d postgres
```

Create the database:

``` sql
CREATE DATABASE kgmis_db;
```

Exit the PostgreSQL prompt:

``` text
\q
```

Connect to the new database:

``` powershell
psql -U postgres -h 127.0.0.1 -d kgmis_db
```

Create the `players` table:

``` sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(40) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    gender VARCHAR(30) NOT NULL,
    phone VARCHAR(20),
    faculty VARCHAR(120) NOT NULL,
    sport VARCHAR(60) NOT NULL,
    position VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Verify the table:

``` text
\dt
```

Exit PostgreSQL:

``` text
\q
```

> If the database or table already exists, do not create it again. Check
> the existing database and table first.

## 3. Configure the Backend

Open a terminal in the backend folder:

``` powershell
cd backend
npm install
```

Create a local `.env` file in the `backend` folder. **Do not upload this
file to GitHub.**

Example `.env`:

``` dotenv
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=kgmis_db
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_POSTGRES_PASSWORD
```

Replace `YOUR_LOCAL_POSTGRES_PASSWORD` with the password for your local
PostgreSQL account. Keep it private.

Make sure `backend/.gitignore` includes:

``` gitignore
node_modules/
.env
```

Start the backend:

``` powershell
npm run dev
```

If the `dev` script is not configured, try:

``` powershell
npm start
```

The API should run at `http://localhost:5000`.

### Backend Test Endpoints

Open these URLs in a browser:

-   `http://localhost:5000/` --- confirms the API is running.
-   `http://localhost:5000/api/health` --- checks the PostgreSQL
    connection.
-   `http://localhost:5000/api/players` --- returns player records as
    JSON. An empty list (`[]`) is normal before any players are
    registered.

## 4. Set Up the Frontend

Open a second terminal from the repository root:

``` powershell
cd frontend
npm install
npm run dev
```

Vite will print a local development URL, usually
`http://localhost:5173`. Open the URL shown in your terminal.

Keep both the frontend and backend terminals running while using the
application.

## Player API Endpoints

  Method   Endpoint         Purpose
  -------- ---------------- -------------------------------------
  `GET`    `/api/health`    Check API and database connectivity
  `GET`    `/api/players`   Retrieve player records
  `POST`   `/api/players`   Register a player

### Example Player Registration Request

Send a JSON request to `POST http://localhost:5000/api/players`:

``` json
{
  "registration_number": "TEST001",
  "full_name": "Demo Player",
  "gender": "Other",
  "phone": "",
  "faculty": "Science & Technology",
  "sport": "Football",
  "position": "Midfielder",
  "status": "Active"
}
```

Use fictional test data during classroom exercises. The registration
number must be unique.

## Group Development Approach

Student groups contribute to the same integrated application:

-   **Group 1:** Student and Player Management
-   **Group 2:** Teams and Coaches
-   **Group 3:** Fixtures and Results
-   **Group 4:** Events and Attendance
-   **Group 5:** Administration and Reporting

Groups should agree on database relationships, API conventions, and
integration responsibilities before adding their modules. Use feature
branches and pull requests when collaborating through GitHub.

## Troubleshooting

-   **`psql` is not recognized:** Confirm PostgreSQL is installed and
    its command-line tools are available in your PATH.
-   **Password authentication failed:** Check the local backend `.env`
    values and the PostgreSQL password.
-   **Database connection failed:** Confirm the PostgreSQL service is
    running and the database name, port, username, and password are
    correct.
-   **`/api/players` returns `[]`:** This is expected when no player
    records have been registered.
-   **Frontend cannot reach the API:** Confirm the backend is running at
    port `5000` and check browser developer tools for network errors.
-   **Duplicate registration number:** Register a different unique
    number.

## Security Notes

-   Never commit `.env`, passwords, API keys, database dumps containing
    sensitive data, or real student information.
-   Keep `node_modules` and generated build output out of version
    control.
-   Use fictional data for demonstrations.
-   Add authentication, authorization, stronger validation, backups, and
    institutional privacy safeguards before using the application with
    real university records.
-   Do not leave PostgreSQL configured with `trust` authentication. Use
    appropriate password authentication for local database connections.

## Project Status

KGMIS is being developed as a practical learning project. Player listing
and registration are connected to PostgreSQL through the Express API.
Other modules and additional features are to be implemented and
integrated by the development groups.

## Contribution Workflow

1.  Clone the repository.
2.  Create a feature branch for your task.
3.  Implement and test the change locally.
4.  Commit with a descriptive message.
5.  Push the branch and open a pull request for review.

Example:

``` bash
git checkout -b feature/teams-and-coaches
git add .
git commit -m "Add teams and coaches module"
git push -u origin feature/teams-and-coaches
```

------------------------------------------------------------------------

**KeMU Games Management Information System (KGMIS)**\
Educational full-stack development project.
