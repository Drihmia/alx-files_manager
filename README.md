# 📁✨ Files Manager - Project 0x04

Welcome to the **Files Manager** project, a comprehensive and advanced task that ties together all we've learned in this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination, and background processing. Let's build an amazing file upload and view platform!

### 🎯 Project Objectives
- **User Authentication** via a token
- **File Listing**: List all files
- **File Upload**: Upload a new file
- **Permission Management**: Change permission of a file
- **File Viewing**: View a file
- **Thumbnail Generation**: Generate thumbnails for images

### 👥 Team
- **Redouane Drihmia**

### 📅 Project Timeline
- **Start Date**: August 1, 2024, 4:00 AM
- **End Date**: August 8, 2024, 4:00 AM
- **Checker Release**: August 2, 2024, 10:00 PM

### 🚀 Project Summary
This project encapsulates everything we've learned in back-end development so far. We will build a functional platform with user authentication, file management, and image processing capabilities.

### 📚 Resources
- [Node JS getting started](https://nodejs.org/en/docs/guides/getting-started-guide/)
- [Process API doc](https://nodejs.org/dist/latest-v12.x/docs/api/process.html)
- [Express getting started](https://expressjs.com/en/starter/installing.html)
- [Mocha documentation](https://mochajs.org/)
- [Nodemon documentation](https://nodemon.io/)
- [MongoDB](https://docs.mongodb.com/)
- [Bull](https://optimalbits.github.io/bull/)
- [Image thumbnail](https://www.npmjs.com/package/image-thumbnail)
- [Mime-Types](https://www.npmjs.com/package/mime-types)
- [Redis](https://redis.io/documentation)

### 🧠 Learning Objectives
By the end of this project, we will:
- Create an API with Express
- Authenticate a user
- Store data in MongoDB
- Store temporary data in Redis
- Set up and use a background worker

### 🛠️ Requirements
- **Node.js Version**: 12.x.x
- **Linting**: ESLint
- **OS**: Ubuntu 18.04 LTS

### 📝 Provided Files
- **package.json**
- **.eslintrc.js**
- **babel.config.js**

### 💻 Installation
To set up your project, run:
```bash
$ npm install
```

### 📜 Tasks Overview
- **1. Redis utils**

    File: utils/redis.js
    Description: Create RedisClient class with methods to interact with Redis.

- **2. MongoDB utils**

    File: utils/db.js
    Description: Create DBClient class to handle MongoDB interactions.

- **3. First API**

    Files: server.js, routes/index.js, controllers/AppController.js
    Description: Set up an Express server with basic status and stats endpoints.

- **4. Create a new user**

    Files: routes/index.js, controllers/UsersController.js
    Description: Endpoint to create new users, including validation and password hashing.

- **5. Authenticate a user**

    Files: routes/index.js, controllers/AuthController.js
    Description: Implement user authentication and session management.

- **6. First file**

    Files: routes/index.js, controllers/FilesController.js
    Description: Endpoint to handle file uploads, validation, and storage.

### 🌟 Usage Examples

**Connect and Authenticate a User**

```bash

$ curl -X GET 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE="
```

**Create a New File**

```bash

$ curl -X POST 0.0.0.0:5000/files -H "X-Token: your_token" -H "Content-Type: application/json" -d '{ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }'
```

### 🔍 Testing

**Run tests using Mocha:**

```bash

$ npm run test
```

### 📂 Repository

GitHub Repository: alx-files_manager
