import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Weather, Place } from '../../services/weather';
import { Logger } from '../../services/logger';
import { OnInit } from '@angular/core';

interface ViewedCity {
  city: string;
  code: string;
  count: number;
}

@Component({
  selector: 'app-weather-page',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
})
export class WeatherPage implements OnInit {
  selectedCity = '';
  searchText = '';

  filteredPlaces: Place[] = [];
  viewedCities: ViewedCity[] = [];

  showDropdown = false;
  currentWeather: any = null;
  forecastTimestamps: any[] = [];
  savedFiveDaysForecast: any[] = [];

  constructor(private weatherService: Weather, private loggerService: Logger){
    const savedCities = localStorage.getItem('topCities');
    if (savedCities != null) {
      this.viewedCities = JSON.parse(savedCities);
    }
  }
  ngOnInit() {
    this.weatherService.loadPlaces().subscribe();
  }
  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value;

    this.weatherService.filterPlaces(this.searchText).subscribe((places: Place[]) => {
      this.filteredPlaces = places;
    });
  }

  selectPlace(place: Place) {
    if (!place || !place.code) {
    console.error('Invalid place selected:', place);
    return;
  }
    this.showDropdown = false;
    this.selectedCity = place.name;
    this.searchText = place.name;
    this.saveViewedCity(place);
    this.loggerService.logCity(place.name).subscribe();
    this.weatherService.getWeather(place.code).subscribe((response: any) => {this.forecastTimestamps = response.forecastTimestamps; this.currentWeather = response.forecastTimestamps[0]; this.savedFiveDaysForecast = this.fiveDaysForecast();});
  }

  selectViewedCity(viewedCity: ViewedCity) {
    if (!viewedCity.code) {
      console.error('City code is missing:', viewedCity);
      return;
    }
    const place: Place = {
      code: viewedCity.code,
      name: viewedCity.city
    };

    this.selectPlace(place);
  }

  fiveDaysForecast() {
    const usedDates: string[] = [];
    const fiveDays: any[] = [];
    for (let i = 0; i < this.forecastTimestamps.length; i++) {const forecastDate = this.forecastTimestamps[i].forecastTimeUtc.split(' ')[0];
      if (!usedDates.includes(forecastDate)) {
        usedDates.push(forecastDate);
        fiveDays.push(this.forecastTimestamps[i]);
      }
      if (fiveDays.length === 5) {
        break;
      }
    }
    return fiveDays;
  }
  saveViewedCity(place: Place) {
    const storedCity = this.viewedCities.find(
      viewedCity => viewedCity.code === place.code
    );
    if (storedCity === undefined) {
      this.viewedCities.push({city: place.name, code: place.code, count: 1});
    } else {
      storedCity.count++;
    }
    this.viewedCities.sort((a, b) => b.count - a.count);
    this.viewedCities = this.viewedCities.slice(0, 3);
    localStorage.setItem('topCities', JSON.stringify(this.viewedCities));
  }

}