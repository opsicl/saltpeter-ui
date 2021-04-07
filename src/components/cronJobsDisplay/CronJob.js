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
      pathname: "/details",
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
      }
    });
  };

  render() {
    if (this.props.job.runningOn.length) {
      return (
        <tr
          key={this.props.job.id}
	  className="output"
          style={{ color: "#60CE80"}}
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
