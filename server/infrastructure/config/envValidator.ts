/**
 * Environment Configuration Validator
 * Validates and logs all environment variables on startup
 */

export interface EnvConfig {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  databaseUrl: string;

  // Ollama
  ollamaBaseUrl: string;
  ollamaApiKey: string;
  ollamaGeneralModel: string;
  ollamaLongformModel: string;

  // JWT
  jwtSecret: string;
  jwtAccessExpires: string;
  jwtRefreshExpires: string;

  // Optional
  frontendUrl?: string;
  adminEmail?: string;
  replitDomains?: string;
}

interface ValidationResult {
  isValid: boolean;
  config: EnvConfig;
  errors: string[];
  warnings: string[];
}

/**
 * Validate and load environment configuration
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL;
  const ollamaApiKey = process.env.OLLAMA_API_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  // Validate required vars
  if (!ollamaBaseUrl) {
    errors.push('OLLAMA_BASE_URL is required');
  }
  if (!ollamaApiKey) {
    errors.push('OLLAMA_API_KEY is required');
  }
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required');
  }
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required');
  }

  // Warnings for defaults being used
  if (!process.env.OLLAMA_GENERAL_MODEL) {
    warnings.push('OLLAMA_GENERAL_MODEL not set, using default: darkplanet-general:latest');
  }
  if (!process.env.OLLAMA_LONGFORM_MODEL) {
    warnings.push('OLLAMA_LONGFORM_MODEL not set, using default: dolphin-mixtral:latest');
  }
  if (jwtSecret === 'dev-secret-change-in-production-abc123xyz789') {
    warnings.push('JWT_SECRET is using default dev value - change in production!');
  }

  const config: EnvConfig = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: databaseUrl || '',
    ollamaBaseUrl: ollamaBaseUrl || '',
    ollamaApiKey: ollamaApiKey || '',
    ollamaGeneralModel: process.env.OLLAMA_GENERAL_MODEL || 'darkplanet-general:latest',
    ollamaLongformModel: process.env.OLLAMA_LONGFORM_MODEL || 'dolphin-mixtral:latest',
    jwtSecret: jwtSecret || '',
    jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    frontendUrl: process.env.FRONTEND_URL,
    adminEmail: process.env.ADMIN_EMAIL,
    replitDomains: process.env.REPLIT_DOMAINS,
  };

  return {
    isValid: errors.length === 0,
    config,
    errors,
    warnings,
  };
}

/**
 * Mask sensitive values for logging
 */
function maskSecret(value: string | undefined, showChars: number = 4): string {
  if (!value) return '(not set)';
  if (value.length <= showChars * 2) return '****';
  return value.substring(0, showChars) + '****' + value.substring(value.length - showChars);
}

/**
 * Log environment configuration to console
 */
export function logEnvConfig(): void {
  const { isValid, config, errors, warnings } = validateEnv();

  console.log('\n┌──────────────────────────────────────────────────────────────┐');
  console.log('│              ENVIRONMENT CONFIGURATION                       │');
  console.log('├──────────────────────────────────────────────────────────────┤');

  // Server config
  console.log('│ SERVER                                                       │');
  console.log(`│   PORT:              ${String(config.port).padEnd(40)}│`);
  console.log(`│   NODE_ENV:          ${config.nodeEnv.padEnd(40)}│`);

  // Database config
  console.log('├──────────────────────────────────────────────────────────────┤');
  console.log('│ DATABASE                                                     │');
  const dbType = config.databaseUrl.startsWith('postgres') ? 'PostgreSQL' : 'SQLite';
  console.log(`│   Type:              ${dbType.padEnd(40)}│`);
  console.log(`│   DATABASE_URL:      ${maskSecret(config.databaseUrl, 10).padEnd(40)}│`);

  // Ollama config
  console.log('├──────────────────────────────────────────────────────────────┤');
  console.log('│ OLLAMA                                                       │');
  console.log(`│   OLLAMA_BASE_URL:   ${(config.ollamaBaseUrl || '(not set)').padEnd(40)}│`);
  console.log(`│   OLLAMA_API_KEY:    ${maskSecret(config.ollamaApiKey).padEnd(40)}│`);
  console.log(`│   GENERAL_MODEL:     ${config.ollamaGeneralModel.padEnd(40)}│`);
  console.log(`│   LONGFORM_MODEL:    ${config.ollamaLongformModel.padEnd(40)}│`);

  // JWT config
  console.log('├──────────────────────────────────────────────────────────────┤');
  console.log('│ JWT                                                          │');
  console.log(`│   JWT_SECRET:        ${maskSecret(config.jwtSecret).padEnd(40)}│`);
  console.log(`│   ACCESS_EXPIRES:    ${config.jwtAccessExpires.padEnd(40)}│`);
  console.log(`│   REFRESH_EXPIRES:   ${config.jwtRefreshExpires.padEnd(40)}│`);

  // Optional config
  console.log('├──────────────────────────────────────────────────────────────┤');
  console.log('│ OPTIONAL                                                     │');
  console.log(`│   FRONTEND_URL:      ${(config.frontendUrl || '(not set)').padEnd(40)}│`);
  console.log(`│   ADMIN_EMAIL:       ${(config.adminEmail || '(not set)').padEnd(40)}│`);
  console.log(`│   REPLIT_DOMAINS:    ${(config.replitDomains ? 'configured' : '(not set)').padEnd(40)}│`);

  console.log('└──────────────────────────────────────────────────────────────┘');

  // Log warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Configuration Warnings:');
    for (const warning of warnings) {
      console.log(`   - ${warning}`);
    }
  }

  // Log errors
  if (errors.length > 0) {
    console.log('\n❌ Configuration Errors:');
    for (const error of errors) {
      console.log(`   - ${error}`);
    }
    console.log('\n');
  }

  // Summary
  if (isValid) {
    console.log('\n✅ Environment configuration is valid\n');
  } else {
    console.log('\n❌ Environment configuration has errors - some features may not work\n');
  }
}

/**
 * Get validated config (throws if invalid required vars)
 */
export function getEnvConfig(): EnvConfig {
  const { isValid, config, errors } = validateEnv();

  if (!isValid) {
    console.error('Environment configuration errors:', errors);
  }

  return config;
}
