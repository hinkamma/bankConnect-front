import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from "@angular/forms";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.less'],
    imports: [ReactiveFormsModule, NgIf]
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: [''], // nullable / optionnel
      role: ['client', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      accept: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur personnalisé pour vérifier la correspondance des mots de passe
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmation = control.get('password_confirmation');

    if (password && confirmation && password.value !== confirmation.value) {
      confirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Vérification de l'affichage des erreurs
  showFieldError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.touched || this.isSubmitted));
  }

  showPasswordMismatch(): boolean {
    const confirmation = this.registerForm.get('password_confirmation');
    return !!(confirmation && confirmation.hasError('passwordMismatch') && (confirmation.touched || this.isSubmitted));
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.registerForm.valid) {
      console.log('Données envoyées :', this.registerForm.value);
      // Appeler votre service Angular / API backend Laravel ici
    }
  }
}