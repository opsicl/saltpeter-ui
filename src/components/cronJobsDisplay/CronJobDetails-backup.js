import React from "react";
import { socket } from "./socket.js";

class CronJobDetails extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      name: this.props.location.state.name,
      command: this.props.location.state.command,
    }
    this.handleData.bind(this);
  }

  handleData(data) { 
    console.log("ahndle");
    //running
/*
    else if (JSON.parse(data).hasOwnProperty("running")) {
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
            cronJobs[j]["instanceName"] = keys_running[i];
            break;
          }
        }
      }
      this.setState({ jobs: cronJobs });
    }
*/
  }

  componentDidMount() {
    var self = this;
    socket.onmessage =  function(event) {
      this.handleData(event.data);
    };
  }

  componentWillUnmount() {
  }


  render(){
    return( 
      <div style={{color: "white"}}>
	<p>{this.state.name}</p>
	<p>{this.state.command}</p>
      </div>
    )
  }
}

export default CronJobDetails;
