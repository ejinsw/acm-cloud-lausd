# Backend API - ACM Cloud LAUSD

The backend is built with Express, TypeScript, and PostgreSQL using Prisma ORM.

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

## Development

### Prerequisites
- Node.js 20 or later
- Docker Desktop (for containerized development)
- PostgreSQL (for local development without Docker)

### Local Development with Docker

1. **Start the Development Environment**
   ```bash
   docker-compose up --build
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
1. AWS Account with Access Portal access
2. AWS CLI installed
3. Serverless Framework installed globally:
   ```bash
   npm install -g serverless
   ```

### AWS Access Portal Setup
1. **Access AWS Console**
   - Log in to your organization's AWS Access Portal
   - Select the appropriate AWS account and role
   - Ensure you have the necessary permissions for:
     - Lambda functions
     - API Gateway
     - Systems Manager Parameter Store
     - CloudWatch Logs

2. **Configure AWS CLI with SSO**
   ```bash
   aws configure sso
   ```
   Follow the prompts to:
   - Enter SSO start URL (provided by your organization)
   - Select AWS account
   - Select role
   - Set default region (e.g., us-west-2)
   - Set default output format (json)

3. **Verify SSO Configuration**
   ```bash
   aws sts get-caller-identity
   ```

### Serverless Framework Configuration
1. **Install Serverless Framework**
   ```bash
   npm install -D serverless serverless-offline
   ```

2. **Create serverless.yml**
   ```yaml
   service: acm-cloud-lausd-api

   provider:
     name: aws
     runtime: nodejs20.x
     region: us-west-2
     environment:
       NODE_ENV: production
       DATABASE_URL: ${ssm:/acm-cloud-lausd/DATABASE_URL}
       JWT_SECRET: ${ssm:/acm-cloud-lausd/JWT_SECRET}
       JWT_REFRESH_SECRET: ${ssm:/acm-cloud-lausd/JWT_REFRESH_SECRET}

   functions:
     api:
       handler: src/handler.handler
       events:
         - http:
             path: /{proxy+}
             method: any
             cors: true

   plugins:
     - serverless-offline
     - serverless-prisma-plugin

   custom:
     prisma:
       stages:
         - production
   ```

3. **Set Up AWS Parameter Store**
   ```bash
   # Store database URL
   aws ssm put-parameter \
     --name "/acm-cloud-lausd/DATABASE_URL" \
     --value "postgresql://user:password@host:5432/dbname" \
     --type SecureString

   # Store JWT secrets
   aws ssm put-parameter \
     --name "/acm-cloud-lausd/JWT_SECRET" \
     --value "your-jwt-secret" \
     --type SecureString

   aws ssm put-parameter \
     --name "/acm-cloud-lausd/JWT_REFRESH_SECRET" \
     --value "your-refresh-secret" \
     --type SecureString
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

### Post-Deployment
1. **Set Up Custom Domain (Optional)**
   ```bash
   serverless create_domain
   ```

2. **Configure CORS**
   - Update `serverless.yml` with your frontend domain
   ```yaml
   cors:
     origins:
       - https://your-frontend-domain.com
     headers:
       - Content-Type
       - Authorization
   ```

3. **Monitor Logs**
   ```bash
   serverless logs -f api
   ```

## Environment Variables

Create a `.env`