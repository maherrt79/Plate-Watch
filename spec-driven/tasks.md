**\# Implementation Plan**

This implementation plan breaks down the Plate-Watch system into discrete, actionable coding tasks. Each task builds incrementally on previous tasks and references specific requirements from the requirements document.

**\#\# Implementation Order**

The tasks are organized to enable parallel development where possible:  
\- **Tasks 1-6**: Cloud Backend (can start immediately)  
\- **Tasks 7-12**: Edge Device (can start after Task 1 is complete for API contract)  
\- **Tasks 13-18**: Web Application (can start after Tasks 1-6 are complete)  
\- **Tasks 19-21**: Deployment (requires all components complete)  
\- **Task 22**: Documentation (ongoing throughout)

**## Task List**

### Phase 1: Local Development Foundation

- [x] **L1. Local Environment Setup**
  - [x] L1.1 Create `docker-compose.yml`
    - Define `db` service (PostgreSQL 14)
    - Define `backend` service (FastAPI)
    - Define `adminer` service (Database GUI)
    - Configure networking and volumes
  - [x] L1.2 Configure Local Environment Variables
    - Create `.env.example` and `.env`
    - Set DB credentials, API URLs, and "Dev Auth" flags

- [x] **L2. Cloud Backend (Local)**
  - [x] L2.1 Initialize FastAPI Project
    - Set up `app/` structure
    - Configure SQLAlchemy for local Postgres
  - [x] L2.2 Implement Core Models & Schemas
    - `Sighting` model and migration
    - `Device` model and migration
  - [x] L2.3 Implement Ingestion API
    - `POST /api/v1/sightings`
    - Mock API Key validation for local dev
  - [x] L2.4 Implement Query API
    - `GET /api/v1/sightings`
    - Mock User Auth for local dev

- [ ] **L3. Web Application (Local)**
  - [x] L3.1 Initialize React + Vite Project
  - [x] L3.2 Implement Sightings Dashboard
    - Connect to `http://localhost:8000`
    - Display sightings list
  - [ ] L3.3 Implement Search & Filter
    - [x] Plate search input
    - [ ] Date/Location filters

- [x] **L4. Edge Device (Local Simulation)**
  - [x] L4.1 Initialize Python Edge Project
  - [x] L4.2 Implement Video Processor
    - Support reading from video file source
  - [x] L4.3 Implement Mock AI Pipeline
    - Option to use pre-recorded detections (for faster dev) OR actual YOLO/OCR
  - [x] L4.4 Implement API Client
    - Send data to `http://localhost:8000`

### Phase 2: Advanced Features (Local)
- [x] **A1. Hotlists & Alerts**
  - [x] A1.1 Backend: Hotlist Model & API
  - [x] A1.2 Backend: Alerting Logic (Check sighting against hotlist)
  - [x] A1.3 Frontend: Hotlist Management UI
  - [x] A1.4 Frontend: Visual Alert on Dashboard
  - [ ] A1.5 Notification Integrations (SMS/Email)

- [ ] **A2. Advanced AI & Edge Intelligence**
  - [x] A2.1 Vehicle Attributes (MMC)
      - [x] Edge: Simulate Make, Model, Color generation
      - [x] Backend: Update Sighting model & API
      - [x] Frontend: Display MMC and add filters
  - [x] A2.2 Direction of Travel
  - [ ] A2.3 Dwell Time Calculation

- [ ] **A3. Dashboard & Analytics**
  - [x] A3.1 Map Dashboard (Jableh)
      - [x] Frontend: Install Leaflet & React-Leaflet
      - [x] Frontend: Create MapDashboard page & CityMap component
      - [x] Frontend: Implement Jableh entrance markers & alert visualization
  - [ ] A3.2 Heatmaps (Sighting density)
  - [ ] A3.3 Convoy Analysis
  - [ ] A3.4 Origin-Destination Tracking

- [ ] **A4. Operational Improvements**
  - [x] A4.1 Fuzzy Search (Partial plate matching)

### Phase 3: Cloud Migration (Original Tasks)

