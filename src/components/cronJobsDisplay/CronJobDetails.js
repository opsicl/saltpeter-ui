import React from "react";
import { socket } from "./socket.js";
import "./CronJobDetails.css";
import { FaCircle } from 'react-icons/fa';
import { FaStop } from 'react-icons/fa';
import { FaPlay } from 'react-icons/fa';
import { MdWarning } from 'react-icons/md';
import { FiInfo } from 'react-icons/fi';
import { FaExclamationCircle } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
import { FaTimesCircle } from 'react-icons/fa';
import { FaPlayCircle } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa';
import { FaClock } from "react-icons/fa";

import TextareaAutosize from 'react-autosize-textarea';

let apis = require("../../version.json");
const UI_VERSION = apis.version;

class CronJobDetails extends React.Component {

  constructor(props){
    super(props);
    const { id } = props.match.params;
    this.state = {
      name: id,
      command: this.props.location.state !== undefined ? this.props.location.state.command : "",
      timeout: this.props.location.state !== undefined ? this.props.location.state.timeout : "",
      cwd: this.props.location.state !== undefined ? this.props.location.state.cwd : "",
      user: this.props.location.state !== undefined ? this.props.location.state.user: "",
      targets: this.props.location.state !== undefined ? this.props.location.state.targets : "",
      target_type: this.props.location.state !== undefined ? this.props.location.state.target_type : "",
      number_of_targets: this.props.location.state !== undefined ? this.props.location.state.number_of_targets: "",
      batch_size: this.props.location.state !== undefined ? this.props.location.state.batch_size : "",
      dom: this.props.location.state !== undefined ? this.props.location.state.dom : "", 
      dow: this.props.location.state !== undefined ? this.props.location.state.dow : "",
      hour: this.props.location.state !== undefined ? this.props.location.state.hour : "",
      min: this.props.location.state !== undefined ?  this.props.location.state.min : "",
      mon: this.props.location.state !== undefined ? this.props.location.state.mon : "",
      sec: this.props.location.state !== undefined ? this.props.location.state.sec : "",
      year: this.props.location.state !== undefined ? this.props.location.state.year : "",
      result: this.props.location.state !== undefined ? this.props.location.state.result : "NotRun",
      runningOn: [],
      next_run: "",
      last_run: "",
      targetsJob: [],
      results: {},
      overlap: "",
      untilNextRun: "",
      timeoutCounter: "",
      ranForCounter: "",
      startedJob:"",
      backend_version: this.props.location.state !== undefined ? this.props.location.state.backend_version : "",
      tz: this.props.location.state !== undefined ? this.props.location.state.tz : "local",
      maintenance: this.props.location.state !== undefined ? this.props.location.state.maintenance : {},
      currentTimeLocal: Date.now(),
    }
    this.handleData.bind(this);
    this.calculateTimeout.bind(this);
    this.showLastRun.bind(this);
    this.runJob.bind(this);
    //this.killJob.bind(this);
    this.killCron.bind(this);
    this.calculateRanFor.bind(this);
    this.changeTz.bind(this);
    this.formatDateToUTC.bind(this);
    this.formatDateToLocal.bind(this);
  }

   formatDateToUTC(date) {
    return date.getUTCFullYear() + '-' +
           ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
           ('0' + date.getUTCDate()).slice(-2) + ' ' +
           ('0' + date.getUTCHours()).slice(-2) + ':' +
           ('0' + date.getUTCMinutes()).slice(-2) + ':' +
           ('0' + date.getUTCSeconds()).slice(-2);
  }

  formatDateToLocal(date) {
    return date.getFullYear() + '-' +
           ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
           ('0' + date.getDate()).slice(-2) + ' ' +
           ('0' + date.getHours()).slice(-2) + ':' +
           ('0' + date.getMinutes()).slice(-2) + ':' +
           ('0' + date.getSeconds()).slice(-2);
  }


  startInterval = () => {
    this.interval = setInterval(
      () => {
        const currentTime = this.state.tz === "utc" ? this.formatDateToUTC(new Date()) : this.formatDateToLocal(new Date());
        this.setState({ currentTime });
      },
      1000
    );
  };

  stopInterval = () => {
    clearInterval(this.interval);
  };

  changeTz(tz){
      var local_text = document.getElementById("local_tz");
      var utc_text = document.getElementById("utc_tz");
      if (tz == 'local') {
        utc_text.style.color = "#6ECBF5";
  local_text.style.color = "#DEFE47";
  this.setState({'tz':'local'})
  this.startInterval();
      } else if (tz == 'utc') {
  local_text.style.color = "#6ECBF5";
        utc_text.style.color = "#DEFE47";
  this.setState({'tz':'utc'})
  this.startInterval();
      }
  }


