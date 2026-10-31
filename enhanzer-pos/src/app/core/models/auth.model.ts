export interface LoginRequest {
  email: string;
  password: string;
}

export interface LocationDto {
  locationCode: string;
  locationName: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  expiresAtUtc: string;
  locations: LocationDto[];
}
