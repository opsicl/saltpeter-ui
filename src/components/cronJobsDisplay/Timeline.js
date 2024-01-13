import React from "react";
import "./Timeline.css";
import { socket } from "./socket.js";
import { Link } from "react-router-dom";
import ReactApexChart from 'react-apexcharts';

import moment from 'moment';

let apis = require("../../version.json");
const UI_VERSION = apis.version;

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timelineLast: "5m", /////////////////////
      refresh: 10000, ////////////////////////
      jobs: [],
      search: "",
      backend_version:"",
      dateNow: "",
      config_received: false,
      series: [],
      options: {
          chart: {
              height: 800,
              type: 'rangeBar',
              foreColor: '#E0D9F6',
              events: {
                dataPointSelection: function(event, chartContext, config) {
                  console.log(config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x);
                },
                xAxisLabelClick: function(event, chartContext, config) {
                  console.log(config.globals.labels[config.labelIndex])
                }
              }
                 
          },
          plotOptions: {
              bar: {
                horizontal: true,
                barHeight: '50%',
                rangeBarGroupRows: true
              }
          },
          xaxis: {
            type: 'datetime',
          },
          yaxis: {
            labels: {
              maxWidth: 250,
              style: {
                fontSize: '13px'
              }
            }
          },

          
          colors: ["#008000", "#FF0000"],
          fill: {
              type: 'solid'
          },
          legend: {
              position: 'right'
          },
          tooltip: {
            enabled: false,
          },
        
          tooltip: {
            custom: function(opts) {
              const fromTime = new Date(opts.y1).getTime();
              const toTime = new Date(opts.y2).getTime();
              const timeDiffInSeconds = Math.floor((toTime - fromTime) / 1000);

              const hours = Math.floor(timeDiffInSeconds / 3600);
              const minutes = Math.floor((timeDiffInSeconds % 3600) / 60);
              const seconds = timeDiffInSeconds % 60;

              const hoursStr = String(hours)
              const minutesStr = String(minutes)
              const secondsStr = String(seconds)

              var formattedTimeDiff = `${hoursStr}h:${minutesStr}m:${secondsStr}s`;
          
              if (hoursStr === '0') {
                formattedTimeDiff = `${minutesStr}m:${secondsStr}s`
                if (minutesStr === '0') {
                  formattedTimeDiff = `${secondsStr}s`
                }
              }
             return (
               `   ran for ${formattedTimeDiff}   `
             );
            }
          }
          
      },
    }

    socket.debug=true;
    socket.timeoutInterval = 5400;
    this.handleData.bind(this)
    this.getTimeline.bind(this)
  }

  updateSearch(event) {
    this.setState({ search: event.target.value.substr(0, 20) });
    if (event.target.value.substr(0, 20)) {
        const nextTitle = 'Saltpeter';
        const nextURL = "timeline?search=" + event.target.value.substr(0, 20);
        const nextState = { additionalInformation: 'Updated the URL with JS' };
        // This will create a new entry in the browser's history, without reloading
        window.history.replaceState(nextState,nextTitle,nextURL);
    } else {
        const nextURL = "/timeline"
        const nextTitle = 'Saltpeter';
        const nextState = { additionalInformation: 'Updated the URL with JS' };
        // This will create a new entry in the browser's history, without reloading
        window.history.replaceState(nextState,nextTitle,nextURL);
    }

  }

  getTimeline() {
    // send message to ws to get timeline info
    var obj = {}
    obj.last = this.state.timelineLast
    var now = String(Date.now())
    obj.id = now
    this.setState({dateNow: now})
    var obj_send = {}
    obj_send.getTimeline = obj
    var jsonString = JSON.stringify(obj_send)
    socket.send(jsonString);

  }

  handleData(data) {
    sessionStorage.setItem('savedState', JSON.stringify(this.state))

    // get backend version
    if (JSON.parse(data).hasOwnProperty("sp_version")){
        var json_result_version = JSON.parse(data).sp_version;
        this.setState({ backend_version: json_result_version});
    }

    //config
    if (JSON.parse(data).hasOwnProperty("config")) {
      var json_result_config = JSON.parse(data).config.crons;
      var keys = Object.keys(json_result_config);
      var cronJobs = [];
      this.setState({ config_received: true});

      for (var i = 0; i < keys.length; i++) {
         // set default number of target to 0
        var no_of_targets = json_result_config[keys[i]]["number_of_targets"]
        if (!no_of_targets) {
            no_of_targets = "0"
        }

        cronJobs.push({
          id: i,
          name: keys[i],
          command: json_result_config[keys[i]]["command"],
          cwd: json_result_config[keys[i]]["cwd"],
          user: json_result_config[keys[i]]["user"],
          soft_timeout: json_result_config[keys[i]]["soft_timeout"],
          hard_timeout: json_result_config[keys[i]]["hard_timeout"],
          targets: json_result_config[keys[i]]["targets"],
          target_type: json_result_config[keys[i]]["target_type"],
          number_of_targets: no_of_targets,
          dom: json_result_config[keys[i]]["dom"],
          dow: json_result_config[keys[i]]["dow"],
          hour: json_result_config[keys[i]]["hour"],
          min: json_result_config[keys[i]]["min"],
          mon: json_result_config[keys[i]]["mon"],
          sec: json_result_config[keys[i]]["sec"],
          year: json_result_config[keys[i]]["year"],
          group: json_result_config[keys[i]]["group"],
          batch_size: json_result_config[keys[i]]["batch_size"],
          runningOn: [],
          result: 'NotRun',
          last_run: "",
          timeline: []
        });
      }
      this.setState({jobs: cronJobs})
    }
    if ((JSON.parse(data).hasOwnProperty("running")) && (this.state.config_received === true)) {
      cronJobs = this.state.jobs;
      //clear previous data
      for (var i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["runningOn"] = [];
      }

      var json_result_running = JSON.parse(data).running;
      var keys_running = Object.keys(json_result_running);
      for (var i = 0; i < keys_running.length; i++) {
        var key_running = json_result_running[keys_running[i]]["name"];
        for (var j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] === key_running) {
            cronJobs[j]["runningOn"] = json_result_running[keys_running[i]]["machines"];
            cronJobs[j]["result"] = "Running";
            break;
          }
        }
      }

      this.setState({ jobs: cronJobs });
    }

    if ((JSON.parse(data).hasOwnProperty("last_state")) && (this.state.config_received === true)) {
      cronJobs = this.state.jobs;
      //clear previous data
      for (var i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["result"] = 0;
        cronJobs[i]["result"] = "Notrun";
      }

      var json_result_last_state = JSON.parse(data).last_state;
      var keys_last_state = Object.keys(json_result_last_state);
      for (var i = 0; i < keys_last_state.length; i++) {
        var key_name = keys_last_state[i]
        for (var j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] === key_name) {
            if (json_result_last_state[key_name]["result_ok"] === false) {
                cronJobs[j]["result"] = "Fail"
            } else {
                cronJobs[j]["result"] = "Success"
            }
            cronJobs[j]["last_run"] = json_result_last_state[key_name]["last_run"];
            break;
          }
        }
      }
      this.setState({ jobs: cronJobs }); /////////////////////////
    }

    // get timeline
    if ((JSON.parse(data).hasOwnProperty("timeline"))  && (this.state.config_received === true)) {
     if ((this.state.dateNow === "") || (JSON.parse(data).timeline.id === this.state.dateNow)) {  
      /// series first batch
      var seriesData = []
      var timeline = JSON.parse(data).timeline.content
      var data = []
      for (var i = 0; i < timeline.length; i++) {
          var jobName = timeline[i]["cron"]
          var jobInstance = timeline[i]["job_instance"]
          var msg_type = timeline[i]["msg_type"]
          var ret_code = timeline[i]['ret_code']
          var timestamp = timeline[i]['timestamp']

          var run_result
          if (timeline[i]['ret_code'] > 0) {
               run_result = 'fail'
          } else {
               run_result = 'pass'
          }
          
          var y = []
          var xyItem = {}

         //first element
         var first = false
          if ((seriesData.length == 0) && (msg_type === 'machine_start')) {
            // add first element
              y.push(new Date(timestamp).getTime())
              xyItem['jobInstance'] = jobInstance
              xyItem['x'] = jobName
              xyItem['y'] = y
              xyItem['result'] = run_result
              seriesData.push(xyItem)
              first = true
          } else {
            //search for job instance
             var resultSearchJobInstance = false
             for (var j = 0; j < seriesData.length; j++) {
                if (seriesData[j].jobInstance === jobInstance) {
                   resultSearchJobInstance = true
                   y = seriesData[j].y
                   seriesData[j].result = run_result
                   break
                 }
               }
          }
          // if not found and msg type = machine_start, add it
          // if found and msg_type = machine_result, add it
          // else, skip
          //
          if (!first && !resultSearchJobInstance && (msg_type === 'machine_start')) {
            y.push(new Date(timestamp).getTime())
            xyItem['jobInstance'] = jobInstance 
            xyItem['x'] = jobName
            xyItem['y'] = y
            xyItem['result'] = run_result
            seriesData.push(xyItem)
          } else if (resultSearchJobInstance && (msg_type === 'machine_result')) {
            y.push(new Date(timestamp).getTime()) 
          } else {
            // do nothing
          }
        }

      // last list - series to process by react chart
      var seriesDataFinal = [{'name':'pass', 'data':[]}, {'name':'fail', 'data':[]}]
      for (var i = 0;  i < seriesData.length; i++){
        var item = seriesData[i]
        if (item.result === "pass") {
          delete item.result
          delete item.jobInstance
          seriesDataFinal[0].data.push(item)
        } else if (item.result === "fail") {
          delete item.result
          delete item.jobInstance
          seriesDataFinal[1].data.push(item)
        }
      }

      seriesDataFinal.forEach(item => {
        item.data.sort((a, b) => a.x.localeCompare(b.x));
      });
      this.setState({ series: seriesDataFinal });
     }
    }

    if (this.state.config_received === false) {
      window.location.reload(false);
    }

  }

  componentDidMount() {
    //const rehydrate = JSON.parse(localStorage.getItem('savedState'))
    const rehydrate = JSON.parse(sessionStorage.getItem('savedState'))
    this.setState(rehydrate)
    const queryParams = new URLSearchParams(window.location.search);
    const search_word = queryParams.get('search');
    if (search_word){
        this.setState({ search: search_word });
    } else {
        this.setState({ search:""})
    }
    
    var self = this;
    this.interval = setInterval(
     () => self.getTimeline(),
     this.state.refresh);


    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

    socket.onclose = function(event) {
      self.setState({jobs: []});
    }
    
  }

  componentWillUnmount() {
    //localStorage.setItem('savedState', JSON.stringify(this.state))
    sessionStorage.setItem('savedState', JSON.stringify(this.state))
    clearInterval(this.interval);
  }

  render() {
    window.addEventListener("keydown",function (e) {             
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {        
        e.preventDefault();         
        document.getElementById("searchBarInput").focus()
      }      
    })

    const filteredSeries = this.state.series.map((item) => ({
  name: item.name,
  data: item.data.filter((dataItem) => dataItem.x.toLowerCase().includes(this.state.search.toLowerCase())),
})).filter((item) => item.data.length > 0);


    let filteredJobs = this.state.jobs.filter((job) => {
      return (
        job.command.toLowerCase().indexOf(this.state.search.toLowerCase()) !==
          -1
      );
    });

    return (
        <div>
          <table className="tableName">
            <tbody>
              <tr>
                <th>Timeline</th>
              </tr>
            </tbody>
          </table>
          <table className="tableName2">
          <tbody>
            <tr style={{textAlign:"center"}}>
              <th style={{width:"30%", textAlign:"center"}}>
                <input
                  type="text"
                  id="searchBarInputTimeline"
                  className="searchBarTimeline"
                  placeholder="Search"
                  value={this.state.search}
                  onChange={this.updateSearch.bind(this)}
                  autoFocus
                />
              </th>
            </tr>
          </tbody>
        </table>
        <div id="chart" style = {{marginLeft:"2.5%", marginRight:"2.5%", marginBottom:"2%"}}>
            <ReactApexChart options={this.state.options} series={filteredSeries} type="rangeBar" height={800} />
        </div>
        <div className = "versions">
            <p>UI: {UI_VERSION}</p>
            <p>Backend: {this.state.backend_version}</p>
        </div>
      </div>
    );
  }
}

export default Timeline;
