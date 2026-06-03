import { Component, signal } from '@angular/core';
import { WeatherPage } from './components/weather-page/weather-page';

@Component({
  selector: 'app-root',
  imports: [WeatherPage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
