export interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  bio?: string | null; 
  cooking_level?: string | null; 
    favorite_cuisines: string[] | null; 
  dietary_restrictions: string[] | null; 
}
// 여기서 null은 null을 허락한다는거인가?

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
}

export interface GoogleSignInResponse {
  access_token: string;
  id_token?: string;
}