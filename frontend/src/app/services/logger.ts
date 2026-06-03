import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Logger {
  constructor(private http: HttpClient){

  }
  logCity(cityName: string): Observable<any> {
    const url = `https://weather-app-vuq7.onrender.com/log`;
    return this.http.post<any>(url, { city: cityName }).pipe(
      catchError((error) => {
        console.error('Logging city failed', error);
        return throwError(() => error);
      })
    );
  }
}
export function logCity(cityName: string): Promise<any> {
  const url = `https://weather-app-vuq7.onrender.com/log`;
  return fetch(url, {method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: cityName }),
  }).then((response) => {
    if (!response.ok) {
      return response.text().then((text) => {
        throw new Error(`Logging city failed: ${response.status} ${text}`);
      });
    }
    return response.json();
  });
}