\- [ ] 1\. Set up Cloud Backend project structure and AWS infrastructure  
 \- [ ] 1.1 Initialize FastAPI project structure  
   \- Create FastAPI project with directory structure: app/, tests/, alembic/  
   \- Set up virtual environment and requirements.txt with FastAPI, SQLAlchemy, boto3, python-jose  
   \- Create app/main.py with basic FastAPI application  
   \- Set up pytest configuration for testing  
   \- *\_Requirements: 7.1\_*  
 \- \[ \] 1.2 Configure AWS RDS connection and Secrets Manager  
   \- Create app/core/config.py for settings management  
   \- Implement AWS Secrets Manager client to retrieve database credentials  
   \- Configure SQLAlchemy engine with RDS PostgreSQL connection string  
   \- Create database session dependency for FastAPI endpoints  
   \- Add connection pooling configuration  
   \- *\_Requirements: 8.1, 8.2\_*  
 \- \[ \] 1.3 Set up database migrations with Alembic  
   \- Initialize Alembic in project  
   \- Configure Alembic to use SQLAlchemy models  
   \- Create initial migration structure  
   \- Test migration up/down functionality  
   \- *\_Requirements: 8.3\_*  
 \- \[ \] 1.4 Create base models and schemas  
   \- Create app/models/base.py with SQLAlchemy Base class  
   \- Create app/schemas/base.py with common Pydantic base schemas  
   \- Set up app/core/aws.py for AWS service clients (Cognito, Secrets Manager)  
   \- *\_Requirements: 7.1, 8.3\_*

\- \[ \] 2\. Implement Cloud Backend database models and schemas  
 \- \[ \] 2.1 Create Sighting database model with proper schema  
   \- Define SQLAlchemy Sighting model with id, plateNumber, timestamp, locationId, createdAt fields  
   \- Create database indexes on plateNumber, timestamp, and locationId fields  
   \- Write Alembic migration for sightings table creation  
   \- *\_Requirements: 8.4, 8.5, 9.3, 9.4, 9.5\_*  
 \- \[ \] 2.2 Create Device database model  
   \- Define SQLAlchemy Device model for edge device registry with apiKeyId and apiKeyHash fields  
   \- Write Alembic migration for devices table creation  
   \- Note: User authentication handled by AWS Cognito (no User table needed)  
   \- *\_Requirements: 7.3\_*  
 \- \[ \] 2.3 Create Pydantic schemas for request/response validation  
   \- Define SightingCreate schema with plateNumber, timestamp, locationId validation  
   \- Define SightingResponse schema for API responses  
   \- Define DeviceCreate and DeviceResponse schemas  
   \- Note: User schemas not needed (AWS Cognito handles user management)  
   \- *\_Requirements: 7.4, 5.1, 5.2, 5.3, 5.4\_*

\- \[ \] 3\. Implement Cloud Backend authentication and security with AWS services  
 \- \[ \] 3.1 Implement AWS Cognito JWT token verification for users  
   \- Create app/core/security.py with Cognito JWT verification utilities  
   \- Install python-jose\[cryptography\] for JWT handling  
   \- Implement function to fetch Cognito JWKS (JSON Web Key Set)  
   \- Implement JWT token validation: verify signature, expiration, issuer, audience  
   \- Create FastAPI dependency get\_current\_user() that validates Cognito token  
   \- Extract user information from token claims (sub, email, cognito:username)  
   \- Handle token validation errors with appropriate HTTP responses  
   \- Note: User registration/login handled by AWS Cognito (no custom endpoints needed)  
   \- *\_Requirements: 11.2, 11.3, 11.5, 11.7\_*  
 \- \[ \] 3.2 Implement API key authentication for edge devices  
   \- Create FastAPI dependency get\_api\_key() that validates x-api-key header  
   \- Implement function to verify API key against devices table  
   \- Hash incoming API key and compare with stored hash  
   \- Return device information if valid, raise 401 if invalid  
   \- Add rate limiting check per device (optional)  
   \- Note: API key generation handled in device registration endpoint (Task 3.3)  
   \- *\_Requirements: 7.3, 7.5\_*  
 \- \[ \] 3.3 Create device registration endpoint  
   \- Create POST /api/v1/devices endpoint (admin-only or internal)  
   \- Accept locationId and device metadata in request  
   \- Generate API key using secrets.token\_urlsafe()  
   \- Create API Gateway API key via boto3 (if using API Gateway key management)  
   \- Store device record with apiKeyId and hashed API key in devices table  
   \- Return API key to caller (only shown once)  
   \- *\_Requirements: 7.3\_*

