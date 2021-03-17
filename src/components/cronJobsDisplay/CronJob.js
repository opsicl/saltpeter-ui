import React, {PureComponent} from "react";
import { withRouter } from 'react-router-dom';
import CronParser from "./CronParser";
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
      }
    });
  };

  render() {
    if (this.props.job.runningOn.length != 0) {
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
