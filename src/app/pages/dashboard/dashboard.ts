import { Navigation } from './../../navigation/navigation/navigation';
import { Component } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  imports: [Navigation],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.less',
})
export class Dashboard {}
