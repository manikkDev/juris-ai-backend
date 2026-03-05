const { initializeFirebase, getFirestore } = require('../src/config/firebase');
const { generateId, calculatePriorityScore, formatDate } = require('../src/utils/helpers');
const logger = require('../src/utils/logger');
const sampleCases = require('../src/data/sampleCases.json');

const judges = [
  { name: 'Justice Sharma', court: 'Supreme Court', experience: 25 },
  { name: 'Justice Verma', court: 'High Court Delhi', experience: 18 },
  { name: 'Justice Patel', court: 'District Court Mumbai', experience: 12 },
  { name: 'Justice Desai', court: 'High Court Mumbai', experience: 20 },
  { name: 'Justice Kumar', court: 'Supreme Court', experience: 22 },
  { name: 'Justice Singh', court: 'District Court Delhi', experience: 15 },
  { name: 'Justice Rao', court: 'High Court Bangalore', experience: 19 },
  { name: 'Justice Iyer', court: 'District Court Chennai', experience: 14 },
  { name: 'Justice Banerjee', court: 'High Court Kolkata', experience: 21 },
  { name: 'Justice Mehta', court: 'Supreme Court', experience: 23 },
];

const seedCases = async (db) => {
  try {
    logger.info('Seeding cases...');
    
    const casesCollection = db.collection('cases');
    let count = 0;

    for (const caseData of sampleCases) {
      const caseId = generateId();
      
      const priorityScore = calculatePriorityScore({
        adjournments: caseData.adjournments,
        filedDate: caseData.filedDate,
        caseType: caseData.caseType,
        status: caseData.status,
      });

      const newCase = {
        caseId,
        court: caseData.court,
        judge: caseData.judge,
        caseType: caseData.caseType,
        filedDate: formatDate(caseData.filedDate),
        lastHearingDate: formatDate(caseData.lastHearingDate),
        adjournments: caseData.adjournments,
        status: caseData.status,
        description: caseData.description,
        priorityScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await casesCollection.doc(caseId).set(newCase);
      count++;
    }

    for (let i = 0; i < 40; i++) {
      const caseId = generateId();
      const randomJudge = judges[Math.floor(Math.random() * judges.length)];
      const caseTypes = ['Civil', 'Criminal', 'Family', 'Commercial', 'Constitutional'];
      const statuses = ['Pending', 'Pending', 'Pending', 'Resolved', 'Under Review'];
      
      const adjournments = Math.floor(Math.random() * 10);
      const daysAgo = Math.floor(Math.random() * 1095);
      const filedDate = new Date();
      filedDate.setDate(filedDate.getDate() - daysAgo);

      const lastHearingDaysAgo = Math.floor(Math.random() * 90);
      const lastHearingDate = new Date();
      lastHearingDate.setDate(lastHearingDate.getDate() - lastHearingDaysAgo);

      const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const priorityScore = calculatePriorityScore({
        adjournments,
        filedDate: filedDate.toISOString(),
        caseType,
        status,
      });

      const newCase = {
        caseId,
        court: randomJudge.court,
        judge: randomJudge.name,
        caseType,
        filedDate: filedDate.toISOString(),
        lastHearingDate: lastHearingDate.toISOString(),
        adjournments,
        status,
        description: `${caseType} case - Auto-generated`,
        priorityScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await casesCollection.doc(caseId).set(newCase);
      count++;
    }

    logger.success(`✅ Seeded ${count} cases successfully`);
  } catch (error) {
    logger.error('Error seeding cases:', { error: error.message });
    throw error;
  }
};

const seedJudges = async (db) => {
  try {
    logger.info('Seeding judges...');
    
    const judgesCollection = db.collection('users');
    let count = 0;

    for (const judge of judges) {
      const judgeId = generateId();
      
      const judgeData = {
        uid: judgeId,
        email: `${judge.name.toLowerCase().replace(/\s+/g, '.')}@judiciary.gov.in`,
        displayName: judge.name,
        role: 'judge',
        court: judge.court,
        experience: judge.experience,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await judgesCollection.doc(judgeId).set(judgeData);
      count++;
    }

    logger.success(`✅ Seeded ${count} judges successfully`);
  } catch (error) {
    logger.error('Error seeding judges:', { error: error.message });
    throw error;
  }
};

const seedPredictions = async (db) => {
  try {
    logger.info('Seeding predictions...');
    
    const casesSnapshot = await db.collection('cases').limit(20).get();
    const predictionsCollection = db.collection('predictions');
    let count = 0;

    for (const caseDoc of casesSnapshot.docs) {
      const caseData = caseDoc.data();
      const predictionId = generateId();

      const daysPending = Math.floor(
        (new Date() - new Date(caseData.filedDate)) / (1000 * 60 * 60 * 24)
      );

      const adjournmentRisk = Math.min(0.95, 0.3 + (caseData.adjournments * 0.08));
      const delayProbability = Math.min(0.95, 0.25 + (caseData.adjournments * 0.1));

      let resolutionEstimate = '1-3 months';
      if (caseData.adjournments > 5 || daysPending > 730) {
        resolutionEstimate = '12-18 months';
      } else if (caseData.adjournments > 3 || daysPending > 365) {
        resolutionEstimate = '6-12 months';
      } else if (caseData.adjournments > 1 || daysPending > 180) {
        resolutionEstimate = '3-6 months';
      }

      const prediction = {
        predictionId,
        caseId: caseData.caseId,
        adjournmentRisk,
        delayProbability,
        resolutionEstimate,
        topFactors: [
          {
            factor: 'Adjournment Count',
            impact: caseData.adjournments > 5 ? 'High' : 'Medium',
            value: caseData.adjournments,
          },
          {
            factor: 'Case Age',
            impact: daysPending > 365 ? 'High' : 'Medium',
            value: `${Math.floor(daysPending / 30)} months`,
          },
        ],
        confidence: 0.78,
        generatedAt: new Date().toISOString(),
        modelVersion: '1.0.0-seeded',
      };

      await predictionsCollection.doc(predictionId).set(prediction);
      count++;
    }

    logger.success(`✅ Seeded ${count} predictions successfully`);
  } catch (error) {
    logger.error('Error seeding predictions:', { error: error.message });
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('\n🌱 Starting database seeding process...\n');

    initializeFirebase();
    const db = getFirestore();

    await seedJudges(db);
    await seedCases(db);
    await seedPredictions(db);

    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
