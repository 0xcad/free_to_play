export interface User {
  id: number;
  name: string;
  email?: string;
  is_participating: boolean;
  is_me?: boolean;
  is_admin: boolean;
  is_authenticated: boolean;
  balance?: number;
  spent?: number;
  is_muted?: boolean;
  is_joined: boolean;
  has_played: boolean;
  has_superchat?: boolean;
  freelance_text?: string;
}
