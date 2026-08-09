import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-send-token',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './send-token.html',
  styleUrl: './send-token.less',
})
export class SendToken {
  timeRemaining = 180;

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  resendToken(): void {
    this.timeRemaining = 180;
  }
}
