import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';


@Component({
  selector: 'app-new-heat',
  templateUrl: './new-heat.component.html',
  styleUrls: ['./new-heat.component.css']
})
export class NewHeatComponent implements OnInit {
  data: any[];
  baseValue;
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.getDataFromAPI()
      .then(() => this.draw())
      .catch(error => console.error('Error:', error));
  }
  draw(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.createChart();
      resolve(); // Opcionalmente, puedes pasar algún valor a resolve()
    });
  }
  getDataFromAPI(): Promise<any> {
    return new Promise<void>(async (resolve, reject) => {
      const freecodecampData = await this.dataService.getData().toPromise();
      this.data = freecodecampData.monthlyVariance;
      this.baseValue = freecodecampData.baseTemperature;
      resolve();
    });
  }
  createChart(): void {
    const years = Array.from({ length: 262 }, (_, i) => 1753 + i); // Genera un arreglo con 10 años desde 2010 hasta 2019
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const legendValues = {
      color: ["#FF4500", "#FF6600", "#FF7F00", "#FF8C00", "#FFA500", "#FFB732", "#FFC864", "#FFD98E", "#FFE8BF"],
      limit: [12.8, 11.7, 10.6, 9.5, 8.3, 7.2, 6.1, 5.0, 3.9, 2.8]
    }

    const getColorByValue = (value) => {
      const { limit, color } = legendValues;
      for (let i = 0; i < limit.length; i++) {
        if (value >= limit[i]) {
          return color[i];
        }
      }
      return color[color.length - 1];
    };
    const margin = { top: 50, right: 30, bottom: 80, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#heatmap-container')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu) // Puedes cambiar el esquema de colores según tus preferencias
      .domain([0, 100]); // Ajusta el dominio de acuerdo a tus datos


    // const getColor = (month: string, year: number) => {
    const getColorTemp = (month: string, year: number) => {
      const monthIndex = months.indexOf(month);
      const yearIndex = years.indexOf(year);
      const value = (monthIndex + 1) * (yearIndex + 1); // Puedes ajustar esta fórmula según tus necesidades

      const foundObject = this.data.find(obj => obj.year === year && obj.month === (monthIndex + 1));
      var color = "red"
      const temp = foundObject.variance + this.baseValue;
      if (foundObject) {
        color = getColorByValue(temp);
      }
      // return  color;
      return { "color": color, "temp": temp };
    };

    // Eje x
    const xScale = d3.scaleTime()
      .domain([new Date(years[0].toString()), new Date((years[years.length - 1] + 1).toString())])
      .range([0, width]);

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%Y')));

    // Eje y
    const yScale = d3.scaleBand()
      .domain(months)
      .range([0, height]);

    svg.append('g')
      .attr('id', 'y-axis')
      .call(d3.axisLeft(yScale).tickPadding(2)
      );

    svg.append('text')
      .attr('id', 'title')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Monthly Global Land-Surface Temperature');

    svg.append('text')
      .attr('id', 'description')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('1753 - 2015: base temperature 8.66℃');
    const tooltip = d3.select('#heatmap-container')
      .append('div')
      .attr("id", "tooltip")
      .attr('class', 'tooltip')
      .attr('data-year', 1753)
      .style('opacity', 0);

    svg.selectAll('.month-group')
      .data(months)
      .enter()
      .append('g')
      .attr('class', 'month-group')
      .attr('transform', (d) => `translate(0, ${yScale(d)})`)
      .selectAll('.heatmap-rect')
      .data((d: string, i) => years.map((year) => ({ month: d, year })))
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', 0)
      .attr('data-year', 1753)
      .attr('data-temp', 0)
      .attr('x', (d) => xScale(new Date(d.year.toString())))
      .attr('y', 0)
      .attr('width', xScale(new Date(years[1].toString())) - xScale(new Date(years[0].toString())))
      .attr('height', yScale.bandwidth())
      .style('fill', (d) => {
        const colorTemp = getColorTemp(d.month, d.year);
        return colorTemp.color;
      })
      .style('stroke', 'white')
      .style('stroke-width', 0.5)
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        const colorTemp = getColorTemp(d.month, d.year);
        tooltip.html('<strong>' + d.month + ' ' + d.year + '</strong><br /><span> Temp : ' + colorTemp.temp + '<strong> C</strong></span>')
          .style('left', (event.clientX + 10) + 'px')
          .style('top', (event.clientY - 10) + 'px')
      })

      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    //Legend
    const widthLegend = 30;
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${margin.left + 150}, ${margin.top})`);

    const legendY = 280;
    const legendX = 280;

    legend
      .selectAll("rect")
      .data(legendValues.color)
      .enter()
      .append("rect")
      .attr("width", widthLegend)
      .attr("height", widthLegend)
      .attr("x", (d, i) => i * (-widthLegend) + legendX)
      .attr("y", legendY)
      .attr("fill", (d, i) => legendValues.color[i]);

    // with text elements include text below each rectangle of the legend
    legend
      .selectAll("text")
      .data(legendValues.limit)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * (-widthLegend) + legendX)
      .attr("y", legendY)
      .style("font-size", "0.7rem")
      .text((d, i) => `${legendValues.limit[i]}°`);

    const xAxisTitle = svg.append('text')
      .attr('id', 'x-axis-title')
      .style('font-family', 'Arial')
      .style('font-size', '12px')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .style('text-anchor', 'middle')
      .text('Years');

    const yAxisTitle = svg.append('text')
      .attr('id', 'y-axis-title')
      .style('font-family', 'Arial')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .style('text-anchor', 'middle')
      .text('Months');

  }
}
