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

// TODO:
// - Get text tooltip to show up in the right place
// - Hook up to API call instead of dummy client_apiDat
// - Probably a bunch of refactoring, but low priority
// - Create 2nd chart for Analytics page

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  animations: [fadeInAnimation]

})
export class AnalyticsComponent implements OnInit {
  private htmlElement: HTMLElement;
  private host: d3.Selection<HTMLElement, any, any, any>;

  private htmlElement2: HTMLElement; 

  private margin = {top: 40, right: 20, bottom: 30, left: 70};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  private user_margin = {top: 40, right: 20, bottom: 30, left: 70};
  private user_width: number;
  private user_height: number;
  private user_x: any;
  private user_y: any;
  private user_svg: any;
  private user_line: d3Shape.Line<[number, number]>;
  private user_apiData = [
    {
      "month": "jan",
      "value": 5
    },{
      "month": "feb",
      "value": 8
    },{
      "month": "mar",
      "value": 11
    },{
      "month": "apr",
      "value": 7
    },{
      "month": "may",
      "value": 6
    },{
      "month": "jun",
      "value": 10
    }
  ];
  private client_apiData = [
    {
      "month": "jan",
      "value": 5
    },{
      "month": "feb",
      "value": 8
    },{
      "month": "mar",
      "value": 11
    },{
      "month": "apr",
      "value": 7
    },{
      "month": "may",
      "value": 6
    },{
      "month": "jun",
      "value": 10
    }
  ];
  realApiData: any[];
  errorMessage: string;
  successMessage: string;
  companies: any[];

  constructor(private elementRef: ElementRef, private dataService: DataService, private route: ActivatedRoute) {
    this.htmlElement = elementRef.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.htmlElement2 = elementRef.nativeElement;
    this.host = d3.select(this.htmlElement2)
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 470 - this.margin.top - this.margin.bottom;
    this.user_width = 700 - this.user_margin.left - this.user_margin.right;
    this.user_height = 470 - this.user_margin.top - this.user_margin.bottom;
  }

  ngOnInit() {
    this.getCompanies(); 
    this.getAnalytics();
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();
  }

  private getCompanies() {
    this.dataService.getRecords("company")
      .subscribe(
        companies => this.companies = companies,
        error => this.errorMessage = <any>error);
  }

  private getAnalytics() {
    this.dataService.getRecords("analytics") // need to make an analytics-service.ts and hook up
    .subscribe(
      results => this.realApiData = results,
      error =>  this.errorMessage = <any>error);
  }

