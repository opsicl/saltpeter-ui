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
      runningOn: [],
      next_run: "",
      last_run: "",
      targets: [],
      results: {},
      currentTime: Date.now(),
      untilNextRun: "",
      hardTimeoutCounter: this.props.location.state.hard_timeout, // to do(per machine)
      softTimeoutCounter: this.props.location.state.soft_timeout,
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
      if (Number.isFinite(secDiff)){
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
	      hardTimeoutCounter: secondsDiffTimeout(prevState.currentTime, new Date(prevState.last_run), this.state.hard_timeout),
	      softTimeoutCounter: secondsDiffTimeout(prevState.currentTime, new Date(prevState.last_run), this.state.soft_timeout),
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
	  <h1 className="detailsTableName">Details</h1>
	  <table className="detailsTable">
	    <tbody>
	      <tr>
	        <th>Name</th>
	        <td>{this.state.name}</td>
	      </tr>
	      <tr>
	        <th>Command</th>
	        <td>{this.state.command}</td>
	      </tr>
	      <tr>
                <th>Soft timeout</th>
                <td>
	            {this.state.runningOn !== [] ? this.state.runningOn.map((machine, i) => {
			    return <p>{this.state.softTimeoutCounter}</p>;
                    }) : ""}
	        </td>
              </tr>
	      <tr>
                <th>Hard timeout</th>
                <td>
                    {this.state.runningOn !== [] ? this.state.runningOn.map((machine, i) => {
                          return <p>{this.state.hardTimeoutCounter}</p>;
                    }) : ""}
	        </td>
              </tr>
	      <tr>
                <th>Next run</th>
                 <td>
	           <div>
	             <p>{this.state.next_run}</p>
	             <p>{this.state.untilNextRun}</p>
	          </div> 
	        </td>
              </tr>
	      <tr>
	        <th style={{ width: "20%" }} >Last run</th>
	        <td>{this.state.last_run}</td>
	      </tr>
	      <tr>
                <th>Last result</th>
                <td >
	            <div style={{ maxHeight:"400px", overflow:"auto"}} > {this.state.results !== {} ? Object.keys(this.state.results).map((target, i) => {
		       return <div key={i}> 
				<p className="output" style={{color: "#FF7597u", fontWeight:"bold"}}>{target} :: started at {new Date(this.state.results[target]["starttime"]).toLocaleString()} :: ended at {this.state.results[target]["endtime"] ? new Date(this.state.results[target]["endtime"]).toLocaleString(): "-"} :: ret code {this.state.results[target]["retcode"]} </p> 
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Output:</p>
				<p className="output" style={{color:"white"}}>
                                    <div>
                                      {this.state.results[target]["ret"].split('\n').map(str => <p style={{textIndent: "4em"}}>{str}</p>)}
                                    </div>
                                </p>
			    <p>{i==Object.keys(this.state.results).length-1 ? "" : <br></br>}</p>
			    </div>;
			}) : ""}
	            </div>
	        </td>
              </tr>
	      <tr>
	        <th>Targets</th>
	        <td style={{ maxHeight:"50px", overflow:"auto"}}> 
	          <ul>
	             {this.state.targets !== [] ? this.state.targets.map((machine, i) => {
                          if (Object.values(this.state.runningOn).indexOf(machine) > -1) {
                            this.textColor = "#60CE80"
                          } else {
                            this.textColor = "white"
			  }
			  return <li key={i} className="output" style={{ color: this.textColor}} >{machine}</li>;
                    }) : ""}
	          </ul>
	        </td>
	      </tr>
	    </tbody>
	  </table>
	</div>
    )
  }
}

export default CronJobDetails;
