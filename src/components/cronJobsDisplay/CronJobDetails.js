import React from "react";
import { socket } from "./socket.js";
import "./CronJobDetails.css";
import { FaCircle } from 'react-icons/fa';
import { FaStop } from 'react-icons/fa';
import { FaPlay } from 'react-icons/fa';
import { MdWarning } from 'react-icons/md';
import { FiInfo } from 'react-icons/fi';
import { BsExclamationCircleFill } from 'react-icons/bs';

let apis = require("../../version.json");
const UI_VERSION = apis.version;

class CronJobDetails extends React.Component {

  constructor(props){
    super(props);
    const { id } = props.match.params;
    this.state = {
      name: id,
      command: this.props.location.state !== undefined ? this.props.location.state.command : "",
      hard_timeout: this.props.location.state !== undefined ? this.props.location.state.hard_timeout : "",
      //soft_timeout: this.props.location.state.soft_timeout,
      cwd: this.props.location.state !== undefined ? this.props.location.state.cwd : "",
      user: this.props.location.state !== undefined ? this.props.location.state.user: "",
      targets: this.props.location.state !== undefined ? this.props.location.state.targets : "",
      target_type: this.props.location.state !== undefined ? this.props.location.state.target_type : "",
      number_of_targets: this.props.location.state !== undefined ? this.props.location.state.number_of_targets : "",
      batch_size: this.props.location.state !== undefined ? this.props.location.state.batch_size : "",
      dom: this.props.location.state !== undefined ? this.props.location.state.dom : "", 
      dow: this.props.location.state !== undefined ? this.props.location.state.dow : "",
      hour: this.props.location.state !== undefined ? this.props.location.state.hour : "",
      min: this.props.location.state !== undefined ?  this.props.location.state.min : "",
      mon: this.props.location.state !== undefined ? this.props.location.state.mon : "",
      sec: this.props.location.state !== undefined ? this.props.location.state.sec : "",
      year: this.props.location.state !== undefined ? this.props.location.state.year : "",
      runningOn: [],
      next_run: "",
      last_run: "",
      targetsJob: [],
      results: {},
      overlap: "",
      currentTime: Date.now(),
      untilNextRun: "",
      hardTimeoutCounter: "",
      ranForCounter: "",
      //softTimeoutCounter: "",
      startedJob:"",
    }
    this.handleData.bind(this);
    this.calculateHardTimeout.bind(this);
    //this.calculateSoftTimeout.bind(this);
    this.showLastRun.bind(this);
    this.runJob.bind(this);
    this.killJob.bind(this);
    this.killCron.bind(this);
    this.calculateRanFor.bind(this);
  }

  runJob = () => {
    var obj = {}
    obj.run = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);
  }

  killJob = (machine) => {
    var obj = {}
    obj.cron = this.state.name
    obj.machine = machine
    var obj_main = {}
    obj_main.killMachine = obj
    var jsonString = JSON.stringify(obj_main)
    socket.send(jsonString)  
  }

  killCron = () => {
    var obj = {}
    obj.killCron = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);
  }

  showLastRun = (machine, details1_id) => {
    try {
      var x = document.getElementById(machine);
      if (x.style.display === "none") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }

      var y = document.getElementById(details1_id);
      if (y.style.color === "white") {
        y.style.color = "#888888";
      } else {
        y.style.color = "white";
      }
    } catch (err) {
      // go on
    }
  }
