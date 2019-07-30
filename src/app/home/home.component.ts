import { ElementRef, Component, OnInit } from '@angular/core';
import { fadeInAnimation } from '../animations/fade-in.animation';
import { AuthService } from 'app/auth.service';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3Format from "d3-format"
import * as d3Transition from "d3-transition";
import 'svg-builder';

export class GraphData {
  month: string;
  value: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})

export class HomeComponent implements OnInit {
  private htmlElement: HTMLElement;
  private host: d3.Selection<HTMLElement, any, any, any>;

  private margin = {top: 40, right: 20, bottom: 40, left: 70};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  auth_user;
  errorMessage: string;
  successMessage: string;
  invoices: any[];
  apiData: GraphData[] = [];

  gridApi: any;
  gridColumnApi: any;

  constructor(private authService: AuthService, private dataService: DataService, public router: Router, private elementRef: ElementRef) {
    this.htmlElement = elementRef.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 470 - this.margin.top - this.margin.bottom;
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
      this.dataService.getHomeRecords("analytics/user", this.auth_user.id, "table")
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
      this.dataService.getHomeRecords("analytics/user", this.auth_user.id, "graph")
      .subscribe(
        results => {this.apiData = results;
                    this.initSvg();
                    this.initAxis();
                    this.drawAxis();
                    this.drawLine();},
        error =>  this.errorMessage = <any>error);
    } else { // Company Performance Graph
      this.dataService.getHomeCompanyRecords("analytics")
      .subscribe(
        results => {this.apiData = results;
                    console.log(this.apiData);
                    this.initSvg();
                    this.initAxis();
                    this.drawAxis();
                    this.drawLine();},
        error =>  this.errorMessage = <any>error);
    }
  }

  async initSvg() {
    this.svg = this.host.select('#chartsvg')
                 .append('svg:g')
                 .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  async initAxis() {
    this.x = d3Scale.scaleBand().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(this.apiData.map(function(d) { return d.month; } ));
    this.y.domain(d3Array.extent(this.apiData, function(d) { return d.value; } ));
  }

  async drawAxis() {

    var maxTick = 1;

    for(let item of this.apiData) {
      if (item.value > maxTick) {
        maxTick = item.value;
      }
    }

    this.svg.append("svg:g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + this.height + ")")
          .style("font-size", "12")
          .style("font-variant", "small-caps")
          .call(d3Axis.axisBottom(this.x));

    this.svg.append("svg:g")
          .attr("class", "axis axis--y")
          .attr('transform', 'translate(0,0)')
          .style("font-size", "12")
          .call(d3Axis.axisLeft(this.y).tickFormat(d3Format.format("d")).ticks(maxTick));

    this.svg.append("svg:text")
          .attr("class", "x axis-label")
          .attr("x", this.height/2 + this.margin.left)
          .attr("y", this.width/2 + this.margin.bottom*2 + this.margin.top + 10)
          .text("Month")
          .style('font-weight', "bold")
          .style("font-size", 20);

    this.svg.append("svg:text")
          .attr("class", "y axis-label")
          .attr("x", -this.height/2 - this.margin.top - 15)
          .attr("y", -this.margin.right - 10)
          .attr("transform", "rotate(270)")
          .text("Invoices")
          .style('font-weight', "bold")
          .style("font-size", 20);
  }

  async drawLine() {
    this.line = d3Shape.line()
                       .curve(d3Shape.curveMonotoneX)
                       .x( (d: any) => this.x(d.month) )
                       .y( (d: any) => this.y(d.value) );

    this.svg.append("svg:path")
            .datum(this.apiData)
            .attr("class", "line")
            .attr("d", this.line)
            .attr('transform', 'translate(25,0)')
            .style("fill", "none")
            .style('stroke', "purple")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style('stroke-width', 3);

    var label = d3.select(".label");
    this.svg.selectAll(".dot")
            .data(this.apiData)
            .enter()
            .append("svg:circle")
            .attr("class", "dot")
            .attr("cx", (d: any) => this.x(d.month))
            .attr("cy", (d: any) => this.y(d.value))
            .attr("r", 5)
            .attr("transform", "translate(25,0)")
            .style("fill", "white")
            .style('stroke', "purple")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style('stroke-width', 3)
            .on("mouseover", function(d) {
              d3.select(this)
                .attr("r", 8)
                .style("fill", "white")
                .style("stroke", "green");
              label.attr("transform", "translate("+ ((d: any) => this.x(d.month)) +"," + ((d: any) => this.y(d.value)) +")");
              label.text("" +d.month+ ": " +d.value);
            })
    //         .on("mouseover", mouseOver)
            .on("mouseout", mouseOut);
    // function mouseOver(d, i) {
    //   d3.select(this)
    //     .attr("r", 8)
    //     .style("fill", "white")
    //     .style("stroke", "green");
    //   this.svg.append("svg:g")
    //           .attr("id", "t" + d.x + "-" + d.y + "-" + i)
    //           .attr("x", function(d) { return this.x(d.x); })
    //           .attr("y", function(d) { return this.y(d.y); })
    //           .text(function() { return [d.x, d.y]; });
    // }
    function mouseOut(d, i) {
      d3.select(this)
        .attr("r", 5)
        .style("fill", "white")
        .style("stroke", "purple");
      d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
    }

    var curtain = this.svg.append("svg:rect")
            .attr('x', -1 * this.width - 10)
            .attr('y', -1 * this.height - 10)
            .attr('height', this.height + 20)
            .attr('width', this.width + 5)
            .attr('class', 'curtain')
            .attr('transform', 'rotate(180)')
            .style('fill', 'white')

    var t = d3Transition.transition()
            .delay(250)
            .duration(3000);
    t.select('rect.curtain')
            .attr('width', 0);
  }
}
