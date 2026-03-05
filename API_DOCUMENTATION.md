# Juris AI Backend - API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication

Most endpoints require Firebase authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

---

## Endpoints

### 🏥 Health & Status

#### GET /
Get API information and available endpoints

**Response:**
```json
{
  "success": true,
  "message": "Juris AI Backend API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "cases": "/api/cases",
    "analytics": "/api/analytics",
    "predictions": "/api/predict",
    "users": "/api/users",
    "simulation": "/api/simulation"
  }
}
```

#### GET /health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-03-05T10:00:00.000Z"
}
```

---

### 📁 Cases API

#### GET /api/cases
Get all cases with optional filters

**Query Parameters:**
- `status` (optional) - Filter by status (Pending, Resolved, Under Review)
- `court` (optional) - Filter by court name
- `judge` (optional) - Filter by judge name
- `caseType` (optional) - Filter by case type (Civil, Criminal, Family, etc.)

**Example:**
```
GET /api/cases?status=Pending&court=Supreme%20Court
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "case-uuid",
      "caseId": "case-uuid",
      "court": "Supreme Court",
      "judge": "Justice Sharma",
      "caseType": "Constitutional",
      "filedDate": "2022-03-15T00:00:00.000Z",
      "lastHearingDate": "2025-01-10T00:00:00.000Z",
      "adjournments": 8,
      "status": "Pending",
      "priorityScore": 85,
      "description": "Constitutional validity case",
      "createdAt": "2026-03-05T10:00:00.000Z",
      "updatedAt": "2026-03-05T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/cases/:id
Get a specific case by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "case-uuid",
    "caseId": "case-uuid",
    "court": "Supreme Court",
    ...
  }
}
```

#### POST /api/cases
Create a new case (🔒 Auth Required)

**Request Body:**
```json
{
  "court": "High Court Delhi",
  "judge": "Justice Verma",
  "caseType": "Civil",
  "filedDate": "2024-01-15",
  "lastHearingDate": "2024-03-01",
  "adjournments": 2,
  "status": "Pending",
  "description": "Property dispute case"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Case created successfully",
  "data": {
    "caseId": "generated-uuid",
    "priorityScore": 65,
    ...
  }
}
```

#### PUT /api/cases/:id
Update a case (🔒 Auth Required)

**Request Body:**
```json
{
  "status": "Resolved",
  "adjournments": 3,
  "lastHearingDate": "2024-03-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Case updated successfully",
  "data": { ... }
}
```

#### DELETE /api/cases/:id
Delete a case (🔒 Auth Required)

**Response:**
```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

#### GET /api/cases/priority
Get high-priority cases

**Query Parameters:**
- `minScore` (optional, default: 70) - Minimum priority score

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [ ... ]
}
```

---

### 📊 Analytics API

#### GET /api/analytics/overview
Get dashboard overview with key metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCases": 50,
    "delayedCases": 20,
    "highPriorityCases": 15,
    "resolvedThisMonth": 5,
    "avgAdjournments": 4.2,
    "casesByType": {
      "Civil": 20,
      "Criminal": 15,
      "Family": 10,
      "Commercial": 5
    },
    "casesByStatus": {
      "Pending": 35,
      "Resolved": 10,
      "Under Review": 5
    },
    "casesByCourt": { ... },
    "generatedAt": "2026-03-05T10:00:00.000Z"
  }
}
```

#### GET /api/analytics/backlog
Get backlog analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBacklog": 35,
    "criticalBacklog": 10,
    "backlogByAge": {
      "0-6 months": 10,
      "6-12 months": 8,
      "1-2 years": 12,
      "2+ years": 5
    },
    "backlogByCourt": { ... },
    "backlogByType": { ... },
    "generatedAt": "2026-03-05T10:00:00.000Z"
  }
}
```

#### GET /api/analytics/adjournment-trends
Get adjournment trend analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "adjournmentDistribution": {
      "0": 5,
      "1-2": 15,
      "3-5": 20,
      "6+": 10
    },
    "avgByType": {
      "Civil": "4.5",
      "Criminal": "3.2"
    },
    "avgByCourt": { ... },
    "highAdjournmentCases": 10,
    "totalCases": 50,
    "generatedAt": "2026-03-05T10:00:00.000Z"
  }
}
```

