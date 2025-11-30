**\# Requirements Document**

**\#\# Introduction**

The Plate-Watch system is an end-to-end vehicle monitoring solution that combines edge computing, cloud infrastructure, and web-based management. The system performs real-time Automatic Number Plate Recognition (ANPR) at the edge using Raspberry Pi devices, transmits minimal metadata to a cloud backend, and provides a web interface for data query and system management. This document focuses on Stage 1 requirements, covering the core Edge Device functionality, Cloud Backend API, and basic Web Application interface.

**\#\# Glossary**

\- \*\*Edge\_Device\*\*: A Raspberry Pi unit deployed at a physical location that processes video streams locally and performs AI-based vehicle detection and ANPR  
\- \*\*Cloud\_Backend\*\*: The central server infrastructure that receives, stores, and serves vehicle sighting data via REST API  
\- \*\*Web\_Application\*\*: The browser-based user interface for querying sighting data and managing the system  
\- \*\*ANPR\*\*: Automatic Number Plate Recognition \- the process of using OCR to extract license plate text from vehicle images  
\- \*\*Sighting\_Event\*\*: A single occurrence of a vehicle being detected and its license plate successfully read at a specific location  
\- \*\*Tracker\_ID\*\*: A unique identifier assigned by the object tracking algorithm to a specific vehicle as it moves through the video frame  
\- \*\*Location\_ID\*\*: A unique, static string identifier (e.g., "LOC-001\_Main-St-Bridge") that identifies the physical location of an Edge\_Device  
\- \*\*De-duplication\*\*: The process of ensuring that each vehicle passing through the frame triggers only one Sighting\_Event, regardless of how many frames it appears in  
\- \*\*Metadata\_Payload\*\*: The JSON data structure containing sighting information transmitted from Edge\_Device to Cloud\_Backend  
\- \*\*AI\_Pipeline\*\*: The sequence of AI models (vehicle detection, object tracking, ANPR) that process the video stream

**\#\# Requirements**

**\#\#\# Requirement 1: Edge Device Identity Management**

\*\*User Story:\*\* As a system administrator, I want each Edge Device to have a unique location identifier, so that I can distinguish which physical location generated each vehicle sighting.

**\#\#\#\# Acceptance Criteria**

1\. WHEN the Edge\_Device is initialized, THE Edge\_Device SHALL load a static Location\_ID from its configuration  
2\. THE Edge\_Device SHALL include the Location\_ID in every Metadata\_Payload transmitted to the Cloud\_Backend  
3\. THE Edge\_Device SHALL use a string format for Location\_ID that follows the pattern of alphanumeric characters with hyphens and underscores  
4\. THE Edge\_Device SHALL validate that the Location\_ID is non-empty before beginning video processing operations  
5\. IF the Location\_ID is missing or invalid during initialization, THEN THE Edge\_Device SHALL log an error and refuse to start the AI\_Pipeline

**\#\#\# Requirement 2: Real-Time Video Processing Pipeline**

\*\*User Story:\*\* As an Edge Device operator, I want the system to continuously process video streams using AI models, so that vehicles can be detected and their plates read in real-time.

**\#\#\#\# Acceptance Criteria**

1\. THE Edge\_Device SHALL continuously capture frames from a connected camera device at a minimum rate of 10 frames per second  
2\. THE Edge\_Device SHALL apply a vehicle detection model to each captured frame to identify vehicle bounding boxes  
3\. WHEN a vehicle is detected in a frame, THE Edge\_Device SHALL apply an object tracking algorithm to assign or maintain a Tracker\_ID for that vehicle  
4\. THE Edge\_Device SHALL apply the ANPR model to extract license plate text from the bounding box of each tracked vehicle  
5\. THE Edge\_Device SHALL process the video stream without requiring manual intervention or frame-by-frame triggering

**\#\#\# Requirement 3: Vehicle Tracking and De-duplication**

\*\*User Story:\*\* As a data analyst, I want each vehicle to generate only one sighting record per pass through the camera view, so that my traffic counts and analytics are accurate.

**\#\#\#\# Acceptance Criteria**

