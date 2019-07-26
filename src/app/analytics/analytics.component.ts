import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/data.service';
import { ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'app/animations/fade-in.animation';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  animations: [fadeInAnimation]

})
export class AnalyticsComponent implements OnInit {

  errorMessage: string;
  successMessage: string;
  companies: any[];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getCompanies()
  }


  getCompanies() {
    this.dataService.getRecords("company")
      .subscribe(
        companies => this.companies = companies,
        error => this.errorMessage = <any>error
      );
  }
}
