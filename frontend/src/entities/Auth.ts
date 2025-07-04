export interface UserAuth {
  email: string;
  password: string;
}

export interface UserProfileUpdate {
  name?: string;
  last_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  photo_url?: string;
} 