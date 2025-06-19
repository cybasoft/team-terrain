
export interface User {
  id: string;
  name: string;
  email?: string;
  password: string;
  coordinates?: string; // Raw string from API (e.g., "36.123, -1.456")
  location: [number, number] | null; // Processed coordinates array
  pinned: boolean;
}
