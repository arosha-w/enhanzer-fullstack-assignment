import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LocationDto } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);

  /** Locations stored in the Location_Details table. */
  getLocations() {
    return this.http.get<LocationDto[]>(`${environment.apiUrl}/locations`);
  }
}
