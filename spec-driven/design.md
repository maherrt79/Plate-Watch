**\# Plate-Watch System Design Document**

**\#\# Overview**

The Plate-Watch system is a distributed vehicle monitoring solution consisting of three primary components:

1\. \*\*Edge Device\*\*: Raspberry Pi units running real-time ANPR processing  
2\. \*\*Cloud Backend\*\*: Scalable API and database infrastructure for data ingestion and querying  
3\. \*\*Web Application\*\*: Secure browser-based interface for searching and viewing sighting data

This design document outlines the technical architecture, technology stack, data models, and implementation approach for Stage 1 of the system.

**\#\# Technology Stack**

**\#\#\# Edge Device (Component 1\)**  
\- \*\*Platform\*\*: Raspberry Pi 4 (4GB+ RAM recommended)  
\- \*\*Operating System\*\*: Raspberry Pi OS (Debian-based)  
\- \*\*Programming Language\*\*: Python 3.9+  
\- \*\*Computer Vision\*\*: OpenCV 4.x  
\- \*\*AI/ML Framework\*\*:  
 \- YOLOv8 (ultralytics) for vehicle detection  
 \- EasyOCR or PaddleOCR for ANPR  
 \- SORT or DeepSORT for object tracking  
\- \*\*HTTP Client\*\*: requests library  
\- \*\*Configuration\*\*: YAML or JSON config files  
\- \*\*Logging\*\*: Python logging module with file rotation

**\#\#\# Cloud Backend (Component 2\)**  
\- \*\*Framework\*\*: FastAPI (Python 3.9+)  
\- \*\*Database\*\*: AWS RDS PostgreSQL 14+ with TimescaleDB extension (for time-series optimization)  
\- \*\*ORM\*\*: SQLAlchemy 2.x  
\- \*\*Authentication\*\*: AWS Cognito for user authentication \+ API Gateway API keys for device authentication  
\- \*\*API Documentation\*\*: OpenAPI/Swagger (built into FastAPI)  
\- \*\*Deployment\*\*: AWS ECS Fargate (containerized) or AWS Lambda with API Gateway  
\- \*\*Cloud Platform\*\*: AWS (primary)  
\- \*\*MQTT Support\*\*: AWS IoT Core for edge device communication (alternative to REST)  
\- \*\*Secrets Management\*\*: AWS Secrets Manager for API keys and credentials  
\- \*\*Monitoring\*\*: AWS CloudWatch for logs and metrics

**\#\#\# Web Application (Component 3\)**  
\- \*\*Framework\*\*: React 18+ with TypeScript  
\- \*\*UI Library\*\*: Material-UI (MUI) or Tailwind CSS  
\- \*\*State Management\*\*: React Query for server state  
\- \*\*Authentication\*\*: AWS Cognito (OAuth 2.0 / OpenID Connect \+ email/password)  
**## Technology Stack**

**### Edge Device (Component 1)**  
- **Platform**: Raspberry Pi 4 (4GB+ RAM recommended)  
- **Operating System**: Raspberry Pi OS (Debian-based)  
- **Programming Language**: Python 3.9+  
- **Computer Vision**: OpenCV 4.x  
- **AI/ML Framework**:  
 - YOLOv8 (ultralytics) for vehicle detection  
 - EasyOCR or PaddleOCR for ANPR  
 - SORT or DeepSORT for object tracking  
- **HTTP Client**: requests library  
- **Configuration**: YAML or JSON config files  
- **Logging**: Python logging module with file rotation

**### Cloud Backend (Component 2)**  
- **Framework**: FastAPI (Python 3.9+)  
- **Database**: AWS RDS PostgreSQL 14+ with TimescaleDB extension (for time-series optimization)  
- **ORM**: SQLAlchemy 2.x  
- **Authentication**: AWS Cognito for user authentication + API Gateway API keys for device authentication  
- **API Documentation**: OpenAPI/Swagger (built into FastAPI)  
- **Deployment**: AWS ECS Fargate (containerized) or AWS Lambda with API Gateway  
- **Cloud Platform**: AWS (primary)  
- **MQTT Support**: AWS IoT Core for edge device communication (alternative to REST)  
- **Secrets Management**: AWS Secrets Manager for API keys and credentials  
- **Monitoring**: AWS CloudWatch for logs and metrics

