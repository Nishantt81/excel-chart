import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js'

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

constructor() { }

  ngOnInit(): void {
    (async function () {
      const data = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
        { year: 2012, count: 15 },
        { year: 2013, count: 25 },
        { year: 2014, count: 22 },
        { year: 2015, count: 30 },
        { year: 2016, count: 28 },
      ];

      new Chart(
        document.getElementById('acquisitions'),
        {
          type: 'bar',
          data: {
            labels: data.map(row => row.year),
            datasets: [
              {
                label: 'Acquisitions by year',
                data: data.map(row => row.count)
              }
            ]
          }
        }
      );
    })();
  }

}  
