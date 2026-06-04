import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Place {
  code: string;
  name: string;
  administrativeDivision?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Weather {
  private readonly localApiUrl = 'http://localhost:3000/api';

  // Kai deployinsi backendą į Render, čia įrašyk savo Render URL
  private readonly productionApiUrl = 'https://weather-app-vuq7.onrender.com/api';

  private readonly apiUrl =
    window.location.hostname === 'localhost'
      ? this.localApiUrl
      : this.productionApiUrl;

  constructor(private http: HttpClient) {}

  loadPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.apiUrl}/places`);
  }

  getWeather(placeCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/weather/${placeCode}`);
  }
}