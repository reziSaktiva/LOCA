import type { AuthSession } from "../domain/auth-entities";
import type { AuthRepository } from "../domain/auth-repository";

export async function getCurrentSession(repository: AuthRepository): Promise<AuthSession | null> {
  return repository.getCurrentSession();
}
