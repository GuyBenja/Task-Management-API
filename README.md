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
  "username": "john_doe",
  "password": "securepassword"
}