/*
  calculateSoftTimeout() {
    var currentTime = Date.now();
    let secDiff = Math.floor( ((new Date(this.state.startedJob) - currentTime) % (1000*60))/1000 );
    if (Number.isFinite(secDiff) && this.state.soft_timeout){
      return secDiff +  this.state.soft_timeout;
    }
    else { 
      return ""
    }
  }
*/
  calculateHardTimeout() {
    var start_time;
    var machinesTimeouts = {};
    var currentTime = Date.now();
    if (this.state.hard_timeout) { 
      for (let machine in this.state.results) {
        if (this.state.runningOn.includes(machine)) {
          start_time = this.state.results[machine]["starttime"];
          let secondsDiff = Math.floor( ((new Date(start_time) - currentTime + (this.state.hard_timeout * 1000)) % (1000*60))/1000 );
          let minutesDiff = Math.floor( ((new Date(start_time) - currentTime + (this.state.hard_timeout * 1000)) % (1000*60*60)) / (1000*60) );
          let hoursDiff = Math.floor( ((new Date(start_time) - currentTime + (this.state.hard_timeout * 1000)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          if (secondsDiff < 0) { secondsDiff = 0; }
          if (minutesDiff < 0) { minutesDiff = 0 }
          if (hoursDiff < 0) {hoursDiff = 0 }
          machinesTimeouts[machine] = "hard timeout: " + hoursDiff + "h " + minutesDiff + "m " + secondsDiff + "s"
        }
      }
      return machinesTimeouts;
    } else {
      return "";
    }
  }

    calculateRanFor() {
        var start_time;
        var machinesRanFor = {};
        var currentTime = Date.now();
        var secondsDiff = 0;
        var minutesDiff = 0;
        var hoursDiff = 0;
        for (let machine in this.state.results) {
          start_time = this.state.results[machine]["starttime"];
          if (this.state.runningOn.includes(machine)) {
              secondsDiff = Math.floor( ((currentTime - new Date(start_time)) % (1000*60))/1000 );
              minutesDiff = Math.floor( ((currentTime - new Date(start_time)) % (1000*60*60)) / (1000*60) );
              hoursDiff = Math.floor( ((currentTime - new Date(start_time)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              if (secondsDiff < 0) { secondsDiff = 0; }
              if (minutesDiff < 0) { minutesDiff = 0 }
              if (hoursDiff < 0) {hoursDiff = 0 }
          }
          if (this.state.results[machine]["endtime"]){
              let end_time = this.state.results[machine]["endtime"]
              secondsDiff = Math.floor( ((new Date(end_time) - new Date(start_time)) % (1000*60))/1000 );
              minutesDiff = Math.floor( ((new Date(end_time) - new Date(start_time)) % (1000*60*60)) / (1000*60) );
              hoursDiff = Math.floor( ((new Date(end_time) - new Date(start_time)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              if (secondsDiff < 0) { secondsDiff = 0; }
              if (minutesDiff < 0) { minutesDiff = 0 }
              if (hoursDiff < 0) {hoursDiff = 0 }
          }
          machinesRanFor[machine] = "ran for: " + hoursDiff + "h " + minutesDiff + "m " + secondsDiff + "s"
        }
        return machinesRanFor;
    }


  handleData(json) {
    let data = JSON.parse(json);
    if(data.hasOwnProperty("config")){
      var json_result_config = data.config.crons;
      this.setState({
          command: json_result_config[this.state.name]["command"],
          cwd: json_result_config[this.state.name]["cwd"],
          user: json_result_config[this.state.name]["user"],
          //soft_timeout: json_result_config[this.state.name]["soft_timeout"],
          hard_timeout: json_result_config[this.state.name]["hard_timeout"],
          targets: json_result_config[this.state.name]["targets"],
          target_type: json_result_config[this.state.name]["target_type"],
          number_of_targets: json_result_config[this.state.name]["number_of_targets"],
          dom: json_result_config[this.state.name]["dom"],
          dow: json_result_config[this.state.name]["dow"],
          hour: json_result_config[this.state.name]["hour"],
          min: json_result_config[this.state.name]["min"],
          mon: json_result_config[this.state.name]["mon"],
          sec: json_result_config[this.state.name]["sec"],
          year: json_result_config[this.state.name]["year"],
          batch_size: json_result_config[this.state.name]["batch_size"],
      });
    }
    // running
    else if(data.hasOwnProperty("running")){
	//clear previous data
        this.setState({ runningOn: []});

        var result_running = data["running"];
        var keys_running = Object.keys(result_running);
        for (var i = 0; i < keys_running.length; i++) {
          var key_running = result_running[keys_running[i]]["name"];
            if (key_running === this.state.name) {
              this.setState((prevState,props) => ({ 
		        runningOn: result_running[keys_running[i]]["machines"],
                startedJob: new Date(result_running[keys_running[i]]["started"]).toLocaleString(),
	          }));
              break;
            }
        }
    } else {
      // details
      var name = Object.keys(data)[0];
      if (name === this.state.name) {
        if (data[name].hasOwnProperty("next_run")){
          this.setState({ next_run: new Date(data[name]["next_run"]).toLocaleString()});
        }
        if (data[name].hasOwnProperty("last_run")){
	      this.setState({ last_run : new Date(data[name]["last_run"]).toLocaleString()});
        }
        if (data[name].hasOwnProperty("targets")){
          this.setState({ targetsJob : data[name]["targets"].sort() });
        } 
        if (data[name].hasOwnProperty("results")){
          this.setState({ results : data[name]["results"]});
        }
	if (data[name].hasOwnProperty("overlap")){
          this.setState({ overlap : data[name]["overlap"]});
        }
      } 
    }
  }

  componentDidMount() {
    //const rehydrate = JSON.parse(localStorage.getItem('savedStateiDetails'))
    //this.setState(rehydrate)

    function secondsDiff(d1, d2) { 
      let secDiff = Math.floor( ((d2 - d1) % (1000*60))/1000 );
      if (secDiff >= 0) {
        return secDiff;
      }
      else {
     	return 0;
      }
    }

    function minutesDiff(d1, d2) { 
      let minutesDiff = Math.floor( ((d2-d1) % (1000*60*60)) / (1000*60) );
      if (minutesDiff >= 0) {
        return minutesDiff;
      }
      else {
        return 0;
      }
    }

    function hoursDiff(d1, d2) { 
      let hoursDiff = Math.floor(((d2-d1) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (hoursDiff >= 0) {
        return hoursDiff;
      }
      else {
        return 0;
      }
    }

    function daysDiff(d1, d2) { 
      let daysDiff = Math.floor((d2-d1) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0) {
        return daysDiff;
      }
      else {
        return 0;
      }
    }

    var self = this;
    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

    var obj = {}
    obj.subscribe = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);

    socket.onopen = function(event) {
      socket.send(jsonString);
    }

    socket.onclose = function(event) {
      self.setState({
        command: "",
        runningOn: [],
        next_run: "",
        last_run: "",
        targetsJob: [],
        results: {},
        cwd: "",
        user: "",
        targets: [],
        target_type: "",
        number_of_targets: "",
        batch_size: "",
        dom: "",
        dow: "",
        hour: "",
        min: "",
        mon: "",
        sec: "",
        year: "",
        overlap: "",
        untilNextRun: "",
        hardTimeoutCounter: "",
        ranForCounter: "",
        startedJob: "",
        hard_timeout: "",
      });
    }

    this.interval = setInterval(
      () => this.setState((prevState,props) => ({
	      currentTime: Date.now(),
          untilNextRun:  daysDiff(prevState.currentTime, new Date(prevState.next_run)) + "d " + hoursDiff(prevState.currentTime, new Date(prevState.next_run))+"h " + minutesDiff(prevState.currentTime, new Date(prevState.next_run)) + "m " + secondsDiff(prevState.currentTime, new Date(prevState.next_run))+"s",
          hardTimeoutCounter: self.calculateHardTimeout(),
          ranForCounter: self.calculateRanFor(),
          //softTimeoutCounter: self.calculateSoftTimeout(),
      })),
      1000
    );

//    if (Object.keys(this.state.runningOn).length > 0){

  }

  componentWillUnmount() {
    //localStorage.setItem('savedStateDetails', JSON.stringify(this.state))
    var obj = {}
    obj.unsubscribe = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);

    clearInterval(this.interval);
  }

  render(){
    return(
    <div>
        <div style={{marginLeft:"4%"}}>
            <h1 className="cronTitle">{this.state.name} {this.state.overlap === true ? <BsExclamationCircleFill title="overlap" style={{color:"#FF1919", size:"3px", marginLeft:"10px" }}/> : ""}</h1>
        </div>
        <div>
        <div className="details1">
                <h1 className="sectionTitle"><span> CONFIG </span></h1>

                <table className="configTable" style = {{marginLeft:"2%"}}>
                    <tbody>
                        <tr>
                            <th>sec</th>
                            <th>min</th>
                            <th>hour</th>
                            <th>dow</th>
                            <th>dom</th>
                            <th>mon</th>
                            <th>year</th>
                        </tr>
                    </tbody>
                    <tbody>
                        <tr>
                            <td>{this.state.sec}</td>
                            <td>{this.state.min}</td>
                            <td>{this.state.hour}</td>
                            <td>{this.state.dow}</td>
                            <td>{this.state.dom}</td>
                            <td>{this.state.mon}</td>
                            <td>{this.state.year}</td>
                        </tr>
                    </tbody>
                </table> 

                <table className="configTable" style = {{marginTop: "10px", textAlign:"left"}}>
                        <tr>
                            <th style={{width:"25%"}}>cmd</th>
                            <td><div style={{ resize:"both", height:"8vh", maxWidth: "auto", overflow:"auto"}} >{this.state.command.split('\\').map(str => <p>{str}</p>)}</div></td>
                        </tr>
                        <tr>
                            <th style={{width:"25%"}}>user</th>
                            <td>{this.state.user}</td>
                        </tr>
                        <tr>
                            <th style={{width:"25%"}}>cwd</th>
                            <td>{this.state.cwd}</td>
                        </tr>
                        <tr>
                            <th style={{width:"25%"}}>targets</th>
                            <td>{this.state.targets}</td>
                        </tr>
                        <tr>
                            <th style={{width:"25%"}}>target type</th>
                            <td>{this.state.target_type}</td>
                        </tr>
                        {this.state.number_of_targets ? 
                            <tr>
                                <th style={{width:"25%", marginBottom:"30px"}}>no. of targets</th>
                                <td>{this.state.number_of_targets}</td>
                            </tr> : ""}
                        {this.state.batch_size ? 
                            <tr>
                                <th style={{width:"25%", marginBottom:"30px"}}>batch size</th>
                                <td>{this.state.batch_size}</td>
                            </tr> : ""}
                </table>


                <h1 className="sectionTitle"><span> TIMES </span></h1>
                <table className="configTable" style = {{marginTop: "10px", textAlign:"left"}}>
                    <tr>
                        <th style={{width:"25%"}}>last run</th>
                        <td>{this.state.last_run}</td>
                    </tr>
                    <tr>
                        <th style={{width:"25%"}}>next run</th>
                        <td>{this.state.next_run}</td>
                    </tr>
                    <tr>
                        <th style={{width:"25%"}}>remaining</th>
                        <td>{this.state.untilNextRun}</td>
                    </tr>
                </table>
                <div>
                    <button className="button" style={{backgroundColor: "#4CAF50", marginLeft: "40px", width: "120px"}} onClick={this.runJob.bind(this)}>Run cron now</button>
                    {Object.keys(this.state.runningOn).length > 0 ? <button className="button" style={{ marginLeft: "30px"}} onClick={this.killCron.bind(this)}>Kill cron</button> : ""}
                </div>

                <h1 className="sectionTitle"><span> TARGETS <FiInfo  title="gray - matched by expression&#10;green - ran successfully&#10;blue - running now&#10;red - ran with errors" style ={{marginLeft: "2px"}}/> </span></h1>
                <div style={{ resize:"both", height:"20vh", overflow:"auto"}}>
                    {this.state.targetsJob !== [] ? this.state.targetsJob.map((machine, i) => {
                        var id1 = i;
                        if (Object.values(this.state.runningOn).indexOf(machine) > -1) {
                            this.circleColor = "#6666FF"
                            this.cursor = "pointer"
                            this.sign = "start"
                        } else if (this.state.results.hasOwnProperty(machine)) {
                            this.circleColor = "#60CE80"
                            this.cursor = "pointer"
                            this.sign = "stopped"
                            if (this.state.results[machine]["retcode"] !== "" && this.state.results[machine]["retcode"] !== 0) {
                                this.circleColor = "#FF0000"
                                this.cursor = "pointer"
                                this.sign = "warning"
                            }
                        } else {
                            this.circleColor = "white"
                            this.cursor = "auto"
                        }
                        if (this.circleColor !== "white") {
                            if (this.sign === "start") {
                                return  <p id={id1} className="sectionDetails" onClick={this.showLastRun.bind(this,machine,id1)} style={{ cursor: this.cursor, color: "white" }} > <FaPlay style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                            }
                            if (this.sign === "stopped") {
                                return  <p id={id1} className="sectionDetails" onClick={this.showLastRun.bind(this,machine,id1)} style={{ cursor: this.cursor, color: "white" }} > <FaStop style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                            }
                            if (this.sign === "warning") {
                                return  <p id={id1} className="sectionDetails" onClick={this.showLastRun.bind(this,machine,id1)} style={{ cursor: this.cursor, color: "white" }} > <MdWarning size = {20} style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                            }
                        } else {
                            return  <p id={id1} className="sectionDetails" style={{ cursor: this.cursor, color: "white"}} > <FaCircle style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                        }
                    }) : ""}
                </div>
            </div> 


            <div className="details2">
                <h1 className="sectionTitle"><span> LAST RUN </span></h1>
                <div style={{ resize:"both", height: "70vh", overflow:"auto"}} > {this.state.targetsJob !== [] ? this.state.targetsJob.map((target, i) => {
                  if (this.state.results.hasOwnProperty(target)){
                    return <div id={target} style={{display:"none"}}>
                        <p className="sectionDetails" style={{fontWeight:"bold"}}>{target}</p>
                        {this.state.results[target]["starttime"] ?
                            <p className="sectionDetails" style={{fontStyle:"italic", textIndent: "2em"}}>started at: {new Date(this.state.results[target]["starttime"]).toLocaleString()}</p> : ""} 
                        {this.state.results[target]["endtime"] ? 
                            <p className="sectionDetails" style={{fontStyle:"italic", textIndent: "2em"}}>ended at: {new Date(this.state.results[target]["endtime"]).toLocaleString()}</p>: ""}
                        {this.state.results[target]["starttime"] ?
                            <p className="sectionDetails" style={{textIndent: "2em", color:"#d5ff00", fontStyle:"italic"}}>{this.state.ranForCounter[target]}</p> : ""}
                        {this.state.results[target]["retcode"] !== "" ? 
                            <p className="sectionDetails" style={{fontStyle:"italic", textIndent: "2em"}}>ret code: {this.state.results[target]["retcode"]}</p> : ""} 
                        {this.state.hardTimeoutCounter.hasOwnProperty(target) ?
                            <p className="sectionDetails" style={{textIndent: "2em", color:"#d5ff00", fontStyle:"italic"}}>{this.state.hardTimeoutCounter[target]}</p> : ""}
                        {(Object.values(this.state.runningOn).indexOf(target) > -1) ? <button className="button" style={{ marginLeft: "8%"}} onClick={this.killJob.bind(this,target)}>Kill</button> : ""}
                        {this.state.results[target]["ret"] ? <p className="sectionDetails" style={{textIndent: "2em", color:"#018786"}}>Output:</p> : "" }
                        <p className="sectionDetails" style={{color:"white"}}>
                            <div>
				{this.state.results[target]["ret"].split('\n').map(str => <p style={{textIndent: "3em"}}>{str}</p>)}
                            </div>
                        </p>
                        <br></br>
                    </div>
                  } else { 
                        try {
                            var y = document.getElementById(target+"1");
                            y.style.color = "white";
                        } catch {
                        }
                        return <div id={target} style={{display:"none"}}></div>
                    }
                ;}) : ""}
            </div>
	    </div>
     </div>
        <div className="versions">
            <p>UI: {UI_VERSION}</p>
            <p>Backend: vx.y.z</p>
        </div>
    </div>
    )
  }
}

export default CronJobDetails;
