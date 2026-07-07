import type { AuthResult, AuthSession, LoginCommand } from "../domain/auth-entities";
import { isValidEmail } from "../domain/auth-invariants";
import type { AuthRepository } from "../domain/auth-repository";

export async function loginCustomer(
  repository: AuthRepository,
  command: LoginCommand,
): Promise<AuthResult<AuthSession>> {
  if (!isValidEmail(command.email)) {
    return {
      success: false,
      error: { code: "EMAIL_INVALID", message: "Format email tidak valid." },
    };
  }

  return repository.login(command);
}
