import { ElementRef, Component, OnInit } from '@angular/core';
import { DataService } from 'app/data.service'
import { ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'app/animations/fade-in.animation';
import { GraphService } from 'app/graph.service';

export class GraphData {
  month: string;
  value: number;
}

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

  auth_user;
  apiData: GraphData[] = [];
  errorMessage: string;
  successMessage: string;
  companies: any[];
  clientId: number = 0;

  constructor(private elementRef: ElementRef, private graphService: GraphService, private dataService: DataService, private route: ActivatedRoute) {
    this.htmlElement = elementRef.nativeElement;
    
  }

  async ngOnInit() {
    await this.refreshUser();
    await this.getCompanies();
    await this.getUserGraphInvoices();
    await this.getClientGraphInvoices();
  }

  async refreshUser(): Promise<any> {
    this.auth_user = JSON.parse(localStorage.getItem("auth_user"));
  }

  setClientId(event: any) {
    this.clientId = event.target.value.split(" ").pop();
    this.graphService.clearGraph();
    this.getClientGraphInvoices();
    this.getUserGraphInvoices();
  }

  private getCompanies() {
    this.dataService.getRecords("company")
      .subscribe(
        companies => this.companies = companies,
        error => this.errorMessage = <any>error);
  }

  private getClientGraphInvoices() {
    var svg: any;
    this.dataService.getRecordsId("analytics/client", this.clientId)
    .subscribe(
      results => {this.apiData = results;
                  this.graphService.drawGraph(this.apiData, "#chartsvg", this.htmlElement);},
      error =>  this.errorMessage = <any>error);
  }

  private getUserGraphInvoices() {
    var tempString = "?user-id=" + this.auth_user.id;
    this.dataService.getHomeRecords("analytics/client", this.clientId, tempString)
    .subscribe(
      results => {this.apiData = results;
                  this.graphService.drawUserGraph(this.apiData, this.htmlElement);},
      error =>  this.errorMessage = <any>error);
  }
}