\- \[ \] 4\. Implement Cloud Backend ingestion API endpoints  
 \- \[ \] 4.1 Create POST /api/v1/sightings endpoint for device data ingestion  
   \- Implement endpoint with AWS API Gateway API key authentication  
   \- Add request payload validation using Pydantic schemas  
   \- Implement database insertion logic with proper field mapping to AWS RDS  
   \- Add error handling for validation failures (400) and auth failures (401)  
   \- Return 201 status with confirmation response on success  
   \- *\_Requirements: 7.1, 7.4, 7.5, 7.6, 7.7, 9.1, 9.2, 9.7\_*  
 \- \[ \]\* 4.2 Add AWS CloudWatch logging and error tracking  
   \- Implement structured logging to CloudWatch Logs for all incoming requests  
   \- Log validation errors and database operations with appropriate log levels  
   \- Add correlation IDs for request tracing across AWS services  
   \- Configure CloudWatch log groups and retention policies  
   \- *\_Requirements: 15.2, 15.4\_*

\- \[ \] 5\. Implement Cloud Backend query API endpoints  
 \- \[ \] 5.1 Create GET /api/v1/sightings endpoint with filtering  
   \- Implement endpoint with AWS Cognito JWT authentication  
   \- Add query parameters for plateNumber, locationId, and date range filtering  
   \- Implement database query with SQLAlchemy filters against AWS RDS  
   \- Add pagination support with page and limit parameters (max 100 per page)  
   \- Return JSON response with data array and pagination metadata  
   \- Handle empty results with 200 status and empty array  
   \- *\_Requirements: 10.1, 10.2, 10.3, 10.4, 10.5\_*  
 \- \[ \] 5.2 Implement query result sorting by timestamp  
   \- Add sorting logic to return results in descending timestamp order (newest first)  
   \- Ensure timestamp preservation from edge device data  
   \- *\_Requirements: 9.6, 12.4\_*  
 \- \[ \]\* 5.3 Add query performance optimization with AWS services  
   \- Implement database query optimization with proper RDS index usage  
   \- Add query result caching headers for API Gateway caching  
   \- Monitor and log slow queries to CloudWatch  
   \- Use RDS Performance Insights for query analysis  
   \- *\_Requirements: 8.1\_*

\- \[ \] 6\. Configure AWS Cognito for user authentication  
 \- \[ \] 6.1 Set up AWS Cognito User Pool via AWS Console or IaC  
   \- Create Cognito User Pool with email/password authentication  
   \- Configure password policy: minimum 8 characters, require uppercase, lowercase, numbers  
   \- Enable email verification for new users  
   \- Configure token expiration: access token 1 hour, refresh token 30 days  
   \- Set up email templates for verification and password reset  
   \- Note: No custom registration/login endpoints needed \- Cognito handles this  
   \- *\_Requirements: 11.2, 11.7\_*  
 \- \[ \] 6.2 Configure AWS Cognito App Client for web application  
   \- Create Cognito App Client for web application  
   \- Configure OAuth 2.0 flows: authorization code grant with PKCE  
   \- Set up callback URLs for local development and production  
   \- Enable OAuth scopes: openid, email, profile  
   \- Disable client secret (for public web app)  
   \- Configure token validity periods  
   \- *\_Requirements: 11.2, 11.5\_*  
 \- \[ \] 6.3 Document Cognito configuration for backend integration  
   \- Record Cognito User Pool ID and region  
   \- Record App Client ID  
   \- Document JWT token structure and claims  
   \- Create configuration file or environment variables for backend  
   \- *\_Requirements: 11.1, 11.5\_*  
 \- \[ \]\* 6.4 Configure OAuth 2.0 identity providers in Cognito  
   \- Add social identity providers (Google, Facebook, etc.) to Cognito User Pool  
   \- Configure provider credentials and scopes  
   \- Set up attribute mapping from providers to Cognito  
   \- Test social login flow  
   \- *\_Requirements: 11.3\_*

