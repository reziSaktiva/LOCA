import type { AuthRepository } from "../domain/auth-repository";

export async function logoutCustomer(repository: AuthRepository): Promise<void> {
  return repository.logout();
}
