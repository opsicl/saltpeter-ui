import React, {PureComponent} from "react";
import { withRouter } from 'react-router-dom';
import CronJob from "./CronJob";
import "./JobsTable.css";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { socket } from "./socket.js";

class JobsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      search: "",
      currentTime: new Date().toUTCString(),
    };
    socket.debug=true;
    socket.timeoutInterval = 5400;
    this.handleData.bind(this);
  }
 
  updateSearch(event) {
    this.setState({ search: event.target.value.substr(0, 20) });
  }

  handleData(data) {
    //config
    if (JSON.parse(data).hasOwnProperty("config")) {
      var json_result_config = JSON.parse(data).config.crons;
      var keys = Object.keys(json_result_config);
      var cronJobs = [];
      for (var i = 0; i < keys.length; i++) {
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
          runningOn: [],
        });
      }
      this.setState({ jobs: cronJobs });
    }
    //running
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
          if (cronJobs[j]["name"] == key_running) {
            cronJobs[j]["runningOn"] =
              json_result_running[keys_running[i]]["machines"];
            break;
          }
        }
      }

      this.setState({ jobs: cronJobs });
    }
  }

  componentDidMount() {
    const rehydrate = JSON.parse(localStorage.getItem('savedState'))
    this.setState(rehydrate)
    
    var self = this;
    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

    socket.onclose = function(event) {
      self.setState({jobs: []});
    }


    this.interval = setInterval(
      () => this.setState({ currentTime: new Date().toUTCString() }),
      1000
    );
  }

  componentWillUnmount() {
    localStorage.setItem('savedState', JSON.stringify(this.state))
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
      <CronJob key={item.id} job={item}/>
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
                <th style={{ width: "25%" }}>Name_v2</th>
                <th style={{ width: "50%" }}>Command_v2</th>
                <th style={{ width: "25%" }}>Running on_v2</th>
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
