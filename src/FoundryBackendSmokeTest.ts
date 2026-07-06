type ValidationResult = {
  isValid: boolean;
  reason?: string;
};

/**
 * Validates a string by checking its length constraints.
 * @param input The input string to validate.
 * @param minLength The minimum length allowed.
 * @param maxLength The maximum length allowed.
 * @returns A ValidationResult indicating whether the string is valid and why if not.
 */
export function validateStringLength(input: string, minLength: number = 1, maxLength: number = 255): ValidationResult {
  if (input.length < minLength) {
    return { isValid: false, reason: `Input is shorter than the minimum length of ${minLength}.` };
  }
  if (input.length > maxLength) {
    return { isValid: false, reason: `Input exceeds the maximum length of ${maxLength}.` };
  }
  return { isValid: true };
}