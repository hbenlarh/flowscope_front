import { Component, OnInit } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Button } from '../shared/button/button';

@Component({
  selector: 'app-register',
  imports: [Header, Footer, FormsModule, ReactiveFormsModule, CommonModule,Button],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  signupForm!: FormGroup;
  signupData = { first_name: '', last_name: '', password: '', email: '' };
  loading = false;
  serverError = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    // Initialize the form group with validation
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(3)]],
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+])[A-Za-z\d@$!%*?&+]{8,30}$/)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(formGroup: FormGroup): null | { mismatch: true } {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  signup() {
    this.serverError = '';
    if (this.signupForm.invalid || this.loading) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.signupForm.disable({ emitEvent: false });
    this.signupData = {
      first_name: this.signupForm.get('first_name')?.value,
      last_name: this.signupForm.get('last_name')?.value,
      password: this.signupForm.get('password')?.value,
      email: this.signupForm.get('email')?.value,
    };
 
    this.http.post('/api/flowscope_core/client', this.signupData, { withCredentials: true })
      .subscribe(
        (response) => {
          this.loading = false;
          this.signupForm.enable({ emitEvent: false });
          this.router.navigate(['/login']); // Navigate after successful signup
        },
        (error) => {
          console.error(error);
          this.serverError = error?.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
          this.signupForm.enable({ emitEvent: false });
        }
      );
  }

}