\- \[ \] 7\. Set up Edge Device project structure and configuration  
 \- \[ \] 7.1 Initialize Edge Device Python project  
   \- Create project directory structure: edge\_device/  
   \- Create subdirectories: config/, models/, core/, storage/, transmission/, utils/  
   \- Set up virtual environment and requirements.txt  
   \- Install dependencies: opencv-python, ultralytics, easyocr, requests, pyyaml  
   \- Create \_\_init\_\_.py files for each module  
   \- *\_Requirements: 1.1\_*  
 \- \[ \] 7.2 Implement configuration management  
   \- Create config/device\_config.yaml template with fields:  
     \- locationId (string)  
     \- apiEndpoint (URL)  
     \- apiKey (string, encrypted or from env)  
     \- cameraSource (int or string)  
     \- storageDirectory (path)  
     \- logDirectory (path)  
   \- Create utils/config\_loader.py to load and parse YAML configuration  
   \- Implement configuration validation:  
     \- Validate locationId matches pattern: ^\[A-Za-z0-9\_-\]+$  
     \- Validate apiEndpoint is valid HTTPS URL  
     \- Validate apiKey is non-empty  
     \- Validate directories exist or can be created  
   \- Raise ConfigurationError if validation fails  
   \- *\_Requirements: 1.1, 1.3, 1.4, 1.5\_*  
 \- \[ \] 7.3 Set up logging configuration  
   \- Create utils/logger.py with logging configuration  
   \- Configure file handler with rotation (max 10MB, keep 5 backups)  
   \- Configure console handler for development  
   \- Set log format: timestamp, level, module, message  
   \- Create separate log files for errors and general logs  
   \- *\_Requirements: 15.1\_*  
 \- \[ \] 7.4 Create main entry point  
   \- Create main.py as application entry point  
   \- Load configuration and validate  
   \- Initialize logging  
   \- Handle startup errors gracefully  
   \- Implement signal handlers for graceful shutdown (SIGTERM, SIGINT)  
   \- *\_Requirements: 1.5, 15.1\_*

\- \[ \] 8\. Implement Edge Device AI models and computer vision pipeline  
 \- \[ \] 8.1 Implement vehicle detection with YOLOv8  
   \- Create VehicleDetector class wrapping YOLOv8 model  
   \- Load pre-trained YOLOv8 model for vehicle detection  
   \- Implement detect() method to return vehicle bounding boxes from frame  
   \- Add confidence threshold filtering  
   \- *\_Requirements: 2.2\_*  
 \- \[ \] 8.2 Implement object tracking with SORT/DeepSORT  
   \- Create ObjectTracker class for vehicle tracking  
   \- Implement update() method to assign and maintain tracker IDs  
   \- Handle tracker lifecycle (creation, update, removal)  
   \- Return tracked objects with tracker\_id and bounding box  
   \- *\_Requirements: 2.3, 3.1, 3.4\_*  
 \- \[ \] 8.3 Implement ANPR with EasyOCR or PaddleOCR  
   \- Create PlateReader class wrapping OCR model  
   \- Load pre-trained ANPR model  
   \- Implement read() method to extract plate text from vehicle bounding box  
   \- Return plate text and confidence score  
   \- *\_Requirements: 2.4\_*

