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

- `POST /api/auth/signup` - Register a new user

  - Body: `{ email, password, firstName, lastName, role, street, apartment, city, state, zip, country, schoolName, birthdate, grade (optional), subjects (optional), parentEmail (optional) }`
  - Returns: `{ message, userSub }` or error

- `POST /api/auth/login` - Login user

  - Body: `{ email, password }`
  - Returns: `{ email, idToken, accessToken, refreshToken }` or error

- `POST /api/auth/verify-email` - Verify user's email

  - Body: `{ code, email }`
  - Returns: `{ message }` or error

- `POST /api/auth/resend-verification` - Resend email verification code

  - Body: `{ email }`
  - Returns: `{ message, deliveryMedium, destination }` or error

- `GET /api/auth/me` - Get user data from database

  - Headers: `Authorization: Bearer <token>`
  - Returns: User data (TODO: implementation)

- `POST /api/auth/logout` - Logout user from Cognito

  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ message }` or error

- `GET /api/auth/tokens` - Get all active tokens for a user from Cognito

  - Headers: `Authorization: Bearer <token>`
  - Returns: (TODO: implementation)

- `POST /api/auth/refresh-token` - Refresh access token using a refresh token

  - Body: `{ refreshToken }`
  - Returns: `{ accessToken, idToken, expiresIn, tokenType }` or error

- `POST /api/auth/forgot-password` - Initiate forgot password flow (send reset code to email)

  - Body: `{ email }`
  - Returns: `{ message }` or error

- `POST /api/auth/reset-password` - Reset password using code sent to email
  - Body: `{ email, code, newPassword }`
  - Returns: `{ message }` or error

### Users

- `GET /instructors` - List all instructors

  - Query params: `name, subjects`
  - Returns: List of instructors

- `GET /instructors/:id` - Get instructor by ID

  - Returns: Instructor details

- `GET /users/profile` - Get current user profile

  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile

- `PUT /users/profile` - Update current user profile

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ street, apartment, city, state, zip, country, profilePicture, bio }`
    -INSTRUCTOR ONLY: `{firstName, lastName, birthdate, education, experience, certificationUrls ,subjects,}`
    -STUDENT ONLY: `{grade, parentFirstName, parentLastName, parentEmail, parentPhone, interests,learningGoals }`
  - Returns: Updated user profile

- `DELETE /users/profile` - Delete current user profile

  - Headers: `Authorization: Bearer <token>`
  - Returns: "User Deleted Successfully"

- `GET /users/students` - Instructor ONLY - gets all students that instructor has sessions with

  - Headers: `Authorization: Bearer <token>`
  - Returns: List of Students

- `GET /users/instructors` - Student ONLY - gets all instructors that student has sessions with

  - Headers: `Authorization: Bearer <token>`
  - Returns: List of Instructors

- `GET /users/sessions` - Get current user's sessions
- Headers: `Authorization: Bearer <token>`
- Returns: List of sessions

- `GET /users/reviews` - Get current user reviews
  - Headers: `Authorization: Bearer <token>`
  - Returns: List of Reviews

### Sessions

- `GET /sessions` - List all sessions

  - Query params: `tutorName, name, subject`
  - Headers: `Authorization: Bearer <token>`
  - Returns: List of sessions

- `GET /sessions/:id` - Get session by ID

  - Headers: `Authorization: Bearer <token>`
  - Returns: Session details

- `POST /sessions` - Create new session

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, description, startTime, endTime, zoomLink, maxAttendees, materials, objectives, subjects }`
  - Returns: Created session

- `PUT /sessions/:id` - Update session

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, description, startTime, endTime, zoomLink, maxAttendees, materials, objectives, subjects }`
  - Returns: Updated session

- `DELETE /sessions/:id` - Delete session

  - Headers: `Authorization: Bearer <token>`
  - Returns: "Session deleted successfully"

- `POST /sessions/:id/join` - Join a session

  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated session

- `POST /sessions/:id/leave` - Leave a session
  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated session

### StudentQueues

- `POST /sessions` - Create new session

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, description, startTime, endTime, zoomLink, maxAttendees, materials, objectives, subjects }`
  - Returns: Created session

- `PUT /queue/:id/accept` - Instructor accept a queue

  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated Queue

- `PUT /queue/:id/description` - Student Updates Queue Description

  - Headers: `Authorization: Bearer <token>`
  - Body: `{description}`
  - Returns: Updated Queue

- `DELETE /queue/:id` - Delete session

  - Headers: `Authorization: Bearer <token>`
  - Returns: "Queue deleted successfully"

### Reviews

- `GET /reviews` - List all reviews

  - Headers: `Authorization: Bearer <token>`
  - Query params: `studentId, instructorId`
  - Returns: List of reviews

- `GET /reviews/:id` - Get review by ID

  - Headers: `Authorization: Bearer <token>`
  - Returns: Review details

- `POST /reviews` - Create new review

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rating, comment, instructorId }`
  - Returns: Created review

- `PUT /reviews/:id` - Update review

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rating, comment }`
  - Returns: Updated review

- `DELETE /reviews/:id` - Delete review

  - Headers: `Authorization: Bearer <token>`
  - Returns: "Review deleted successfully"
