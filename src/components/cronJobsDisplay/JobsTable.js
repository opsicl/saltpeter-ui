import React from "react";
import CronJob from "./CronJob";
import "./JobsTable.css";
import Loader from "react-loader-spinner";

let apis = require("../../apis.json");

const API_CONFIG = apis.apiConfig;
const API_RUNNING = apis.apiRunning;

class JobsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      json_result: [],
      jobs: [],
      json_result_running: {},
      search: "",
      currentTime: new Date().toUTCString(),
    };
  }

  // ######################################################################
  updateSearch(event) {
    this.setState({ search: event.target.value.substr(0, 20) });
  }

  // ######################################################################
  fetchJobs() {
    fetch(API_CONFIG)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            json_result: result.crons,
            currentTime: new Date().toUTCString(),
          });
        },
        // error handler
        (error) => {
          this.setState({
            isLoaded: true,
            error,
            currentTime: new Date().toUTCString(),
          });
        }
      );

    fetch(API_RUNNING)
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          json_result_running: result,
        });
      });

    const keys = Object.keys(this.state.json_result);
    const cronsJsonResult = this.state.json_result;
    var cronJobs = [];
    for (var i = 0; i < keys.length; i++) {
      cronJobs.push({
        id: i,
        name: keys[i],
        command: cronsJsonResult[keys[i]]["command"],
        year: cronsJsonResult[keys[i]]["year"],
        mon: cronsJsonResult[keys[i]]["mon"],
        dow: cronsJsonResult[keys[i]]["dow"],
        dom: cronsJsonResult[keys[i]]["dom"],
        hour: cronsJsonResult[keys[i]]["hour"],
        min: cronsJsonResult[keys[i]]["min"],
        sec: cronsJsonResult[keys[i]]["sec"],
        cwd: cronsJsonResult[keys[i]]["cwd"],
        user: cronsJsonResult[keys[i]]["user"],
        soft_timeout: cronsJsonResult[keys[i]]["soft_timeout"],
        hard_timeout: cronsJsonResult[keys[i]]["hard_timeout"],
        targets: cronsJsonResult[keys[i]]["targets"],
        target_type: cronsJsonResult[keys[i]]["target_type"],
        number_of_targets: cronsJsonResult[keys[i]]["number_of_targets"],
        runningOn: [],
      });
    }

    const keys_running = Object.keys(this.state.json_result_running);
    for (i = 0; i < keys_running.length; i++) {
      var key_running = this.state.json_result_running[keys_running[i]]["name"];
      for (var j = 0; j < cronJobs.length; j++) {
        if (cronJobs[j]["name"] == key_running) {
          cronJobs[j]["runningOn"] = this.state.json_result_running[
            keys_running[i]
          ]["machines"];
          break;
        }
      }
    }

    this.setState({
      jobs: cronJobs,
      currentTime: new Date().toUTCString(),
    });
  }

  // ######################################################################
  componentDidMount() {
    this.interval = setInterval(() => this.fetchJobs(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // ######################################################################
  render() {
    let filteredJobs = this.state.jobs.filter((job) => {
      return (
        job.command.toLowerCase().indexOf(this.state.search.toLowerCase()) !==
          -1 ||
        job.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1
      );
    });

    var tableData = filteredJobs.map((item) => (
      <CronJob key={item.id} job={item} />
    ));

    var noDataAvailable = (
      <h2
        style={{
          padding: "15px",
          textAlign: "center",
          marginLeft: "center",
          columnSpan: "all",
        }}
      >
        No Data Available
      </h2>
    );

    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "20vh",
          }}
        >
          Error: {this.state.error.message}
        </div>
      );
    } else if (!this.state.isLoaded) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <Loader type="Oval" color="#00BFFF" height={80} width={80} />
        </div>
      );
    } else {
      return (
        <body>
          <table className="tableName">
            <tr>
              <th>Cron Jobs</th>
            </tr>
            <tr id="date" className="date">
              - {this.state.currentTime} -
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
          </table>
          <table className="data" id="cronsTable">
            <tr>
              <th style={{ width: "12%" }}>Name</th>
              <th style={{ width: "55%" }}>Command</th>
              <th style={{ width: "20%" }}>Running on</th>
              <th style={{ width: "13%" }}>Next run</th>
            </tr>
            <tbody>{tableData}</tbody>
          </table>
          <p
            style={{
              padding: "5px",
              fontSize: "12px",
              textAlign: "center",
              columnSpan: "all",
            }}
          >
            {filteredJobs == "" ? "No Data Available" : ""}
          </p>
        </body>
      );
    }
  }
}

export default JobsTable;