\- \[ \] 9\. Implement Edge Device video processing and sighting detection  
 \- \[ \] 9.1 Create VideoProcessor main processing loop  
   \- Initialize camera capture with OpenCV  
   \- Implement continuous frame capture at 10+ FPS  
   \- Integrate vehicle detection, tracking, and ANPR in processing pipeline  
   \- Add frame processing error handling and recovery  
   \- *\_Requirements: 2.1, 2.5\_*  
 \- \[ \] 9.2 Implement SightingManager for de-duplication  
   \- Create SightingManager class to track processed tracker IDs  
   \- Implement is\_processed() method to check if tracker has been processed  
   \- Implement mark\_processed() method to mark tracker as processed  
   \- Implement remove\_tracker() method to clean up when vehicle exits frame  
   \- *\_Requirements: 3.2, 3.3, 3.4, 3.5\_*  
 \- \[ \] 9.3 Implement sighting event triggering logic  
   \- Detect when ANPR successfully reads plate for new tracker ID  
   \- Trigger sighting event only once per tracker lifecycle  
   \- Record timestamp with millisecond precision  
   \- Skip event if ANPR fails before vehicle exits  
   \- *\_Requirements: 4.1, 4.2, 4.4, 4.5\_*

\- \[ \] 10\. Implement Edge Device local image storage  
 \- \[ \] 10.1 Create ImageStorage class for saving vehicle images  
   \- Implement save\_image() method to save frame to local filesystem  
   \- Select frame with highest ANPR confidence score for storage  
   \- Generate filename using strict format: \[YYYYMMDDHHMMSS\]\_\[plateNumber\].jpg  
   \- Save images in JPEG format with configurable quality  
   \- Create designated storage directory with proper permissions  
   \- *\_Requirements: 6.1, 6.2, 6.3, 6.5, 6.6\_*  
 \- \[ \] 10.2 Implement storage cleanup manager  
   \- Create CleanupManager class for retention policy  
   \- Implement automatic deletion of images older than 7 days  
   \- Run cleanup process periodically (e.g., daily)  
   \- Add disk space monitoring and warnings  
   \- *\_Requirements: 6.4, 6.7\_*

\- \[ \] 11\. Implement Edge Device cloud data transmission to AWS  
 \- \[ \] 11.1 Create CloudClient for AWS API Gateway communication  
   \- Implement HTTP client using requests library  
   \- Configure HTTPS endpoint for AWS API Gateway  
   \- Set authentication headers with x-api-key for API Gateway  
   \- Create send\_sighting() method to POST JSON payload  
   \- Format payload with plateNumber, timestamp (ISO 8601), and locationId fields  
   \- Ensure no video streams, images, or confidence scores in payload  
   \- *\_Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6\_*  
 \- \[ \] 11.2 Implement retry logic with exponential backoff  
   \- Add retry handler for failed API Gateway requests  
   \- Implement exponential backoff (1s, 2s, 4s) for up to 3 retries  
   \- Log transmission failures and retry attempts  
   \- Handle different error responses (4xx, 5xx) from API Gateway  
   \- *\_Requirements: 5.7, 15.1, 15.3\_*

\- \[ \] 12\. Integrate Edge Device components and implement event handler  
 \- Wire together VideoProcessor, SightingManager, ImageStorage, and CloudClient  
 \- Implement EventHandler to coordinate sighting event actions  
 \- On sighting event trigger:  
   \- Save image to local storage  
   \- Construct and send JSON payload to cloud  
   \- Mark tracker as processed  
 \- Add error handling for component failures  
 \- Implement graceful shutdown and cleanup  
 \- *\_Requirements: 4.3, 15.1, 15.3\_*

