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
  loading = false;
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
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.authService.isAuthenticated()) {
      setTimeout(() => this.redirectBasedOnRole());
    }
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
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: () => {
        this.toastr.success('Login successful!');
        setTimeout(() => this.redirectBasedOnRole());
      },
      error: (error) => {
        console.error('Login error:', error);
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

  get l() { return this.loginForm.controls; }
}