import { Injectable } from '@angular/core';
import { Settings } from '../classes/Settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _settings: Settings;

  constructor() {}

  getSettings() {
    return this._settings;
  }

  setSettings(settings: Settings) {
    this._settings = settings;
  }
}
