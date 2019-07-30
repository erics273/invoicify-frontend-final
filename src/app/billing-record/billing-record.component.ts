import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { DataService } from '../data.service'
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component'
import { fadeInAnimation } from '../animations/fade-in.animation';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-billing-record',
  templateUrl: './billing-record.component.html',
  styleUrls: ['./billing-record.component.css'],
  animations: [fadeInAnimation]
})
export class BillingRecordComponent implements OnInit {

  errorMessage: string;
  successMessage: string;
  billingRecords: any[];
  gridApi: any;
  gridColumnApi: any;
  private columnDefs;
  defaultColDef: any = {resizable: true};
//   columnDefs = [
//     {headerName: 'Make', field: 'make', sortable: true ,filter: true },
//     {headerName: 'Model', field: 'model',sortable: true , filter: true },
//     {headerName: 'Price', field: 'price',sortable: true ,filter: true}
// ];

// rowData = [
//     { make: 'Toyota', model: 'Celica', price: 35000},
//     { make: 'Ford', model: 'Mondeo', price: 32000},
//     { make: 'Porsche', model: 'Boxter', price: 72000 }
// ];
  rowData: any;

  constructor (private dataService: DataService, public dialog: MatDialog) {
    this.columnDefs = [
      {headerName: 'ID', field: 'id', sortable: true, filter: true, resizable: true},
      {headerName: 'Description', field: 'description', sortable: true, filter: true, resizable: true},
      {headerName: 'Client', field: 'client', sortable: true, filter: true, resizable: true},
      {headerName: 'Type', field: 'type', sortable: true, filter: true, resizable: true},
      {headerName: 'Created By', field: 'createdBy', sortable: true, filter: true, resizable: true},
      {headerName: 'Total', field: 'total', sortable: true, filter: true, resizable: true},

    ];
    this.defaultColDef = { resizable: true};
  }

  ngOnInit() { this.getBillingRecords();
    // this.rowData = this.http.get('https://')
  }



  onGridReady(params) {
    console.log(params);
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    }

  populateRowData() {

  }

  getBillingRecords() {
    this.dataService.getRecords("billing-record")
      // .do(data => console.log(data))
      .map(results => {
        results.forEach( r =>{
          r.client = r.client.name;
          r.createdBy = r.createdBy.username;
          r.type = (r.rate && r.quantity) ? "Rate Based" : "Flat Fee";
        })
        return results;
      })
      .subscribe(
        results => {
        this.billingRecords = results;
        this.rowData = results;
      },
        error =>  this.errorMessage = <any>error);
  }

}
