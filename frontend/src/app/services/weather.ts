import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

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

  private placesCache$?: Observable<Place[]>;

  constructor(private http: HttpClient) {}

  loadPlaces(): Observable<Place[]> {
    if (!this.placesCache$) {
      this.placesCache$ = this.http
        .get<Place[]>(`${this.apiUrl}/places`)
        .pipe(shareReplay(1));
    }

    return this.placesCache$;
  }

  filterPlaces(searchText: string): Observable<Place[]> {
    const search = searchText.toLowerCase().trim();

    return this.loadPlaces().pipe(
      map((places: Place[]) => {
        if (search.length < 2) {
          return [];
        }

        return places.filter(place => place.name.toLowerCase().includes(search) || place.code.toLowerCase().includes(search) || place.administrativeDivision?.toLowerCase().includes(search)).slice(0, 20);
      })
    );
  }

  getWeather(placeCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/weather/${placeCode}`);
  }
}