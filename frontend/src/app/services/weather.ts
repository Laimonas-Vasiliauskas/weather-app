import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Place {
  code: string;
  name: string;
  administrativeDivision?: string;
  countryCode?: string;
  coordinates?: {
  latitude: number;
  longitude: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Weather {
  private apiUrl = 'https://weather-app-vuq7.onrender.com/api';

  constructor(private http: HttpClient) {}

  searchPlaces(searchText: string): Observable<Place[]> {
    const params = new HttpParams().set('search', searchText);
    return this.http.get<Place[]>(`${this.apiUrl}/places`, { params });
  }

  getWeather(placeCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/weather/${placeCode}`);
  }
}