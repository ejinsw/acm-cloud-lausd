# Frontend - ACM Cloud LAUSD

The frontend is built with Next.js, TypeScript, and Mantine UI.

## Development

### Prerequisites
- Node.js 20 or later
- Docker Desktop (for containerized development)

### Local Development with Docker

1. **Start the Development Environment**
   ```bash
   docker-compose up --build
   ```
   The frontend will be available at http://localhost:3000

2. **Hot Reloading**
   - Changes to the code will automatically reload the page
   - No need to restart the container

### Local Development without Docker

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app/` - Next.js App Router pages
  - `(auth)/` - Authentication pages
  - `(dashboard)/` - Protected dashboard pages
  - `(student)/` - Student-specific pages
  - `(instructor)/` - Instructor-specific pages
- `src/components/` - Reusable React components
  - `auth/` - Authentication components
  - `dashboard/` - Dashboard components
  - `sessions/` - Session-related components
  - `instructors/` - Instructor-related components
- `src/lib/` - Utility functions and shared code
  - `api/` - API client and endpoints
  - `auth/` - Authentication utilities
  - `utils/` - Helper functions
- `public/` - Static assets

## Technologies Used

- Next.js 14
- TypeScript
- Mantine UI
- Tailwind CSS
- ESLint for code linting

## Deployment

The frontend can be deployed to Vercel or any other static hosting platform.

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Deploy automatically on push to main branch

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## AWS Deployment

### Prerequisites
1. AWS Account with Access Portal access
2. AWS CLI installed
3. AWS Amplify CLI installed:
   ```bash
   npm install -g @aws-amplify/cli
   ```

### AWS Access Portal Setup
1. **Access AWS Console**
   - Log in to your organization's AWS Access Portal
   - Select the appropriate AWS account and role
   - Ensure you have the necessary permissions for:
     - AWS Amplify
     - S3
     - CloudFront
     - IAM

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

### AWS Amplify Setup
1. **Initialize Amplify Project**
   ```bash
   amplify init
   ```
   Select options:
   - Environment: dev
   - Default editor: your preferred editor
   - App type: javascript
   - Framework: react
   - Source directory: src
   - Distribution directory: .next
   - Build command: npm run build
   - Start command: npm run start

2. **Add Hosting**
   ```bash
   amplify add hosting
   ```
   Select:
   - Hosting with Amplify Console
   - Manual deployment

3. **Configure Environment Variables**
   ```bash
   amplify env add
   ```
   Add your environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url
   NEXT_PUBLIC_WS_URL=wss://your-websocket-url
   ```

### Deployment
1. **Build and Deploy**
   ```bash
   amplify publish
   ```

2. **Set Up Custom Domain (Optional)**
   - Go to AWS Amplify Console
   - Select your app
   - Click "Domain management"
   - Add your custom domain
   - Follow DNS configuration instructions

### CI/CD Setup
1. **Connect GitHub Repository**
   - Go to AWS Amplify Console
   - Click "New app" > "Host web app"
   - Select GitHub as source
   - Choose repository and branch

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add environment variables in Amplify Console
   - Set up different environments (dev, staging, prod)

### Monitoring
1. **View Build Logs**
   - Go to AWS Amplify Console
   - Select your app
   - Click "Builds" tab

2. **View Application Logs**
   - Go to CloudWatch Console
   - Select your app's log group
