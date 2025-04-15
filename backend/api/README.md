# Backend API - ACM Cloud LAUSD

The backend is built with Express, TypeScript, and PostgreSQL using Prisma ORM.

## Development

### Prerequisites
- Node.js 20 or later
- Docker Desktop (for containerized development)
- PostgreSQL (for local development without Docker)

### Local Development with Docker

1. **Start the Development Environment**
   ```bash
   docker-compose up
   ```
   The API will be available at http://localhost:8080

2. **Hot Reloading**
   - Changes to the code will automatically reload the server
   - No need to restart the container

### Local Development without Docker

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   - Create a PostgreSQL database
   - Update `.env` with your database URL

3. **Run Migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `src/` - Source code
  - `app.ts` - Main Express application
  - `routes/` - API routes
  - `controllers/` - Route controllers
  - `models/` - Data models
  - `middleware/` - Express middleware
- `prisma/` - Database schema and migrations

## Technologies Used

- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Serverless Framework (for deployment)

## Database Management

1. **Prisma Studio**
   ```bash
   npx prisma studio
   ```
   Access at http://localhost:5555

2. **Migrations**
   ```bash
   # Create new migration
   npx prisma migrate dev --name migration_name

   # Apply migrations
   npx prisma migrate deploy
   ```

## AWS Configuration

### Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI installed
3. Serverless Framework installed globally:
   ```bash
   npm install -g serverless
   ```

### AWS Credentials Setup

1. **Configure AWS CLI**
   ```bash
   aws configure
   ```
   When prompted, enter:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-west-1`
   - Default output format: `json`

2. **Verify Configuration**
   ```bash
   # Check your identity
   aws sts get-caller-identity
   ```

### Deployment
1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to AWS**
   ```bash
   serverless deploy
   ```

3. **Verify Deployment**
   ```bash
   serverless info
   ```

### Troubleshooting AWS Credentials

1. **Invalid Credentials**
   - Verify your credentials in AWS Console:
     - Go to IAM → Users → Your User → Security credentials
     - Create new access key if needed
   - Update your local credentials:
     ```bash
     aws configure
     ```

2. **Permission Issues**
   - Ensure your IAM user has these permissions:
     - AWSLambda_FullAccess
     - IAMFullAccess
     - AmazonAPIGatewayAdministrator
     - CloudFormationFullAccess
     - AmazonS3FullAccess

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
  - Body: `{ email, password, firstName, lastName, role }`
  - Returns: JWT token and user info

- `POST /auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: JWT token and user info

- `POST /auth/refresh` - Refresh JWT token
  - Headers: `Authorization: Bearer <refresh_token>`
  - Returns: New JWT token

### Users
- `GET /users/me` - Get current user profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile

- `PUT /users/me` - Update current user profile
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ firstName, lastName, email }`
  - Returns: Updated user profile

### Students
- `GET /students` - List all students
  - Query params: `page, limit, search`
  - Returns: Paginated list of students

- `GET /students/:id` - Get student by ID
  - Returns: Student details

- `POST /students` - Create new student
  - Body: `{ userId, grade, school, subjects }`
  - Returns: Created student

- `PUT /students/:id` - Update student
  - Body: `{ grade, school, subjects }`
  - Returns: Updated student

### Instructors
- `GET /instructors` - List all instructors
  - Query params: `page, limit, search, subjects`
  - Returns: Paginated list of instructors

- `GET /instructors/:id` - Get instructor by ID
  - Returns: Instructor details

- `POST /instructors` - Create new instructor
  - Body: `{ userId, subjects, bio, certifications }`
  - Returns: Created instructor

- `PUT /instructors/:id` - Update instructor
  - Body: `{ subjects, bio, certifications }`
  - Returns: Updated instructor

### Sessions
- `GET /sessions` - List all sessions
  - Query params: `page, limit, instructorId, studentId, status`
  - Returns: Paginated list of sessions

- `GET /sessions/:id` - Get session by ID
  - Returns: Session details

- `POST /sessions` - Create new session
  - Body: `{ instructorId, subject, startTime, endTime, maxStudents }`
  - Returns: Created session

- `PUT /sessions/:id` - Update session
  - Body: `{ subject, startTime, endTime, maxStudents, status }`
  - Returns: Updated session

- `POST /sessions/:id/join` - Join a session
  - Body: `{ studentId }`
  - Returns: Updated session

### Reviews
- `GET /reviews` - List all reviews
  - Query params: `page, limit, instructorId, studentId`
  - Returns: Paginated list of reviews

- `POST /reviews` - Create new review
  - Body: `{ sessionId, rating, comment }`
  - Returns: Created review
