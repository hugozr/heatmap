import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'app-heats',
  templateUrl: './heat.component.html',
  styleUrls: ['./heat.component.css']
})
export class DotsComponent implements OnInit {
  w = 1000;
  h = 600;
  data: any;
  constructor(private dataService: DataService) { }
  ngOnInit() {
    this.getDataFromAPI()
      .then(() => this.draw())
      .catch(error => console.error('Error:', error));
  }
  draw(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.drawChart();
      resolve(); // Opcionalmente, puedes pasar algún valor a resolve()
    });
  }

  private drawChart(): void {
    // Datos de ejemplo

    const data1: any = this.data.monthlyVariance;

    const baseValue = this.data.baseTemperature;

    const legendValues = {
      // fillColors: ["#e83a30", "#ee6d66", "#f4a09c", "#faddd1", "#a39cf4", "#7166ee", "#4030e8"],
      fillColors:
        ["#FF4500",
          "#FF6600",
          "#FF7F00",
          "#FF8C00",
          "#FFA500",
          "#FFB732",
          "#FFC864",
          "#FFD98E",
          "#FFE8BF"
        ],
      meaning: [10.6, 11.7, 12.8, 9.5, 8.3, 7.2, 6.1, 5.0, 3.9, 2.8],
      size: 30
    }

    // Configuración del gráfico
    const margin = { top: 120, right: 20, bottom: 100, left: 80 };
    const width = this.w - margin.left - margin.right;
    const height = this.h - margin.top - margin.bottom;

    console.log(data1);

    //Get the range we want to display on X axis

    var maxYear = d3.max(data1, (d: any) => d.year * 1)
    var minYear = d3.min(data1, (d: any) => d.year * 1)
    var maxMonth = d3.max(data1, (d: any) => d.month * 1)
    var minMonth = d3.min(data1, (d: any) => d.month * 1)

    const toolTips = d3.select("body").append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("background", "Red")
      .style("color", "White")
      .style("opacity", 0);

    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const chartTitle = svg.append('text')
      .attr('class', 'chart-title')
      .style('font-family', 'Arial')
      .style('font-size', '26px')
      .attr('id', 'title')
      .attr('x', width / 2)
      .attr('y', - margin.top / 2)
      .style('text-anchor', 'middle')
      .text('Monthly Global Land-Surface Temperature')

    const chartSubTitle = svg.append('text')
      .attr('id', 'description')
      .attr('x', width / 2)
      .attr('y', 20 - margin.top / 2)
      .attr('text-anchor', 'middle')
      .text("1753 - 2015: base temperature 8.66℃")
      .style('font-size', '16px')

    // Escala X
    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // const months = ["December", "November", "October", "September", "August", "July", "June", "May", "April", "March", "February", "January"]
    // http://using-d3js.com/04_07_ordinal_scales.html

    var yScale = d3.scaleBand()
      .domain(months)
      .range([0, height])


    // const yScale = d3.scaleLinear()
    //   // .domain([maxMonth, minMonth])
    //   .domain([minMonth, maxMonth])
    //   .range([0, height]);


    const hrect = height / 12

    svg.selectAll('rect')
      .data(data1)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', (d: any) => d.month - 1)
      .attr('data-year', (d: any) => d.year)
      .attr('data-temp', (d: any) => d.variance)
      .attr('x', (d: any) => xScale(d.year))
      .attr('y', (d: any) => {
        console.log("analizo y", d, months[d.month])
        // return yScale(months[d.month])})
        return yScale(d.month) - hrect
      })
      .attr("width", width / (maxYear - minYear))
      .attr("height", hrect)
      .attr("fill", (d: any, i) => {
        let cellTemperature = d.variance + baseValue;
        if (cellTemperature > legendValues.meaning[0]) {
          return legendValues.fillColors[0];
        }
        else if (cellTemperature > legendValues.meaning[1]) {
          return legendValues.fillColors[1];
        }
        else if (cellTemperature > legendValues.meaning[2]) {
          return legendValues.fillColors[2];
        }
        else if (cellTemperature > legendValues.meaning[3]) {
          return legendValues.fillColors[3];
        }
        else if (cellTemperature > legendValues.meaning[4]) {
          return legendValues.fillColors[4];
        }
        else if (cellTemperature > legendValues.meaning[5]) {
          return legendValues.fillColors[5];
        }
        else if (cellTemperature > legendValues.meaning[6]) {
          return legendValues.fillColors[6];
        }
        else if (cellTemperature > legendValues.meaning[7]) {
          return legendValues.fillColors[7];
        }
        else if (cellTemperature > legendValues.meaning[8]) {
          return legendValues.fillColors[8];
        }
        else {
          return legendValues.fillColors[9];
        }
      })


      .on('mouseover', (event, d: any) => {
        console.log("atnto", d)
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.clientX + 10) + 'px')
          .style('top', (event.clientY - 10) + 'px')
          .html('<strong>' + months[d.month - 1] + ' ' + d.year
            + '</strong><br /><span> Temp : ' + (Math.round(baseValue + d.variance)) + '<strong> C</strong></span>');
      })
      .on('mouseout', () => {
        d3.select('#tooltip')
          .style('display', 'none');
      })
      .style("opacity", .8);

    const xAxisTitle = svg.append('text')
      .attr('id', 'x-axis-title')
      .style('font-family', 'Arial')
      .style('font-size', '16px')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .style('text-anchor', 'middle')
      .style('font-size', '18px')
      .text('Years');

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    const yAxisTitle = svg.append('text')
      .attr('id', 'y-axis-title')
      .style('font-family', 'Arial')
      .style('font-size', '16px')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 30)
      .style('text-anchor', 'middle')
      .style('font-size', '18px')
      .text('Months');

    var yAxis = d3.axisLeft(yScale);
    svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("id", "y-axis")
      .call(yAxis);


    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${margin.left + 150}, ${margin.top})`);

    const legendY = 350;

    legend
      .selectAll("rect")
      .data(legendValues.fillColors)
      .enter()
      .append("rect")
      .attr("width", legendValues.size)
      .attr("height", legendValues.size)
      .attr("x", (d, i) => i * (-legendValues.size))
      .attr("y", legendY)
      .attr("fill", (d, i) => legendValues.fillColors[i]);

    // with text elements include text below each rectangle of the legend
    legend
      .selectAll("text")
      .data(legendValues.meaning)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * (-legendValues.size))
      .attr("y", legendY)
      .style("font-size", "0.7rem")
      .text((d, i) => `${legendValues.meaning[i]}°`);
  }

  getDataFromAPI(): Promise<any> {
    return new Promise<void>(async (resolve, reject) => {
      this.data = await this.dataService.getData().toPromise();
      console.log(this.data);
      resolve();
    });
  }
}