1\. WHEN a new vehicle enters the video frame, THE Edge\_Device SHALL assign a unique Tracker\_ID to that vehicle  
2\. WHEN the ANPR model successfully reads a license plate for a Tracker\_ID for the first time, THE Edge\_Device SHALL mark that Tracker\_ID as processed  
3\. WHILE a Tracker\_ID remains marked as processed, THE Edge\_Device SHALL NOT generate additional Sighting\_Events for that Tracker\_ID  
4\. WHEN a tracked vehicle exits the video frame, THE Edge\_Device SHALL remove the Tracker\_ID from its internal tracking state  
5\. IF the same physical vehicle re-enters the frame after exiting, THEN THE Edge\_Device SHALL assign a new Tracker\_ID and treat it as a new Sighting\_Event

**\#\#\# Requirement 4: Sighting Event Triggering**

\*\*User Story:\*\* As a system operator, I want the Edge Device to automatically detect when a new vehicle sighting occurs, so that relevant data is captured and transmitted without manual intervention.

**\#\#\#\# Acceptance Criteria**

1\. WHEN the ANPR model successfully reads a license plate text for a new Tracker\_ID, THE Edge\_Device SHALL trigger a Sighting\_Event  
2\. THE Edge\_Device SHALL trigger a Sighting\_Event only once per Tracker\_ID lifecycle  
3\. WHEN a Sighting\_Event is triggered, THE Edge\_Device SHALL initiate both cloud data transmission and local image storage operations  
4\. THE Edge\_Device SHALL record the timestamp of the Sighting\_Event with millisecond precision  
5\. IF the ANPR model fails to read a plate before the vehicle exits the frame, THEN THE Edge\_Device SHALL NOT trigger a Sighting\_Event for that Tracker\_ID

**\#\#\# Requirement 5: Cloud Data Transmission**

\*\*User Story:\*\* As a backend developer, I want the Edge Device to send structured JSON metadata to the cloud API, so that sighting data can be stored and queried centrally.

**\#\#\#\# Acceptance Criteria**

1\. WHEN a Sighting\_Event is triggered, THE Edge\_Device SHALL immediately construct a Metadata\_Payload in JSON format with exactly three fields: plateNumber, timestamp, and locationId  
2\. THE Edge\_Device SHALL format the plateNumber field as a string containing the license plate text extracted by the ANPR model  
3\. THE Edge\_Device SHALL format the timestamp field as an ISO 8601 string in the format "YYYY-MM-DDTHH:MM:SSZ"  
4\. THE Edge\_Device SHALL format the locationId field as a string matching the configured Location\_ID value with the example format "LOC-001\_Main-St-Bridge"  
5\. THE Edge\_Device SHALL transmit the Metadata\_Payload to the Cloud\_Backend API endpoint via HTTPS POST request  
6\. THE Edge\_Device SHALL NOT include video streams, image files, binary data, or confidence scores in the Metadata\_Payload  
7\. IF the Cloud\_Backend API returns an error response, THEN THE Edge\_Device SHALL log the failure and retry transmission up to 3 times with exponential backoff

**\#\#\# Requirement 6: Local Image Storage**

\*\*User Story:\*\* As a system administrator, I want the Edge Device to save a local image of each detected vehicle, so that I can verify ANPR accuracy and investigate discrepancies.

**\#\#\#\# Acceptance Criteria**

1\. WHEN a Sighting\_Event is triggered, THE Edge\_Device SHALL save exactly one representative image frame to the local filesystem  
2\. THE Edge\_Device SHALL select the frame with the highest ANPR confidence score as the representative image for storage  
3\. THE Edge\_Device SHALL name the saved image file using the strict format "\[timestamp\]\_\[plateNumber\].jpg" where timestamp follows the format "YYYYMMDDHHMMSS"  
4\. THE Edge\_Device SHALL use the example filename format "20251107220510\_XYZ-789.jpg" where the timestamp represents the exact moment of the Sighting\_Event  
5\. THE Edge\_Device SHALL store images in a designated local directory with appropriate file permissions  
6\. THE Edge\_Device SHALL save images in JPEG format with a quality setting that balances file size and readability  
7\. THE Edge\_Device SHALL ensure the filename contains queryable event data including both timestamp and plateNumber  
8\. THE Edge\_Device SHALL implement a storage management policy that deletes images older than 7 days to prevent disk overflow

