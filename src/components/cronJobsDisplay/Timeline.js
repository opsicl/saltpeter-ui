import React from "react";
import "./Timeline.css";
import { socket } from "./socket.js";
import { Link } from "react-router-dom";
import ReactApexChart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import _ from 'lodash';

let apis = require("../../version.json");
const UI_VERSION = apis.version;

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    
    this.handleData.bind(this)
    this.getTimeline.bind(this)
    this.setRefreshInterval.bind(this)
    
    this.state = {
      interval: "",
      refresh: "off",
      jobs: [],
      search: "",
      backend_version:"",
      dateNow: String(new Date().getTime()),
      config_received: false,
      series: [],
      annotationsPoints:[],
      options: {
        annotations: {points:[]},
          chart: {
              height: '650',
              type: 'rangeBar',
              foreColor: '#E0D9F6',
          },
          noData: {
            text: 'No data available',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
              color: '#e0d9f6',
              fontSize: '14px',
            }
        },

          plotOptions: {
              bar: {
                horizontal: true,
                barHeight: '0%',
                rangeBarGroupRows: true
              }
          },
          xaxis: {
            type: 'datetime',
            position: 'top',
          },
          yaxis: {
            labels: {
              maxWidth: 250,
              style: {
                fontSize: '13px'
              }
            },
          },
          grid: {
            show: false,
          },
          colors: ["#DEFE47", "#7700A6"],
          fill: {
              type: 'solid'
          },
          legend: {
              position: 'right',
              onItemClick: {toggleDataSeries: false},
              onItemHover: {highlightDataSeries: false}
          },
      },
    }

    socket.debug=true;
    //socket.timeoutInterval = 5400;
  }

  setRefreshInterval(event) {
    var val = event.target.value
    this.setState({'refresh':val})

    if (this.state.interval) {
      clearInterval(this.state.interval);
    }

    if (val === "10s") {
       this.setState({interval:setInterval(() => this.getTimeline(),10000)})
    } else if (val === "30s") {
      this.setState({interval:setInterval(() => this.getTimeline(),30000)})
    } else if (val === "1m") {
      this.setState({interval:setInterval(() => this.getTimeline(),60000)})
    } else if (val === "5m") {
      this.setState({interval:setInterval(() => this.getTimeline(),300000)})
    } else {
      // means it's set to off, so do nothing
    }
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
    var startDateStr = document.getElementById('startDate').value
    var endDateStr = document.getElementById('endDate').value

    obj.start_date = new Date(startDateStr)
    obj.end_date = new Date(endDateStr)

    if (startDateStr.includes('now')) {
      obj.start_date = startDateStr
    }
    if (endDateStr.includes('now')) {
      obj.end_date = endDateStr
    }

    var now = String(new Date().getTime())
    obj.id = now
    this.setState({dateNow: now})
    var obj_send = {}
    obj_send.getTimeline = obj
    var jsonString = JSON.stringify(obj_send)
    socket.send(jsonString);

  }

  handleData(data) {
    //sessionStorage.setItem('savedState', JSON.stringify(this.state))

    // get backend version
    if (JSON.parse(data).hasOwnProperty("sp_version")){
        var json_result_version = JSON.parse(data).sp_version;
        this.setState({ backend_version: json_result_version});
    }

    // get timeline
    if (JSON.parse(data).hasOwnProperty("timeline")) {
     if ((JSON.parse(data).timeline.id === this.state.dateNow)) {
      /// series first batch
      var seriesData = []
      var timeline = JSON.parse(data).timeline.content
      var data = []
      var jobsFailed = []
      for (var i = 0; i < timeline.length; i++) {
          var jobName = timeline[i]["cron"]
          var jobInstance = timeline[i]["job_instance"]
          var msg_type = timeline[i]["msg_type"]
          var ret_code = timeline[i]['ret_code']
          var timestamp = timeline[i]['timestamp']

          var run_result
          if (timeline[i]['ret_code'] > 0) {
               run_result = 'fail'
               jobsFailed.push(jobName)
          } else {
               if (!jobsFailed.includes(jobName)){
                   run_result = 'pass'
               }
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

      var annPoints = []
      for (var i = 0;  i < seriesData.length; i++){
       var item = seriesData[i]
       var color = "#DEFE47"
       if (item.result === "fail"){
         color = "#7700A6"
       }
       var point = {
              x: new Date(item.y[0]).getTime(),
              y: item.x,
              marker: {
                size: 12,
                shape: "square",
                radius: 2,
                fillColor: color
               },
              mouseEnter: (function (itemCopy) {
                return function(event) {
                  var fromTime = new Date(itemCopy.y[0]).getTime()
                  var toTime = new Date(itemCopy.y[1]).getTime()
                  var timeDiffInSeconds = Math.floor((toTime - fromTime) / 1000);
                  var hours = Math.floor(timeDiffInSeconds / 3600);
                  var minutes = Math.floor((timeDiffInSeconds % 3600) / 60);
                  var seconds = timeDiffInSeconds % 60;
                  var hoursStr = String(hours)
                  var minutesStr = String(minutes)
                  var secondsStr = String(seconds)
                  var formattedTimeDiff = `${hoursStr}h:${minutesStr}m:${secondsStr}s`;
                  if (hoursStr === '0') {
                    formattedTimeDiff = `${minutesStr}m:${secondsStr}s`
                    if (minutesStr === '0') {
                      formattedTimeDiff = `${secondsStr}s`
                    }
                  }
                  document.getElementById('marker').value = itemCopy.x + " - ran for " + formattedTimeDiff;
                 };
              })(item)
          }
       annPoints.push(point)
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
      this.setState({ series: seriesDataFinal , annotationsPoints: annPoints });
     }
    }

  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const search_word = queryParams.get('search');
    if (search_word){
        this.setState({ search: search_word });
    } else {
        this.setState({ search:""})
    }
    
    var self = this
    // get timeline
    // send message to ws to get timeline info
    var obj = {}
    obj.start_date = document.getElementById('startDate').value
    obj.end_date = document.getElementById('endDate').value
    var now = this.state.dateNow
    obj.id = now
    var obj_send = {}
    obj_send.getTimeline = obj
    var jsonString = JSON.stringify(obj_send)
    socket.send(jsonString);


    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    window.addEventListener("keydown",function (e) {             
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {        
        e.preventDefault();         
        document.getElementById("searchBarInput").focus()
      }      
    })

    var filteredSeries = this.state.series.map((item) => ({
      name: item.name,
      data: item.data.filter((dataItem) => dataItem.x.toLowerCase().includes(this.state.search.toLowerCase())),
    })).filter((item) => item.data.length > 0);

    if ((this.state.search.toLowerCase() === 'pass') || (this.state.search.toLowerCase() === 'fail')){ 
      filteredSeries = this.state.series.filter(series => series.name === this.state.search.toLowerCase());
    }

   
    // Add an entry for 'pass' if it doesn't exist in the filtered result
    if (!filteredSeries.some(item => item.name === 'pass')) {
     filteredSeries.unshift({ name: 'pass', data: [] });
    } 
    if (!filteredSeries.some(item => item.name === 'fail')) {
     filteredSeries.push({ name: 'fail', data: [] });
    }

    //var opts = JSON.parse(JSON.stringify(this.state.options))
    var opts = _.cloneDeep(this.state.options)

    var filteredAnnotations = this.state.annotationsPoints.filter(annotation => {
      return filteredSeries.some(series => {
        return series.data.some(dataPoint => {
          return annotation.y === dataPoint.x && annotation.x === dataPoint.y[0];
        });
      });
    });

    opts.annotations.points = filteredAnnotations
    opts.chart.events = {
                mouseLeave: function(chartContext, config) {
                  document.getElementById('marker').value = ""
                },
                xAxisLabelClick: function(event ,chartContext, config) {
                   window.location.href = '/details/' + config.globals.labels[config.labelIndex]
                },
                zoomed: function(chartContext, {xaxis}) {
                  document.getElementById('startDate').value = new Date(xaxis.min).toUTCString();
                  document.getElementById('endDate').value =  new Date(xaxis.max).toUTCString();
                }
              }


    return (
        <div>
          <table className="tableName">
            <tbody>
              <tr>
                <th>Timeline (beta)</th>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'right', width: '93%' }}>
          <label htmlFor="marker" style={{ color: '#e0d9f6', marginRight: '1em', marginLeft: '3em', fontSize: '0.8em' }}>Selected Marker</label>
          <input
            style={{width: '30em', backgroundColor: '#CCCCCC', border: '1px solid #000000', padding:'0.3em', textAlign: 'center', fontSize: '0.8em' }}
            type="text"
            id="marker"
            readOnly={true}
          />

          <label htmlFor="startDate" style={{ color: '#e0d9f6', marginRight: '1em', marginLeft: '6em', fontSize: '0.8em' }}>From:</label>
          <input
            style={{ width: '18em', backgroundColor: '#CCCCCC', border: '1px solid #000000', padding:'0.3em', textAlign: 'center', fontSize: '0.8em' }}
            type="text"
            id="startDate"
            defaultValue="now-5m"
            onChange={(e) => this.setState({ startDate: e.target.value })}
          />
          <label htmlFor="endDate" style={{ color: '#e0d9f6', marginRight: '1em', marginLeft: '3em', fontSize: '0.8em' }}>To:</label>
          <input
      style={{ width: '18em', backgroundColor: '#CCCCCC', border: '1px solid #000000', padding:'0.3em', textAlign: 'center', fontSize: '0.8em' }}
            type="text"
            id="endDate"
            defaultValue="now"
          />
           <div>
              <label htmlFor="refreshInterval" style={{ color: '#e0d9f6', marginRight: '1em', marginLeft: '6em', fontSize: '0.8em' }}>Refresh: </label>
                <select id="refreshInterval" style={{ width: '7em', backgroundColor: '#CCCCCC', border: '1px solid #000000', padding:'0.3em', textAlign: 'center', fontSize: '0.8em' }} onChange={this.setRefreshInterval.bind(this)} value={this.state.refresh}>
                  <option value="off" style={{ backgroundColor: '#CCCCCC' }}>off</option>
                  <option value="10s" style={{ backgroundColor: '#CCCCCC' }}>10 sec</option>
                  <option value="30s" style={{ backgroundColor: '#CCCCCC' }}>30 sec</option>
                  <option value="1m" style={{ backgroundColor: '#CCCCCC' }}>1 min</option>
                  <option value="5m" style={{ backgroundColor: '#CCCCCC' }}>5 min</option>
                </select>
    </div>
          <button className="button" style={{color:"white", backgroundColor: "#808080", marginLeft: "12em", width: "10em"}} onClick={this.getTimeline.bind(this)}>
            <FontAwesomeIcon icon={faSync} style={{ marginRight: '0.5em' }} />
             Refresh
           </button>
        </div>
        <div id="chart" style = {{marginLeft:"2.5%", marginRight:"2.5%", marginBottom:"2%"}}>
            <ReactApexChart options={opts} series={filteredSeries} type="rangeBar" height={'650'} />
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