**### Web Application (Component 3)**  
- **Framework**: React 18+ with TypeScript  
- **UI Library**: Material-UI (MUI) or Tailwind CSS  
- **State Management**: React Query for server state  
- **Authentication**: AWS Cognito (OAuth 2.0 / OpenID Connect + email/password)  
- **HTTP Client**: Axios with AWS Amplify for Cognito integration  
- **Routing**: React Router v6  
- **Build Tool**: Vite  
- **Deployment**: AWS S3 + CloudFront CDN  
- **Hosting**: AWS Amplify Hosting (alternative for CI/CD integration)

**## Architecture**

### Local Development Architecture

To support rapid iteration and offline development, the system supports a fully local deployment mode using Docker and local services.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Local Developer Machine                   │
│                                                                 │
│  ┌──────────────┐      ┌─────────────────────────────────────┐  │
│  │ Edge Sim     │      │ Docker Compose Environment          │  │
│  │ (Python)     │      │                                     │  │
│  │ Video File   │─────▶│  ┌──────────────┐  ┌─────────────┐  │  │
│  │              │ HTTP │  │ FastAPI App  │  │ PostgreSQL  │  │  │
│  │              │ POST │  │ (Backend)    │──│ (DB)        │  │  │
│  └──────┬───────┘      │  └──────┬───────┘  └─────────────┘  │  │
│         │              │         │                           │  │
│         │              │         │ HTTP API                  │  │
│         │              └─────────┼───────────────────────────┘  │
│         │                        │                              │
│         │                        ▼                              │
│         │              ┌─────────────────────────────────────┐  │
│         └─────────────▶│ Web Application                     │  │
│           Local FS     │ (React + Vite Dev Server)           │  │
│           Images       └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Differences from Cloud:**
- **Database**: Local PostgreSQL container instead of AWS RDS.
- **Auth**: Simplified "Dev Auth" (mock tokens) instead of AWS Cognito/API Gateway.
- **Storage**: Local filesystem for images instead of S3 (Edge already does this, but Web App will serve from local dev server or mock S3).
- **Edge**: Runs as a script reading a video file, not a service on a Pi.

### Local Private Cloud Architecture (Phase 1 Production)

For the initial production deployment, the system runs on a dedicated local server (Local Private Cloud) alongside the Edge Devices. This provides data sovereignty, low latency, and zero cloud costs.

```mermaid
graph TD
    subgraph "Local Private Network"
        Edge[Edge Devices] -->|HTTP/POST| Gateway[Nginx Gateway]
        Gateway --> API[FastAPI Container]
        API --> DB[(PostgreSQL + TimescaleDB)]
        API --> FS[Local File System (Images)]
        Web[Web App Container] --> API
        User[Local Operator] -->|Browser| Web
    end
```

**Key Characteristics:**
- **Infrastructure**: Self-hosted Docker orchestration on a dedicated server (e.g., Linux Server).
- **Database**: PostgreSQL with TimescaleDB running in a local container.
- **Storage**: Images stored on local RAID storage, served via Nginx or API.
- **Authentication**: Local "Simulated Auth" or Lightweight Auth Service (keycloak/basic-auth) instead of AWS Cognito.
- **Remote Access**: Secured via VPN (Tailscale/WireGuard) or Cloudflare Tunnel.

See [DEPLOYMENT_STRATEGY.md](../DEPLOYMENT_STRATEGY.md) for detailed hardware specs and setup.

### AWS Cloud Architecture Overview

The Plate-Watch system leverages AWS managed services for scalability, reliability, and security:

\- \*\*AWS RDS PostgreSQL\*\*: Managed relational database with Multi-AZ deployment for high availability  
\- \*\*AWS Cognito\*\*: Fully managed user authentication and authorization service  
\- \*\*AWS S3 \+ CloudFront\*\*: Global content delivery for web application with low latency  
\- \*\*AWS Secrets Manager\*\*: Secure storage for database credentials and API keys  
\- \*\*AWS CloudWatch\*\*: Centralized logging, monitoring, and alerting  
\- \*\*AWS VPC\*\*: Network isolation and security for backend services

**\#\#\# System Architecture Diagram**

