
export interface User {
  id: string;
  name: string;
  password: string;
  location: [number, number] | null;
  pinned: boolean;
}
