import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from "./navigation/navigation/navigation";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation],
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.less']
})
export class App {
  protected readonly title = signal('bankconnect-front');
}