**\#\#\# Requirement 7: Cloud Backend Ingestion API**

\*\*User Story:\*\* As a backend developer, I want the Cloud Backend to provide a secure API endpoint for receiving sighting data from Edge Devices, so that only authenticated devices can submit data to the system.

**\#\#\#\# Acceptance Criteria**

1\. THE Cloud\_Backend SHALL expose a REST API endpoint that accepts POST requests with Metadata\_Payload in JSON format  
2\. THE Cloud\_Backend SHALL support MQTT protocol as an alternative ingestion method for Edge\_Device communication  
3\. THE Cloud\_Backend SHALL authenticate incoming requests from Edge\_Devices using API keys or token-based authentication mechanisms  
4\. WHEN the Cloud\_Backend receives a Metadata\_Payload, THE Cloud\_Backend SHALL validate that all required fields defined in the JSON schema are present and correctly formatted  
5\. IF the authentication credentials are invalid or missing, THEN THE Cloud\_Backend SHALL return an HTTP 401 Unauthorized error response  
6\. IF the Metadata\_Payload validation fails, THEN THE Cloud\_Backend SHALL return an HTTP 400 error with a descriptive error message  
7\. WHEN the Metadata\_Payload is valid and authenticated, THE Cloud\_Backend SHALL return an HTTP 201 status code with a confirmation response

**\#\#\# Requirement 8: Cloud Backend Database Provisioning**

\*\*User Story:\*\* As a system architect, I want the Cloud Backend to use a scalable database solution, so that the system can handle growing volumes of sighting data without performance degradation.

**\#\#\#\# Acceptance Criteria**

1\. THE Cloud\_Backend SHALL provision a cloud-based database system capable of horizontal scaling  
2\. THE Cloud\_Backend SHALL support PostgreSQL, Firestore, or DynamoDB as the database technology  
3\. THE Cloud\_Backend SHALL create a primary table or collection named "sightings" for storing vehicle sighting records  
4\. THE Cloud\_Backend SHALL define the sightings schema with the following mandatory fields: plateNumber (String), timestamp (Timestamp), locationId (String)  
5\. THE Cloud\_Backend SHALL include standard metadata fields in the sightings schema including id and createdAt

**\#\#\# Requirement 9: Cloud Backend Data Storage and Indexing**


**\#\#\#\# Acceptance Criteria**

1\. THE Cloud\_Backend SHALL expose a REST API endpoint that accepts GET requests for querying sighting records from the sightings table  
2\. THE Cloud\_Backend SHALL support query parameters for filtering by locationId, date range, and plateNumber  
3\. WHEN a query request is received, THE Cloud\_Backend SHALL return matching sighting records in JSON format with pagination support  
4\. THE Cloud\_Backend SHALL limit query results to a maximum of 100 records per page to prevent performance degradation  
5\. THE Cloud\_Backend SHALL return an empty array with HTTP 200 status when no records match the query criteria

**\#\#\# Requirement 11: Web Application User Authentication**

\*\*User Story:\*\* As a system administrator, I want the Web Application to require secure user authentication, so that only authorized users can access vehicle sighting data.

**\#\#\#\# Acceptance Criteria**

1\. THE Web\_Application SHALL require users to authenticate before accessing any sighting data or system features  
2\. THE Web\_Application SHALL support email and password authentication as the primary login method  
3\. THE Web\_Application SHALL support OAuth authentication as an alternative login method  
4\. WHEN a user attempts to access a protected page without authentication, THE Web\_Application SHALL redirect the user to the login page  
5\. WHEN a user successfully authenticates, THE Web\_Application SHALL create a secure session and grant access to the application features  
6\. THE Web\_Application SHALL provide a logout function that terminates the user session and clears authentication credentials  
7\. THE Web\_Application SHALL implement password security requirements including minimum length and complexity rules

**\#\#\# Requirement 12: Web Application Plate Search View**

