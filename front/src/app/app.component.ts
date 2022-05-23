import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private titleService: Title) {}

  ngOnInit(): void {
    const appTitle = this.titleService.getTitle();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let child = this.route.firstChild;
      while (child?.firstChild) {
        child = child.firstChild;
      }
      this.titleService.setTitle(
        (child?.snapshot.data['title'] ?? appTitle) + ' | Конструктор интерактивных инструкций',
      );
    });
  }
}
