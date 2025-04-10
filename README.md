# ACM Cloud LAUSD

A tutoring platform for LAUSD students, built with Next.js, Express, and PostgreSQL.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/downloads)

## Local Development Setup

1. **Install Docker Desktop**
   - Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Start Docker Desktop and wait for it to be running

2. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/acm-cloud-lausd.git
   cd acm-cloud-lausd
   ```

3. **Start the Development Environment**
   ```bash
   docker-compose up --build
   ```
   This will start:
   - Frontend (Next.js) on http://localhost:3000
   - Backend (Express) on http://localhost:8080
   - PostgreSQL database on port 5432

4. **Run Database Migrations**
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

## Project Structure

- `frontend/` - Next.js application
  - Built with TypeScript
  - Uses Mantine UI components
  - Hot reloading enabled in development

- `backend/` - Express API server
  - TypeScript with Express
  - PostgreSQL with Prisma ORM
  - Hot reloading with nodemon

## Development Workflow

1. **Frontend Development**
   - Changes to frontend code will automatically hot reload
   - Access the frontend at http://localhost:3000

2. **Backend Development**
   - Changes to backend code will automatically hot reload
   - API endpoints available at http://localhost:8080
   - Database migrations handled through Prisma

3. **Database Management**
   - Use Prisma Studio for database management:
   ```bash
   docker-compose exec backend npx prisma studio
   ```
   - Access at http://localhost:5555

## Deployment

For deployment instructions, see:
- [Frontend Deployment](./frontend/README.md#deployment)
- [Backend Deployment](./backend/api/README.md#deployment)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request