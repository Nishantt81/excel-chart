import { Component, ViewChild, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  excelData: any;
  excelcolumnNames: string[] = [];
  predefinedArray = [
    { ourcolumnName: 'productid', excelcolumnName: '' },
    { ourcolumnName: 'productname', excelcolumnName: '' },
    { ourcolumnName: 'productprice', excelcolumnName: '' }
  ];
  mapping: { [key: string]: string } = {};
  isMappingConfirmed = false;
  mappingItems = this.predefinedArray.map(column => ({
    predefinedcolumnName: column.ourcolumnName,
    excelcolumnNames: ''
  }));

  title = 'Excel';

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild('barChartCanvas') barChartCanvas: ElementRef<HTMLCanvasElement>;

  constructor() {}

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  handleFileInput(event: any) {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      this.readExcel(selectedFile).then(({ data, columns }) => {
        console.log("Excel data: ", data);
        this.excelData = data;
        this.excelcolumnNames = columns;
      }).catch(error => {
        console.error('Error reading Excel file: ', error);
      });
    }
  }

  readExcel(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        const columnNames = Object.keys(excelData[0]);
        resolve({ data: excelData, columns: columnNames });
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  generateBarChart(data: any[]) {
    if (!this.barChartCanvas) {
      console.error('Canvas not found');
      return;
    }

    const labels = data.map(items => items.productname);
    const values = data.map(items => items.productprice);

    new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Product Prizes',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 6
        }]
      },
      options: {
        responsive: false
      }
    });
  }

  



  confirmMapping(mapping: { [key: string]: string }) {
    this.mapping = mapping;
    this.isMappingConfirmed = true;

    for (const item of this.mappingItems) {
      const predefinedcolumnName = item.predefinedcolumnName;
      const excelcolumnNames = this.mapping[predefinedcolumnName];
      item.excelcolumnNames = excelcolumnNames;
    }

    const tableData = this.excelData.map((row: any) => {
      const mappedRow: any = {};
      for (const key of Object.keys(this.mapping)) {
        mappedRow[key] = row[this.mapping[key]];
      }
      return mappedRow;
    });

    console.log(this.mappingItems);
    this.generateBarChart(tableData);
    console.log(tableData)
    //this.openTablePopupWindow(tableData);
  }

  openTablePopupWindow(data: any[]) {
    const popupWidth = 600;
    const popupHeight = 400;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    const popupWindow = window.open('', '_blank', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
    if (popupWindow) {
      popupWindow.document.write('<h2>Table Data</h2>');
      popupWindow.document.write('<table border="1">');
      popupWindow.document.write('<tr>');
      for (const key of Object.keys(this.mapping)) {
        popupWindow.document.write(`<th>${key}</th>`);
      }
      popupWindow.document.write('</tr>');
      for (const row of data) {
        popupWindow.document.write('<tr>');
        for (const key of Object.keys(this.mapping)) {
          popupWindow.document.write(`<td>${row[key]}</td>`);
        }
        popupWindow.document.write('</tr>');
      }
      popupWindow.document.write('</table>');
      popupWindow.document.close();
    } else {
      console.error('Failed to open popup window.');
    }
  }
}