\- \[ \] 13\. Set up Web Application project structure with AWS Amplify  
 \- \[ \] 13.1 Initialize React \+ TypeScript project  
   \- Create new Vite project with React and TypeScript template  
   \- Set up project directory structure: src/components/, pages/, services/, hooks/, types/, utils/  
   \- Configure ESLint and Prettier for code quality  
   \- Set up .env files for environment variables (.env.local, .env.production)  
   \- *\_Requirements: 11.1\_*  
 \- \[ \] 13.2 Install and configure dependencies  
   \- Install React Router v6 for routing  
   \- Install UI library: Material-UI (MUI) or Tailwind CSS  
   \- Install AWS Amplify: @aws-amplify/auth, @aws-amplify/core  
   \- Install Axios for API communication  
   \- Install React Query (@tanstack/react-query) for server state management  
   \- Install date-fns or dayjs for date formatting  
   \- *\_Requirements: 11.1\_*  
 \- \[ \] 13.3 Configure AWS Amplify for Cognito  
   \- Create src/config/amplify.ts with Amplify configuration  
   \- Configure Auth module with Cognito User Pool ID, App Client ID, region  
   \- Set up OAuth configuration with redirect URIs  
   \- Initialize Amplify in src/main.tsx  
   \- *\_Requirements: 11.1, 11.2\_*  
 \- \[ \] 13.4 Set up Axios with authentication interceptors  
   \- Create src/services/api.ts with Axios instance  
   \- Configure base URL for API Gateway endpoint  
   \- Add request interceptor to attach Cognito JWT token to Authorization header  
   \- Add response interceptor to handle 401 errors and token refresh  
   \- *\_Requirements: 11.5, 11.6\_*  
 \- \[ \] 13.5 Configure routing structure  
   \- Create src/App.tsx with React Router setup  
   \- Define routes: /, /login, /register, /dashboard, /search  
   \- Set up route structure with public and protected routes  
   \- *\_Requirements: 11.1, 11.4\_*

\- \[ \] 14\. Implement Web Application authentication with AWS Cognito  
 \- \[ \] 14.1 Create AWS Cognito authentication service and hooks  
   \- Implement authService using AWS Amplify Auth module  
   \- Use Amplify Auth.signIn(), Auth.signUp(), and Auth.signOut() methods  
   \- Create useAuth hook for Cognito authentication state management  
   \- Implement automatic Cognito token refresh with Amplify  
   \- Configure Axios interceptors to add Cognito JWT tokens to API requests  
   \- *\_Requirements: 11.2, 11.5, 11.6\_*  
 \- \[ \] 14.2 Create LoginForm component with Cognito integration  
   \- Build login form with email and password inputs  
   \- Add form validation  
   \- Implement login submission using Amplify Auth.signIn()  
   \- Display Cognito authentication errors to user  
   \- Redirect to dashboard on successful Cognito authentication  
   \- *\_Requirements: 11.2, 11.5, 15.5\_*  
 \- \[ \] 14.3 Create ProtectedRoute component with Cognito session check  
   \- Implement route protection using Amplify Auth.currentAuthenticatedUser()  
   \- Redirect unauthenticated users to login page  
   \- Preserve intended destination for post-login redirect  
   \- *\_Requirements: 11.4\_*  
 \- \[ \]\* 14.4 Create RegisterForm component with Cognito sign-up  
   \- Build registration form with email, password, and name inputs  
   \- Add password strength validation matching Cognito policy  
   \- Implement registration using Amplify Auth.signUp()  
   \- Handle email verification flow with Cognito  
   \- Redirect to login after successful Cognito registration  
   \- *\_Requirements: 11.7\_*

\- \[ \] 15\. Implement Web Application plate search feature  
 \- \[ \] 15.1 Create sightings service and hooks  
   \- Implement sightingsService with searchByPlate() method  
   \- Create useSightings hook with React Query  
   \- Add automatic caching and background refetching  
   \- Handle loading and error states  
   \- *\_Requirements: 12.2\_*  
 \- \[ \] 15.2 Create PlateSearchInput component  
   \- Build search input field for plate number entry  
   \- Add input validation and formatting  
   \- Implement search submission on enter key or button click  
   \- Display search button with loading state  
   \- *\_Requirements: 12.1, 12.2\_*  
 \- \[ \] 15.3 Create SightingsList component  
   \- Display sighting records in chronological list  
   \- Sort results by timestamp descending (newest first)  
   \- Show timestamp and locationId for each sighting  
   \- Display plateNumber being searched at top  
   \- Handle empty results with "No sightings found" message  
   \- *\_Requirements: 12.3, 12.4, 12.5, 12.6, 12.7\_*  
 \- \[ \] 15.4 Create PlateSearchPage  
   \- Integrate PlateSearchInput and SightingsList components  
   \- Implement search flow from input to results display  
   \- Add loading spinner during API requests  
   \- Display error messages for failed requests  
   \- *\_Requirements: 12.1, 12.2, 12.3, 15.5\_*

