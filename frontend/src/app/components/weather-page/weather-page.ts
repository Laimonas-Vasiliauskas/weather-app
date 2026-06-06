import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Weather, Place } from '../../services/weather';
import { Logger } from '../../services/logger';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
    MatCardModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
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

  private readonly defaultCityCode = 'vilnius';
  private readonly defaultCityName = 'Vilnius';
  private readonly localStorageKey = 'topCities';
  isWeatherLoading: boolean = false;

  constructor(
    private weatherService: Weather,
    private loggerService: Logger,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPlaces();
    this.loadSavedViewedCities();
    this.loadDefaultCity();
  }

  loadDefaultCity() {
    this.loadWeather(this.defaultCityCode, this.defaultCityName);
  }

  getDayName(dateString: string): string {
    const fixedDate = dateString.replace(' ', 'T');
    const date = new Date(fixedDate);

    return date.toLocaleDateString('en-US', {
      weekday: 'long'
  });
}

  loadPlaces() {
    this.weatherService.loadPlaces().subscribe({
      next: (places: Place[]) => {
        this.allPlaces = places;
        this.filterPlaces();
      },
      error: error => {
        console.error('Places loading failed:', error);
      }
    });
  }

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value;

    this.filterPlaces();
  }

  filterPlaces() {
    const search = this.searchText.toLowerCase().trim();

    if (search.length < 2) {
      this.filteredPlaces = [];
      return;
    }

    this.filteredPlaces = this.allPlaces
      .filter(place => this.placeMatchesSearch(place, search))
      .slice(0, 20);
  }

  placeMatchesSearch(place: Place, search: string): boolean {
    return (
      place.name.toLowerCase().includes(search) ||
      place.code.toLowerCase().includes(search) ||
      place.administrativeDivision?.toLowerCase().includes(search) === true
    );
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    const search = this.searchText.toLowerCase().trim();

    if (search.length < 2) {
      return;
    }

    this.filterPlaces();

    const exactPlace = this.allPlaces.find(place =>
      place.name.toLowerCase() === search ||
      place.code.toLowerCase() === search
    );

    const selectedPlace = exactPlace || this.filteredPlaces[0];

    if (selectedPlace) {
      this.selectPlace(selectedPlace);
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
    this.logSelectedCity(place.name);
    this.loadWeather(place.code, place.name);
  }

  selectViewedCity(viewedCity: ViewedCity) {
    const place: Place = {
      name: viewedCity.city,
      code: viewedCity.code
    };

    this.selectPlace(place);
  }

  loadWeather(placeCode: string, cityName: string) {
    this.selectedCity = cityName;
    this.searchText = cityName;
    this.isWeatherLoading = true;
    this.currentWeather = null;
    this.forecastTimestamps = [];
    this.savedFiveDaysForecast = [];

    this.weatherService.getWeather(placeCode).subscribe({
      next: response => {
        this.forecastTimestamps = response.forecastTimestamps;
        this.currentWeather = this.forecastTimestamps[0];
        this.savedFiveDaysForecast = this.getFiveDaysForecast();
        this.isWeatherLoading = false;
        this.cd.detectChanges();
      },
      error: error => {
        console.error('Weather loading failed:', error);
      }
    });
  }

  getFiveDaysForecast(): any[] {
    const usedDates: string[] = [];
    const fiveDays: any[] = [];

    for (const forecast of this.forecastTimestamps) {
      const forecastDate = forecast.forecastTimeUtc.split(' ')[0];

      if (!usedDates.includes(forecastDate)) {
        usedDates.push(forecastDate);
        fiveDays.push(forecast);
      }

      if (fiveDays.length === 5) {
        break;
      }
    }

    return fiveDays;
  }

  saveViewedCity(place: Place) {
    const savedCity = this.viewedCities.find(
      viewedCity => viewedCity.code === place.code
    );

    if (savedCity) {
      savedCity.count++;
    } else {
      this.viewedCities.push({
        city: place.name,
        code: place.code,
        count: 1
      });
    }

    this.viewedCities.sort((a, b) => b.count - a.count);
    this.viewedCities = this.viewedCities.slice(0, 3);

    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.viewedCities)
    );
  }

  loadSavedViewedCities() {
    const savedCities = localStorage.getItem(this.localStorageKey);

    if (!savedCities) {
      return;
    }

    try {
      this.viewedCities = JSON.parse(savedCities);
    } catch {
      this.viewedCities = [];
    }
  }

  logSelectedCity(cityName: string) {
    this.loggerService.logCity(cityName).subscribe({
      error: error => {
        console.error('City logging failed:', error);
      }
    });
  }
}