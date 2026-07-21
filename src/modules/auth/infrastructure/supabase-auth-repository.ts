import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import type {
  AuthResult,
  AuthSession,
  CustomerAccount,
  LoginCommand,
  RegisterCustomerCommand,
} from "../domain/auth-entities";
import type { AuthRepository } from "../domain/auth-repository";

export class SupabaseAuthRepository implements AuthRepository {
  async register(command: RegisterCustomerCommand): Promise<AuthResult<CustomerAccount>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: command.email,
      password: command.password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        error.status === 422
      ) {
        return {
          success: false,
          error: { code: "EMAIL_ALREADY_EXISTS", message: "Email sudah terdaftar." },
        };
      }
      return {
        success: false,
        error: { code: "PROVIDER_ERROR", message: error.message },
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: { code: "PROVIDER_ERROR", message: "Registrasi gagal." },
      };
    }

    return {
      success: true,
      data: { id: data.user.id, email: data.user.email! },
    };
  }

  async login(command: LoginCommand): Promise<AuthResult<AuthSession>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: command.email,
      password: command.password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("wrong") || error.status === 400) {
        return {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah." },
        };
      }
      return {
        success: false,
        error: { code: "PROVIDER_ERROR", message: error.message },
      };
    }

    if (!data.session || !data.user) {
      return {
        success: false,
        error: { code: "PROVIDER_ERROR", message: "Login gagal." },
      };
    }

    return {
      success: true,
      data: { userId: data.user.id, email: data.user.email! },
    };
  }

  async logout(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return { userId: user.id, email: user.email! };
  }
}
