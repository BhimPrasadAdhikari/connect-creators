// Password Validation Utilities
// Implements strong password policy for security hardening

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

// Default strong password policy
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// Validates a password against the security policy
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  const errors: string[] = [];

  // Length check
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  // Uppercase check
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Lowercase check
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Number check
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Special character check
  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
  }

  // Common password check (basic - extend as needed)
  const commonPasswords = [
    "password123",
    "123456789012",
    "qwerty123456",
    "admin1234567",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a more unique password");
  }

  // Calculate strength
  const strength = calculatePasswordStrength(password);

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

// Calculates password strength based on various factors
export function calculatePasswordStrength(
  password: string
): "weak" | "medium" | "strong" {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character diversity
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  // Bonus for mix
  if (password.length >= 12 && /[a-zA-Z]/.test(password) && /\d/.test(password)) {
    score += 1;
  }

  if (score <= 3) return "weak";
  if (score <= 5) return "medium";
  return "strong";
}

// Generates a hint for password requirements
export function getPasswordRequirements(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): string[] {
  const requirements: string[] = [];

  requirements.push(`At least ${policy.minLength} characters`);
  if (policy.requireUppercase) requirements.push("One uppercase letter");
  if (policy.requireLowercase) requirements.push("One lowercase letter");
  if (policy.requireNumbers) requirements.push("One number");
  if (policy.requireSpecialChars) requirements.push("One special character");

  return requirements;
}
