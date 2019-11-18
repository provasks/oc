import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'oc-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.css']
})
export class CommonComponent implements OnInit {
  /*********************************************/
  /* Class properties
  /*********************************************/
  // filter properties
  showFilters: boolean = false;
  fields: any[] = [];

  // sorting properties
  sortType: string = 'asc';
  sortField: string = '';

  // scroll properties
  showLeftScroll: boolean = false;
  showRightScroll: boolean = false;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor() {}

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {}

  /*********************************************/
  /* Method to replace dot with hyphen to enable
  /* correct calling of jquery element 
  /* containing dot
  /*********************************************/
  dashed(str) {
    return str.replace('.', '-');
  }

  /*********************************************/
  /* Method to show/hide filters row
  /*********************************************/
  toggleFilters() {
    // clear all filter values
    _.forEach(this.fields, (field, i) => {
      $('#filter-' + this.dashed(field.key)).val('');
      // set filterValue to empty
      field['filterValue'] = '';
    });
    // run an empty filtering to show all rows
    this.filter();
    // toggle filter row visibility
    this.showFilters = !this.showFilters;
  }

  /*********************************************/
  /* Method to filter rows based on given 
  /* field, value combination
  /*********************************************/
  filter(key?, value?) {
    // set value to corresponding field object
    if (key) {
      let obj = _.find(this.fields, { key: key });
      obj['filterValue'] = value;
    }
    this.matcher(key);
  }

  /*********************************************/
  /* Stub method that requires custom 
  /* implementation in each inherited component 
  /* for custom filtering
  /*********************************************/
  matcher(key) {}

  /*********************************************/
  /* Method to clear all filters and show all
  /* rows
  /*********************************************/
  clearFilter(key) {
    $('#filter-' + this.dashed(key)).val('');
    this.filter(key, '');
  }

  /*********************************************/
  /* Method to update whether field needs to be
  /* sorted in ascending or descending
  /*********************************************/
  updateSortType(field) {
    // update sortType
    if (this.sortField != field) {
      this.sortType = 'asc';
    } else if (this.sortType == 'asc') {
      this.sortType = 'desc';
    } else {
      this.sortType = 'asc';
    }
  }

  /*********************************************/
  /* Method to sort column by given field
  /*********************************************/
  doSort(field, fieldMap, rows) {
    // update sortField
    this.sortField = field;
    // construct new fieldMap after converting keys containing commas
    // to single key,value pairs
    let newFieldMap = {};
    _.forEach(fieldMap, (jsonField, uiField) => {
      if (_.includes(uiField, ',')) {
        let fields = uiField.split(',');
        _.forEach(fields, field => {
          newFieldMap[field] = jsonField;
        });
      } else {
        newFieldMap[uiField] = jsonField;
      }
    });
    // define sort condition by value in json
    let sortField = null;
    _.forEach(newFieldMap, (jsonField, uiField) => {
      // exclude default and check if other fields exist
      if (uiField != 'default') {
        if (this.shortenField(field) == this.shortenField(uiField)) {
          sortField = jsonField;
          // exit loop after first match
          return false;
        }
      }
    });
    // when no matching uiField exists, use default
    if (!sortField && _.has(newFieldMap, 'default')) {
      sortField = newFieldMap['default'];
    }
    // sorter containing dynamic fields with depth in json
    let sorter = row => {
      if (_.includes(sortField, '.')) {
        let value;
        let keys = sortField.split('.');
        _.forEach(keys, key => {
          if (!value) {
            if (key == 'field') {
              value = row[field];
            } else {
              value = row[key];
            }
          } else {
            if (key == 'field') {
              value = value[field];
            } else {
              value = value[key];
            }
          }
        });
        return value;
      } else {
        return row[sortField];
      }
    };
    // return sorted rows
    return _.orderBy(rows, sorter, this.sortType);
  }

  /*********************************************/
  /* Method to strip all characters excepting
  /* alphabets and convert to lowercase
  /*********************************************/
  shortenField(str) {
    return str.replace(/[^a-zA-Z]+/g, '').toLowerCase();
  }

  /*********************************************/
  /* Method to scroll left when table has 
  /* horizontal scroll
  /*********************************************/
  leftScroll() {
    let pos = $('#table-data').scrollLeft();
    $('#table-data').scrollLeft(pos - 200);
    this.checkScrollVisibility();
  }

  /*********************************************/
  /* Method to scroll right when table has 
  /* horizontal scroll
  /*********************************************/
  rightScroll() {
    let pos = $('#table-data').scrollLeft();
    let newPos = pos + 200;
    $('#table-data').scrollLeft(newPos);
    this.checkScrollVisibility();
  }

  /*********************************************/
  /* Method to show visibility of scroll left
  /* or right button on table with horizontal
  /* scroll 
  /*********************************************/
  checkScrollVisibility() {
    let tableWidth = Math.round($('#table-data').width());
    let scrollWidth = $('#table-data').get(0).scrollWidth;
    let scrollDiff = scrollWidth - tableWidth;
    let pos = $('#table-data').scrollLeft();
    // show left and right scroll by default
    this.showLeftScroll = true;
    this.showRightScroll = true;
    // hide left scroll if bar is in the beginning
    if (pos == 0) {
      this.showLeftScroll = false;
    }
    // hide right scroll if bar has already reached end
    if (pos == scrollDiff) {
      this.showRightScroll = false;
    }
    // hide both left and right scroll bars if window
    // is large enough
    if (scrollWidth <= tableWidth) {
      this.showLeftScroll = false;
      this.showRightScroll = false;
    }
  }
}