#### GET /api/analytics/judge-performance
Get judge performance metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "Justice Sharma": {
      "totalCases": 10,
      "resolvedCases": 3,
      "pendingCases": 7,
      "avgAdjournments": "5.20",
      "resolutionRate": "30.00",
      "totalAdjournments": 52
    },
    ...
  }
}
```

---

### 🤖 Predictions API

#### POST /api/predict/:caseId
Generate AI prediction for a case (🔒 Auth Required)

**Response:**
```json
{
  "success": true,
  "message": "Prediction generated successfully",
  "data": {
    "predictionId": "pred-uuid",
    "caseId": "case-uuid",
    "adjournmentRisk": 0.75,
    "delayProbability": 0.68,
    "resolutionEstimate": "6-12 months",
    "topFactors": [
      {
        "factor": "High Adjournment Count",
        "impact": "High",
        "value": 8
      },
      {
        "factor": "Case Age",
        "impact": "Critical",
        "value": "35 months"
      }
    ],
    "confidence": 0.82,
    "generatedAt": "2026-03-05T10:00:00.000Z",
    "modelVersion": "1.0.0-simulated"
  }
}
```

#### GET /api/predict/:caseId
Get prediction for a specific case

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### GET /api/predict
Get all predictions

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [ ... ]
}
```

---

### 🎯 Simulation API

#### POST /api/simulation/fast-track
Run fast-track simulation (🔒 Auth Required)

**Request Body:**
```json
{
  "topN": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation completed successfully",
  "data": {
    "simulationId": "sim-1234567890",
    "topNCases": 10,
    "selectedCases": [
      {
        "caseId": "case-uuid",
        "court": "Supreme Court",
        "priorityScore": 95,
        "adjournments": 10
      }
    ],
    "currentBacklog": 35,
    "projectedBacklog": 25,
    "backlogReduction": 28.57,
    "timeSaved": {
      "days": 450,
      "months": 15.0
    },
    "resolutionTimeline": [
      {
        "caseId": "case-uuid",
        "estimatedResolution": "2026-03-12",
        "weeksFromNow": 1,
        "priorityScore": 95
      }
    ],
    "impactMetrics": {
      "avgPriorityScore": 87.5,
      "totalAdjournmentsSaved": 65,
      "affectedCourts": 3,
      "courtsList": ["Supreme Court", "High Court Delhi"],
      "caseTypeDistribution": {
        "Criminal": 4,
        "Civil": 3,
        "Constitutional": 3
      },
      "estimatedCostSavings": 150000,
      "citizensBenefited": 30
    },
    "simulatedAt": "2026-03-05T10:00:00.000Z"
  }
}
```

#### POST /api/simulation/compare
Compare multiple scenarios (🔒 Auth Required)

**Request Body:**
```json
{
  "scenarios": [10, 20, 50]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "scenario": "Top 10",
        "backlogReduction": 28.57,
        "timeSavedMonths": 15.0,
        "costSavings": 150000
      },
      {
        "scenario": "Top 20",
        "backlogReduction": 57.14,
        "timeSavedMonths": 30.0,
        "costSavings": 300000
      }
    ],
    "recommendation": {
      "optimalScenario": "Top 20",
      "reasoning": "This scenario provides the best balance..."
    },
    "generatedAt": "2026-03-05T10:00:00.000Z"
  }
}
```

---

### 👥 Users API

#### GET /api/users
Get all users (🔒 Auth Required)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "user-uuid",
      "uid": "user-uuid",
      "email": "justice.sharma@judiciary.gov.in",
      "displayName": "Justice Sharma",
      "role": "judge",
      "court": "Supreme Court",
      "experience": 25,
      "createdAt": "2026-03-05T10:00:00.000Z",
      "updatedAt": "2026-03-05T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/users/:id
Get user by ID (🔒 Auth Required)

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### POST /api/users
Create a new user

**Request Body:**
```json
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}
```

#### PUT /api/users/:id
Update user (🔒 Auth Required)

**Request Body:**
```json
{
  "displayName": "Updated Name",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Stack trace (only in development)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with cURL

### Get all cases
```bash
curl http://localhost:5000/api/cases
```

### Create a case (with auth)
```bash
curl -X POST http://localhost:5000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "court": "High Court Delhi",
    "judge": "Justice Verma",
    "caseType": "Civil",
    "filedDate": "2024-01-15",
    "status": "Pending",
    "adjournments": 2
  }'
```

### Get analytics overview
```bash
curl http://localhost:5000/api/analytics/overview
```

### Generate prediction
```bash
curl -X POST http://localhost:5000/api/predict/CASE_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (Frontend dev server)
- `http://localhost:8081` (Alternative frontend port)

Update `ALLOWED_ORIGINS` in `.env` for production.
