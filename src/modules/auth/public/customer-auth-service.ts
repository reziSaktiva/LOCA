import { getCurrentSession } from "../application/get-current-session";
import { loginCustomer } from "../application/login-customer";
import { logoutCustomer } from "../application/logout-customer";
import { registerCustomer } from "../application/register-customer";
import type {
  AuthResult,
  AuthSession,
  CustomerAccount,
  LoginCommand,
  RegisterCustomerCommand,
} from "../domain/auth-entities";
import { SupabaseAuthRepository } from "../infrastructure/supabase-auth-repository";

export type { AuthError, AuthResult, AuthSession, CustomerAccount, LoginCommand, RegisterCustomerCommand } from "../domain/auth-entities";

const repository = new SupabaseAuthRepository();

export async function authRegisterCustomer(
  command: RegisterCustomerCommand,
): Promise<AuthResult<CustomerAccount>> {
  return registerCustomer(repository, command);
}

export async function authLoginCustomer(
  command: LoginCommand,
): Promise<AuthResult<AuthSession>> {
  return loginCustomer(repository, command);
}

export async function authLogoutCustomer(): Promise<void> {
  return logoutCustomer(repository);
}

export async function authGetCurrentSession(): Promise<AuthSession | null> {
  return getCurrentSession(repository);
}
