import React from "react";
import { socket } from "./socket.js";
import "./CronJobDetails.css";

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
      targets: [],
      results: {},
      currentTime: Date.now(),
      untilNextRun: "",
      hardTimeoutCounter: this.props.location.state.hard_timeout, // to do(per machine)
      softTimeoutCounter: this.props.location.state.soft_timeout,
      started:"",
    }
    this.handleData.bind(this);
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
            if (key_running == this.state.name) {
              this.setState((prevState,props) => ({ 
		        runningOn: result_running[keys_running[i]]["machines"],
                started: new Date(result_running[keys_running[i]]["started"]).toLocaleString(),
	          }));
              break;
            }
        }
    } else {
      // details
      var name = Object.keys(data)[0];
      if (name == this.state.name) {
        if (data[name].hasOwnProperty("next_run")){
          this.setState({ next_run: new Date(data[name]["next_run"]).toLocaleString()});
        }
        if (data[name].hasOwnProperty("last_run")){
	  this.setState({ last_run : new Date(data[name]["last_run"]).toLocaleString()});
        }
        if (data[name].hasOwnProperty("targets")){
          this.setState({ targets : data[name]["targets"] });
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

    function secondsDiffTimeout(d1, d2, t) {
      let secDiff = Math.floor( ((d2 - d1) % (1000*60))/1000 );
      if (Number.isFinite(secDiff) && t){
        return secDiff + t
      } else {
	return ""
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

    var obj = new Object()
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
        targets: [],
        results: {},
      });
    }

    this.interval = setInterval(
      () => this.setState((prevState,props) => ({
	      currentTime: Date.now(),
              untilNextRun:  daysDiff(prevState.currentTime, new Date(prevState.next_run)) + "d " + hoursDiff(prevState.currentTime, new Date(prevState.next_run))+"h " + minutesDiff(prevState.currentTime, new Date(prevState.next_run)) + "m " + secondsDiff(prevState.currentTime, new Date(prevState.next_run))+"s",
	      hardTimeoutCounter: secondsDiffTimeout(prevState.currentTime, new Date(prevState.started), this.state.hard_timeout),
	      softTimeoutCounter: secondsDiffTimeout(prevState.currentTime, new Date(prevState.started), this.state.soft_timeout),
      })),
      1000
    );

//    if (Object.keys(this.state.runningOn).length > 0){

  }

  componentWillUnmount() {
    //localStorage.setItem('savedStateDetails', JSON.stringify(this.state))
    var obj = new Object()
    obj.unsubscribe = this.state.name
    var jsonString = JSON.stringify(obj)
    socket.send(jsonString);

    clearInterval(this.interval);
  }

  render(){
    return(
    <div>
	   <h1 className="detailsTableName">{this.state.name}</h1>
       
       <h1 className="sectionTitle"><span> CONFIG </span></h1>
       <p className="sectionDetails"> {this.state.sec} &nbsp; {this.state.min} &nbsp; {this.state.hour} &nbsp; {this.state.dom} &nbsp; {this.state.mon} &nbsp; {this.state.dow} &nbsp; {this.state.year} &emsp;&emsp; {this.state.command} </p>
       <p className="sectionDetails"> {this.state.cwd} &emsp; {this.state.user} &emsp; {this.state.target_type} &emsp; {this.state.number_of_targets}</p>
       
       <h1 className="sectionTitle"><span> TIMES </span></h1>
       <p className="sectionDetails"> {this.state.last_run} &emsp; {this.state.next_run}</p>
       <p className="sectionDetails"> {this.state.untilNextRun} </p>

       <h1 className="sectionTitle"><span> TARGETS </span></h1>
       <div style={{ maxHeight:"200px", overflow:"auto"}}>
            {this.state.targets !== [] ? this.state.targets.map((machine, i) => {
                if (Object.values(this.state.runningOn).indexOf(machine) > -1) {
                    this.textColor = "#60CE80"
                } else {
                    this.textColor = "white"
                }
                return <p className="sectionDetails" style={{ color: this.textColor}} >{machine}{Object.keys(this.state.runningOn).length > 0 ? " :: " + this.state.softTimeoutCounter : ""}{Object.keys(this.state.runningOn).length > 0 ? " :: " + this.state.hardTimeoutCounter : ""}</p>;
            }) : ""}
       </div>
	  
       <h1 className="sectionTitle"><span> LAST RUN </span></h1>
       <div style={{ maxHeight:"400px", overflow:"auto"}} > {this.state.results !== {} ? Object.keys(this.state.results).map((target, i) => {
               return <div key={i}>
                <p className="sectionDetails" style={{fontWeight:"bold"}}>{target}{this.state.results[target]["starttime"] ? " :: started at " + new Date(this.state.results[target]["starttime"]).toLocaleString() : ""}{this.state.results[target]["endtime"] ? " :: ended at " + new Date(this.state.results[target]["endtime"]).toLocaleString(): ""}{this.state.results[target]["retcode"] !== "" ? " :: ret code " + this.state.results[target]["retcode"] : ""} </p>
                <p className="sectionDetails" style={{textIndent: "2em", color:"#018786"}}>Output:</p>
                <p className="sectionDetails" style={{color:"white"}}>
                                    <div>
                                      {this.state.results[target]["ret"].split('\n').map(str => <p style={{textIndent: "4em"}}>{str}</p>)}
                                    </div>
                                </p>
                <br></br>
                </div>;
            }) : ""}
                </div>
	</div>
    )
  }
}

export default CronJobDetails;
