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
    const url = `http://localhost:3000/weather/${apiName}`;
    return this.http.get(url);
  }
}
