import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.less',
})
export class Login {
  loginForm: FormGroup;

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('client', Validators.required)
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      console.log('Form Data:', formData);
      // Here you can handle the form submission, e.g., send data to the server
    } else {
      console.log('Form is invalid');
      this.loginForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }
}
