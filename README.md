# CivicTrack — Crowdsourced Civic Issue Reporting and Resolution System

A full-stack civic engagement platform that enables citizens to report local problems, track issue resolution, and collaborate with municipal authorities to build cleaner, safer, and more accountable communities.

**Repository:** [Crowdsourced Civic Issue Reporting and Resolution System](https://github.com/kir943/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Performance Testing with Apache JMeter](#performance-testing-with-apache-jmeter)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CivicTrack is a crowdsourced civic issue reporting and resolution system designed to connect citizens with municipal authorities through a centralized digital platform.

Citizens can report civic problems such as damaged roads, overflowing garbage bins, broken streetlights, water leakage, and other public infrastructure issues. They can submit issue details, attach supporting images, follow the progress of reported problems, and interact with other citizens through community engagement features.

Officers can manage assigned issues, update their status, and coordinate resolution activities. Administrators can oversee platform activity, manage users, and monitor system-wide statistics.

The application combines a React-based frontend with a Node.js and Express backend, using MongoDB for persistent data storage.

### Project Highlights

- Role-based access for citizens, officers, and administrators.
- Centralized civic issue reporting and tracking.
- Image upload support for issue evidence.
- Issue assignment and status management.
- Community engagement through upvotes and comments.
- Notifications and civic engagement points.
- Administrative analytics and management.
- Backend integration and automated end-to-end testing.
- Performance testing using Apache JMeter.

## Problem Statement

Traditional civic complaint processes can be fragmented, difficult to track, and lacking in transparency. Citizens may not know whether their complaints have been received, assigned, or resolved.

Municipal teams also need an organized way to prioritize incoming complaints, distribute work among officers, and monitor outstanding issues.

CivicTrack addresses these challenges by providing a centralized system where civic issues can be reported, managed, tracked, and analyzed.

## Objectives

1. **Simplify reporting:** Make it easier for citizens to submit civic complaints.
2. **Improve transparency:** Allow users to track issue progress.
3. **Enable accountability:** Support issue assignment and status updates by authorized personnel.
4. **Encourage participation:** Provide community engagement features such as upvotes, comments, and civic points.
5. **Improve administration:** Give administrators tools to manage users and review platform analytics.
6. **Ensure reliability:** Validate backend workflows through automated testing.
7. **Evaluate performance:** Measure API response times, throughput, and errors under simulated workloads.

## Key Features

### 1. Citizen Portal

Citizens can use the platform to participate in local issue reporting and resolution.

- Register and log in securely.
- Report new civic issues.
- Provide issue descriptions and relevant details.
- Upload supporting images.
- Browse and track reported issues.
- View issue status and progress.
- Upvote issues to indicate community interest.
- Comment on reported issues.
- Receive notifications.
- Participate in civic engagement and points-based features.

### 2. Officer Dashboard

The officer interface supports municipal issue handling and operational workflows.

- View assigned issues.
- Review issue details and supporting evidence.
- Track work orders and outstanding tasks.
- Update issue statuses where authorized.
- Support resolution workflows.
- Provide resolution evidence through image uploads where implemented.

The exact availability of individual dashboard actions depends on their frontend and backend integration.

### 3. Administrator Dashboard

The administrator interface provides centralized management capabilities.

- Manage platform users and roles.
- Oversee civic issue activity.
- Support officer and administrative workflows.
- Access dashboard statistics and analytics.
- Monitor issue distribution and resolution activity.

Administrative operations are protected by role-based authorization.

### 4. Issue Management

The backend supports core issue-management operations, including:

- Creating and retrieving issues.
- Accessing issue details.
- Managing issue-related comments and upvotes.
- Updating issue statuses.
- Supporting administrative assignment and workflow operations.
- Associating issues with their reporting users and relevant metadata.

### 5. Notifications and Civic Engagement

CivicTrack includes notification functionality and community engagement features.

- Retrieve user notifications.
- Support notification-related workflows.
- Track civic points and leaderboard-related information.
- Encourage participation in reporting and discussing civic problems.

### 6. Image Uploads

Users can attach images to support civic issue reports. The backend includes upload middleware for handling uploaded files.

Uploaded files are excluded from the Git repository by default to avoid committing generated or user-provided data.

---

## User Roles

| Role | Responsibilities |
|---|---|
| Citizen | Report issues, browse reports, upvote, comment, and track progress |
| Officer | Handle assigned issues and participate in authorized resolution workflows |
| Admin | Manage users, oversee issue workflows, and access administrative analytics |

Role-based access control determines which operations are available to each authenticated user.

---

## Technology Stack

### Frontend

- **React** — Component-based user interface.
- **TypeScript** — Type safety and maintainable application code.
- **Vite** — Development server and production build tooling.
- **React Router** — Client-side navigation.
- **Tailwind CSS** — Utility-first styling.

### Backend

- **Node.js** — JavaScript runtime.
- **Express.js** — REST API and HTTP request handling.
- **MongoDB** — NoSQL database.
- **Mongoose** — MongoDB object modeling.
- **JWT** — Token-based authentication.
- **Cookie-based authentication** — Browser session credential handling.
- **Multer or configured upload middleware** — File upload handling.

### Testing and Development Tools

- **Node.js test scripts** — Backend end-to-end testing.
- **Apache JMeter 5.6.3** — HTTP load and performance testing.
- **PowerShell** — Local development and test execution on Windows.
- **Git and GitHub** — Version control and source-code hosting.
- **VS Code** — Development environment.

---

## System Architecture

CivicTrack follows a frontend–backend–database architecture.

```text
┌─────────────────────────────────────┐
│             End Users               │
│       Citizen / Officer / Admin      │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          React + TypeScript         │
│       Vite / React Router           │
│            Port 5173                │
└──────────────────┬──────────────────┘
                   │ HTTP / REST API
                   ▼
┌─────────────────────────────────────┐
│          Node.js + Express          │
│             Port 5000               │
│                                     │
│  Routes → Middleware → Controllers  │
│                                     │
│  Authentication and Authorization   │
│  Issue and User Management          │
│  Notifications and Analytics        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          MongoDB + Mongoose         │
│                                     │
│  Users / Issues / Notifications     │
└─────────────────────────────────────┘
```

### Request Lifecycle

1. A user interacts with the React frontend.
2. The frontend sends an HTTP request to the backend API.
3. Express routes direct the request to the relevant controller.
4. Middleware performs applicable authentication, authorization, validation, or upload processing.
5. Controllers execute business logic and interact with MongoDB through Mongoose.
6. The backend returns a JSON response or an appropriate error.
7. The frontend updates the user interface using the response.

---

## Project Structure

The repository is organized into separate frontend and backend applications.

```text
Crowdsourced-Civic-Issue-Reporting-and-Resolution-System/
│
├── SE Project Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── backend/
│   ├── scripts/
│   │   └── seedUsers.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── issue.controller.js
│   │   │   └── notification.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   │
│   │   ├── models/
│   │   │   ├── Issue.js
│   │   │   ├── Notification.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── issue.routes.js
│   │   │   └── notification.routes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── AppError.js
│   │   │   └── asyncHandler.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── test-e2e.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── performance-tests/
│   └── CivicTrack_Load_Test.jmx
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*Note: The structure above documents the backend files added to the repository. Other frontend and testing files may exist beyond the abbreviated tree.*

---

## Prerequisites

Install the following software before running CivicTrack:

- Node.js and npm.
- MongoDB Community Server or an accessible MongoDB instance.
- Git.
- A modern web browser.
- VS Code or another code editor.

For performance testing, install Java and Apache JMeter.

Verify Node.js and npm:

```bash
node --version
npm --version
```

Verify Git:

```bash
git --version
```

For JMeter:

```bash
java -version
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kir943/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System.git
```

Move into the project directory:

```bash
cd Crowdsourced-Civic-Issue-Reporting-and-Resolution-System
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a local environment file by copying the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Open `backend/.env` and configure the values for your local environment.

### 3. Configure MongoDB

Ensure MongoDB is running locally or provide a valid MongoDB connection URI.

For a local development database, the example URI is:

```text
mongodb://127.0.0.1:27017/civictrack
```

The database connection is configured through `MONGODB_URI`.

### 4. Configure the Frontend

Open a second terminal:

```bash
cd "SE Project Frontend"
npm install
```

If the frontend requires an API base URL, configure it using the environment variable expected by the existing frontend code. For a Vite application, client-side environment variables generally use the `VITE_` prefix.

For example, if the frontend is configured to read `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not add a new environment variable unless the frontend actually reads it.

---

## Environment Configuration

The backend uses environment variables for configuration.

Create `backend/.env` using `backend/.env.example` as a template.

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/civictrack` |
| `JWT_SECRET` | Secret used for signing JWTs | A long, random secret |
| `JWT_EXPIRES_IN` | JWT expiry duration | `1d` |
| `COOKIE_NAME` | Authentication cookie name | `civictrack_token` |
| `SEED_DEMO_USERS` | Enable or disable demo-user seeding | `false` |
| `SEED_ADMIN_NAME` | Demo administrator name | `CivicTrack Admin` |
| `SEED_ADMIN_EMAIL` | Demo administrator email | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | Demo administrator password | Local-only placeholder |
| `SEED_OFFICER_NAME` | Demo officer name | `Demo Officer` |
| `SEED_OFFICER_EMAIL` | Demo officer email | `officer@example.com` |
| `SEED_OFFICER_PASSWORD` | Demo officer password | Local-only placeholder |

### Important Security Notes

- Never commit the actual `.env` file.
- Never use example passwords or placeholder secrets in production.
- Generate a strong, unique JWT secret for every deployed environment.
- Keep database credentials private.
- Do not enable demo-user seeding in production without reviewing its implementation.

---

## Running the Application

### Start the Backend

From the `backend` directory:

```bash
npm run dev
```

If the project does not define a `dev` script, use the script specified in `backend/package.json`. The server entry point is `src/server.js`.

The local API is expected to run at:

```text
http://localhost:5000
```

### Check Backend Health

Open the following URL in your browser:

```text
http://localhost:5000/api/health
```

A successful response indicates that the health endpoint is responding. Check the backend terminal for database connection errors as well.

### Start the Frontend

Open another terminal:

```bash
cd "SE Project Frontend"
npm run dev
```

Open the Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

### Build the Frontend for Production

```bash
npm run build
```

The production build is generated in the frontend's `dist/` directory.

A successful build verifies compilation and bundling; it does not by itself guarantee that every application workflow works correctly.

---

## API Documentation

The backend exposes REST API routes under the `/api` prefix.

The following table describes the main route groups and known endpoint examples. Consult the backend route files for the exact supported HTTP methods, request bodies, query parameters, and permissions.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the current authenticated user |
| POST | `/api/auth/logout` | Log out, if configured in the authentication routes |
| GET | `/api/issues` | Retrieve civic issues |
| POST | `/api/issues` | Create an issue, subject to route configuration |
| PATCH | `/api/issues/:id/status` | Update issue status, subject to authorization |
| GET | `/api/notifications` | Retrieve notifications |
| GET | `/api/admin/analytics` | Access administrative analytics |

The endpoint examples above are not a complete OpenAPI specification. Refer to `backend/src/routes/` and the corresponding controllers for the definitive implementation.

### Authentication

Authentication uses JWT-based credentials and a configured cookie name. Protected routes can use authentication middleware to identify the current user and enforce role-based access.

For browser requests involving cookies, the frontend and backend must be configured for compatible CORS and credential settings.

### Error Handling

The backend includes centralized error-handling middleware and utility functions for asynchronous route handlers. These help keep API error responses consistent and reduce repeated error-handling code.

---

## Database Design

CivicTrack uses MongoDB with Mongoose models.

### User

The user model represents platform accounts and supports identity and authorization-related information.

Typical responsibilities include:

- User identity and contact details.
- Authentication-related information.
- Role information for citizen, officer, and administrator access.
- Civic engagement information where implemented.

### Issue

The issue model represents a reported civic problem.

Typical responsibilities include:

- Issue description and associated metadata.
- Reporting user.
- Status and workflow information.
- Supporting image references.
- Engagement information, such as upvotes and comments, where implemented.

### Notification

The notification model represents notifications associated with users and platform activity.

It supports notification retrieval and related workflows.

*The precise schema fields, validation rules, and relationships are defined by the Mongoose models in `backend/src/models/`.*

---

## Testing and Quality Assurance

Testing is important to verify that the API behaves correctly across authentication, issue management, authorization, and administrative workflows.

### 1. Backend End-to-End Testing

The backend includes:

```text
backend/test-e2e.js
```

Install backend dependencies first:

```bash
cd backend
npm install
```

Run the test script:

```bash
node test-e2e.js
```

The test suite has been used to exercise workflows involving:

- Authentication and cookies.
- User and role-related behavior.
- Issue creation and retrieval.
- Civic points.
- Upvotes and comments.
- Administrative and officer workflows.
- Notifications, leaderboard, and analytics.
- Role-based access control.

**Previously recorded result:** 26 passed, 0 failed.

This is a result from a prior local test run, not a guarantee that every future run will pass. Ensure the backend, database, and required test configuration are available before executing the suite.

### 2. Frontend Production Build

From the frontend directory:

```bash
npm run build
```

The frontend build has previously completed successfully with TypeScript and Vite.

### 3. Manual Integration Testing

After starting both applications, verify:

1. Registration and login.
2. Authenticated user retrieval.
3. Issue creation and listing.
4. Image upload.
5. Issue engagement, including upvotes and comments.
6. Notifications.
7. Officer issue workflows.
8. Administrative access and analytics.
9. Unauthorized requests and invalid inputs.

---

## Performance Testing with Apache JMeter

Apache JMeter is used to simulate HTTP traffic and evaluate how the backend behaves under different request volumes.

The project includes a JMeter test plan:

```text
performance-tests/CivicTrack_Load_Test.jmx
```

A corrected version has also been created locally during test development:

```text
performance-tests/CivicTrack_Load_Test_Fixed.jmx
```

Use the version actually committed to the repository when running tests. If the corrected test plan is not present in the cloned repository, copy and commit it before referencing it as a repository artifact.

### Running JMeter

1. Start the backend and ensure the database is accessible.
2. Open Apache JMeter.
3. Load the relevant `.jmx` test plan.
4. Review the target host, port, authentication setup, and thread groups.
5. Confirm that test requests use the intended credentials and valid session or cookie configuration.
6. Run the test.
7. Inspect the Summary Report, Aggregate Report, and results file.

For repeatable command-line execution, use the JMeter executable or batch file:

```powershell
& "C:\path\to\apache-jmeter\bin\jmeter.bat" `
  -n `
  -t ".\performance-tests\CivicTrack_Load_Test.jmx" `
  -l ".\performance-tests\jmeter-results.jtl" `
  -e `
  -o ".\performance-tests\jmeter-report"
```

Replace the JMeter path with the installation path on your machine. Use a fresh output directory for each HTML report.

### Performance Metrics

| Metric | Meaning |
|---|---|
| Average response time | Mean duration of requests |
| Minimum response time | Fastest observed request |
| Maximum response time | Slowest observed request |
| Throughput | Requests processed per unit of time |
| Error rate | Percentage of failed requests |
| Percentiles | Response-time distribution, such as p90 or p95 |

### Interpreting Results

A high request count alone does not prove that an application performs well. Performance should be evaluated together with error rate, response-time percentiles, and the behavior of individual endpoints.

During earlier local testing, an initial JMeter run produced a high failure rate because some issue and notification requests returned HTTP 401. These results indicate an authentication or test-session configuration problem that should be resolved before treating the run as a valid capacity benchmark.

Use valid authenticated sessions for protected endpoints and distinguish expected authorization failures from genuine application errors.

Do not report a load test as successful merely because the test plan completed.

---

## Security

CivicTrack includes several security-related mechanisms.

- **Authentication:** JWT-based authentication with configured cookie handling.
- **Authorization:** Middleware for protected operations and role-based access.
- **Environment configuration:** Database and authentication secrets are supplied through environment variables.
- **Centralized errors:** Error-handling middleware helps standardize error processing.
- **Upload handling:** Dedicated middleware processes uploaded files.
- **Git exclusions:** `.env`, dependencies, logs, generated build output, and backend uploads are excluded by the configured ignore rules.

### Recommended Production Hardening

Before deploying publicly, review the following:

- Validate and sanitize all user-controlled input.
- Enforce strict authorization for issue assignment, status changes, and administrative actions.
- Validate file type, file size, and upload content.
- Add appropriate request rate limits.
- Use HTTPS and secure cookie settings in production.
- Configure restrictive CORS origins.
- Avoid exposing sensitive stack traces in production.
- Review password hashing and authentication token handling.
- Keep dependencies updated.
- Back up the database and define a data-retention policy.
- Review logs to ensure credentials and personal information are not exposed.

These are recommendations for production readiness; their implementation should be verified in the source code.

---

## Troubleshooting

### Backend cannot connect to MongoDB

- Ensure MongoDB is running.
- Verify `MONGODB_URI` in `backend/.env`.
- Check database connectivity and credentials.
- Inspect the backend terminal for connection errors.

### Port 5000 is already in use

Check which process is using the port before starting another backend instance:

```powershell
netstat -ano | findstr :5000
```

Stop or reuse the existing process as appropriate. Do not start duplicate servers on the same port.

### Frontend cannot reach the backend

- Confirm that the backend health endpoint responds.
- Verify the frontend API base URL.
- Check CORS configuration and browser developer tools.
- Ensure cookie-based requests use the required credentials configuration.

### Protected API requests return HTTP 401

- Verify that the user is logged in.
- Check whether the authentication cookie is sent.
- Verify frontend credential settings and backend CORS configuration.
- Confirm that the test uses a valid session or token.
- Do not disable authentication simply to make load tests pass.

### Frontend production build fails

Run:

```bash
npm install
npm run build
```

Review TypeScript errors and missing dependencies reported by the build output.

### Git reports `.env` or upload files

Check the applicable ignore rules:

```powershell
git check-ignore backend/.env backend/uploads/*
```

If a secret has already been committed, removing the file in a later commit does not remove the secret from Git history. Rotate the exposed credential and follow the appropriate history-cleanup procedure.

---

## Future Enhancements

Potential future improvements include:

- Interactive maps and geospatial issue visualization.
- Geographic-based issue assignment.
- Advanced issue prioritization.
- Analytics dashboards with historical trends.
- Email or push notifications.
- Resolution-proof review workflows.
- Improved mobile responsiveness and accessibility.
- More extensive automated frontend and integration tests.
- API documentation using OpenAPI/Swagger.
- Continuous integration for builds and tests.
- Production deployment with monitoring and structured logging.
- More comprehensive load tests with authenticated users and realistic traffic patterns.

These items are proposed enhancements and should not be interpreted as already implemented features.

---

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Run the relevant tests and frontend build.
5. Review the changes for secrets, generated files, and unintended modifications.
6. Commit your changes with a descriptive message.
7. Open a pull request explaining the problem and proposed solution.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Avoid committing `.env` files, `node_modules`, generated reports, or uploaded user data.

---

## License

No license has been specified in this README. Add an appropriate `LICENSE` file and update this section before distributing the project under an open-source license.

---

## Acknowledgements

CivicTrack is developed as a software engineering project focused on improving civic participation, complaint tracking, and municipal accountability through a centralized digital platform.

**Project:** Crowdsourced Civic Issue Reporting and Resolution System  
**Repository:** [GitHub](https://github.com/kir943/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System)
