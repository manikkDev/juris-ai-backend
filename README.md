# Juris AI Backend

Backend service for **Juris AI** - An AI-powered judicial case intelligence system that provides predictive analytics, case prioritization, and backlog management for judicial systems.

## 🏗️ Architecture

This is a production-grade Node.js backend built with:

- **Express.js** - Web framework
- **Firebase Admin SDK** - Database and authentication
- **Firestore** - NoSQL database
- **RESTful API** - Clean API design
- **Modular Architecture** - Scalable and maintainable

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.js          # Firebase Admin SDK initialization
│   │   └── env.js               # Environment configuration
│   ├── controllers/
│   │   ├── caseController.js    # Case management endpoints
│   │   ├── analyticsController.js
│   │   ├── predictionController.js
│   │   └── userController.js
│   ├── services/
│   │   ├── caseService.js       # Business logic for cases
│   │   ├── predictionService.js # AI prediction simulation
│   │   ├── analyticsService.js  # Analytics engine
│   │   └── simulationService.js # Backlog simulation
│   ├── routes/
│   │   ├── caseRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── userRoutes.js
│   │   └── simulationRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Firebase token verification
│   │   └── errorMiddleware.js   # Error handling
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   └── helpers.js           # Helper functions
│   ├── data/
│   │   ├── sampleCases.json
│   │   └── samplePredictions.json
│   ├── ml/
│   │   └── modelClient.js       # ML service client (future)
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── scripts/
│   └── seedDatabase.js          # Database seeding script
├── tests/                       # Test files (future)
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Firebase project with Firestore enabled
- Firebase Admin SDK credentials

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/manikkDev/juris-ai-backend.git
cd juris-ai-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
PORT=5000
NODE_ENV=development

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"

ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
```

**Getting Firebase Credentials:**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy the values to your `.env` file

4. **Seed the database**

```bash
npm run seed
```

This will populate Firestore with:
- 50 sample cases
- 10 judge profiles
- 20 prediction records

5. **Start the development server**

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check

```
GET /health
GET /
```

### Cases

```
GET    /api/cases              # Get all cases (with filters)
GET    /api/cases/:id          # Get case by ID
POST   /api/cases              # Create new case (auth required)
PUT    /api/cases/:id          # Update case (auth required)
DELETE /api/cases/:id          # Delete case (auth required)
GET    /api/cases/priority     # Get high-priority cases
```

**Query Parameters for GET /api/cases:**
- `status` - Filter by status (Pending, Resolved, etc.)
- `court` - Filter by court name
- `judge` - Filter by judge name
- `caseType` - Filter by case type

### Analytics

```
GET /api/analytics/overview           # Dashboard overview
GET /api/analytics/backlog            # Backlog analysis
GET /api/analytics/adjournment-trends # Adjournment trends
GET /api/analytics/judge-performance  # Judge performance metrics
```

### Predictions

```
POST /api/predict/:caseId    # Generate prediction (auth required)
GET  /api/predict/:caseId    # Get prediction for case
GET  /api/predict            # Get all predictions
```

### Simulation

```
POST /api/simulation/fast-track  # Run fast-track simulation (auth required)
POST /api/simulation/compare     # Compare scenarios (auth required)
```

### Users

```
GET  /api/users        # Get all users (auth required)
GET  /api/users/:id    # Get user by ID (auth required)
POST /api/users        # Create user
PUT  /api/users/:id    # Update user (auth required)
```

## 🔐 Authentication

Protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

The frontend should obtain this token from Firebase Authentication and include it in API requests.

## 📊 Data Models

### Case

```javascript
{
  caseId: string,
  court: string,
  judge: string,
  caseType: string,
  filedDate: string (ISO),
  lastHearingDate: string (ISO),
  adjournments: number,
  status: string,
  priorityScore: number,
  description: string,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

### Prediction

```javascript
{
  predictionId: string,
  caseId: string,
  adjournmentRisk: number (0-1),
  delayProbability: number (0-1),
  resolutionEstimate: string,
  topFactors: array,
  confidence: number,
  generatedAt: string (ISO),
  modelVersion: string
}
```

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

## 🔧 Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

## 🚢 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Update `ALLOWED_ORIGINS` with production frontend URL
3. Use strong `JWT_SECRET`
4. Enable Firebase security rules
5. Set up proper CORS configuration
6. Configure logging and monitoring

### Deploy to Cloud

The backend can be deployed to:
- Google Cloud Run
- AWS Lambda
- Heroku
- DigitalOcean
- Any Node.js hosting platform

## 🤖 ML Integration (Future)

The backend is designed to integrate with a Python ML microservice. The `modelClient.js` currently uses simulated predictions but can be updated to call a real ML service at `ML_SERVICE_URL`.

## 📈 Monitoring

Activity logs are automatically stored in Firestore's `activityLogs` collection for:
- Case creation/updates
- Prediction generation
- Simulation runs

## 🛡️ Security

- Firebase Admin SDK for authentication
- Token verification middleware
- Input validation
- Error handling
- CORS configuration
- Environment variable protection

## 🤝 Contributing

This is a hackathon project. For production use, consider:
- Adding comprehensive tests
- Implementing rate limiting
- Adding request validation with Joi/Zod
- Setting up CI/CD pipeline
- Adding API documentation (Swagger)
- Implementing caching (Redis)

## 📄 License

MIT

## 👥 Team

Juris AI Team

## 🔗 Related Repositories

- Frontend: [juris-ai-frontend](https://github.com/manikkDev/juris-ai-frontend)

---

**Built with ❤️ for improving judicial efficiency**
