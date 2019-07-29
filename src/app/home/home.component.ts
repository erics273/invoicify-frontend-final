import { Component, OnInit } from '@angular/core';

import { fadeInAnimation } from '../animations/fade-in.animation';
import { DataService } from '../data.service'
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
  errorMessage: string;
  invoices: any[];

  constructor(private authService: AuthService, private dataService: DataService,public router: Router) { }

  ngOnInit() {
    this.refreshUser();
    this.getTableInvoices();
  }

  refreshUser(){
    this.auth_user = JSON.parse(localStorage.getItem("auth_user"));
  }

  getTableInvoices() {
    this.dataService.getHomeRecords("analytics/user", this.auth_user.id, "table")
    .subscribe(
      results => this.invoices = results,
      error =>  this.errorMessage = <any>error);
  }

}
