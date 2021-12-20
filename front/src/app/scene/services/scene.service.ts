import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SceneService {
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  loadDefaultModel(): Observable<any> {
    return this.http.get(`${this.apiUrl}/viewer/default`, { withCredentials: true });
  }

  shadeColor(hexadecimalColor: number, percent: number) {
    let color = hexadecimalColor.toString(16);

    color = color.replace(/^#/, '');
    if (color.length === 3) color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];

    const match = color.match(/.{2}/g);
    let [r, g, b]: any[] = [];
    if (match) [r, g, b] = match;
    [r, g, b] = [parseInt(r, 16) + percent, parseInt(g, 16) + percent, parseInt(b, 16) + percent];

    r = Math.max(Math.min(255, r), 0).toString(16);
    g = Math.max(Math.min(255, g), 0).toString(16);
    b = Math.max(Math.min(255, b), 0).toString(16);

    const rr = (r.length < 2 ? '0' : '') + r;
    const gg = (g.length < 2 ? '0' : '') + g;
    const bb = (b.length < 2 ? '0' : '') + b;

    return parseInt(rr + gg + bb, 16);
  }
}