\`\`\`  
┌─────────────────────────────────────────────────────────────────┐  
│                         Edge Devices                             │  
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │  
│  │ Raspberry Pi │  │ Raspberry Pi │  │ Raspberry Pi │          │  
│  │  LOC-001     │  │  LOC-002     │  │  LOC-003     │          │  
│  │              │  │              │  │              │          │  
│  │ Camera       │  │ Camera       │  │ Camera       │          │  
│  │ ANPR Engine  │  │ ANPR Engine  │  │ ANPR Engine  │          │  
│  │ Local Store  │  │ Local Store  │  │ Local Store  │          │  
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │  
│         │                  │                  │                  │  
└─────────┼──────────────────┼──────────────────┼──────────────────┘  
         │                  │                  │  
         │  HTTPS POST      │                  │  
         │  JSON Payload    │                  │  
         │                  │                  │  
         ▼                  ▼                  ▼  
┌─────────────────────────────────────────────────────────────────┐  
│                      AWS Cloud Backend                           │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  AWS API Gateway                                           │ │  
│  │  \- API Key authentication for devices                      │ │  
│  │  \- Cognito authorizer for users                            │ │  
│  │  \- Rate limiting & throttling                              │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  FastAPI on AWS ECS Fargate                                │ │  
│  │  \- POST /api/v1/sightings (device ingestion)               │ │  
│  │  \- GET /api/v1/sightings (user queries)                    │ │  
│  │  \- Validation & Business Logic                             │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  AWS RDS PostgreSQL                                        │ │  
│  │  \- sightings table (indexed)                               │ │  
│  │  \- devices table (device registry)                         │ │  
│  │  \- Multi-AZ for high availability                          │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  AWS Cognito User Pool                                     │ │  
│  │  \- User authentication & management                        │ │  
│  │  \- OAuth 2.0 / OpenID Connect                              │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  AWS CloudWatch                                            │ │  
│  │  \- Application logs & metrics                              │ │  
│  │  \- Alarms & monitoring                                     │ │  
│  └────────────────────────────────────────────────────────────┘ │  
└─────────────────────────────────────────────────────────────────┘  
                             │  
                             │ HTTPS GET  
                             │ JSON Response  
                             │  
                             ▼  
┌─────────────────────────────────────────────────────────────────┐  
│              Web Application (React on AWS)                      │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  AWS CloudFront CDN                                        │ │  
│  │  \- Global content delivery                                 │ │  
│  │  \- HTTPS/SSL termination                                   │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  AWS S3 Static Hosting                                     │ │  
│  │  \- React build artifacts                                   │ │  
│  │  \- Versioned deployments                                   │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  Authentication (AWS Cognito SDK)                          │ │  
│  │  \- Login (email/password \+ OAuth)                          │ │  
│  │  \- Session Management with JWT                             │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  Plate Search View (Primary Feature)                       │ │  
│  │  \- Search Input                                            │ │  
│  │  \- Results List (timestamp \+ location)                     │ │  
│  │  \- Chronological Display                                   │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  Advanced Filters (Optional)                               │ │  
│  │  \- Location Filter                                         │ │  
│  │  \- Date Range Filter                                       │ │  
│  └────────────────────────────────────────────────────────────┘ │  
└─────────────────────────────────────────────────────────────────┘  
\`\`\`

**\#\# Components and Interfaces**

**\#\#\# Component 1: Edge Device**

**\#\#\#\# Module Structure**  
\`\`\`  
edge\_device/  
├── config/  
│   └── device\_config.yaml          \# Location ID, API endpoint, credentials  
├── models/  
│   ├── vehicle\_detector.py         \# YOLOv8 wrapper  
│   ├── plate\_reader.py             \# ANPR engine (EasyOCR/PaddleOCR)  
│   └── object\_tracker.py           \# SORT/DeepSORT tracker  
├── core/  
│   ├── video\_processor.py          \# Main processing loop  
│   ├── sighting\_manager.py         \# De-duplication logic  
│   └── event\_handler.py            \# Sighting event triggering  
├── storage/  
│   ├── image\_storage.py            \# Local image saving  
│   └── cleanup\_manager.py          \# 7-day retention policy  
├── transmission/  
│   ├── cloud\_client.py             \# HTTP client for API  
│   └── retry\_handler.py            \# Exponential backoff retry  
├── utils/  
│   ├── logger.py                   \# Logging configuration  
│   └── validators.py               \# Config validation  
└── main.py                         \# Entry point  
\`\`\`

**\#\#\#\# Key Classes and Interfaces**

\*\*VideoProcessor\*\*  
\`\`\`python  
class VideoProcessor:  
   def \_\_init\_\_(self, config: DeviceConfig):  
       self.camera \= cv2.VideoCapture(config.camera\_source)  
       self.detector \= VehicleDetector()  
       self.tracker \= ObjectTracker()  
       self.plate\_reader \= PlateReader()  
       self.sighting\_manager \= SightingManager()  
        
   def process\_frame(self, frame: np.ndarray) \-\> None:  
       *\# Detect vehicles*  
       detections \= self.detector.detect(frame)  
        
       *\# Update tracker*  
       tracked\_objects \= self.tracker.update(detections)  
        
       *\# Process each tracked vehicle*  
       for obj in tracked\_objects:  
           if not self.sighting\_manager.is\_processed(obj.tracker\_id):  
               plate\_text, confidence \= self.plate\_reader.read(frame, obj.bbox)  
               if plate\_text:  
                   self.trigger\_sighting\_event(obj, plate\_text, confidence)  
\`\`\`

\*\*SightingManager\*\*  
\`\`\`python  
class SightingManager:  
   def \_\_init\_\_(self):  
       self.processed\_trackers: Set\[int\] \= set()  
        
   def is\_processed(self, tracker\_id: int) \-\> bool:  
       return tracker\_id in self.processed\_trackers  
        
   def mark\_processed(self, tracker\_id: int) \-\> None:  
       self.processed\_trackers.add(tracker\_id)  
        
   def remove\_tracker(self, tracker\_id: int) \-\> None:  
       self.processed\_trackers.discard(tracker\_id)  
\`\`\`

\*\*CloudClient\*\*  
\`\`\`python  
class CloudClient:  
   def \_\_init\_\_(self, api\_url: str, api\_key: str):  
       self.api\_url \= api\_url  
       self.headers \= {  
           "x-api-key": api\_key,  *\# AWS API Gateway API key format*  
           "Content-Type": "application/json"  
       }  
        
   def send\_sighting(self, payload: dict) \-\> bool:  
       *\# POST to AWS API Gateway endpoint /api/v1/sightings with retry logic*  
       *\# Returns True on success, False on failure*  
\`\`\`

**\#\#\#\# Data Flow**  
1\. Camera captures frame at 10+ FPS  
2\. YOLOv8 detects vehicle bounding boxes  
3\. SORT/DeepSORT assigns/maintains tracker IDs  
4\. ANPR model reads plates for each tracked vehicle  
5\. On first successful read for a tracker ID:  
  \- Trigger sighting event  
  \- Save image: \`\[timestamp\]\_\[plateNumber\].jpg\`  
  \- Send JSON to cloud: \`{"plateNumber": "...", "timestamp": "...", "locationId": "..."}\`  
6\. Mark tracker as processed  
7\. Remove tracker when vehicle exits frame

**\#\#\# Component 2: Cloud Backend**

**\#\#\#\# API Structure**  
\`\`\`  
backend/  
├── app/  
│   ├── api/  
│   │   ├── v1/  
│   │   │   ├── endpoints/  
│   │   │   │   ├── sightings.py        \# Ingestion \+ Query endpoints  
│   │   │   │   └── devices.py          \# Device management  
│   │   │   └── router.py  
│   │   └── deps.py                     \# Dependency injection  
│   ├── core/  
│   │   ├── config.py                   \# Settings management (AWS SSM/Secrets Manager)  
│   │   ├── security.py                 \# API key validation, Cognito JWT verification  
│   │   ├── database.py                 \# AWS RDS connection  
│   │   └── aws.py                      \# AWS service clients (Cognito, Secrets Manager)  
│   ├── models/  
│   │   ├── sighting.py                 \# SQLAlchemy models  
│   │   └── device.py  
│   ├── schemas/  
│   │   ├── sighting.py                 \# Pydantic schemas  
│   │   └── device.py  
│   ├── crud/  
│   │   ├── sighting.py                 \# Database operations  
│   │   └── device.py  
│   └── main.py                         \# FastAPI app  
├── alembic/                            \# Database migrations  
├── tests/  
├── Dockerfile                          \# Container for ECS Fargate  
└── requirements.txt  
\`\`\`

**\#\#\#\# API Endpoints**

\*\*Ingestion API (Device Authentication via AWS API Gateway)\*\*  
\`\`\`  
POST /api/v1/sightings  
Headers:  
 x-api-key: \<aws\_api\_gateway\_key\>  
 Content-Type: application/json  
Body: {  
 "plateNumber": "XYZ-789",  
 "timestamp": "2025-11-07T22:05:10Z",  
 "locationId": "LOC-001\_Main-St-Bridge"  
}  
Response: 201 Created  
{  
 "id": "uuid",  
 "message": "Sighting recorded successfully"  
}  
\`\`\`

\*\*Query API (User Authentication via AWS Cognito)\*\*  
\`\`\`  
GET /api/v1/sightings?plateNumber=XYZ-789\&page=1\&limit=100  
Headers: Authorization: Bearer \<cognito\_jwt\_token\>  
Response: 200 OK  
{  
 "data": \[  
   {  
     "id": "uuid",  
     "plateNumber": "XYZ-789",  
     "timestamp": "2025-11-07T22:05:10Z",  
     "locationId": "LOC-001\_Main-St-Bridge",  
     "createdAt": "2025-11-07T22:05:11Z"  
   }  
 \],  
 "pagination": {  
   "page": 1,  
   "limit": 100,  
   "total": 1,  
   "pages": 1  
 }  
}  
\`\`\`

\*\*Authentication (Handled by AWS Cognito)\*\*  
\`\`\`  
\# User authentication is handled directly by AWS Cognito  
\# Web application uses AWS Amplify SDK to interact with Cognito  
\# No custom auth endpoints needed \- Cognito provides:  
\# \- Sign up  
\# \- Sign in (email/password)  
\# \- OAuth 2.0 / Social login  
\# \- Password reset  
\# \- MFA (optional)  
\# \- JWT token generation and validation

\# Backend validates Cognito JWT tokens via API Gateway Cognito Authorizer  
\`\`\`

**\#\#\#\# Key Classes**

\*\*Sighting Model (SQLAlchemy for AWS RDS PostgreSQL)\*\*  
\`\`\`python  
class Sighting(Base):  
   \_\_tablename\_\_ \= "sightings"  
    
   id \= Column(UUID(as\_uuid\=True), primary\_key\=True, default\=uuid.uuid4)  
   plate\_number \= Column(String(20), nullable\=False, index\=True)  
   timestamp \= Column(DateTime(timezone\=True), nullable\=False, index\=True)  
   location\_id \= Column(String(100), nullable\=False, index\=True)  
   created\_at \= Column(DateTime(timezone\=True), server\_default\=func.now())  
    
   *\# Indexes for query optimization on RDS*  
   \_\_table\_args\_\_ \= (  
       Index('idx\_plate\_timestamp', 'plate\_number', 'timestamp'),  
       Index('idx\_location\_timestamp', 'location\_id', 'timestamp'),  
   )  
\`\`\`

\*\*Sighting Schema (Pydantic)\*\*  
\`\`\`python  
class SightingCreate(BaseModel):  
   plateNumber: str \= Field(..., min\_length\=1, max\_length\=20)  
   timestamp: datetime  
   locationId: str \= Field(..., min\_length\=1, max\_length\=100)

class SightingResponse(BaseModel):  
   id: UUID  
   plateNumber: str  
   timestamp: datetime  
   locationId: str  
   createdAt: datetime  
\`\`\`

**\#\#\# Component 3: Web Application**

**\#\#\#\# Application Structure**  
\`\`\`  
web\_app/  
├── src/  
│   ├── components/  
│   │   ├── auth/  
│   │   │   ├── LoginForm.tsx  
│   │   │   ├── RegisterForm.tsx  
│   │   │   └── ProtectedRoute.tsx  
│   │   ├── search/  
│   │   │   ├── PlateSearchInput.tsx  
│   │   │   ├── SightingsList.tsx  
│   │   │   └── SightingCard.tsx  
│   │   ├── filters/  
│   │   │   ├── LocationFilter.tsx  
│   │   │   ├── DateRangeFilter.tsx  
│   │   │   └── FilterPanel.tsx  
│   │   ├── map/
│   │   │   ├── CityMap.tsx
│   │   │   └── MapController.tsx  
│   │   └── common/  
│   │       ├── Pagination.tsx  
│   │       ├── LoadingSpinner.tsx  
│   │       └── ErrorMessage.tsx  
│   ├── pages/  
│   │   ├── LoginPage.tsx  
│   │   ├── DashboardPage.tsx  
│   │   └── PlateSearchPage.tsx  
│   ├── services/  
│   │   ├── api.ts                      # Axios instance  
│   │   ├── authService.ts              # Login/logout  
│   │   └── sightingsService.ts         # Query sightings  
│   ├── hooks/  
│   │   ├── useAuth.ts  
│   │   └── useSightings.ts  
│   ├── types/  
│   │   ├── sighting.ts  
│   │   └── user.ts  
│   ├── utils/  
│   │   ├── dateFormatter.ts  
│   │   └── validators.ts  
│   ├── App.tsx  
│   └── main.tsx  
├── public/  
└── package.json  
```

