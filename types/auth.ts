export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
}

export interface GoogleSignInResponse {
  access_token: string;
  id_token?: string;
}