\*\*User Story:\*\* As an end user, I want to search for a specific license plate and view all sighting records for that vehicle, so that I can track vehicle movements across monitored locations.

**\#\#\#\# Acceptance Criteria**

1\. THE Web\_Application SHALL provide a dedicated plate search interface as the primary user-facing feature  
2\. THE Web\_Application SHALL display an input field where users can enter a license plate number for search  
3\. WHEN the user submits a license plate search, THE Web\_Application SHALL query the Cloud\_Backend for all sighting records matching the plateNumber field  
4\. THE Web\_Application SHALL display search results in a chronological list sorted by timestamp with newest entries first  
5\. THE Web\_Application SHALL show the timestamp and locationId for each sighting record in the results list  
6\. THE Web\_Application SHALL display the plateNumber being searched at the top of the results view  
7\. WHEN no matching records are found, THE Web\_Application SHALL display a message indicating no sightings exist for the entered plate number

**\#\#\# Requirement 13: Web Application Data Display**

\*\*User Story:\*\* As an end user, I want to view vehicle sighting records through a web interface, so that I can monitor traffic and search for specific vehicles.

**\#\#\#\# Acceptance Criteria**

1\. THE Web\_Application SHALL display a table or list view of vehicle sighting records retrieved from the Cloud\_Backend  
2\. THE Web\_Application SHALL show the following information for each sighting: locationId, plateNumber, and timestamp  
3\. THE Web\_Application SHALL format timestamps in a human-readable format with date and time components  
4\. THE Web\_Application SHALL implement pagination controls to navigate through multiple pages of results when more than 100 records are returned  
5\. THE Web\_Application SHALL update the display when new query parameters are applied without requiring a full page reload

**\#\#\# Requirement 14: Web Application Search and Filter**

\*\*User Story:\*\* As an end user, I want to search and filter sighting records by location, date, and license plate, so that I can find specific vehicles or analyze traffic patterns at particular locations.

**\#\#\#\# Acceptance Criteria**

1\. THE Web\_Application SHALL provide input fields for entering search criteria including locationId, date range, and plateNumber  
2\. WHEN the user submits search criteria, THE Web\_Application SHALL send a query request to the Cloud\_Backend with the specified filters  
3\. THE Web\_Application SHALL display the filtered results in the data display area  
4\. THE Web\_Application SHALL allow partial matching for plateNumber searches to accommodate incomplete plate numbers  
5\. THE Web\_Application SHALL provide a clear or reset button that removes all filters and displays all recent sightings

**\#\#\# Requirement 15: System Error Handling and Logging**

\*\*User Story:\*\* As a system administrator, I want comprehensive error logging across all components, so that I can diagnose issues and maintain system reliability.

**\#\#\#\# Acceptance Criteria**

1\. THE Edge\_Device SHALL log all errors related to camera connection, AI model failures, and network transmission issues to a local log file  
2\. THE Cloud\_Backend SHALL log all incoming requests, validation errors, and database operations with appropriate severity levels  
3\. WHEN a critical error occurs on the Edge\_Device, THE Edge\_Device SHALL attempt to recover automatically and log the recovery attempt  
4\. THE Cloud\_Backend SHALL implement structured logging with timestamps, severity levels, and contextual information  
5\. THE Web\_Application SHALL display user-friendly error messages when API requests fail or return errors


### Requirement 16: Local Development Support

**User Story:** As a developer, I want to run the entire system locally without external cloud dependencies, so that I can iterate quickly and test changes offline.

#### Acceptance Criteria

1. THE System SHALL provide a `docker-compose` configuration that spins up the Cloud Backend, PostgreSQL database, and Web Application locally.
2. THE Edge_Device SHALL support a "simulation mode" where it processes a local video file instead of a live camera feed.
3. THE Edge_Device SHALL be configurable to send data to a local API endpoint (e.g., `http://localhost:8000`) instead of AWS API Gateway.
4. THE Cloud_Backend SHALL support a "local auth" mode that bypasses AWS Cognito and accepts a static development token or no authentication.
5. THE Web_Application SHALL support a "local auth" mode to simulate user login without connecting to AWS Cognito.
