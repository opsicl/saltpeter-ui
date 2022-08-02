import React  from "react";
import { withRouter } from 'react-router-dom';
import "./CronJob.css";

class CronJob extends React.Component {
  constructor(props){
    super(props);
    this.handleHistory.bind(this);
  }

  handleHistory = () => {
    const { history } = this.props;
    //console.log(this.props.job.name);
    history.push({
      pathname: "/details/" + this.props.job.name,
      state: { 
	    name: this.props.job.name,
	    command: this.props.job.command,
	    soft_timeout: this.props.job.soft_timeout,
	    hard_timeout: this.props.job.hard_timeout,
        cwd: this.props.job.cwd,
        user: this.props.job.user,
        targets: this.props.job.targets,
        target_type: this.props.job.target_type,
        number_of_targets: this.props.job.number_of_targets,
        dom: this.props.job.dom,
        dow: this.props.job.dow,
        hour: this.props.job.hour,
        min: this.props.job.min,
        mon: this.props.job.mon,
        sec: this.props.job.sec,
        year: this.props.job.year,
        group: this.props.job.group,
        batch_size: this.props.job.batch_size,
      }
    });
  };

  render() {
    if (this.props.job.runningOn.length) {
      return (
        <tr
          key={this.props.job.id}
	      className="output"
          style={{ color: "#6666FF", cursor: "pointer"}}
          onClick={this.handleHistory}>
          <td>
            <div style={{ maxHeight:"100px", overflow:"auto"}} >
              {this.props.job.name}
            </div>
          </td>
          <td>
            <div style={{ maxHeight:"100px", overflow:"auto"}} >
              {this.props.job.command.split('\\').map(str => <p>{str}</p>)}
            </div>
          </td>
          <td>
            <div style={{ maxHeight:"100px", overflow:"auto", textAlign:"center"}} >
              {this.props.job.runningOn.map((machine, i) => {
                return <p key={i} className="output">{machine}</p>;
              })}
            </div>
          </td>
          <td>{this.props.job.group}</td>
        </tr>
      );
    } else {
      return (
        <tr
          key={this.props.job.id}
	  className="output" 
	  onClick = {this.handleHistory}
      style = {{cursor: "pointer"}}>
          <td>{this.props.job.name}</td>
          <td>{this.props.job.command.split('\\').map(str => <p>{str}</p>)}</td>
          <td style={{textAlign:"center"}}> - </td>
          <td>{this.props.job.group}</td>  
        </tr>
      );
    }
  }
}

export default withRouter(CronJob);
