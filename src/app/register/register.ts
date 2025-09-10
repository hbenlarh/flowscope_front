import { Component, OnInit } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [Header, Footer, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  signupForm!: FormGroup;
  signupData = { first_name: '', last_name: '', password: '', email: '', role: '' };

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    // Initialize the form group with validation
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(3)]],
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.signupData = {
      first_name: this.signupForm.get('first_name')?.value,
      last_name: this.signupForm.get('last_name')?.value,
      password: this.signupForm.get('password')?.value,
      email: this.signupForm.get('email')?.value,
      role: 'user'
    };
    console.log('Request Data:', this.signupData);
    this.http.post('/api/client', this.signupData, { withCredentials: true })
      .subscribe(
        (response) => {
          console.log("hello");
          console.log(response);
          console.log(this.signupData);
          this.router.navigate(['']); // Navigate after successful signup
        },
        (error) => {
          console.error(error);
          console.log("im here bad");
        }
      );
  }

}