\- \[ \] 16\. Implement Web Application data display and pagination  
 \- \[ \] 16.1 Create SightingCard component  
   \- Display individual sighting with formatted timestamp  
   \- Show locationId and plateNumber  
   \- Format timestamp in human-readable format (date and time)  
   \- Apply consistent styling  
   \- *\_Requirements: 13.2, 13.3\_*  
 \- \[ \] 16.2 Implement pagination controls  
   \- Create Pagination component with page navigation  
   \- Handle page changes and update API queries  
   \- Display current page and total pages  
   \- Disable navigation buttons at boundaries  
   \- Update results without full page reload  
   \- *\_Requirements: 13.4, 13.5\_*

\- \[ \] 17\. Implement Web Application advanced filtering  
 \- \[ \] 17.1 Create LocationFilter component  
   \- Build dropdown or input for locationId filtering  
   \- Integrate with sightings query  
   \- Update results when filter changes  
   \- *\_Requirements: 14.1, 14.2\_*  
 \- \[ \] 17.2 Create DateRangeFilter component  
   \- Build date range picker for timestamp filtering  
   \- Add start date and end date inputs  
   \- Integrate with sightings query  
   \- Validate date range (start before end)  
   \- *\_Requirements: 14.1, 14.2\_*  
 \- \[ \] 17.3 Create FilterPanel component  
   \- Integrate LocationFilter and DateRangeFilter  
   \- Add clear/reset button to remove all filters  
   \- Display active filters  
   \- Show all recent sightings when filters cleared  
   \- *\_Requirements: 14.1, 14.3, 14.5\_*  
 \- \[ \] 17.4 Implement partial plate number matching  
   \- Update search logic to support partial matches  
   \- Add wildcard or fuzzy matching for incomplete plates  
   \- Display indication when using partial match  
   \- *\_Requirements: 14.4\_*

\- \[ \] 18\. Implement error handling and user feedback across Web Application  
 \- Create ErrorMessage component for displaying API errors  
 \- Create LoadingSpinner component for loading states  
 \- Implement error boundaries for component error catching  
 \- Add user-friendly error messages for common failures  
 \- Implement toast notifications for success/error feedback  
 \- *\_Requirements: 15.5\_*

