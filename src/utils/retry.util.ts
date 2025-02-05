export async function withRetries<T>(
  action: () => Promise<T>, 
  retries: number = 3
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await action();
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
    }
  }
}