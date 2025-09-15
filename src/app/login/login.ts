import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Button } from '../shared/button/button';


@Component({
  selector: 'app-login',
  imports: [Header, Footer, FormsModule, ReactiveFormsModule, CommonModule, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  signinData = { username: '', password: '' };
  loading = false;
  serverError = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  signin() {
    this.serverError = '';
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.loginForm.disable({ emitEvent: false });
    const body = new URLSearchParams();
    body.set('username', this.loginForm.get('email')?.value);
    body.set('password', this.loginForm.get('password')?.value);

    console.log('Request Data:', body.toString());
    this.http.post('/api/flowscope_core/auth/login', body.toString(), {
      withCredentials: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe(
      (response: any) => {
        if (!response.client.is_admin) {
          console.log("im here good");
           this.router.navigate(['/user/Dashboard']);
        } else {
           this.router.navigate(['/admin/Dashboard']);
        }
        this.loading = false;
        this.loginForm.enable({ emitEvent: false });
      },
      (error) => {
        console.error(error);
        this.serverError = error?.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
        this.loginForm.enable({ emitEvent: false });
        console.log("im here bad");
      }
    );
  }

}
