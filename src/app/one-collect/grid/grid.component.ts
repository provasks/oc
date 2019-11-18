import { Component } from '@angular/core';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'oc-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent {
  /*********************************************/
  /* Grid properties
  /*********************************************/
  meta: any = {};
  headers: any[] = [];
  processClick: any;

  // filter properties
  showFilters: boolean = false;

  // sort properties
  sortType: string = 'asc';
  sortIndex: any;

  // horizontal scroll properties
  showLeftScroll: boolean = false;
  showRightScroll: boolean = false;

  /*********************************************/
  /* Constructor
  /*********************************************/
  constructor() {
    this.setMeta();
  }

  /*********************************************/
  /* Method to set grid meta data
  /*********************************************/
  setMeta() {
    this.meta = {
      tableId: null,
      tableBordered: true,
      tableStriped: true,
      cellPadding: '8px',
      minCellWidth: '120px',
      // actions column
      actions: true,
      actionsWidth: '90px',
      actionsTitle: 'Actions',
      // horizontal scroll buttons
      scrollButtons: true,
      showBottomScroll: true,
      // select all column
      selectAll: false,
      // extra messages row
      messages: false,
      msgColSpan: null
    };
  }

  /*********************************************/
  /* Method to be override default meta values
  /* with user provided values
  /*********************************************/
  mergeMeta(obj) {
    _.merge(this.meta, obj);
  }

  /*********************************************/
  /* Method to be called within ngOnInit of
  /* inherited class
  /*********************************************/
  initGrid(domCheck = true) {
    this.addGridDefaults();
    this.calcColSpan();
    if (domCheck) {
      this.checkDOMReady();
    }
  }

  /*********************************************/
  /* Method to add default values to grid rows
  /*********************************************/
  addGridDefaults() {
    _.forEach(this.headers, (header, i) => {
      this.headers[i].filterValue = '';
    });
  }

  /*********************************************/
  /* Method to set colspan for messages row
  /*********************************************/
  calcColSpan() {
    let cols = 0;
    if (this.meta.selectAll) {
      cols++;
    }
    if (this.meta.actions) {
      cols++;
    }
    cols += this.headers.length;
    this.meta.msgColSpan = cols;
  }

  /*********************************************/
  /* Method to check if DOM is loaded before 
  /* querying nodes
  /*********************************************/
  checkDOMReady() {
    let callback = () => {
      this.setAffixStyles();
      this.checkScrollVisibility();
    };
    // check if DOM is loaded before fixing scroll buttons
    let el = document.getElementById(this.meta.tableId);
    if (typeof el != 'undefined' && el != null) {
      callback();
      $(window).resize(() => {
        callback();
      });
    } else {
      setTimeout(() => {
        this.checkDOMReady();
      }, 1000);
    }
  }

  /*********************************************/
  /* Method to perform specified operation on 
  /* all rows
  /*********************************************/
  gridDo(action, rows, index, value?) {
    if (action == 'sort') {
      return this.sort(rows, index);
    } else if (action == 'filter') {
      return this.filter(rows, index, value);
    } else if (action == 'toggleFilters') {
      return this.toggleFilters(rows);
    } else if (action == 'clearFilter') {
      return this.clearFilter(rows, index);
    }
  }

  /*********************************************/
  /* Method to show/hide filters row
  /*********************************************/
  toggleFilters(rows) {
    // clear all filter values
    _.forEach(this.headers, (header, i) => {
      $('#' + this.meta.tableId + '-filter-' + i).val('');
      // set filterValue to empty
      header.filterValue = '';
    });
    // toggle filter row visibility
    this.showFilters = !this.showFilters;
    // run empty filter
    return this.filter(rows, 0, '');
  }

  /*********************************************/
  /* Method to clear all filters and show all
  /* rows
  /*********************************************/
  clearFilter(rows, index) {
    $('#' + this.meta.tableId + '-filter-' + index).val('');
    return this.filter(rows, index, '');
  }

  /*********************************************/
  /* Method to filter rows based on given 
  /* field, value combination
  /*********************************************/
  filter(rows, index, value?) {
    // set value to corresponding field object
    this.headers[index].filterValue = value;
    // find all rows matching all values for all fields
    _.forEach(rows, (row, i) => {
      // set row to show initially
      row.showRow = true;
      _.forEach(this.headers, (header, j) => {
        // for fields having a filter value
        if (header.filterValue) {
          let value = this.getRowValueFromKey(row, j);
          // create regular expression
          let exp = new RegExp(header.filterValue, 'i');
          if (!exp.test(value)) {
            row.showRow = false;
            // break from fields loop when first
            // non-matching field is found
            return false;
          }
        }
      });
    });
    return rows;
  }

  /*********************************************/
  /* Method to update whether field needs to be
  /* sorted in ascending or descending
  /*********************************************/
  updateSortType(index) {
    if (this.sortIndex != index) {
      this.sortType = 'asc';
    } else if (this.sortType == 'asc') {
      this.sortType = 'desc';
    } else {
      this.sortType = 'asc';
    }
  }

  /*********************************************/
  /* Method to get value is given row object
  /* based on depth of key
  /*********************************************/
  getRowValueFromKey(row, colIndex) {
    let value;
    let header = this.headers[colIndex];
    let key = header.key;
    if (_.includes(key, '.')) {
      let keys = key.split('.');
      _.forEach(keys, (key, k) => {
        if (k == 0) {
          value = row[key];
        } else {
          value = value[key];
        }
      });
    } else {
      value = row[key];
    }
    return value;
  }

  /*********************************************/
  /* Method to sort column by given field
  /*********************************************/
  sort(rows, index) {
    // update sortType
    this.updateSortType(index);
    // update sortIndex
    this.sortIndex = index;
    // sorter containing dynamic fields with depth in json
    let key = this.headers[index].key;
    let sorter = row => {
      if (_.includes(key, '.')) {
        let value = this.getRowValueFromKey(row, index);
        if (value) {
          return value.toLowerCase();
        } else {
          return value;
        }
      } else {
        if (row[key]) {
          return row[key].toLowerCase();
        } else {
          return row[key];
        }
      }
    };
    // sort rows
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
    let pos = $('#' + this.meta.tableId).scrollLeft();
    $('#' + this.meta.tableId).scrollLeft(pos - 200);
    this.checkScrollVisibility();
  }

  /*********************************************/
  /* Method to scroll right when table has 
  /* horizontal scroll
  /*********************************************/
  rightScroll() {
    let pos = $('#' + this.meta.tableId).scrollLeft();
    let newPos = pos + 200;
    $('#' + this.meta.tableId).scrollLeft(newPos);
    this.checkScrollVisibility();
  }

  /*********************************************/
  /* Method to set affix positions for scroll
  /* buttons when table width overflows with
  /* too many columns
  /*********************************************/
  setAffixStyles() {
    let body = document.body;
    let html = document.documentElement;
    let leftScroll = this.meta.tableId + '-left-scroll';
    let rightScroll = this.meta.tableId + '-right-scroll';
    // specify affix top and bottom
    //let gridTopOffset = document.getElementById(this.meta.tableId).offsetTop;
    if ($('#' + this.meta.tableId).offset()) {
      let gridTopOffset = $('#' + this.meta.tableId).offset().top;
      let gridHeight = $('#' + this.meta.tableId).outerHeight(true);
      let gridBottomOffset = gridTopOffset + gridHeight;
      let height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      $('#' + leftScroll, '#' + rightScroll).affix({
        offset: { top: gridTopOffset, bottom: height - gridBottomOffset }
      });
    }
    // $("#" + rightScroll).affix({
    //   offset: { top: gridTopOffset, bottom: height - gridBottomOffset }
    // });
  }

  /*********************************************/
  /* Method to show visibility of scroll left
  /* or right button on table with horizontal
  /* scroll 
  /*********************************************/
  checkScrollVisibility() {
    //for those where the custom scroll is not used (like saved project)
    if (typeof $('#' + this.meta.tableId).get(0) === 'undefined') return;
    let tableWidth = Math.round($('#' + this.meta.tableId).width());
    let scrollWidth = $('#' + this.meta.tableId).get(0).scrollWidth;
    let scrollDiff = scrollWidth - tableWidth;
    let pos = $('#' + this.meta.tableId).scrollLeft();
    // show left and right scroll by default
    this.showLeftScroll = true;
    this.showRightScroll = true;
    // hide left scroll if bar is in the beginning
    if (pos <= 0) {
      this.showLeftScroll = false;
    }
    // hide right scroll if bar has already reached end
    if (pos >= scrollDiff) {
      this.showRightScroll = false;
    }
    // hide both left and right scroll bars if window
    // is large enough
    if (scrollWidth <= tableWidth) {
      this.showLeftScroll = false;
      this.showRightScroll = false;
    }
  }

  /*********************************************/
  /* Method to show actions dropdown for each
  /* project
  /*********************************************/
  viewActions(i) {
    let toolsId = this.meta.tableId + '-tools-dropdown-' + i;

    let hideDropDown = () => {
      document.getElementById(toolsId).style.display = 'none';
      document
        .getElementsByTagName('body')[0]
        .removeEventListener('click', processClick);
    };

    let processClick = evt => {
      //let insideDropdown = false;
      if (!document.getElementById(toolsId).contains(evt.target)) {
        hideDropDown();
      }
      evt.stopPropagation();
    };

    this.processClick = processClick;

    // attach processClick for the dropdown
    let el = document.getElementById(toolsId);
    if (el.style.display != 'block') {
      el.style.display = 'block';
      setTimeout(() => {
        document
          .getElementsByTagName('body')[0]
          .addEventListener('click', processClick);
      }, 0);
    } else {
      // when tools button is clicked again hide dropdown
      hideDropDown();
    }
  }

  /*********************************************/
  /* Method to hide tools dropdown for each
  /* project
  /*********************************************/
  hideActions(i) {
    let toolsId = this.meta.tableId + '-tools-dropdown-' + i;
    document.getElementById(toolsId).style.display = 'none';
  }
}