  private initSvg() {
    this.svg = this.host.select('#chartsvg')
                 .append('svg:g')
                 .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.user_svg = this.host.select('#user_svg')
                 .append('svg:g')
                 .attr('transform', 'translate(' + this.user_margin.left + ',' + this.user_margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleBand().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(this.client_apiData
  .map(function(d) { return d.month; } ));
    this.y.domain(d3Array.extent(this.client_apiData
  , function(d) { return d.value; } ));
  
  this.user_x = d3Scale.scaleBand().range([0, this.user_width]);
    this.user_y = d3Scale.scaleLinear().range([this.user_height, 0]);
    this.user_x.domain(this.user_apiData
  .map(function(d) { return d.month; } ));
    this.user_y.domain(d3Array.extent(this.user_apiData
  , function(d) { return d.value; } ));

  }

  private drawAxis() {

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
          .call(d3Axis.axisLeft(this.y).tickFormat(d3Format.format("d")).ticks(this.client_apiData
        .length));

    this.svg.append("svg:text")
          .attr("class", "x axis-label")
          .attr("x", this.height/2 + this.margin.left)
          .attr("y", this.width/2 + this.margin.bottom*3 + this.margin.top*3 + 10)
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
    
    // user svg below

    this.user_svg.append("svg:g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + this.user_height + ")")
          .style("font-size", "12")
          .style("font-variant", "small-caps")
          .call(d3Axis.axisBottom(this.user_x));

    this.user_svg.append("svg:g")
          .attr("class", "axis axis--y")
          .attr('transform', 'translate(0,0)')
          .style("font-size", "12")
          .call(d3Axis.axisLeft(this.user_y).tickFormat(d3Format.format("d")).ticks(this.user_apiData
        .length));

    this.user_svg.append("svg:text")
          .attr("class", "x axis-label")
          .attr("x", this.user_height/2 + this.user_margin.left)
          .attr("y", this.user_width/2 + this.user_margin.bottom*3 + this.user_margin.top*3 + 10)
          .text("Month")
          .style('font-weight', "bold")
          .style("font-size", 20);

    this.user_svg.append("svg:text")
          .attr("class", "y axis-label")
          .attr("x", -this.user_height/2 - this.user_margin.top - 15)
          .attr("y", -this.user_margin.right - 10)
          .attr("transform", "rotate(270)")
          .text("Invoices")
          .style('font-weight', "bold")
          .style("font-size", 20);
  }

  private drawLine() {
    this.line = d3Shape.line()
                       .curve(d3Shape.curveMonotoneX)
                       .x( (d: any) => this.x(d.month) )
                       .y( (d: any) => this.y(d.value) );

    this.svg.append("svg:path")
            .datum(this.client_apiData
          )
            .attr("class", "line")
            .attr("d", this.line)
            .attr('transform', 'translate(50,0)')
            .style("fill", "none")
            .style('stroke', "purple")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style('stroke-width', 3);

    var label = d3.select(".label");
    this.svg.selectAll(".dot")
            .data(this.client_apiData
          )
            .enter()
            .append("svg:circle")
            .attr("class", "dot")
            .attr("cx", (d: any) => this.x(d.month))
            .attr("cy", (d: any) => this.y(d.value))
            .attr("r", 5)
            .attr("transform", "translate(50,0)")
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
            .attr('y', -1 * this.height- 10)
            .attr('height', this.height + 20)
            .attr('width', this.width + 5)
            .attr('class', 'curtain')
            .attr('transform', 'rotate(180)')
            .style('fill', 'white')

    var t = d3Transition.transition()
            .delay(750)
            .duration(6000);
    t.select('rect.curtain')
            .attr('width', 0);

    // user line below
    this.user_line = d3Shape.line()
                       .curve(d3Shape.curveMonotoneX)
                       .x( (d: any) => this.x(d.month) )
                       .y( (d: any) => this.y(d.value) );

    this.user_svg.append("svg:path")
            .datum(this.user_apiData
          )
            .attr("class", "line")
            .attr("d", this.user_line)
            .attr('transform', 'translate(50,0)')
            .style("fill", "none")
            .style('stroke', "purple")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style('stroke-width', 3);

    var user_label = d3.select(".userLabel");
    this.user_svg.selectAll(".dot")
            .data(this.user_apiData
          )
            .enter()
            .append("svg:circle")
            .attr("class", "dot")
            .attr("cx", (d: any) => this.x(d.month))
            .attr("cy", (d: any) => this.y(d.value))
            .attr("r", 5)
            .attr("transform", "translate(50,0)")
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
              user_label.attr("transform", "translate("+ ((d: any) => this.x(d.month)) +"," + ((d: any) => this.y(d.value)) +")");
              user_label.text("" +d.month+ ": " +d.value);
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
    // function mouseOut(d, i) {
    //   d3.select(this)
    //     .attr("r", 5)
    //     .style("fill", "white")
    //     .style("stroke", "purple");
    //   d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
    // }

    var user_curtain = this.user_svg.append("svg:rect")
            .attr('x', -1 * this.user_width)
            .attr('y', -1 * this.user_height)
            .attr('height', this.user_height + 20)
            .attr('width', this.user_width + 5)
            .attr('class', 'user_curtain')
            .attr('transform', 'rotate(180)')
            .style('fill', 'white')

    var t2 = d3Transition.transition()
            .delay(750)
            .duration(6000);
    t2.select('rect.user_curtain')
            .attr('width', 0);
  }
}
