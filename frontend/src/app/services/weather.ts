import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  constructor(private http: HttpClient){

  }

  getWeather(apiName: string){
    const url = `https://weather-app-vuq7.onrender.com/weather/${apiName}`;
    return this.http.get(url);
  }
}
