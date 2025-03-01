import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.less'
})
export class WelcomeComponent implements OnInit {
  isLoggedIn = false;
  titleLogin = '';
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.authContent.subscribe((x) => {
      this.isLoggedIn = x.isAuthorized;
      if (this.isLoggedIn) {
        this.titleLogin = x.getUserName()!;
      }
    });
  }
}
