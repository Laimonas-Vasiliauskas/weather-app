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
    const url = `https://weather-app-vuq7.onrender.com/api/log`;
    return this.http.post<any>(url, { city: cityName }).pipe(
      catchError((error) => {
        console.error('Logging city failed', error);
        return throwError(() => error);
      })
    );
  }
}

