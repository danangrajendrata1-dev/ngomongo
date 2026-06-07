export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: 'bearer' | string;
};
