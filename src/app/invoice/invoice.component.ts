import { Component, OnInit, Input } from '@angular/core';

import { DataService } from '../data.service'
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component'
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  animations: [fadeInAnimation]
})
export class InvoiceComponent implements OnInit {

  errorMessage: string;
  successMessage: string;
  invoices: any[];
  gridApi: any;
  gridColumnApi: any;

  constructor (private dataService: DataService) {}

  columnDefs = [
    {headerName: "ID", field: "id", sortable: true, filter: true, resizable: true, width: 120},
    {headerName: "Description", field: "invoiceDescription", sortable: true, filter: true, resizable: true},
    {headerName: "Client", field: "company.name", sortable: true, filter: true, resizable: true},
    {headerName: "Line Items", field: "lineItems.length", sortable: true, filter: true, resizable: true},
    {headerName: "Created By", field: "createdBy.username", sortable: true, filter: true, resizable: true},
    {headerName: "Created On", field: "createdOn", sortable: true, filter: true, resizable: true}
  ]
  rowData = [

  ]

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridColumnApi.getColumn("id").setSort("asc");
    }

  ngOnInit() { this.getInvoices(); }

  getInvoices() {
    this.dataService.getRecords("invoice")
      .subscribe(
        results => {
          this.invoices = results
          this.rowData = results
        },
        error =>  this.errorMessage = <any>error);
  }
}
