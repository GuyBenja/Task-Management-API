# Task Management System

A simple Node.js application for managing tasks with user authentication, built with Express, MongoDB, and JWT.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [User Registration (POST /auth/register)](#user-registration-post-authregister)
  - [User Login (POST /auth/login)](#user-login-post-authlogin)
  - [Create a new task (POST /tasks/new)](#create-a-new-task-post-tasksnew)
  - [Get the health of the server (GET /tasks/health)](#get-the-health-of-the-server-get-taskshealth)
  - [Get the total number of tasks (GET /tasks/size)](#get-the-total-number-of-tasks-get-taskssize)
  - [Get task content (GET /tasks/content)](#get-task-content-get-taskscontent)
  - [Update task status (PUT /tasks/status)](#update-task-status-put-taskstatus)
  - [Update task priority (PUT /tasks/priority)](#update-task-priority-put-taskpriority)
  - [Delete a task (DELETE /tasks)](#delete-a-task-delete-tasks)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and login with JWT authentication.
- Create, update, delete, and retrieve tasks.
- Store tasks in-memory (non-persistent) for simplicity.
- Middleware for request timing.
- Environment variable configuration using dotenv.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.
- MongoDB server running for persistent storage.

### Installation

1. Clone the repository:

     ```bash
     git clone https://github.com/yourusername/task-management.git
     ```

2. Navigate to the project directory:

     ```bash
     cd task-management
     ```

3. Install the dependencies:

     ```bash
     npm install
     ```

4. Create a `.env` file in the project root and configure your environment variables. Example:

     ```env
     PORT=3101
     MONGODB_CONNECTION_STRING=mongodb://localhost/taskdb
     JWT_SECRET=mysecretkey
     ```

5. Run the server:

     ```bash
     npm start
     ```

### API Endpoints

#### User Registration (POST /auth/register)

Request Example (POST):
```json
POST /auth/register
Content-Type: application/json
{
  "username": "guy",
  "password": "12345678"
}

Response Example (Success - Status 201 Created):
Status: 201 Created
{
  "message": "User guy registered successfully"
}

Response Example (Error - Status 400 Bad Request):
Status: 400 Bad Request
{
  "errorMessage": "Invalid username or password"
}

User Login (POST /auth/login)

Request Example (POST):
POST /auth/login
Content-Type: application/json
{
  "username": "guy",
  "password": "12345678"
}

Response Example (Success - Status 200 OK):
Status: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}

Response Example (Error - Status 401 Unauthorized):
Status: 401 Unauthorized
{
  "errorMessage": "Invalid username or password"
}

Create a new task (POST /tasks/new)

Request Example (POST):
POST /tasks/new
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIsIn...
{
  "title": "New Task",
  "content": "This is a new task",
  "dueDate": "2023-12-31",
  "priority": "HIGH"
}

Response Example (Success - Status 201 Created):
Status: 201 Created
{
  "message": "Task with id: [1] and title: [New Task] has been created"
}

Response Example (Error - Status 400 Bad Request):
Status: 400 Bad Request
{
  "errorMessage": "Invalid Details"
}

Get the health of the server (GET /tasks/health)

Request Example (GET):
GET /tasks/health

Response Example (Success - Status 200 OK):
Status: 200 OK
"Welcome, the server is up and running"

Get the total number of tasks (GET /tasks/size)

Request Example (GET):
GET /tasks/size?status=PENDING

Response Example (Success - Status 200 OK):
Status: 200 OK
{
  "message": "The number of tasks left with status: [PENDING] is: [3]"
}

Response Example (Error - Status 400 Bad Request):
Status: 400 Bad Request
{
  "errorMessage": "Error: Invalid status parameter"
}

Get task content (GET /tasks/content)

Request Example (GET):
GET /tasks/content?status=ALL&sortBy=dueDate

Response Example (Success - Status 200 OK):
Status: 200 OK
[
  {
    "id": 1,
    "title": "New Task",
    "content": "This is a new task",
    "dueDate": "2023-12-31",
    "priority": "HIGH",
    "status": "PENDING"
  },
  // ... (other tasks)
]

Response Example (Error - Status 400 Bad Request):
Status: 400 Bad Request
{
  "errorMessage": "Error: Invalid status or sortBy parameter"
}

Update task status (PUT /tasks/status)

Request Example (PUT):
PUT /tasks/status?id=1&status=DONE

Response Example (Success - Status 200 OK):
Status: 200 OK
{
  "message": "Task with id: [1] has been changed to status: [DONE]"
}

Response Example (Error - Status 404 Not Found):
Status: 404 Not Found
{
  "errorMessage": "Error: No such task with id 1"
}

Update task priority (PUT /tasks/priority)

Request Example (PUT):
PUT /tasks/priority?id=1&priority=MID

Response Example (Success - Status 200 OK):
Status: 200 OK
{
  "message": "Task with id: [1] has been changed to priority: [MID]"
}

Response Example (Error - Status 404 Not Found):
Status: 404 Not Found
{
  "errorMessage": "Error: No such task with id 1"
}

Delete a task (DELETE /tasks)

Request Example (DELETE):
DELETE /tasks?id=1

Response Example (Success - Status 200 OK):
Status: 200 OK
{
  "message": "Task with id: [1] has been deleted, there are [2] tasks left"
}

Response Example (Error - Status 404 Not Found):
Status: 404 Not Found
{
  "errorMessage": "Error: No such task with id 1"
}
...
