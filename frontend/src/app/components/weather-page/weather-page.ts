import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Weather, Place } from '../../services/weather';
import { Logger } from '../../services/logger';

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
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
})
export class WeatherPage implements OnInit {
  selectedCity = '';
  searchText = '';

  allPlaces: Place[] = [];
  filteredPlaces: Place[] = [];
  viewedCities: ViewedCity[] = [];

  currentWeather: any = null;
  forecastTimestamps: any[] = [];
  savedFiveDaysForecast: any[] = [];

  constructor(
    private weatherService: Weather,
    private loggerService: Logger,
    private cdr: ChangeDetectorRef
  ) {
    const savedCities = localStorage.getItem('topCities');

    if (savedCities !== null) {
      this.viewedCities = JSON.parse(savedCities);
    }
  }

  ngOnInit() {
    this.weatherService.loadPlaces().subscribe({
      next: (places: Place[]) => {
        this.allPlaces = places;
        console.log('Loaded places:', places.length);

        this.loadDefaultCity();
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Places loading failed:', error);
      }
    });
  }

  loadDefaultCity() {
    const defaultPlace = this.allPlaces.find(place => place.code === 'vilnius');

    if (defaultPlace) {
      this.loadWeather(defaultPlace.code, defaultPlace.name, false);
      return;
    }

    this.loadWeather('vilnius', 'Vilnius', false);
  }

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value;

    this.filterPlacesFromCache();
  }

  filterPlacesFromCache() {
    const search = this.searchText.toLowerCase().trim();

    if (search.length < 2) {
      this.filteredPlaces = [];
      return;
    }

    this.filteredPlaces = this.allPlaces
      .filter(place =>
        place.name.toLowerCase().includes(search) ||
        place.code.toLowerCase().includes(search) ||
        place.administrativeDivision?.toLowerCase().includes(search)
      )
      .slice(0, 20);

    this.cdr.detectChanges();
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    this.filterPlacesFromCache();

    if (this.filteredPlaces.length > 0) {
      this.selectPlace(this.filteredPlaces[0]);
    }
  }

  selectPlace(place: Place) {
    if (!place || !place.code) {
      console.error('Invalid place selected:', place);
      return;
    }

    this.selectedCity = place.name;
    this.searchText = place.name;
    this.filteredPlaces = [];

    this.saveViewedCity(place);

    this.loggerService.logCity(place.name).subscribe({
      error: error => console.error('Logging city failed:', error)
    });

    this.loadWeather(place.code, place.name, true);
  }

  selectViewedCity(viewedCity: ViewedCity) {
    if (!viewedCity || !viewedCity.code) {
      console.error('Invalid viewed city:', viewedCity);
      return;
    }

    this.filteredPlaces = [];

    this.loadWeather(viewedCity.code, viewedCity.city, true);
  }

  loadWeather(placeCode: string, cityName: string, updateSearch = true) {
    this.selectedCity = cityName;

    if (updateSearch) {
      this.searchText = cityName;
    }

    this.currentWeather = null;
    this.savedFiveDaysForecast = [];

    this.weatherService.getWeather(placeCode).subscribe({
      next: (response: any) => {
        this.forecastTimestamps = response.forecastTimestamps;
        this.currentWeather = response.forecastTimestamps[0];
        this.savedFiveDaysForecast = this.fiveDaysForecast();

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Weather loading failed:', error);
      }
    });
  }

  fiveDaysForecast() {
    const usedDates: string[] = [];
    const fiveDays: any[] = [];

    for (let i = 0; i < this.forecastTimestamps.length; i++) {
      const forecastDate = this.forecastTimestamps[i].forecastTimeUtc.split(' ')[0];

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
      this.viewedCities.push({
        city: place.name,
        code: place.code,
        count: 1
      });
    } else {
      storedCity.count++;
    }

    this.viewedCities.sort((a, b) => b.count - a.count);
    this.viewedCities = this.viewedCities.slice(0, 3);

    localStorage.setItem('topCities', JSON.stringify(this.viewedCities));
  }
}