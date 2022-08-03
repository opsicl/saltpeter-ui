import React from "react";
//import { withRouter } from 'react-router-dom';
import CronJob from "./CronJob";
import "./JobsTable.css";
//import ReconnectingWebSocket from 'reconnecting-websocket';
import { socket } from "./socket.js";

let apis = require("../../version.json");
const UI_VERSION = apis.version;

class JobsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      search: "",
//      currentTime: new Date().toLocaleString(),
      backend_version:""
    };
    socket.debug=true;
    socket.timeoutInterval = 5400;
    this.handleData.bind(this);
  }

  updateSearch(event) {
    this.setState({ search: event.target.value.substr(0, 20) });
  }

  handleData(data) {
    if (JSON.parse(data).hasOwnProperty("sp_version")){
        var json_result_version = JSON.parse(data).sp_version;
        this.setState({ backend_version: json_result_version});
    }
    //config
    if (JSON.parse(data).hasOwnProperty("config")) {
      var json_result_config = JSON.parse(data).config.crons;
      var keys = Object.keys(json_result_config);
      var cronJobs = [];
      for (var i = 0; i < keys.length; i++) {
        //var obj = {}
        //obj.subscribe = keys[i]
        //var jsonString = JSON.stringify(obj)
        //socket.send(jsonString);

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
          number_of_targets: json_result_config[keys[i]]["number_of_targets"],
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
          result: 0, //0-did not run/ 1-success/ 2-fail
          last_run: "",
        });
      }
      
      function compare(a, b) {
        const groupA = a.group.toUpperCase();
        const groupB = b.group.toUpperCase();

        let comparison = 0;
        if (groupA > groupB) {
            comparison = 1;
        } else if (groupA < groupB) {
            comparison = -1;
        }
        return comparison;
      }

      this.setState({ jobs: cronJobs.sort(compare)});
    }
    if (JSON.parse(data).hasOwnProperty("running")) {
      cronJobs = this.state.jobs;
      //clear previous data
      for (i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["runningOn"] = [];
      }

      var json_result_running = JSON.parse(data).running;
      var keys_running = Object.keys(json_result_running);
      for (i = 0; i < keys_running.length; i++) {
        var key_running = json_result_running[keys_running[i]]["name"];
        for (var j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] === key_running) {
            cronJobs[j]["runningOn"] = json_result_running[keys_running[i]]["machines"];
            break;
          }
        }
      }

      this.setState({ jobs: cronJobs });
    }

    if (JSON.parse(data).hasOwnProperty("last_state")) {
      cronJobs = this.state.jobs;
      //clear previous data
      for (i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["result"] = 0;
        cronJobs[i]["last_run"] = "";
      }

      var json_result_last_state = JSON.parse(data).last_state;
      var keys_last_state = Object.keys(json_result_last_state);
      for (i = 0; i < keys_last_state.length; i++) {
          var key_name = keys_last_state[i]
          for (var j = 0; j < cronJobs.length; j++) {
            if (cronJobs[j]["name"] === key_name) {
              if (json_result_last_state[key_name]["result_ok"] === false) {
                  cronJobs[j]["result"] = 2
              } else {
                  cronJobs[j]["result"] = 1
              }
              cronJobs[j]["last_run"] = json_result_last_state[key_name]["last_run"];
              break;
            }
          }
      }
    }

  }

  componentDidMount() {
    const rehydrate = JSON.parse(localStorage.getItem('savedState'))
    this.setState(rehydrate)
    this.setState({ search: "" });

    var self = this;
    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

    socket.onclose = function(event) {
      self.setState({jobs: []});
    }


  //  this.interval = setInterval(
    //  () => this.setState({ currentTime: new Date().toLocaleString() }),
     // 1000
    //);
  }

  componentWillUnmount() {
    localStorage.setItem('savedState', JSON.stringify(this.state))
    //clearInterval(this.interval);
  }

  render() { 
    window.addEventListener("keydown",function (e) {             
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {        
        e.preventDefault();         
        document.getElementById("searchBarInput").focus()
      }      
    })

    let filteredJobs = this.state.jobs.filter((job) => {
      return (
        job.command.toLowerCase().indexOf(this.state.search.toLowerCase()) !==
          -1 ||
        job.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 ||
        job.group.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1
      );
    });

    var tableData = filteredJobs.map((item) => (
      <CronJob key={item.id} job={item}/>
    ));

    return (
      <div>
        <table className="tableName">
	  <tbody>
            <tr>
              <th>Crons</th>
            </tr>
            <tr>
              <th>
                <input
                  type="text"
                  id="searchBarInput"
                  className="searchBar"
                  value={this.state.search}
                  onChange={this.updateSearch.bind(this)}
                  placeholder="Search"
	          autoFocus
                />
              </th>
            </tr>
	  </tbody>
        </table>
          <table id="cronsTable" className="data">
	    <tbody>  
              <tr>
                <th style={{ width: "15%" }}>Name</th>
                <th style={{ width: "40%" }}>Command</th>
                <th style={{ width: "20%" }}>Running on</th>
                <th style={{ width: "15%" }}>Last run </th>
                <th style={{ width: "10%" }}>Group</th>
              </tr>
	    </tbody>
          <tbody>{tableData}</tbody>
        </table>
        <p
          style={{
            padding: "5px",
            fontSize: "12px",
            textAlign: "center",
            columnSpan: "all",
	    color:"#d6d6d6"
          }}
        >
          {filteredJobs == "" ? "No Data Available" : ""}
        </p>
        <div className = "versions">
            <p>UI: {UI_VERSION}</p>
            <p>Backend: {this.state.backend_version}</p>
        </div>
      </div>
    );
  }
}

export default JobsTable;
