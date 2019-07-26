import { Component, OnInit } from '@angular/core';

import { fadeInAnimation } from '../animations/fade-in.animation';
import { AuthService } from 'app/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})
export class HomeComponent implements OnInit {

  auth_user;

  constructor(private authService: AuthService, public router: Router) { }

  ngOnInit() {
    this.refreshUser();
  }

  refreshUser(){
    this.auth_user = JSON.parse(localStorage.getItem("auth_user"));
  }

}
