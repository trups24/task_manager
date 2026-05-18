import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;
  isLoginMode = true;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      setTimeout(() => {
        this.redirectBasedOnRole();
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).pipe(
      finalize(() => setTimeout(() => this.loading = false))
    ).subscribe({
      next: () => {
        this.toastr.success('Login successful!');
        setTimeout(() => {
          this.redirectBasedOnRole();
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastr.error(error.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    const { confirmPassword, ...registerData } = this.registerForm.value;
    
    this.authService.register(registerData).pipe(
      finalize(() => setTimeout(() => this.loading = false))
    ).subscribe({
      next: () => {
        this.toastr.success('Registration successful!');
        this.redirectBasedOnRole();
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Registration failed.');
      }
    });
  }

  private redirectBasedOnRole(): void {
    const isAdmin = this.authService.isAdmin();
    const targetRoute = isAdmin ? '/admin' : '/dashboard';
    
    // Avoid redundant navigation if already at target
    if (this.router.url === targetRoute) {
      this.loading = false;
      return;
    }

    console.log(`Redirecting to ${targetRoute} (isAdmin: ${isAdmin})`);
    this.router.navigate([targetRoute]).then(success => {
      if (!success) {
        this.loading = false;
        this.toastr.error('Navigation to dashboard failed.');
      }
    }).catch(err => {
      this.loading = false;
      this.toastr.error('Navigation error occurred.');
      console.error('Navigation error:', err);
    });
  }

  // Convenience getters for form controls
  get l() { return this.loginForm.controls; }
  get r() { return this.registerForm.controls; }
}