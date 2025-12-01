# Plate-Watch Local Deployment Guide

This document provides step-by-step instructions and a script to deploy the Plate-Watch system locally.

## Prerequisites

Ensure you have the following installed on your machine:
- **Docker & Docker Compose**: For running the backend API and PostgreSQL database.
- **Node.js & npm**: For the web application.
- **Python 3.9+**: For the edge device simulation.

## Automated Deployment

We have provided a script to automate the setup and running of all components.

1.  Make the script executable:
    ```bash
    chmod +x deploy_local.sh
    ```
2.  Run the script:
    ```bash
    ./deploy_local.sh
    ```

This script will:
- Start the Backend and Database using Docker Compose (detached mode).
- Install Node.js dependencies and start the Web App (background process).
- Create a Python virtual environment, install requirements, and start the Edge Device simulation (background process).
- Stream logs from the services.
- Stop all services when you press `Ctrl+C`.

## Manual Deployment

If you prefer to run components individually, follow these steps:

### 1. Backend & Database
Start the core services (FastAPI and PostgreSQL).

```bash
docker-compose up --build
```
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database GUI**: [http://localhost:8080](http://localhost:8080)

### 2. Web Application
Run the frontend dashboard.

```bash
cd web_app
npm install
npm run dev
```
- **Dashboard**: [http://localhost:5173](http://localhost:5173)

### 3. Edge Device Simulation
Run the mock camera device that generates license plate sightings.

```bash
cd edge_device
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Troubleshooting

- **Port Conflicts**: Ensure ports `8000` (API), `8080` (Adminer), and `5173` (Web App) are free.
- **Database Connection**: If the backend fails to connect to the DB, ensure the `db` service in Docker is healthy.
- **Missing Dependencies**: If `npm` or `pip` commands fail, check your internet connection and version compatibility.
