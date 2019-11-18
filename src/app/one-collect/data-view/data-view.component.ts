import { of as observableOf, Subscription, Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import * as _ from 'lodash';
declare var $: any;

import { environment } from 'src/environments/environment';
import { TranslateService } from '../../services/translate/translate.service';
import { debounceTime, mergeMap, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'oc-data-view',
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.css']
})
export class DataViewComponent implements OnInit, OnDestroy, AfterViewInit {
  /*********************************************/
  /* Class properties
  /*********************************************/
  firstLoad: boolean = true;
  noAdvancedView: boolean = false;
  slider: any;
  folder: any;
  job: any;
  components: any[] = [];
  commands: any[] = [];
  componentIdx: any = 0;
  commandLog: any;
  commandLogBackup: any;
  commandFlag: any;
  searchText: any;
  dataView: any;
  parseError: any;
  types: any[] = [];
  headers: any[] = [];
  rows: any[] = [];
  start: number = 0;
  interval: number = 20;
  command$: any;

  // command search
  searchQuery: string = '';
  searchIndex: any = -1;
  totalMatches = 0;

  // tour properties
  tourStarted: boolean = false;

  //CA Varaibles
  caLaunch: boolean = environment.caLaunch;
  showcommand: any;
  enableOneCollect: any = false;
  enableOneCollectSubscription: Subscription;
  //CommandView updates for CA
  requestCommandPre: boolean = false;
  searchCommandPre: boolean = false;

