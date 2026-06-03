import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Logger {
  constructor(private http: HttpClient){

  }
  logCity(cityName: string) {
    const url = `https://weather-app-vuq7.onrender.com/log`;
    return this.http.post(url, { city: cityName });
  }
}
