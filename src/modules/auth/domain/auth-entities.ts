export type CustomerAccount = {
  id: string;
  email: string;
};

export type AuthSession = {
  userId: string;
  email: string;
};

export type RegisterCustomerCommand = {
  email: string;
  password: string;
};

export type LoginCommand = {
  email: string;
  password: string;
};

export type AuthError =
  | { code: "EMAIL_INVALID"; message: string }
  | { code: "PASSWORD_TOO_SHORT"; message: string }
  | { code: "EMAIL_ALREADY_EXISTS"; message: string }
  | { code: "INVALID_CREDENTIALS"; message: string }
  | { code: "PROVIDER_ERROR"; message: string }
  | { code: "UNAUTHENTICATED"; message: string };

export type AuthResult<T> = { success: true; data: T } | { success: false; error: AuthError };