  searchTextChanged = new Subject<string>();
  searchSubscription: Subscription;
  isSearching: boolean = false;
  client: any = environment.client;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    if (!this.caLaunch) {
      this.slider = 'advanced';
    } else {
      this.slider = 'command';
      this.enableOneCollect = this.dataService.getEnableOneCollect();
      this.enableOneCollectSubscription = this.dataService.modalCustomOC$.subscribe(
        ocvalue => {
          this.enableOneCollect = ocvalue;
          this.slider = 'command';
        }
      );
    }
    this.searchSubscription = this.searchTextChanged
      .pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .pipe(mergeMap(search => observableOf(this.commandSearch())))
      .subscribe(data => {
        // this.dataService.hideLoader();
        this.isSearching = false;
      });
    this.dataView = this.dataService.getDataView();
    // load first job when data view tab is directly clicked
    if (!this.dataView.job) {
      this.trySettingDefaultJob(this.start, this.interval);
    } else {
      // load the clicked job
      this.job = this.dataView.job;
      this.setComponents();
    }
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    // unbind keypress event handler
    $('body').off('keydown', this.searchByKey);
    if (this.caLaunch) {
      this.enableOneCollectSubscription.unsubscribe();
    }
    this.searchSubscription.unsubscribe();
    this.dataService.setDataView(); //set dataview null
  }

  /*********************************************/
  /* Method to initialize component tour
  /*********************************************/
  toggleTour(state) {
    this.tourStarted = state;
  }

  /*********************************************/
  /* Lifecycle hook AfterViewInit
  /*********************************************/
  ngAfterViewInit() {
    // attach keypress event handler
    $('body').on('keydown', this.searchByKey);
  }

  /*********************************************/
  /* Callback to search command text by keypress
  /*********************************************/
  searchByKey = e => {
    // do nothing if there are no search results
    if (!this.totalMatches) {
      return;
    }
    // get current active element id
    let id = document.activeElement.id;
    if (id == 'search-command-input') {
      // match keystroke and move up or down
      let code = e.keyCode ? e.keyCode : e.which;
      if (code == 13 || code == 40) {
        this.searchDown();
      } else if (code == 38) {
        this.searchUp();
      }
    }
  };

  /*********************************************/
  /* Method to download report for advanced view
  /* and command view
  /*********************************************/
  downloadView(folder) {
    this.dataService.showLoader();
    this.apiService.downloadJobViewReportData(folder).subscribe(
      data => {
        if (data) {
          this.dataService.hideLoader();
          let blob = data;
          let a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = this.job.name + '.xlsx';
          document.body.appendChild(a);
          a.click();
        }
      },
      error => {
        //this.ImtError = error.message;
        this.dataService.hideLoader();
      }
    );
  }

  /*********************************************/
  /* Method to load default job based when data
  /* view tab is clicked - selects top most job
  /* that has completed collecting
  /*********************************************/
  trySettingDefaultJob(start, interval) {
    this.apiService.getJobsList(start, interval).subscribe(data => {
      let jobs = data.jobs;
      _.forEach(jobs, (job, i) => {
        if (job.status != 'Failed' && job.status != 'In progress') {
          this.job = _.cloneDeep(job);
          // exit loop after first occurrence
          return false;
        }
      });
      if (this.job) {
        // continue to set components
        this.setComponents();
      } else {
        // retry with next page of jobs
        //this.trySettingDefaultJob(start + interval, interval);
      }
    });
  }

  /*********************************************/
  /* Method to set components for given job
  /*********************************************/
  setComponents() {
    // check if component is passed
    if (!this.dataView.component) {
      // check if job exists and load all components for the job
      if (this.job) {
        if (!this.caLaunch) {
          this.apiService.getJobLog(this.job.name).subscribe(data => {
            // parse all components and store in array
            if (!data.components) {
              this.parseError = this.translate.instant('Dataview_nodata');
              this.noAdvancedView = true;
            } else {
              let components = JSON.parse(data.components);
              _.forEach(components, (component, host) => {
                component['host'] = host;
                component['show'] = false;
                this.components.push(component);
              });
              this.setFolder();
              if (this.slider == 'advanced') {
                this.setAdvancedData(0);
              } else {
                this.setCommands();
              }
            }
          });
        } else {
          this.apiService
            .getCommandViewerJobLog(this.job.name)
            .subscribe(data => {
              // parse all components and store in array
              let components;
              let dataComponents = data['components'];
              if (typeof dataComponents == 'string') {
                components = JSON.parse(dataComponents);
              } else {
                components = dataComponents;
              }
              _.forEach(components, (component, host) => {
                component['host'] = host;
                component['show'] = false;
                this.components.push(component);
              });
              this.setFolder();
              if (this.slider == 'advanced') {
                this.setAdvancedData(0);
              } else {
                this.setCommands();
              }
            });
        }
      }
    } else {
      // load only the selected component
      if (this.caLaunch) {
        this.showcommand = true;
      }
      this.dataView.component['show'] = false;
      this.components.push(this.dataView.component);
      this.setFolder();
      if (this.slider == 'advanced') {
        this.setAdvancedData(0);
      } else {
        this.setCommands();
      }
    }
  }

  /*********************************************/
  /* Method to set folder to be displayed for
  /* fetching files directly
  /*********************************************/
  setFolder() {
    if (this.job) {
      // windows type file path with back slashes
      let path = this.getFilePath(0);
      let parts = path.split('\\');
      if (parts.length > 1) {
        parts.splice(-1, 1);
        this.folder = parts.join('\\');
      } else {
        // check of linux system forward slashes
        parts = path.split('/');
        parts.splice(-1, 1);
        this.folder = parts.join('/');
      }
    }
  }

  /*********************************************/
  /* Method to set commands run for given job
  /*********************************************/
  setCommands() {
    if (this.job) {
      this.commands = [];
      if (this.caLaunch) {
        this.showcommand = true;
      }
      if (!this.components || !this.components.length) {
        this.commandLog = this.translate.instant('Dataview_nodata');
        return;
      }
      this.dataService.showLoader();
      if (!this.caLaunch) {
        this.apiService.getAllComponentCommands(this.components).subscribe(
          commands => {
            _.forEach(commands, (componentCommands, i) => {
              // initialize array for each component to hold command objects
              this.commands.push([]);
              // loop through each command for a given component
              let commandCount = 0;
              _.forEach(componentCommands, (obj, command) => {
                // initialize array of targets for each command for given component
                let commandObj = { command: command, targets: [], show: false };
                this.commands[i].push(commandObj);
                // add all targets for given command
                let keys = _.keys(obj);
                _.forEach(keys, key => {
                  let targetObj = {
                    target: key,
                    result: obj[key],
                    show: false
                  };
                  this.commands[i][commandCount]['targets'].push(targetObj);
                });
                commandCount++;
              });
            });
            // load command data for first component, first command, first target
            this.setCommandData(0, 0, 0);
            this.dataService.hideLoader();
          },
          error => {
            this.dataService.hideLoader();
          }
        );
      } else {
        this.apiService
          .ca_getAllComponentCommands(this.components, this.job.name)
          .subscribe(
            commands => {
              _.forEach(commands, (componentCommands, i) => {
                // initialize array for each component to hold command objects
                this.commands.push([]);
                // loop through each command for a given component
                let commandCount = 0;
                _.forEach(componentCommands, (obj, command) => {
                  // initialize array of targets for each command for given component
                  let commandObj = {
                    command: command,
                    targets: [],
                    show: false
                  };
                  this.commands[i].push(commandObj);
                  // add all targets for given command
                  let keys = _.keys(obj);
                  _.forEach(keys, key => {
                    let targetObj = {
                      target: key,
                      result: obj[key],
                      show: false
                    };
                    this.commands[i][commandCount]['targets'].push(targetObj);
                  });
                  commandCount++;
                });
              });
              // load command data for first component, first command, first target
              this.setCommandData(0, 0, 0);
              this.dataService.hideLoader();
            },
            error => {
              this.dataService.hideLoader();
            }
          );
      }
    }
  }

  /*********************************************/
  /* Method to show/hide component data
  /*********************************************/
  toggleComponent(componentIdx) {
    let state = this.components[componentIdx]['show'];
    // close all components
    _.forEach(this.components, (component, i) => {
      component['show'] = false;
    });
    // if the component was initially closed then open it
    if (!state) {
      this.components[componentIdx]['show'] = true;
      this.setCommandData(componentIdx, 0, 0);
      // scroll to component title
      /*let $container = $('#command-wrapper');
      let $scrollTo = $('#component-id-' + componentIdx);
      console.log("$container: ", $container);
      console.log("$scrollTo: ", $scrollTo);
      $container.scrollTop(
          $scrollTo.offset().top - $container.offset().top + $container.scrollTop() - 100
      );*/
    } else {
      this.commandFlag = '';
      this.commandLog = '';
    }
  }

  /*********************************************/
  /* Method to show/hide command data
  /*********************************************/
  toggleCommand(componentIdx, commandIdx) {
    // check if command has only one target or less
    if (this.commands[componentIdx][commandIdx]['targets'].length <= 1) {
      // select first target by default
      this.setCommandData(componentIdx, commandIdx, 0);
    } else {
      // command has more than one target so visibility state can be collapsed/expanded
      let state = this.commands[componentIdx][commandIdx]['show'];
      // if the command  was initially closed then open it
      if (!state) {
        this.commands[componentIdx][commandIdx]['show'] = true;
        this.setCommandData(componentIdx, commandIdx, 0);
      } else {
        this.commands[componentIdx][commandIdx]['show'] = false;
        this.commandFlag = '';
        this.commandLog = '';
      }
    }
  }

  /*********************************************/
  /* Method to fetch command data and change
  /* highlight in side bar
  /*********************************************/
  setCommandData(componentIdx, commandIdx, targetIdx) {
    this.searchQuery = '';
    this.totalMatches = 0;
    $('.command-content').scrollTop(0);
    if (this.commands[componentIdx][commandIdx]['targets'].length > 1) {
      _.forEach(this.commands[componentIdx], (command, i) => {
        command['show'] = false;
        _.forEach(command['targets'], (target, j) => {
          target['show'] = false;
        });
      });
      this.commands[componentIdx][commandIdx]['show'] = true;
      this.commands[componentIdx][commandIdx]['targets'][targetIdx][
        'show'
      ] = true;
    } else {
      _.forEach(this.commands[componentIdx], (command, i) => {
        command['show'] = false;
      });
      this.commands[componentIdx][commandIdx]['show'] = true;
    }
    _.forEach(this.components, (component, i) => {
      component['show'] = false;
    });
    this.components[componentIdx]['show'] = true;
    let file = this.components[componentIdx]['file_path'];
    let command = this.commands[componentIdx][commandIdx]['command'];
    let target = this.commands[componentIdx][commandIdx]['targets'][targetIdx][
      'target'
    ];
    if (this.command$) {
      this.command$.unsubscribe();
    }
    if (!this.caLaunch) {
      this.command$ = this.apiService
        .getComponentCommandData(file, target, command)
        .subscribe(
          response => {
            let log = response['body'];
            if (typeof log !== 'object') {
              log = JSON.parse(log);
            }
            if (log.data) {
              this.commandFlag = 'success';
              let data = log.data;
              if (response.headers.get('Content-Type') == 'application/json') {
                try {
                  data = JSON.stringify(JSON.parse(data), null, '  ');
                } catch (e) {
                  // do nothing
                }
              }
              this.commandLogBackup = data;
              this.commandLog = this.htmlEntities(data);
            } else {
              this.commandFlag = 'error';
              this.commandLog = log.error;
              this.commandLogBackup = log.error;
            }
          },
          error => {
            console.log('Command fetch error for: ', command);
          }
        );
    } else {
      this.command$ = this.apiService
        .ca_getComponentCommandData(file, target, command, this.job.name)
        .subscribe(log => {
          this.requestCommandPre = true;
          this.searchCommandPre = false;
          if (log.data) {
            this.commandFlag = 'success';
            this.commandLogBackup = log.data;
            this.commandLog = this.commandLogBackup;
          } else {
            this.commandFlag = 'error';
            this.commandLog = log.error;
            this.commandLogBackup = log.error;
          }
        });
    }
  }

  /*********************************************/
  /* Method to change data displayed for
  /* advanced view
  /*********************************************/
  setAdvancedData(componentIdx) {
    _.forEach(this.components, (component, i) => {
      component['show'] = false;
    });
    this.components[componentIdx]['show'] = true;
    this.componentIdx = componentIdx;

    let file = this.getFilePath(componentIdx);

    this.apiService.getComponentTypes(file).subscribe(
      response => {
        this.dataService.hideLoader();
        this.noAdvancedView = false;
        this.types = [];
        this.headers = [];
        this.rows = [];
        let types = response.body;
        _.forEach(types, (type, i) => {
          type['dataAvailable'] = false;
          type['show'] = false;
          this.types.push(type);
          this.headers.push([]);
          this.rows.push([]);
        });
      },
      error => {
        this.dataService.hideLoader();
        if (error.status == '400') {
          this.noAdvancedView = true;
          this.parseError = error.statusText;
          if (this.firstLoad) {
            this.toggleSlider();
            this.firstLoad = false;
          }
        }
      }
    );
  }

  getFilePath(componentIdx) {
    let file = '';
    if (
      _.has(this.components[componentIdx], 'sum_file') &&
      this.components[componentIdx]['sum_file'] !== ''
    ) {
      file = this.components[componentIdx]['sum_file'];
    } else {
      file = this.components[componentIdx]['file_path'];
    }
    return file;
  }

  /*********************************************/
  /* Method populate table data for given
  /* component
  /*********************************************/
  setTableData(tableIdx) {
    let componentIdx = this.componentIdx;
    if (!this.types[tableIdx]['dataAvailable']) {
      let file = this.getFilePath(componentIdx);
      let type = this.types[tableIdx]['title'];
      this.apiService.getComponentTypeData(file, type).subscribe(
        rows => {
          this.dataService.hideLoader();
          // get headers
          if (rows.length) {
            // get headers
            _.forEach(rows[0], (value, header) => {
              this.headers[tableIdx].push(header);
            });
            // set rows
            _.forEach(rows, (row, rowIdx) => {
              this.rows[tableIdx].push([]);
              _.forEach(this.headers[tableIdx], (header, i) => {
                this.rows[tableIdx][rowIdx].push(row[header]);
              });
            });
            this.types[tableIdx]['dataAvailable'] = true;
          }
        },
        error => {
          this.dataService.hideLoader();
        }
      );
    }
  }

  /*********************************************/
  /* Method to toggle table visibility
  /*********************************************/
  toggleTable(tableIdx) {
    this.types[tableIdx]['show'] = !this.types[tableIdx]['show'];
    if (this.types[tableIdx]['show']) {
      this.setTableData(tableIdx);
    }
  }

  /*********************************************/
  /* Method to toggle slider between advanced
  /* view and command view
  /*********************************************/
  toggleSlider() {
    if (this.slider == 'command') {
      this.slider = 'advanced';
      this.setAdvancedData(this.componentIdx);
    } else {
      this.slider = 'command';
      this.setCommands();
    }
  }

  /*********************************************/
  /* Method to replace special tag characters
  /* with html entities to display server
  /* returned content as is
  /*********************************************/
  htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    //.replace(/\n/g, "<br>");
  }

  /*********************************************/
  /* Method to replace string with new string
  /*********************************************/
  replaceAt(str, index, replacement, times) {
    let startTag = '¦';
    let endTag = '§';
    let tagLength = startTag.length + endTag.length;
    let newHtml = startTag + replacement + endTag;
    return (
      str.substr(0, index + tagLength * times) +
      newHtml +
      str.substr(index + tagLength * times + replacement.length)
    );
  }

  /*********************************************/
  /* Method to clean search query to enable
  /* correct construction of regular expression
  /*********************************************/
  cleanQuery(str) {
    // escape all regex special characters
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\|/g, '\\|')
      .replace(/\*/g, '\\*')
      .replace(/\^/g, '\\^')
      .replace(/\$/g, '\\$')
      .replace(/\./g, '\\.')
      .replace(/\?/g, '\\?')
      .replace(/\+/g, '\\+')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');
  }

  /*********************************************/
  /* Method to search data in command viewer
  /*********************************************/
  commandSearch() {
    this.dataService.showLoader();
    setTimeout(() => {
      this.isSearching = true;
      if (this.caLaunch) {
        this.requestCommandPre = false;
        this.searchCommandPre = true;
      }
      this.searchIndex = -1;
      const searchText = this.cleanQuery(this.searchQuery);
      this.commandLog = this.htmlEntities(this.commandLogBackup);
      if (!searchText) {
        this.totalMatches = 0;
      } else {
        let regexp = new RegExp(searchText, 'ig');
        let match,
          matches = {
            all: [],
            unique: {}
          };
        while ((match = regexp.exec(this.commandLog)) != null) {
          matches['all'].push(match[0]);
          matches['unique'][match[0]] = match[0];
        }
        this.totalMatches = matches['all'].length;
        let startTag =
          "<span class='search-highlight' style='background-color:#ff3b3b; color:#fff;'>";
        let endTag = '</span>';
        _.forEach(matches.unique, (match, i) => {
          let rExp = new RegExp(match, 'g');
          this.commandLog = this.commandLog.replace(
            rExp,
            startTag + match + endTag
          );
        });
      }
      this.isSearching = false;
      this.dataService.hideLoader();
      return this.totalMatches;
    }, 200);
  }

  /*********************************************/
  /* Method to highlight occurence of searched
  /* word in upward direction
  /*********************************************/
  searchUp() {
    let $matches = $('span.search-highlight');
    if (this.searchIndex == -1 || this.searchIndex == 0) {
      this.searchIndex = 0;
    } else if (this.searchIndex > 0) {
      this.searchIndex = this.searchIndex - 1;
    }
    $matches
      .eq(this.searchIndex + 1)
      .css('background-color', '#ff3b3b')
      .css('color', '#fff');
    $matches
      .eq(this.searchIndex)
      .css('background-color', 'yellow')
      .css('color', '#000');
    // scroll to element
    let $container = $('.command-content');
    let $scrollTo = $matches.eq(this.searchIndex);
    $container.scrollTop(
      $scrollTo.offset().top -
        $container.offset().top +
        $container.scrollTop() -
        50
    );
  }

  /*********************************************/
  /* Method to highlight occurence of searched
  /* word in downward direction
  /*********************************************/
  searchDown() {
    let $matches = $('span.search-highlight');
    let count = $matches.length;
    if (this.searchIndex == -1) {
      this.searchIndex = 0;
    } else if (this.searchIndex > -1 && this.searchIndex < count - 1) {
      this.searchIndex = this.searchIndex + 1;
    } else {
      this.searchIndex = count - 1;
    }
    // highlight selected after de-selecting previously selected
    if (this.searchIndex != 0) {
      $matches
        .eq(this.searchIndex - 1)
        .css('background-color', '#ff3b3b')
        .css('color', '#fff');
    }
    $matches
      .eq(this.searchIndex)
      .css('background-color', 'yellow')
      .css('color', '#000');
    // scroll to element
    let $container = $('.command-content');
    let $scrollTo = $matches.eq(this.searchIndex);
    $container.scrollTop(
      $scrollTo.offset().top -
        $container.offset().top +
        $container.scrollTop() -
        50
    );
  }

  //**CA Code**//
  getPreference() {
    this.apiService.getPreferences().subscribe(preferences => {
      preferences = JSON.parse(preferences.preference)['basic'];
      this.enableOneCollect = preferences.enableOneCollect;
    });
  }

  navigateToViewTab(jobName) {
    this.router.navigate(['/main/job', jobName], {
      relativeTo: this.activatedRoute
    });
  }

  navigateToCollection() {
    this.router.navigate(['/new-collection/solution-based']);
  }
  search($event) {
    this.searchTextChanged.next($event.target.value);
  }
}
