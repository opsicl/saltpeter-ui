import React  from "react";
import { withRouter } from 'react-router-dom';
import "./CronJob.css";

class CronJobTimeline extends React.Component {
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
        result: this.props.job.result,
        last_run: this.props.job.last_run,
        settings: this.props.settings,
        backend_version: this.props.backend_version,
        result: this.props.result,
      }
    });
  };

  render() {
    var color = "#E0D9F6";
    switch(this.props.job.result) {
      case "Fail": color = "#FE00FE"; break;
      case "Success": color = "#DEFE47"; break;
      case "Running": color = "#6AC3EC"; break;
    }

    return (
      <tr
        key={this.props.job.id}
        className="output"
        style={{
          color: color,
          cursor: "pointer"
        }}
        onClick={this.handleHistory}>
          {this.props.settings['column_name_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.name}</div></td>:""}
          <td>
              <div>
                   {this.props.job.timeline !== [] ? this.props.job.timeline.map((run, i) => {
                        lastTimeline = 
                        return <p>{run.msg_type + " - " + run.timestamp}</p>
                    }) : ""}
              </div>
          </td>
          <td>2/8</td>
          <td>3/8</td>
          <td>4/8</td>
          <td>5/8</td>
          <td>6/8</td>
          <td>7/8</td>
          <td>8/8</td>
      </tr>
    );
  }
}

export default withRouter(CronJobTimeline);
