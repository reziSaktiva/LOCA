import type {
  AuthResult,
  AuthSession,
  CustomerAccount,
  LoginCommand,
  RegisterCustomerCommand,
} from "./auth-entities";

export interface AuthRepository {
  register(command: RegisterCustomerCommand): Promise<AuthResult<CustomerAccount>>;
  login(command: LoginCommand): Promise<AuthResult<AuthSession>>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
}
