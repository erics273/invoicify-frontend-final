import { ElementRef, Component, OnInit } from '@angular/core';
import { DataService } from 'app/data.service'
import { ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'app/animations/fade-in.animation';
import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3Format from "d3-format"
import * as d3Transition from "d3-transition";
import 'svg-builder';
import { GraphService } from 'app/graph.service';

// TODO:
// - Get text tooltip to show up in the right place
// - Hook up to API call instead of dummy client_apiDat
// - Probably a bunch of refactoring, but low priority
// - Create 2nd chart for Analytics page

@Component({
  selector: 'app-analytics',
  providers: [ GraphService ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  animations: [fadeInAnimation]

})
export class AnalyticsComponent implements OnInit {
  private htmlElement: HTMLElement;
  private host: d3.Selection<HTMLElement, any, any, any>;

  private htmlElement2: HTMLElement; 

  realApiData: any[];
  errorMessage: string;
  successMessage: string;
  companies: any[];

  constructor(private elementRef: ElementRef, private dataService: DataService, private route: ActivatedRoute) {
    this.htmlElement = elementRef.nativeElement;
    
  }

  async ngOnInit() {
    await this.getCompanies();
   //await this.getTableInvoices();
    await this.getGraphInvoices();
  }

  private getCompanies() {
    this.dataService.getRecords("company")
      .subscribe(
        companies => this.companies = companies,
        error => this.errorMessage = <any>error);
  }

  private getGraphInvoices() {
    this.dataService.getRecords("analytics/client") // need to make an analytics-service.ts and hook up
    .subscribe(
      results => this.realApiData = results,
      error =>  this.errorMessage = <any>error);
  }
}
