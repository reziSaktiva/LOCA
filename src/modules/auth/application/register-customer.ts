import type { AuthResult, CustomerAccount, RegisterCustomerCommand } from "../domain/auth-entities";
import { MIN_PASSWORD_LENGTH, isValidEmail, isValidPassword } from "../domain/auth-invariants";
import type { AuthRepository } from "../domain/auth-repository";

export async function registerCustomer(
  repository: AuthRepository,
  command: RegisterCustomerCommand,
): Promise<AuthResult<CustomerAccount>> {
  if (!isValidEmail(command.email)) {
    return {
      success: false,
      error: { code: "EMAIL_INVALID", message: "Format email tidak valid." },
    };
  }

  if (!isValidPassword(command.password)) {
    return {
      success: false,
      error: {
        code: "PASSWORD_TOO_SHORT",
        message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
      },
    };
  }

  return repository.register(command);
}
