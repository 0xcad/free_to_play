export interface User {
  id: number;
  name: string;
  email?: string;
  is_participating: bool;
  is_admin: bool;
  is_authenticated: bool;
}
