import React, {PureComponent} from "react";
import { withRouter } from 'react-router-dom';
import CronParser from "./CronParser";
import "./CronJob.css";

class CronJob extends PureComponent {
  constructor(props){
    super(props);
    this.convertDate.bind(this);
    this.handleHistory.bind(this);
  }

  convertDate(date){
    let date_full = new Date(date).toString();
    return date_full.substring(0, date_full.indexOf("+"));    
  }
/*
  showJobDetails(args) {
    var runningOn=[];
    
    if(data.hasOwnProperty("running")){
        var result_running = data["running"];
        var keys_running = Object.keys(result_running);
        for (var i = 0; i < keys_running.length; i++) {
          var key_running = result_running[keys_running[i]]["name"];
            if (key_running == args.name) {
              runningOn = result_running[keys_running[i]]["machines"];
              break;
          }
        }
    }
    //var name = Object.keys(data);
    var next_run = "";
    var last_run = "";
    var targets = [];
    var results = {};
    if (data[name].hasOwnProperty("next_run")){
      next_run = this.convertDate(data[name]["next_run"]);
    }
    if (data[name].hasOwnProperty("last_run")){
      last_run = this.convertDate(data[name]["last_run"]);
    }
    if (data[name].hasOwnProperty("targets")){
      targets = data[name]["targets"];
    }
    if (data[name].hasOwnProperty("results")){
	results = data[name]["results"];
    }

    MySwal.fire({
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      customClass: {
        confirmButton: 'swal-button-confirm',
        denyButton: 'swal-button-cancel'
      },
      width: 1200,
      allowOutsideClick: false,
      showCancelButton: false,
      showDenyButton: true,
      denyButtonText: "Back",
      showConfirmButton: true,
      confirmButtonText: "Run Now",
      html: 
	<div className="details">
	  <h1>Details</h1>
	  <table className="detailsTable">
	    <tbody>
	      <tr>
	        <th>Name</th>
	        <td>{this.props.job.runningOn}</td>
	      </tr>
	      <tr>
	        <th>Command</th>
	        <td>{args.command}</td>
	      </tr>
	      <tr>
	        <th>Targets</th>
	        <td>{targets !== [] ? targets.map((machine, i) => {
              		return <p key={i} className="output">{machine}</p>;
            		}) : ""}
		</td>
	      </tr>
	      <tr>
                <th>Next run</th>
                 <td>{next_run}</td>
              </tr>
	      <tr>
	        <th>Last run</th>
	        <td>{last_run}</td>
	      </tr>
	      <tr>
                <th>Result</th>
                <td>{results !== {} ? Object.keys(results).map((target, i) => {
		       return <div key={i}> 
				<p className="output" style={{color: "#FF7597u", fontWeight:"bold"}}>{target}</p> 
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Output:</p>
				<p className="output" style={{textIndent: "4em", color:"white"}}>{results[target]["ret"]}</p>
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Return code:</p>
				<p className="output" style={{textIndent: "4em", color:"white"}}>{results[target]["retcode"]}</p>
				<p className="output" style={{textIndent: "2em", color:"#018786"}}>Endtime:</p>
				<p className="output" style={{textIndent: "4em", color:"white"}}>{this.convertDate(results[target]["endtime"])}</p>
			        <p>{i==Object.keys(results).length-1 ? "" : <br></br>}</p>
			      </div>;
			}) : ""}
	        </td>
              </tr>
	      <tr>
	        <th>Running on</th>
	        <td> {runningOn !== [] ? runningOn.map((machine, i) => {
                       return <p key={i} className="output">{machine}</p>;
                     }) : ""}
	        </td>
	      </tr>
	    </tbody>
	  </table>
	</div>
    }).then((result) => {
      this.props.actions.send(this.props.job.name + "-unsubscribe");
      if (result.isConfirmed) {
      
      }else if (result.isDenied) {
      }
    })
  }
*/
  handleHistory = () => {
    const { history } = this.props;
    //console.log(this.props.job.name);
    history.push({
      pathname: "/details",
      state: { 
	name: this.props.job.name,
	command: this.props.job.command,
      }
    });
  };

  componentDidMount(){
  }

  render() {
    console.log(this.props.job);
    if (this.props.job.runningOn.length != 0) {
      return (
        <tr
          key={this.props.job.id}
	  className="output"
          style={{ color: "#f78fa4"}}
          onClick={this.handleHistory}>
          <td>{this.props.job.name}</td>
          <td>{this.props.job.command}</td>
          <td>
            {this.props.job.runningOn.map((machine, i) => {
              return <p key={i} className="output">{machine}</p>;
            })}
          </td>
        </tr>
      );
    } else {
      return (
        <tr
          key={this.props.job.id}
	  className="output" 
	  onClick = {this.handleHistory}>
          <td>{this.props.job.name}</td>
          <td>{this.props.job.command}</td>
          <td> - </td>
        </tr>
      );
    }
  }
}

export default withRouter(CronJob);
