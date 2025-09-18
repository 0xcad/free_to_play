export interface User {
  id: number;
  name: string;
  email?: string;
  is_participating: bool;
  is_me?: bool;
  is_admin: bool;
  is_authenticated: bool;
  balance?: number;
  spent?: number;
  is_muted?: bool;
  is_joined: bool;
  has_played: bool;
  has_superchat?: bool;
}