#### Key Components

**PlateSearchPage**  
```typescript  
const PlateSearchPage: React.FC = () => {  
 const [plateNumber, setPlateNumber] = useState('');  
 const { data, isLoading, error } = useSightings({ plateNumber });  
  return (  
   <div>  
     <PlateSearchInput  
       value={plateNumber}  
       onChange={setPlateNumber}  
     />  
     {isLoading && <LoadingSpinner />}  
     {error && <ErrorMessage message={error.message} />}  
     {data && <SightingsList sightings={data.data} />}  
   </div>  
 );  
};  
```

**SightingsList**  
```typescript  
interface SightingsListProps {  
 sightings: Sighting[];  
}

const SightingsList: React.FC<SightingsListProps> = ({ sightings }) => {  
 *// Sort by timestamp descending (newest first)*  
 const sortedSightings = [...sightings].sort(  
   (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()  
 );  
  return (  
   <div>  
     {sortedSightings.map(sighting => (  
       <SightingCard key={sighting.id} sighting={sighting} />  
     ))}  
   </div>  
 );  
};  
```

**## Data Models**

**### Sighting Record**  
```typescript  
interface Sighting {  
 id: string;                    // UUID  
 plateNumber: string;           // License plate text  
 timestamp: string;             // ISO 8601 datetime  
 locationId: string;            // Edge device location  
 createdAt: string;             // Server insertion time
 vehicleMake?: string;          // MMC: Make
 vehicleModel?: string;         // MMC: Model
 vehicleColor?: string;         // MMC: Color
 direction?: string;            // Direction of travel (e.g. "North", "South")
 isHot?: boolean;               // Hotlist match flag
}  
```