\- \[ \] 19\. Deploy and configure Cloud Backend on AWS  
 \- \[ \] 19.1 Set up AWS networking infrastructure  
   \- Create VPC with public and private subnets across 2 availability zones  
   \- Create Internet Gateway and NAT Gateway for outbound connectivity  
   \- Configure route tables for public and private subnets  
   \- Create security group for RDS (allow PostgreSQL port 5432 from ECS)  
   \- Create security group for ECS (allow HTTP/HTTPS from ALB)  
   \- Create security group for ALB (allow HTTP/HTTPS from internet)  
   \- *\_Requirements: 8.1\_*  
 \- \[ \] 19.2 Provision AWS RDS PostgreSQL database  
   \- Create RDS PostgreSQL 14+ instance with Multi-AZ deployment  
   \- Configure instance class (e.g., db.t3.medium for production)  
   \- Set up automated backups with 7-day retention  
   \- Enable encryption at rest  
   \- Create database credentials and store in AWS Secrets Manager  
   \- Configure parameter group for optimal performance  
   \- Enable Performance Insights  
   \- *\_Requirements: 8.1, 8.2\_*  
 \- \[ \] 19.3 Create and push Docker image to ECR  
   \- Create Dockerfile for FastAPI application with multi-stage build  
   \- Create .dockerignore file  
   \- Create Amazon ECR repository  
   \- Build Docker image locally  
   \- Authenticate Docker to ECR  
   \- Tag and push image to ECR  
   \- *\_Requirements: 7.1\_*  
 \- \[ \] 19.4 Deploy FastAPI to AWS ECS Fargate  
   \- Create ECS cluster  
   \- Create ECS task definition with container configuration  
   \- Configure task role with permissions for Secrets Manager and CloudWatch  
   \- Set environment variables and secrets from Secrets Manager  
   \- Create Application Load Balancer with target group  
   \- Create ECS service with desired count and auto-scaling policies  
   \- Configure health checks for ALB target group  
   \- Run Alembic migrations against RDS database (one-time task)  
   \- *\_Requirements: 7.1\_*  
 \- \[ \] 19.5 Configure AWS API Gateway  
   \- Create REST API in API Gateway  
   \- Create VPC Link to connect API Gateway to ALB (private integration)  
   \- Configure API Gateway resources and methods (POST /sightings, GET /sightings)  
   \- Set up API Gateway API keys and usage plans for device authentication  
   \- Configure Cognito authorizer for user endpoints (GET /sightings)  
   \- Enable rate limiting: 100 requests per minute per API key  
   \- Configure throttling: burst 200, rate 100  
   \- Configure CORS settings (allow origins, headers, methods)  
   \- Deploy API to production stage  
   \- Set up custom domain name with Route 53 and ACM certificate  
   \- *\_Requirements: 7.3, 7.5\_*  
 \- \[ \] 19.6 Set up AWS CloudWatch monitoring and alarms  
   \- Configure CloudWatch log groups for ECS tasks with 30-day retention  
   \- Enable ECS container insights  
   \- Create CloudWatch alarms for:  
     \- ECS CPU utilization \> 80%  
     \- ECS memory utilization \> 80%  
     \- RDS CPU utilization \> 80%  
     \- RDS free storage space \< 10GB  
     \- API Gateway 5xx errors \> 10 per minute  
     \- API Gateway latency \> 2 seconds  
   \- Set up SNS topic for alarm notifications  
   \- Create CloudWatch dashboard with key metrics  
   \- Enable RDS Enhanced Monitoring  
   \- *\_Requirements: 15.2, 15.4\_*

\- \[ \] 20\. Deploy Web Application to AWS  
 \- \[ \] 20.1 Build and deploy to AWS S3 \+ CloudFront  
   \- Build production bundle with Vite  
   \- Configure environment variables for API Gateway endpoint and Cognito User Pool  
   \- Create S3 bucket for static website hosting  
   \- Enable S3 bucket versioning for rollback capability  
   \- Upload build artifacts to S3  
   \- *\_Requirements: 11.1\_*  
 \- \[ \] 20.2 Configure AWS CloudFront CDN  
   \- Create CloudFront distribution pointing to S3 bucket  
   \- Configure custom domain name with Route 53  
   \- Set up ACM SSL/TLS certificate for HTTPS  
   \- Configure CloudFront caching policies  
   \- Enable AWS WAF for DDoS protection  
   \- Set up CloudFront error pages  
   \- *\_Requirements: 11.1\_*  
 \- \[ \]\* 20.3 Set up CI/CD with AWS Amplify Hosting or CodePipeline  
   \- Configure AWS Amplify Hosting for automated deployments  
   \- Or set up CodePipeline with CodeBuild for S3 deployment  
   \- Connect to GitHub repository  
   \- Configure build settings and environment variables  
   \- Enable automatic deployments on git push

\- \[ \] 21\. Configure and deploy Edge Device with AWS integration  
 \- Package Edge Device application for Raspberry Pi  
 \- Create systemd service configuration  
 \- Set up auto-start on boot  
 \- Configure device-specific settings (locationId, AWS API Gateway endpoint, API key)  
 \- Store AWS API Gateway API key in encrypted configuration file  
 \- Test end-to-end flow from camera to AWS API Gateway to RDS  
 \- Implement automatic restart on crash  
 \- Set up log rotation  
 \- *\_Requirements: 1.1, 1.2, 5.5, 15.1\_*

\- \[ \]\* 22\. Create system documentation  
 \- Write deployment guide for each component  
 \- Create API documentation with example requests  
 \- Write user guide for Web Application  
 \- Document Edge Device setup and configuration  
 \- Create troubleshooting guide

