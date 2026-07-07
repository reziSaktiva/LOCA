import { describe, expect, it, vi } from "vitest";

import type { AuthRepository } from "../domain/auth-repository";
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from "../domain/auth-invariants";
import { registerCustomer } from "./register-customer";
import { loginCustomer } from "./login-customer";
import { logoutCustomer } from "./logout-customer";
import { getCurrentSession } from "./get-current-session";

// ---
// Invariants
// ---

describe("isValidEmail", () => {
  it("valid email diterima", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("user+tag@sub.domain.co")).toBe(true);
  });

  it("email tanpa @ ditolak", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("email tanpa domain ditolak", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("email kosong ditolak", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it(`password ${MIN_PASSWORD_LENGTH} karakter diterima`, () => {
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
  });

  it(`password lebih dari ${MIN_PASSWORD_LENGTH} karakter diterima`, () => {
    expect(isValidPassword("validpassword123")).toBe(true);
  });

  it(`password kurang dari ${MIN_PASSWORD_LENGTH} karakter ditolak`, () => {
    expect(isValidPassword("short")).toBe(false);
  });

  it("password kosong ditolak", () => {
    expect(isValidPassword("")).toBe(false);
  });
});

// ---
// Application services — pakai mock repository
// ---

function makeMockRepository(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    register: vi.fn().mockResolvedValue({ success: true, data: { id: "uid-1", email: "user@example.com" } }),
    login: vi.fn().mockResolvedValue({ success: true, data: { userId: "uid-1", email: "user@example.com" } }),
    logout: vi.fn().mockResolvedValue(undefined),
    getCurrentSession: vi.fn().mockResolvedValue({ userId: "uid-1", email: "user@example.com" }),
    ...overrides,
  };
}

describe("registerCustomer", () => {
  it("berhasil register dengan data valid", async () => {
    const repo = makeMockRepository();
    const result = await registerCustomer(repo, { email: "user@example.com", password: "password123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
    expect(repo.register).toHaveBeenCalledOnce();
  });

  it("gagal register jika email tidak valid", async () => {
    const repo = makeMockRepository();
    const result = await registerCustomer(repo, { email: "bademail", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("EMAIL_INVALID");
    }
    expect(repo.register).not.toHaveBeenCalled();
  });

  it("gagal register jika password terlalu pendek", async () => {
    const repo = makeMockRepository();
    const result = await registerCustomer(repo, { email: "user@example.com", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PASSWORD_TOO_SHORT");
    }
    expect(repo.register).not.toHaveBeenCalled();
  });

  it("meneruskan error EMAIL_ALREADY_EXISTS dari repository", async () => {
    const repo = makeMockRepository({
      register: vi.fn().mockResolvedValue({
        success: false,
        error: { code: "EMAIL_ALREADY_EXISTS", message: "Email sudah terdaftar." },
      }),
    });
    const result = await registerCustomer(repo, { email: "taken@example.com", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("EMAIL_ALREADY_EXISTS");
    }
  });
});

describe("loginCustomer", () => {
  it("berhasil login dengan data valid", async () => {
    const repo = makeMockRepository();
    const result = await loginCustomer(repo, { email: "user@example.com", password: "password123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userId).toBe("uid-1");
    }
    expect(repo.login).toHaveBeenCalledOnce();
  });

  it("gagal login jika email tidak valid", async () => {
    const repo = makeMockRepository();
    const result = await loginCustomer(repo, { email: "bademail", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("EMAIL_INVALID");
    }
    expect(repo.login).not.toHaveBeenCalled();
  });

  it("meneruskan error INVALID_CREDENTIALS dari repository", async () => {
    const repo = makeMockRepository({
      login: vi.fn().mockResolvedValue({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah." },
      }),
    });
    const result = await loginCustomer(repo, { email: "user@example.com", password: "wrongpass123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_CREDENTIALS");
    }
  });
});

describe("logoutCustomer", () => {
  it("memanggil repository.logout", async () => {
    const repo = makeMockRepository();
    await logoutCustomer(repo);
    expect(repo.logout).toHaveBeenCalledOnce();
  });
});

describe("getCurrentSession", () => {
  it("mengembalikan session jika ada", async () => {
    const repo = makeMockRepository();
    const session = await getCurrentSession(repo);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("uid-1");
  });

  it("mengembalikan null jika tidak ada session", async () => {
    const repo = makeMockRepository({
      getCurrentSession: vi.fn().mockResolvedValue(null),
    });
    const session = await getCurrentSession(repo);
    expect(session).toBeNull();
  });
});