**### User (Managed by AWS Cognito)**  
```typescript  
*// User data comes from AWS Cognito User Pool*  
*// Accessed via Cognito JWT token claims*  
interface CognitoUser {  
 sub: string;              *// Cognito user ID*  
 email: string;  
 email\_verified: boolean;  
 name?: string;  
 'cognito:username': string;  
}  
\`\`\`

**\#\#\# Device**  
\`\`\`typescript  
interface Device {  
 id: string;  
 locationId: string;  
 apiKeyId: string;              *// AWS API Gateway API Key ID*  
 apiKeyHash: string;            *// Hashed for verification*  
 isActive: boolean;  
 lastSeen: string;  
 createdAt: string;  
}  
\`\`\`

**\#\# Error Handling**

**\#\#\# Edge Device**  
\- \*\*Camera Connection Failure\*\*: Log error, retry connection every 30 seconds  
\- \*\*AI Model Load Failure\*\*: Log critical error, exit with error code  
\- \*\*API Transmission Failure\*\*: Log warning, retry up to 3 times with exponential backoff (1s, 2s, 4s)  
\- \*\*Disk Space Low\*\*: Log warning, trigger aggressive cleanup (reduce retention to 3 days)

**\#\#\# Cloud Backend**  
\- \*\*Invalid Payload\*\*: Return 400 with detailed validation errors  
\- \*\*Authentication Failure\*\*: Return 401 with generic error message (API Gateway handles this)  
\- \*\*Database Connection Loss\*\*: Return 503, implement connection retry with circuit breaker, leverage RDS Multi-AZ failover  
\- \*\*Query Timeout\*\*: Return 504, log slow query to CloudWatch for optimization  
\- \*\*AWS Service Errors\*\*: Log to CloudWatch, implement exponential backoff for transient failures

**\#\#\# Web Application**  
\- \*\*API Request Failure\*\*: Display user-friendly error message, offer retry button  
\- \*\*Authentication Expired\*\*: Redirect to login page, preserve intended destination  
\- \*\*Network Offline\*\*: Display offline indicator, queue requests for retry  
\- \*\*Empty Results\*\*: Display "No sightings found for this plate number"

**\#\# Testing Strategy**

**\#\#\# Edge Device Testing**  
\- \*\*Unit Tests\*\*: Test individual components (detector, tracker, ANPR) with mock data  
\- \*\*Integration Tests\*\*: Test full pipeline with recorded video files  
\- \*\*Performance Tests\*\*: Verify 10+ FPS processing on Raspberry Pi 4  
\- \*\*Hardware Tests\*\*: Test with actual camera and various lighting conditions

**\#\#\# Cloud Backend Testing**  
\- \*\*Unit Tests\*\*: Test CRUD operations, validation logic, Cognito JWT verification  
\- \*\*Integration Tests\*\*: Test API endpoints with test RDS database and mock Cognito  
\- \*\*Load Tests\*\*: Simulate 100+ concurrent edge devices sending data through API Gateway  
\- \*\*Security Tests\*\*: Test API Gateway authentication, Cognito authorization, SQL injection prevention  
\- \*\*AWS Integration Tests\*\*: Test RDS connectivity, Secrets Manager integration, CloudWatch logging

**\#\#\# Web Application Testing**  
\- \*\*Unit Tests\*\*: Test components with React Testing Library  
\- \*\*Integration Tests\*\*: Test user flows with Cypress or Playwright  
\- \*\*E2E Tests\*\*: Test complete search workflow from login to results display  
\- \*\*Accessibility Tests\*\*: Verify WCAG 2.1 AA compliance

**\#\# Security Considerations**

**\#\#\# Edge Device**  
\- Store API keys in encrypted configuration files  
\- Use HTTPS for all cloud communication  
\- Implement certificate pinning for API endpoint  
\- Secure local image storage with appropriate file permissions

**\#\#\# Cloud Backend**  
\- Use AWS Cognito for user authentication (handles JWT tokens, refresh tokens, password hashing)  
\- Leverage AWS API Gateway for rate limiting (100 req/min per device/user) and throttling  
\- Use parameterized queries with SQLAlchemy to prevent SQL injection  
\- Enable CORS in API Gateway with whitelist of allowed origins  
\- Store device API keys in AWS Secrets Manager  
\- Implement API key rotation mechanism using AWS API Gateway usage plans  
\- Use AWS WAF (Web Application Firewall) for additional protection against common attacks  
\- Enable AWS RDS encryption at rest and in transit  
\- Use VPC security groups to restrict database access to backend services only

**\#\#\# Web Application**  
\- Use AWS Amplify SDK for secure Cognito token management  
\- Cognito tokens stored securely by Amplify (httpOnly cookies or secure storage)  
\- Implement CSRF protection  
\- Sanitize all user inputs  
\- Use Content Security Policy headers via CloudFront  
\- Cognito handles session timeout (configurable in User Pool settings)  
\- Enable CloudFront HTTPS-only access  
\- Use AWS WAF with CloudFront for DDoS protection

**\#\# Deployment Architecture**

**\#\#\# Edge Device**  
\- Deploy as systemd service on Raspberry Pi OS  
\- Auto-start on boot  
\- Automatic restart on crash  
\- Log rotation with logrotate  
\- Store AWS API Gateway API key in encrypted config file

**\#\#\# Cloud Backend (AWS)**  
\- \*\*Compute\*\*: Deploy FastAPI as Docker container on AWS ECS Fargate  
 \- Auto-scaling based on CPU/memory metrics  
 \- Application Load Balancer for traffic distribution  
 \- Health checks for automatic container replacement  
\- \*\*API Gateway\*\*: AWS API Gateway REST API  
 \- API key authentication for edge devices  
 \- Cognito authorizer for user requests  
 \- Rate limiting and throttling policies  
 \- Request/response transformation  
\- \*\*Database\*\*: AWS RDS PostgreSQL Multi-AZ  
 \- Automated backups with point-in-time recovery  
 \- Read replicas for query scaling (future)  
 \- Encryption at rest and in transit  
\- \*\*Secrets\*\*: AWS Secrets Manager for database credentials and API keys  
\- \*\*Monitoring\*\*: AWS CloudWatch for logs, metrics, and alarms  
\- \*\*Networking\*\*: VPC with private subnets for RDS and ECS tasks  
\- \*\*CI/CD\*\*: AWS CodePipeline or GitHub Actions for automated deployments

**\#\#\# Web Application (AWS)**  
\- \*\*Build\*\*: Vite production build with environment-specific configuration  
\- \*\*Storage\*\*: AWS S3 bucket for static assets  
 \- Versioning enabled for rollback capability  
 \- Bucket policies for CloudFront-only access  
\- \*\*CDN\*\*: AWS CloudFront distribution  
 \- HTTPS/SSL with ACM certificate  
 \- Custom domain name  
 \- Caching policies for optimal performance  
 \- WAF integration for security  
\- \*\*Authentication\*\*: AWS Amplify SDK for Cognito integration  
\- \*\*CI/CD\*\*: AWS Amplify Hosting or S3 \+ CodePipeline for automated deployments

**\#\#\# Cloud Backend**  
\- Deploy as Docker container on cloud platform  
\- Use managed PostgreSQL service (RDS, Cloud SQL, or Azure Database)  
\- Implement horizontal scaling with load balancer  
\- Use environment variables for configuration  
\- Implement health check endpoint for monitoring

**\#\#\# Web Application**  
\- Build static assets with Vite  
\- Deploy to CDN (CloudFront, Vercel, or Netlify)  
\- Use environment-specific API endpoints  
\- Implement CI/CD pipeline for automated deployments

**\#\# Performance Optimization**

**\#\#\# Edge Device**  
\- Use GPU acceleration for YOLO inference (if available)  
\- Implement frame skipping under high load  
\- Use threading for parallel processing (detection, tracking, ANPR)  
\- Cache AI models in memory

**\#\#\# Cloud Backend**  
\- Implement database connection pooling with SQLAlchemy for RDS  
\- Use database indexes on all query fields (RDS PostgreSQL)  
\- Implement query result caching with Amazon ElastiCache for Redis (future enhancement)  
\- Use async/await for non-blocking I/O operations  
\- Leverage AWS RDS Performance Insights for query optimization  
\- Use AWS RDS Proxy for connection pooling and failover (optional)  
\- Enable API Gateway caching for frequently accessed queries

**\#\#\# Web Application**  
\- Implement lazy loading for components  
\- Use React Query for automatic caching and background refetching  
\- Implement virtual scrolling for large result sets  
\- Optimize bundle size with code splitting

**\#\# Monitoring and Observability**

**\#\#\# Edge Device**  
\- Log all sighting events with metadata  
\- Track processing FPS and latency  
\- Monitor disk space usage  
\- Send heartbeat to cloud every 5 minutes

**\#\#\# Cloud Backend (AWS)**  
\- Implement structured logging to AWS CloudWatch Logs with correlation IDs  
\- Track API response times and error rates with CloudWatch Metrics  
\- Monitor database query performance with RDS Performance Insights  
\- Set up CloudWatch Alarms for high error rates, slow responses, and resource utilization  
\- Use AWS X-Ray for distributed tracing and performance analysis  
\- Create CloudWatch Dashboard for real-time system monitoring  
\- Enable RDS Enhanced Monitoring for detailed database metrics  
\- Track API Gateway metrics (request count, latency, 4xx/5xx errors)

**\#\#\# Web Application**  
\- Implement error boundary components  
\- Track user interactions with analytics  
\- Monitor API call success/failure rates  
\- Log client-side errors to backend

**\#\# Future Enhancements (Post-Stage 1\)**

**\#\#\# AWS-Powered Enhancements**  
\- \*\*Real-time notifications\*\*: Amazon SNS for push notifications, Amazon SES for email alerts  
\- \*\*Advanced analytics\*\*: Amazon QuickSight for interactive dashboards and reporting  
\- \*\*Video storage\*\*: Amazon S3 with lifecycle policies for video clip storage and archival to Glacier  
\- \*\*Image storage\*\*: S3 for edge device images with presigned URLs for secure access  
\- \*\*Real-time processing\*\*: AWS Lambda \+ Amazon Kinesis for real-time stream processing  
\- \*\*Machine learning\*\*: Amazon SageMaker for ANPR model retraining and optimization  
\- \*\*IoT integration\*\*: AWS IoT Core for edge device management and OTA updates  
\- \*\*Search optimization\*\*: Amazon OpenSearch for advanced plate search with fuzzy matching  
\- \*\*Mobile app\*\*: AWS Amplify for iOS/Android app development with Cognito authentication  
\- \*\*Data lake\*\*: Amazon S3 \+ AWS Glue for long-term analytics and data warehousing  
\- \*\*External integrations\*\*: AWS Lambda for integration with stolen vehicle databases  
\- \*\*Multi-region\*\*: AWS Global Accelerator for multi-region deployment and disaster recovery

