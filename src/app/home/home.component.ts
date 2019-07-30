import { Component, OnInit, ElementRef } from '@angular/core';
import { fadeInAnimation } from '../animations/fade-in.animation';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { GraphService } from 'app/graph.service';
import { AuthService } from 'app/auth.service';

export class GraphData {
  month: string;
  value: number;
}

@Component({
  selector: 'app-home',
  providers: [ GraphService ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})

export class HomeComponent implements OnInit {
  private htmlElement: HTMLElement;

  auth_user;
  errorMessage: string;
  successMessage: string;
  invoices: any[];
  apiData: GraphData[] = [];

  gridApi: any;
  gridColumnApi: any;
  constructor(private authService: AuthService, private dataService: DataService, private graphService: GraphService, private elementRef: ElementRef, public router: Router) {
    this.htmlElement = elementRef.nativeElement; 
  }

  columnDefs = [
    {headerName: "ID", field: "id", sortable: true, filter: true, resizable: true, width: 120},
    {headerName: "Description", field: "invoiceDescription", sortable: true, filter: true, resizable: true},
    {headerName: "Client", field: "company.name", sortable: true, filter: true, resizable: true},
    {headerName: "Line Items", field: "lineItems.length", sortable: true, filter: true, resizable: true},
    {headerName: "Created By", field: "createdBy.username", sortable: true, filter: true, resizable: true},
    {headerName: "Created On", field: "createdOn", sortable: true, filter: true, resizable: true},
    {headerName: "Status", field: "status", sortable: true, filter: true, resizable: true}
  ]
  rowData = [

  ]

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridColumnApi.autoSizeColumns();
    this.gridColumnApi.getColumn("id").setSort("asc");
    }

  async ngOnInit() {
    await this.refreshUser();
    await this.getTableInvoices();
    await this.getGraphInvoices();
  }

  async refreshUser(): Promise<any> {
    this.auth_user = JSON.parse(localStorage.getItem("auth_user"));
  }

  async getTableInvoices(): Promise<any> {
    if (this.auth_user != null) {
      this.dataService.getHomeRecords("analytics/user", this.auth_user.id, "/table")
        .subscribe(
          results => {
            this.rowData = results
            this.invoices = results
          },
          error =>  this.errorMessage = <any>error);
    }
  }

  async getGraphInvoices(): Promise<any> {
    if (this.auth_user != null) { // Personal Performance Graph
      this.dataService.getHomeRecords("analytics/user", this.auth_user.id, "/graph")
      .subscribe(
        results => {this.apiData = results;
                    this.graphService.drawGraph(this.apiData, "#chartsvg", this.htmlElement)},
        error =>  this.errorMessage = <any>error);
    } else { // Company Performance Graph
      this.dataService.getHomeCompanyRecords("analytics")
      .subscribe(
        results => {this.apiData = results;
                    this.graphService.drawGraph(this.apiData, "#chartsvg", this.htmlElement)},
        error =>  this.errorMessage = <any>error);
    }
  }
}
