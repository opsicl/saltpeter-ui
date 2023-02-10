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
        result: this.props.job.result,
        last_run: this.props.job.last_run,
	settings: this.props.settings,
      }
    });
  };

  render() {
    if (this.props.job.runningOn.length) {
      return (
        <tr
          key={this.props.job.id}
	      className="output"
          style={{ color: "#6666ff", cursor: "pointer"}}
          onClick={this.handleHistory}>
	     {this.props.settings['column_name_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.name}</div></td>:""}
             {this.props.settings['column_command_checked']?<td>{this.props.job.command.split('\n').map(str => <p>{str}</p>)}</td>:""}
	     {this.props.settings['column_cwd_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.cwd}</div></td>:""}
	     {this.props.settings['column_user_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.user}</div></td>:""}
	     {this.props.settings['column_soft_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.soft_timeout}</div></td>:""}
	     {this.props.settings['column_hard_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hard_timeout}</div></td>:""}
	     {this.props.settings['column_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.targets}</div></td>:""}
	     {this.props.settings['column_target_type_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.target_type}</div></td>:""}
	     {this.props.settings['column_number_of_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.number_of_targets}</div></td>:""}
	     {this.props.settings['column_dom_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dom}</div></td>:""}
	     {this.props.settings['column_dow_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dow}</div></td>:""}
	     {this.props.settings['column_hour_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hour}</div></td>:""}
	     {this.props.settings['column_min_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.min}</div></td>:""}
	     {this.props.settings['column_mon_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.mon}</div></td>:""}
	     {this.props.settings['column_sec_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.sec}</div></td>:""}
	     {this.props.settings['column_year_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.year}</div></td>:""}
	     {this.props.settings['column_group_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.group}</div></td>:""}
	     {this.props.settings['column_batch_size_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.batch_size}</div></td>:""}
	     {this.props.settings['column_running_on_checked']?
                <td>
                        <div style={{ maxHeight:"100px", overflow:"auto", textAlign:"center"}} >
                                {this.props.job.runningOn.map((machine, i) => {
                                        return <p key={i} className="output">{machine}</p>;
                                })}
                        </div>
                </td>:""}
	     {this.props.settings['column_result_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.result}</div></td>:""}
	     {this.props.settings['column_last_run_checked']?<td><div style={{ textAlign:"center", maxHeight:"100px", overflow:"auto"}}>{new Date(this.props.job.last_run).toLocaleString()}</div></td>:""}
        </tr>
      );
    } else if (this.props.job.result == 1) {
      return (
        <tr
          key={this.props.job.id}
	      className="output" 
	      onClick = {this.handleHistory}
          style = {{ color: "#60CE80", cursor: "pointer"}}>
	     {this.props.settings['column_name_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.name}</div></td>:""}
             {this.props.settings['column_command_checked']?<td>{this.props.job.command.split('\n').map(str => <p>{str}</p>)}</td>:""}
             {this.props.settings['column_cwd_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.cwd}</div></td>:""}
             {this.props.settings['column_user_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.user}</div></td>:""}
             {this.props.settings['column_soft_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.soft_timeout}</div></td>:""}
             {this.props.settings['column_hard_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hard_timeout}</div></td>:""}
             {this.props.settings['column_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.targets}</div></td>:""}
             {this.props.settings['column_target_type_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.target_type}</div></td>:""}
             {this.props.settings['column_number_of_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.number_of_targets}</div></td>:""}
             {this.props.settings['column_dom_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dom}</div></td>:""}
             {this.props.settings['column_dow_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dow}</div></td>:""}
             {this.props.settings['column_hour_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hour}</div></td>:""}
             {this.props.settings['column_min_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.min}</div></td>:""}
             {this.props.settings['column_mon_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.mon}</div></td>:""}
             {this.props.settings['column_sec_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.sec}</div></td>:""}
             {this.props.settings['column_year_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.year}</div></td>:""}
             {this.props.settings['column_group_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.group}</div></td>:""}
             {this.props.settings['column_batch_size_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.batch_size}</div></td>:""}
             {this.props.settings['column_running_on_checked']?<td style={{textAlign:"center"}}> - </td>:""}
	     {this.props.settings['column_result_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.result}</div></td>:""}
	     {this.props.settings['column_last_run_checked']?<td><div style={{ textAlign:"center", maxHeight:"100px", overflow:"auto"}}>{new Date(this.props.job.last_run).toLocaleString()}</div></td>:""}
        </tr>
      );
    } else if (this.props.job.result == 2) {
      return (
        <tr
          key={this.props.job.id}
          className="output"
          onClick = {this.handleHistory}
          style = {{ color: "#FF0000", cursor: "pointer"}}>
            {this.props.settings['column_name_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.name}</div></td>:""}
             {this.props.settings['column_command_checked']?<td>{this.props.job.command.split('\n').map(str => <p>{str}</p>)}</td>:""}
             {this.props.settings['column_cwd_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.cwd}</div></td>:""}
             {this.props.settings['column_user_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.user}</div></td>:""}
             {this.props.settings['column_soft_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.soft_timeout}</div></td>:""}
             {this.props.settings['column_hard_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hard_timeout}</div></td>:""}
             {this.props.settings['column_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.targets}</div></td>:""}
             {this.props.settings['column_target_type_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.target_type}</div></td>:""}
             {this.props.settings['column_number_of_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.number_of_targets}</div></td>:""}
             {this.props.settings['column_dom_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dom}</div></td>:""}
             {this.props.settings['column_dow_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dow}</div></td>:""}
             {this.props.settings['column_hour_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hour}</div></td>:""}
             {this.props.settings['column_min_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.min}</div></td>:""}
             {this.props.settings['column_mon_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.mon}</div></td>:""}
             {this.props.settings['column_sec_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.sec}</div></td>:""}
             {this.props.settings['column_year_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.year}</div></td>:""}
             {this.props.settings['column_group_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.group}</div></td>:""}
             {this.props.settings['column_batch_size_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.batch_size}</div></td>:""}
             {this.props.settings['column_running_on_checked']?<td style={{textAlign:"center"}}> - </td>:""}
             {this.props.settings['column_result_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.result}</div></td>:""}
             {this.props.settings['column_last_run_checked']?<td><div style={{ textAlign:"center", maxHeight:"100px", overflow:"auto"}}>{new Date(this.props.job.last_run).toLocaleString()}</div></td>:""}
        </tr>
      );
    } else {
      return (
        <tr
          key={this.props.job.id}
          className="output"
          onClick = {this.handleHistory}
          style = {{color: "#DFD9F5", cursor: "pointer"}}>
	    {this.props.settings['column_name_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.name}</div></td>:""}
             {this.props.settings['column_command_checked']?<td>{this.props.job.command.split('\n').map(str => <p>{str}</p>)}</td>:""}
             {this.props.settings['column_cwd_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.cwd}</div></td>:""}
             {this.props.settings['column_user_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.user}</div></td>:""}
             {this.props.settings['column_soft_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.soft_timeout}</div></td>:""}
             {this.props.settings['column_hard_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hard_timeout}</div></td>:""}
             {this.props.settings['column_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.targets}</div></td>:""}
             {this.props.settings['column_target_type_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.target_type}</div></td>:""}
             {this.props.settings['column_number_of_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.number_of_targets}</div></td>:""}
             {this.props.settings['column_dom_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dom}</div></td>:""}
             {this.props.settings['column_dow_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.dow}</div></td>:""}
             {this.props.settings['column_hour_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.hour}</div></td>:""}
             {this.props.settings['column_min_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.min}</div></td>:""}
             {this.props.settings['column_mon_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.mon}</div></td>:""}
             {this.props.settings['column_sec_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.sec}</div></td>:""}
             {this.props.settings['column_year_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.year}</div></td>:""}
             {this.props.settings['column_group_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.group}</div></td>:""}
             {this.props.settings['column_batch_size_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.batch_size}</div></td>:""}
             {this.props.settings['column_running_on_checked']?<td style={{textAlign:"center"}}> - </td>:""}
             {this.props.settings['column_result_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.result}</div></td>:""}
             {this.props.settings['column_last_run_checked']?<td style={{textAlign:"center"}}> - </td>:""}
        </tr>
      );
    }
  }
}

export default withRouter(CronJob);
