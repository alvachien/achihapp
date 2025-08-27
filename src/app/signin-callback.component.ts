import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services';

@Component({
  selector: 'app-signin-callback',
  template: `<p>Processing signin callback</p>`,
  styles: '',
  standalone: true,
  imports: [],
})
export class SigninCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit() {
    console.log('Entering SigninCallbackComponent');
    this.authService.userManager.signinCallback().finally(() => {
      console.log('Navigating to initial page');
      this.router.navigate(['/']);
    });
  }
}
