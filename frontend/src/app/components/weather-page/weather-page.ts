import { Component } from '@angular/core';
import { City } from '../../models/models/city.models';
import { ViewedCity } from '../../models/models/viewed-city.model';
import { Weather } from '../../services/weather';
import { ChangeDetectorRef } from '@angular/core';
import { Logger } from '../../services/logger';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-weather-page',
  imports: [MatInputModule, MatFormFieldModule, MatAutocompleteModule, MatButtonModule, MatCardModule],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
})
export class WeatherPage {
  cities: City[] = [{name:'Vilnius', apiName: 'vilnius'},
                    {name:'Kaunas', apiName: 'kaunas'},
                    {name:'Klaipeda', apiName: 'klaipeda'},
                    {name:'Utena', apiName: 'utena'},
                    {name:'Palanga', apiName: 'palanga'}];
  selectedCity = '';
  searchText = '';
  filteredCities = this.cities;
  viewedCities: ViewedCity[] = [];
  showDropdown = false;
  currentWeather: any = null;
  forecastTimestamps: any[] = [];
  savedFiveDaysForecast: any[] = [];
  usedDates: string[] = [];

  constructor(private weatherService : Weather, private cdr: ChangeDetectorRef, private loggerService : Logger) {
    const savedCities = localStorage.getItem('topCities');
    if (savedCities != null) {
      this.viewedCities = JSON.parse(savedCities);
    }
  }
  selectViewedCity(cityName: string) {
  const city = this.cities.find(c => c.name === cityName);
    if (city){
      this.selectCity(city);
    }
  }
  selectCity(selectedCity: City) {
    this.showDropdown = false;
    this.selectedCity = selectedCity.name;
    this.searchText = selectedCity.name;
    this.saveViewedCity(selectedCity.name);
    this.loggerService.logCity(selectedCity.name).subscribe();
    this.weatherService.getWeather(selectedCity.apiName).subscribe((response: any) => {this.forecastTimestamps = response.forecastTimestamps; this.currentWeather = response.forecastTimestamps[0]; this.savedFiveDaysForecast = this.fiveDaysForecast(); this.cdr.detectChanges();})
  }
  fiveDaysForecast(){
    const usedDates: string[] = [];
    const fiveDays: any[] = [];
    for (let i = 0; i < this.forecastTimestamps.length; i++) {
      const foreCastDate = this.forecastTimestamps[i].forecastTimeUtc.split(' ')[0];
      if(!usedDates.includes(foreCastDate)){
        usedDates.push(foreCastDate);
        fiveDays.push(this.forecastTimestamps[i])
      }
      if(fiveDays.length === 5){
        break;
      }
    }
    return fiveDays;
  }
  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value;
    this.filteredCities = this.cities.filter(cityName => cityName.name.toLowerCase().startsWith(this.searchText.toLowerCase()));
    this.showDropdown = true;
  }
  saveViewedCity(selectedCityName: string) {
    const storedCity = this.viewedCities.find(viewedCity => viewedCity.city === selectedCityName);
    if (storedCity === undefined) {
      this.viewedCities.push({ city: selectedCityName, count: 1 });
    } else {
      storedCity.count++;
    }
    this.viewedCities.sort((a, b) => b.count - a.count);
    this.viewedCities = this.viewedCities.slice(0, 3);
    localStorage.setItem('topCities', JSON.stringify(this.viewedCities));
  }
}