import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navigation } from './../../navigation/navigation/navigation';

@Component({
  selector: 'app-notifications',
  imports: [Navigation],
  templateUrl: './notifications.html',
  styleUrl: './notifications.less',
})
export class Notifications {}
