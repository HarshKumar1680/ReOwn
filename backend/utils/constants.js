// Status Codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500
};

// User Roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '24h'
};

// Password Configuration
const PASSWORD_CONFIG = {
  MIN_LENGTH: 6,
  SALT_ROUNDS: 10
};

// Validation Messages
const VALIDATION_MESSAGES = {
  NAME_REQUIRED: 'Please provide a name',
  NAME_TOO_LONG: 'Name cannot be more than 50 characters',
  EMAIL_REQUIRED: 'Please provide an email',
  EMAIL_INVALID: 'Please provide a valid email',
  EMAIL_EXISTS: 'User with this email already exists',
  PASSWORD_REQUIRED: 'Please provide a password',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Not authorized',
  ADMIN_REQUIRED: 'Not authorized as admin',
  CANNOT_DELETE_SELF: 'Cannot delete your own account',
  CANNOT_DEACTIVATE_SELF: 'Cannot deactivate your own account'
};

module.exports = {
  STATUS_CODES,
  USER_ROLES,
  JWT_CONFIG,
  PASSWORD_CONFIG,
  VALIDATION_MESSAGES
}; 