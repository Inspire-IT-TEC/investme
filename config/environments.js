// Environment Configuration for Different Deployment Stages

const configs = {
  development: {
    NODE_ENV: 'development',
    PORT: process.env.PORT || 5000,
    database: {
      url: process.env.DATABASE_URL,
      ssl: false,
      logging: true
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      expiresIn: '24h'
    },
    aws: {
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    email: {
      from: process.env.FROM_EMAIL || 'dev@investme.com.br',
      mode: 'development' // Uses local fallback
    },
    cors: {
      origin: '*',
      credentials: true
    },
    logging: {
      level: 'debug',
      enableConsole: true
    },
    features: {
      seedData: true,
      debugMode: true,
      hotReload: true
    }
  },

  production: {
    NODE_ENV: 'production',
    PORT: process.env.PORT || 5000,
    database: {
      url: process.env.DATABASE_URL,
      ssl: true,
      logging: false
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    aws: {
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    email: {
      from: process.env.FROM_EMAIL,
      mode: 'production' // Uses AWS SES
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://investme.com.br'],
      credentials: true
    },
    logging: {
      level: 'error',
      enableConsole: false
    },
    features: {
      seedData: false,
      debugMode: false,
      hotReload: false
    }
  },

  staging: {
    NODE_ENV: 'staging',
    PORT: process.env.PORT || 5000,
    database: {
      url: process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL,
      ssl: true,
      logging: true
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    aws: {
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    email: {
      from: process.env.FROM_EMAIL,
      mode: 'staging' // Uses AWS SES with staging settings
    },
    cors: {
      origin: process.env.STAGING_ORIGINS?.split(',') || ['https://staging.investme.com.br'],
      credentials: true
    },
    logging: {
      level: 'info',
      enableConsole: true
    },
    features: {
      seedData: true,
      debugMode: true,
      hotReload: false
    }
  }
};

const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // Check if running in Replit deployment
  if (process.env.REPLIT_DEPLOYMENT === '1') {
    return configs.production;
  }
  
  return configs[env] || configs.development;
};

export { getConfig, configs };