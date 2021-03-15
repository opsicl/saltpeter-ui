import React from "react";
import { socket } from "./socket.js";
import "./CronJobDetails.css";

class CronJobDetails extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      name: this.props.location.state.name,
      command: this.props.location.state.command,
      runningOn: [],
      next_run: "",
      last_run: "",
      targets: [],
      results: {},
    }
    this.handleData.bind(this);
  }

  convertDate(date){
    let date_full = new Date(date).toString();
    return date_full.substring(0, date_full.indexOf("+"));
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
        this.setState({ runningOn: [] });

        var result_running = data["running"];
        var keys_running = Object.keys(result_running);
        for (var i = 0; i < keys_running.length; i++) {
          var key_running = result_running[keys_running[i]]["name"];
            if (key_running == this.state.name) {
              this.setState({ runningOn: result_running[keys_running[i]]["machines"] });
              break;
          }
        }
    } else {
      // details
      var name = Object.keys(data)[0];
      if (name == this.state.name) {
        if (data[name].hasOwnProperty("next_run")){
          this.setState({ next_run: this.convertDate(data[name]["next_run"])});
        }
        if (data[name].hasOwnProperty("last_run")){
	  this.setState({ last_run : this.convertDate(data[name]["last_run"])});
        }
        if (data[name].hasOwnProperty("targets")){
          this.setState({ targets : data[name]["targets"] });
        } 
        if (data[name].hasOwnProperty("results")){
          this.setState({ results : data[name]["results"] });
        }
      }
    }
  }

  componentDidMount() {
    //const rehydrate = JSON.parse(localStorage.getItem('savedStateiDetails'))
    //this.setState(rehydrate)

    var self = this;
    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

    socket.send("{subscribe:" + this.state.name+"}");

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
  }

  componentWillUnmount() {
    //localStorage.setItem('savedStateDetails', JSON.stringify(this.state))
    socket.send("{unsubscribe:" + this.state.name+"}");
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
	        <th>Targets</th>
	        <td>
	          <ul>
	            {this.state.targets !== [] ? this.state.targets.map((machine, i) => {
              		return <li key={i} className="output">{machine}</li>;
            		}) : ""}
	          </ul>
		</td>
	      </tr>
	      <tr>
                <th>Next run</th>
                 <td>{this.state.next_run}</td>
              </tr>
	      <tr>
	        <th style={{ width: "20%" }} >Last run</th>
	        <td>{this.state.last_run}</td>
	      </tr>
	      <tr>
                <th>Last result</th>
                <td >
	            <div style={{ height:"400px", maxHeight:"400px", overflow:"auto"}} > {this.state.results !== {} ? Object.keys(this.state.results).map((target, i) => {
		       return <div key={i}> 
				<p className="output" style={{color: "#FF7597u", fontWeight:"bold"}}>{target}</p> 
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Output:</p>
				<p className="output" style={{textIndent: "4em", color:"white"}}>{this.state.results[target]["ret"]}</p>
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Return code:</p>
				<p className="output" style={{textIndent: "4em", color:"white"}}>{this.state.results[target]["retcode"]}</p>
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Endtime:</p>
				<p className="output" style={{textIndent: "4em", color:"white"}}>{this.convertDate(this.state.results[target]["endtime"])}</p>
			        <p>{i==Object.keys(this.state.results).length-1 ? "" : <br></br>}</p>
			      </div>;
			}) : ""}
	            </div>
	        </td>
              </tr>
	      <tr>
	        <th>Running on</th>
	        <td style={{ height:"50px", maxHeight:"50px", overflow:"auto"}}> 
	          <ul>
	             {this.state.runningOn !== [] ? this.state.runningOn.map((machine, i) => {
                       return <li key={i} className="output">{machine}</li>;
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
