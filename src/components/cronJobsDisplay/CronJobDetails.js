import React from "react";
import { socket } from "./socket.js";
import "./CronJobDetails.css";
import { FaCircle } from 'react-icons/fa';

class CronJobDetails extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      name: this.props.location.state.name,
      command: this.props.location.state.command,
      hard_timeout: this.props.location.state.hard_timeout,
      soft_timeout: this.props.location.state.soft_timeout,
      cwd: this.props.location.state.cwd,
      user: this.props.location.state.user,
      targets: this.props.location.state.targets,
      target_type: this.props.location.state.target_type,
      number_of_targets: this.props.location.state.number_of_targets,
      dom: this.props.location.state.dom,
      dow: this.props.location.state.dow,
      hour: this.props.location.state.hour,
      min: this.props.location.state.min,
      mon: this.props.location.state.mon,
      sec: this.props.location.state.sec,
      year: this.props.location.state.year,
      runningOn: [],
      next_run: "",
      last_run: "",
      targetsJob: [],
      results: {},
      currentTime: Date.now(),
      untilNextRun: "",
      hardTimeoutCounter: "",
      softTimeoutCounter: "",
      startedJob:"",
    }
    this.handleData.bind(this);
    this.calculateHardTimeout.bind(this);
    this.calculateSoftTimeout.bind(this);
    this.showLastRun.bind(this);
    this.runJob.bind(this);
    this.killJob.bind(this);
  }

  runJob = () => {
    var obj = {}
    obj.run = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);
  }

  killJob = (machine) => {
    var obj = {}
    obj.kill = this.state.name + "-" + machine
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);  
  }
  
  showLastRun = (machine) => {
    try {
      var x = document.getElementById(machine);
      if (x.style.display === "none") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
    } catch (err) {
      // go on
    }
  }

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

  calculateHardTimeout() {
    var start_time;
    var machinesTimeouts = {};
    var currentTime = Date.now();
    if (this.state.hard_timeout) { 
      for (let machine in this.state.results) {
        if (this.state.runningOn.includes(machine)) {
          start_time = this.state.results[machine]["starttime"];
          let secDiff = Math.floor( ((new Date(start_time) - currentTime) % (1000*60))/1000 );
          if (Number.isFinite(secDiff) && this.state.hard_timeout){
            machinesTimeouts[machine] = secDiff +  this.state.hard_timeout;
          }
        }
      }
      return machinesTimeouts;
    } else {
      return "";
    }
  }


  handleData(json) {
    let data = JSON.parse(json);
    console.log(data)    
    if(data.hasOwnProperty("config")){
      // do nothing
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
          this.setState({ targetsJob : data[name]["targets"] });
        } 
        if (data[name].hasOwnProperty("results")){
          this.setState({ results : data[name]["results"]});
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

    socket.onclose = function(event) {
      self.setState({
	    name: "",
        command: "",
        runningOn: [],
        next_run: "",
        last_run: "",
        targetsJob: [],
        results: {},
      });
    }

    this.interval = setInterval(
      () => this.setState((prevState,props) => ({
	      currentTime: Date.now(),
          untilNextRun:  daysDiff(prevState.currentTime, new Date(prevState.next_run)) + "d " + hoursDiff(prevState.currentTime, new Date(prevState.next_run))+"h " + minutesDiff(prevState.currentTime, new Date(prevState.next_run)) + "m " + secondsDiff(prevState.currentTime, new Date(prevState.next_run))+"s",
          hardTimeoutCounter: self.calculateHardTimeout(),
          softTimeoutCounter: self.calculateSoftTimeout(),
      })),
      2000
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
        <div style={{marginLeft:"80px"}}>
            <h1 className="detailsTableName">{this.state.name}</h1>
        </div>
        <div>
            <div className="details1">
                <h1 className="sectionTitle"><span> CONFIG </span></h1>
                <p className="sectionDetails"> {this.state.sec} &nbsp; {this.state.min} &nbsp; {this.state.hour} &nbsp; {this.state.dom} &nbsp; {this.state.mon} &nbsp; {this.state.dow} &nbsp; {this.state.year} &emsp;&emsp; {this.state.command} </p>
                <p className="sectionDetails"> {this.state.cwd} &emsp; {this.state.user} &emsp; {this.state.target_type} &emsp; {this.state.number_of_targets}</p>
       
                <h1 className="sectionTitle"><span> TIMES </span></h1>
                <p className="sectionDetails"> {this.state.last_run} &emsp; {this.state.next_run}</p>
                <p className="sectionDetails"> {this.state.untilNextRun} </p>

                <h1 className="sectionTitle"><span> TARGETS </span></h1>
                <button className="button" style={{backgroundColor: "#4CAF50", marginLeft: "40px"}} onClick={this.runJob.bind(this)}>Run</button>
                <div style={{ maxHeight:"300px", overflow:"auto"}}>
                    {this.state.targetsJob !== [] ? this.state.targetsJob.map((machine, i) => {
                        if (Object.values(this.state.runningOn).indexOf(machine) > -1) {
                            this.textColor = "#60CE80"
                            this.cursor = "pointer"
                    } else if (this.state.results.hasOwnProperty(machine)) {
                        this.textColor = "#FFC308"
                        this.cursor = "pointer"
                    } else {
                        this.textColor = "white"
                        this.cursor = "auto"
                    }
                    return  <p className="sectionDetails" onClick={this.showLastRun.bind(this,machine)} style={{ cursor: this.cursor}} > <FaCircle style={{color:this.textColor, marginRight:"7px"}} />{machine} </p>
            }) : ""}
                </div>
            </div>
            <div className="details2">
                <h1 className="sectionTitle"><span> LAST RUN </span></h1>
                <div style={{ maxHeight:"500px", overflow:"auto"}} > {this.state.results !== {} ? Object.keys(this.state.results).map((target, i) => {
                    return <div id={target} style={{display:"none"}}>
                        <p className="sectionDetails" style={{fontWeight:"bold"}}>{target}</p>
                        <p className="sectionDetails" style={{fontStyle:"italic", textIndent: "2em"}}>
                            started at: {this.state.results[target]["starttime"] ? new Date(this.state.results[target]["starttime"]).toLocaleString() : ""} 
                        </p>
                        <p className="sectionDetails" style={{fontStyle:"italic", textIndent: "2em"}}>
                            ended at: {this.state.results[target]["endtime"] ? new Date(this.state.results[target]["endtime"]).toLocaleString(): ""}
                        </p>
                        <p className="sectionDetails" style={{fontStyle:"italic", textIndent: "2em"}}>
                            ret code: {this.state.results[target]["retcode"] !== "" ? this.state.results[target]["retcode"] : ""} 
                        </p>
                        <p className="sectionDetails" style={{textIndent: "2em", color:"#d5ff00", fontStyle:"italic"}}>
                            soft timeout: {Object.keys(this.state.runningOn).length !== 0  ? this.state.softTimeoutCounter : ""}
                        </p>
                        <p className="sectionDetails" style={{textIndent: "2em", color:"#d5ff00", fontStyle:"italic"}}>
                            hard timeout: {this.state.hardTimeoutCounter.hasOwnProperty(target) ? this.state.hardTimeoutCounter[target] : ""}
                        </p>
                        <button disabled={!(Object.values(this.state.runningOn).indexOf(target) > -1)} className="button" style={{ marginLeft: "70px"}}onClick={this.killJob.bind(this,target)}>Kill</button>
                        <p className="sectionDetails" style={{textIndent: "2em", color:"#018786"}}>Output:</p>
                        <p className="sectionDetails" style={{color:"white"}}>
                            <div>
                                {this.state.results[target]["ret"].split('\n').map(str => <p style={{textIndent: "3em"}}>{str}</p>)}
                            </div>
                        </p>
                    </div>;}) : ""}
            </div>
	    </div>
     </div>
    </div>
    )
  }
}

export default CronJobDetails;