  runJob = () => {
    var obj = {}
    obj.run = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);
  }


/*
  killJob = (machine) => {
    var obj = {}
    obj.cron = this.state.name
    obj.machine = machine
    var obj_main = {}
    obj_main.killMachine = obj
    var jsonString = JSON.stringify(obj_main)
    socket.send(jsonString)  
  }
  */

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
      if (y.style.color === "rgb(223, 217, 245)") {
        y.style.color = "#6ECBF5";
      } else {
        y.style.color = "#DFD9F5";
      }
    } catch (err) {
      // go on
    }
  }
  calculateTimeout() {
    var start_time;
    var machinesTimeouts = {};
    var currentTime = Date.now();
    if (this.state.timeout) { 
      for (let machine in this.state.results) {
        if (this.state.runningOn.includes(machine)) {
          start_time = this.state.results[machine]["starttime"];
          let secondsDiff = Math.floor( ((new Date(start_time) - currentTime + (this.state.timeout * 1000)) % (1000*60))/1000 );
          let minutesDiff = Math.floor( ((new Date(start_time) - currentTime + (this.state.timeout * 1000)) % (1000*60*60)) / (1000*60) );
          let hoursDiff = Math.floor( ((new Date(start_time) - currentTime + (this.state.timeout * 1000)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          if (secondsDiff < 0) { secondsDiff = 0; }
          if (minutesDiff < 0) { minutesDiff = 0 }
          if (hoursDiff < 0) {hoursDiff = 0 }
          machinesTimeouts[machine] = "timeout: " + hoursDiff + "h " + minutesDiff + "m " + secondsDiff + "s"
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
          machinesRanFor[machine] = hoursDiff + "h " + minutesDiff + "m " + secondsDiff + "s"
        }
        return machinesRanFor;
    }


  handleData(json) {
    let data = JSON.parse(json);
    if (data.hasOwnProperty("sp_version")){
        var json_result_version = data.sp_version;
        this.setState({ backend_version: json_result_version});
    }
    if (data.hasOwnProperty("last_state") && (this.state.runningOn.length === 0)) {
      var json_result_last_state = data["last_state"]
      var keys_last_state = Object.keys(json_result_last_state)
      for (var i = 0; i < keys_last_state.length; i++) {
        var key_name = keys_last_state[i]
        if (key_name === this.state.name) {
          if (json_result_last_state[key_name]["result_ok"] === true) {
            this.setState({ result : "Success" })
          } else if (json_result_last_state[key_name]["result_ok"] === false) {
            this.setState({ result: "Fail" })
          }
        }
      }
    }
    if (data.hasOwnProperty("config")){
      var json_result_config = data.config.crons;
      var json_result_config_maintenance = data.config.maintenance
      this.setState({
          command: json_result_config[this.state.name]["command"],
          cwd: json_result_config[this.state.name]["cwd"],
          user: json_result_config[this.state.name]["user"],
          timeout: json_result_config[this.state.name]["timeout"],
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
          maintenance: json_result_config_maintenance,
          result: "NotRun",
      });
    }
    // running
    else if(data.hasOwnProperty("running")){
        this.setState({ runningOn: []})
        var result_running = data["running"];
        var keys_running = Object.keys(result_running)
        for (i = 0; i < keys_running.length; i++) {
          var key_running = result_running[keys_running[i]]["name"]
            if (key_running === this.state.name) {
              this.setState((prevState,props) => ({ 
                result: "Running",
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
          if (this.state.tz === "local") {
              this.setState({ next_run: this.formatDateToLocal(new Date(data[name]["next_run"]))})
          }
          if (this.state.tz === "utc") {
              this.setState({ next_run: this.formatDateToUTC(new Date(data[name]["next_run"]))})
          }
        }
        if (data[name].hasOwnProperty("last_run")){
          if (this.state.tz === "local") {
              this.setState({ last_run : this.formatDateToLocal(new Date(data[name]["last_run"]))})
          }
          if (this.state.tz === "utc") {
              this.setState({ last_run : this.formatDateToUTC(new Date(data[name]["last_run"]))})
          }
        }
        if (data[name].hasOwnProperty("targets")){
          this.setState({ targetsJob : data[name]["targets"].sort() })
        } 
        if (data[name].hasOwnProperty("results")){
          this.setState({ results : data[name]["results"]})
        }
      if (data[name].hasOwnProperty("overlap")){
          this.setState({ overlap : data[name]["overlap"]})
        }

      }
    }
  }

  componentDidMount() {
    //const rehydrate = JSON.parse(localStorage.getItem('savedStateiDetails'))
    //this.setState(rehydrate)
    // timezone
    this.changeTz(this.state.tz)


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
        timeoutCounter: "",
        ranForCounter: "",
        startedJob: "",
        timeout: "",
        result: "NotRun",
        backend_version: "",
      });
    }

    this.interval = setInterval(
      () => this.setState((prevState,props) => ({
          currentTimeLocal: Date.now(),
          untilNextRun:  String(daysDiff(prevState.currentTimeLocal, new Date(prevState.next_run))) + "d " + String(hoursDiff(prevState.currentTimeLocal, new Date(prevState.next_run)))+"h " + String(minutesDiff(prevState.currentTimeLocal, new Date(prevState.next_run))) + "m " + String(secondsDiff(prevState.currentTimeLocal, new Date(prevState.next_run)))+"s",
          timeoutCounter: self.calculateTimeout(),
          ranForCounter: self.calculateRanFor(),
      })),
      1000
    );

//    if (Object.keys(this.state.runningOn).length > 0){

  }

  componentWillUnmount() {
    //localStorage.setItem('savedStateDetails', JSON.stringify(this.state))
    localStorage.setItem('tzState', this.state.tz) 
    this.stopInterval();

    var obj = {}
    obj.unsubscribe = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);

  }

  render(){
    return(
    <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <div className="date">
          <span style={{ display: 'inline-block', marginRight: '1em'}}>
                        <p>{this.state.currentTime}</p>
                </span>
      <span style={{ display: 'inline-block', marginRight: '1em', cursor: 'pointer' }} onClick={this.changeTz.bind(this, 'local')} >
          <p id="local_tz">Local</p>
      </span>
      <span style={{ display: 'inline-block', marginRight: '1em', cursor: 'pointer'}} onClick={this.changeTz.bind(this, 'utc')}>
          <p id="utc_tz">UTC</p>
      </span>
      </div>
  </div>

        <div style={{marginLeft:"4%"}}>
          <h1 className="cronTitle">
            {this.state.name}
            {this.state.overlap === true ?
                (<FaExclamationCircle title="overlap" style={{ color: "#FF1919", size: "3px", marginLeft: "10px" }} />) :
                  this.state.result === "Success" ?
                    (<FaCheckCircle title="success" style={{ color: "#60CE80", size: "3px", marginLeft: "10px" }} />) :
                  this.state.result === "Fail" ?
                    (<FaTimesCircle title="failed" style={{ color: "#FF1919", size: "3px", marginLeft: "10px" }} />) :
                  this.state.result === "Running" ?
                    (<FaPlayCircle title="running" style={{ color: "#6AC3EC", size: "3px", marginLeft: "10px" }} />) :
                  this.state.result === "NotRun" ?
                    (<FaRegCircle title="not run" style={{ color: "#E0D9F6", size: "3px", marginLeft: "10px" }} />) :
                  null
            }
          </h1>
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
                            <td><div>{this.state.command.split('\n').map(str => <p>{str}</p>)}</div></td>
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
                            <td>
                               {Array.isArray(this.state.targets) ? this.state.targets.map((target, index) => (<div key={index}>{target}</div>)) : <div>{this.state.targets}</div>}
                            </td>
                        </tr>
                        <tr>
                            <th style={{width:"25%"}}>target type</th>
                            <td>{this.state.target_type}</td>
                        </tr>
                        {(Number.isInteger(this.state.number_of_targets) || (this.state.number_of_targets === 0)) ? 
                            <tr>
                                <th style={{width:"25%", marginBottom:"30px"}}>no. of targets</th>
                                <td>{this.state.number_of_targets}</td>
                            </tr> : ""}
                        {this.state.batch_size ? 
                            <tr>
                                <th style={{width:"25%", marginBottom:"30px"}}>batch size</th>
                                <td>{this.state.batch_size}</td>
                            </tr> : ""}
                        {(Number.isInteger(this.state.timeout) || (this.state.timeout === 0)) ?
                            <tr>
                                <th style={{width:"25%"}}>timeout</th>
                               <td>{this.state.timeout}</td>
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
                    <button className="button" style={{color:"white", backgroundColor: "#4CAF50", marginLeft: "40px", width: "120px"}} onClick={this.runJob.bind(this)}>Run cron now</button>
                    {Object.keys(this.state.runningOn).length > 0 ? <button className="button" style={{ color:"white",backgroundColor: "#F44336", marginLeft: "30px"}} onClick={this.killCron.bind(this)}>Kill cron</button> : ""}
                </div>

                <h1 className="sectionTitle"><span> TARGETS <FiInfo  title="gray - matched by expression&#10;green - ran successfully&#10;yellow - under maintenance&#10;blue - running now&#10;red - ran with errors" style ={{marginLeft: "2px"}}/> </span></h1>
                <div ClassName="targetsList">
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
			} else if (this.state.maintenance.hasOwnProperty('machines')){
				if (this.state.maintenance.machines.includes(machine)) {
			    	    this.circleColor = "#FFDE21"
				    this.cursor = "pointer"
				    this.sign = "warning"
				}
                        } else {
                            this.circleColor = "white"
                            this.cursor = "auto"
                        }
                        if (this.circleColor !== "white") {
                            if (this.sign === "start") {
                                return  <p id={id1} className="machineNameLeft" onClick={this.showLastRun.bind(this,machine,id1)} style={{ cursor: this.cursor, color: "#DFD9F5" }} > <FaPlay style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                            }
                            if (this.sign === "stopped") {
                                return  <p id={id1} className="machineNameLeft" onClick={this.showLastRun.bind(this,machine,id1)} style={{ cursor: this.cursor, color: "#DFD9F5" }} > <FaStop style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                            }
                            if (this.sign === "warning") {
                                return  <p id={id1} className="machineNameLeft" onClick={this.showLastRun.bind(this,machine,id1)} style={{ cursor: this.cursor, color: "#DFD9F5" }} > <MdWarning size = {20} style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                            }
                        } else {
                            return  <p id={id1} className="machineNameLeft" style={{ cursor: this.cursor, color: "#DFD9F5"}} > <FaCircle style={{color:this.circleColor, marginRight:"7px"}} />{machine}</p>
                        }
                    }) : ""}
                </div>
            </div> 


            <div className="details2">
                <h1 className="sectionTitle"><span> LAST RUN </span></h1>
                <div> {this.state.targetsJob !== [] ? this.state.targetsJob.map((target, i) => {
                  if (this.state.results.hasOwnProperty(target)){
                    return <div id={target} style={{display:"none"}}>
                        <p className="machineNameRight">{target}</p>
                        {this.state.results[target]["starttime"] && this.state.tz === "local" ?
                            <p className="sectionDetails" >started at: <span>{this.formatDateToLocal(new Date(this.state.results[target]["starttime"]))}</span></p> : ""}
                        {this.state.results[target]["starttime"] && this.state.tz === "utc" ?
                            <p className="sectionDetails" >started at: <span>{this.formatDateToUTC(new Date(this.state.results[target]["starttime"]))}</span></p> : ""}
                        {this.state.results[target]["endtime"] && this.state.tz === "local" ? 
                            <p className="sectionDetails" >ended at: <span>{this.formatDateToLocal(new Date(this.state.results[target]["endtime"]))}</span></p>: ""}
                        {this.state.results[target]["endtime"] && this.state.tz === "utc" ?
                            <p className="sectionDetails" >ended at: <span>{this.formatDateToUTC(new Date(this.state.results[target]["endtime"]))}</span></p>: ""}
                        {this.state.results[target]["starttime"] ?
                            <p className="sectionDetails" >ran for: <span>{this.state.ranForCounter[target]}</span></p> : ""}
                        {this.state.results[target]["retcode"] !== "" ? 
                            <p className="sectionDetails" >ret code: <span>{this.state.results[target]["retcode"]}</span></p> : ""} 
                        {this.state.timeoutCounter.hasOwnProperty(target) ?
                            <p className="sectionDetails" >{this.state.timeoutCounter[target]}</p> : ""}
                        {this.state.results[target]["ret"] ? <p id="machineOutput" className="sectionDetails" >Output:</p> : "" }
                        {this.state.results[target]["ret"] ? <p>
                            <div className="sectionDetailsOutput">
                              <TextareaAutosize wrap="off" maxRows={15}>
                                {this.state.results[target]["ret"]}
                              </TextareaAutosize>
                            </div>
                          </p> : "" }

                        <br></br>
                    </div>
                  } else { 
                        try {
                            var y = document.getElementById(target+"1");
                            y.style.color = "#DEFE47";
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
            <p>Backend: {this.state.backend_version}</p>
        </div>
    </div>
    )
  }
}

export default CronJobDetails;
