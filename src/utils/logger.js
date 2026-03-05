const { getFirestore } = require('../config/firebase');

class Logger {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
    };
  }

  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...data,
    };
  }

  async logToFirestore(level, message, data = {}) {
    try {
      const db = getFirestore();
      await db.collection('activityLogs').add({
        ...this.formatMessage(level, message, data),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to log to Firestore:', error.message);
    }
  }

  info(message, data = {}) {
    const log = this.formatMessage('INFO', message, data);
    console.log(
      `${this.colors.cyan}[INFO]${this.colors.reset} ${log.timestamp} - ${message}`,
      data
    );
  }

  success(message, data = {}) {
    const log = this.formatMessage('SUCCESS', message, data);
    console.log(
      `${this.colors.green}[SUCCESS]${this.colors.reset} ${log.timestamp} - ${message}`,
      data
    );
  }

  warn(message, data = {}) {
    const log = this.formatMessage('WARN', message, data);
    console.warn(
      `${this.colors.yellow}[WARN]${this.colors.reset} ${log.timestamp} - ${message}`,
      data
    );
  }

  error(message, data = {}) {
    const log = this.formatMessage('ERROR', message, data);
    console.error(
      `${this.colors.red}[ERROR]${this.colors.reset} ${log.timestamp} - ${message}`,
      data
    );
  }

  async logActivity(action, details = {}) {
    const message = `Activity: ${action}`;
    this.info(message, details);
    await this.logToFirestore('ACTIVITY', action, details);
  }
}

module.exports = new Logger();
