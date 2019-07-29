import 'rxjs/add/operator/switchMap';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import 'rxjs/add/operator/do';

import { DataService } from '../data.service'
import { fadeInAnimation } from '../animations/fade-in.animation';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css'],
  animations: [fadeInAnimation]
})
export class InvoiceFormComponent implements OnInit {

  invoiceForm: NgForm;
  @ViewChild('invoiceForm') currentForm: NgForm;

  successMessage: string;
  selectedClient: string = null;
  errorMessage: string;
  billingRecords: any[];
  companies: any[];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    // this.getBillingRecords();
    this.getCompanies();
  }

  getBillingRecordsById(id) {
    this.dataService.getRecords("billing-record/" + id)
      .do(data => console.log(data))
      .subscribe(
        results => this.billingRecords = results,
        error => this.errorMessage = <any>error)

  }

  getCompanies() {
    this.dataService.getRecords("company")
      .subscribe(
        companies => this.companies = companies,
        error =>  this.errorMessage = <any>error);
  }

  saveInvoice(invoiceForm: NgForm) {
    let endpoint = "invoice/" + invoiceForm.value.client;
    delete(invoiceForm.value.client)
    this.dataService.addRecord(endpoint, invoiceForm.value)
      .subscribe(
        company => this.successMessage = "Record added successfully",
        error => this.errorMessage = <any>error);
    this.invoiceForm.reset()

  }

  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    this.invoiceForm = this.currentForm;
    this.invoiceForm.valueChanges
      .subscribe(
        data => this.onValueChanged(data)
      );
  }

  onValueChanged(data?: any) {
    let form = this.invoiceForm.form;

    for (let field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    'invoiceDescription': ''
  };

  validationMessages = {
    'invoiceDescription': {
      'required': 'Description name is required.',
      'minlength': 'Description name must be at least 5 characters long.',
      'maxlength': 'Description name cannot be more than 30 characters long.'
    }
  };
}
