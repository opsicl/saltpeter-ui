import React from "react";
import CronJob from "./CronJob";
import "./JobsTable.css";

let apis = require("../../apis.json");

const SALTPETER_WS = apis.saltpeter_ws;
var Socket = require('simple-websocket'); 
var socket = new Socket(SALTPETER_WS);

class JobsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: "",
      jobs: [],
      search: "",
      currentTime: new Date().toUTCString(),
      actions: socket,
    };
    this.handleData.bind(this);
  }
 
  updateSearch(event) {
    this.setState({ search: event.target.value.substr(0, 20) });
  }

  handleData(data) {
    // parse config jobs
    if (JSON.parse(data).hasOwnProperty("config")) {
      var json_result_config = JSON.parse(data).config.crons;
      var keys = Object.keys(json_result_config);
      var cronJobs = [];
      for (var i = 0; i < keys.length; i++) {
        cronJobs.push({
          id: i,
          name: keys[i],
          command: json_result_config[keys[i]]["command"],
          year: json_result_config[keys[i]]["year"],
          mon: json_result_config[keys[i]]["mon"],
          dow: json_result_config[keys[i]]["dow"],
          dom: json_result_config[keys[i]]["dom"],
          hour: json_result_config[keys[i]]["hour"],
          min: json_result_config[keys[i]]["min"],
          sec: json_result_config[keys[i]]["sec"],
          cwd: json_result_config[keys[i]]["cwd"],
          user: json_result_config[keys[i]]["user"],
          soft_timeout: json_result_config[keys[i]]["soft_timeout"],
          hard_timeout: json_result_config[keys[i]]["hard_timeout"],
          targets: json_result_config[keys[i]]["targets"],
          target_type: json_result_config[keys[i]]["target_type"],
          number_of_targets: json_result_config[keys[i]]["number_of_targets"],
          runningOn: [],
 	  instanceName: "",
 	  next_run:"",
	  last_run:"",
        });
      }
      this.setState({ jobs: cronJobs });
    }
    else if (JSON.parse(data).hasOwnProperty("running")) {
      /*cronJobs = this.state.jobs;
      // clear previous data
      for (i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["runningOn"] = [];
      }

      var json_result_running = JSON.parse(data).running;
      var keys_running = Object.keys(json_result_running);
      for (i = 0; i < keys_running.length; i++) {
        var key_running = json_result_running[keys_running[i]]["name"];
        for (var j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] == key_running) {
            cronJobs[j]["runningOn"] =
              json_result_running[keys_running[i]]["machines"];
	    cronJobs[j]["instanceName"] = keys_running[i];
            break;
          }
        }
      }
      this.setState({ jobs: cronJobs });*/
    } else {
      console.log(JSON.parse(data));
      cronJobs = this.state.jobs;
      let keys_result = JSON.parse(data);
      let keys_examples = Object.keys(keys_result);
      for (i = 0; i < keys_examples.length; i++) {
        let key_example = keys_examples[i];
        for (var j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] == key_example) {
	    cronJobs[j]["next_run"] = keys_result[key_example]["next_run"];
  	    break;
          }
        }
      }
      this.setState({ jobs: cronJobs });
    }
  }

  componentDidMount() {
    var self = this;
    socket.on('data', function (data) {
      self.handleData(data);
    });

    socket.on('close', function () {
      console.log("connection closed");
    });

    this.interval = setInterval(
      () => this.setState({ currentTime: new Date().toUTCString() }),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    let filteredJobs = this.state.jobs.filter((job) => {
      return (
        job.command.toLowerCase().indexOf(this.state.search.toLowerCase()) !==
          -1 ||
        job.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1
      );
    });

    var tableData = filteredJobs.map((item) => (
      <CronJob key={item.id} job={item} {... this.state} />
    ));

    return (
      <div>
        <table className="tableName">
	  <tbody>
            <tr>
              <th>Cron Jobs</th>
            </tr>
            <tr>
              <td id="date" className="date">{this.state.currentTime}</td>
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
                />
              </th>
            </tr>
	  </tbody>
        </table>
          <table id="cronsTable" className="data">
	    <tbody>  
              <tr>
                <th style={{ width: "10%" }}>Name</th>
                <th style={{ width: "50%" }}>Command</th>
                <th style={{ width: "30%" }}>Running on</th>
                <th style={{ width: "10%" }}>Next run</th>
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
      </div>
    );
  }
}

export default JobsTable;
