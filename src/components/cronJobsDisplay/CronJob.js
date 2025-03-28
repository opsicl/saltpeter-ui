import React  from "react";
import { withRouter } from 'react-router-dom';
import "./CronJob.css";

class CronJob extends React.Component {
  constructor(props){
    super(props);
    this.calculateRanFor = this.calculateRanFor.bind(this)
    this.handleHistory.bind(this);
    this.formatDateToUTC.bind(this);
    this.formatDateToLocal.bind(this);
  }

  handleHistory = () => {
    console.log(this.props)
    const { history } = this.props;
    //console.log(this.props.job.name);
    history.push({
      pathname: "/details/" + this.props.job.name,
      state: { 
        name: this.props.job.name,
        command: this.props.job.command,
        timeout: this.props.job.timeout,
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
        status: this.props.job.status,
        last_run: this.props.job.last_run,
        settings: this.props.settings,
        backend_version: this.props.backend_version,
        tz: this.props.tz,
        running_started: this.props.job.running_started,
        maintenance: this.props.maintenance
      }
    });
  };

   formatDateToUTC(date) {
    return date.getUTCFullYear() + '-' +
           ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
           ('0' + date.getUTCDate()).slice(-2) + ' ' +
           ('0' + date.getUTCHours()).slice(-2) + ':' +
           ('0' + date.getUTCMinutes()).slice(-2) + ':' +
           ('0' + date.getUTCSeconds()).slice(-2);
  }

  formatDateToLocal(date) {
    return date.getFullYear() + '-' +
           ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
           ('0' + date.getDate()).slice(-2) + ' ' +
           ('0' + date.getHours()).slice(-2) + ':' +
           ('0' + date.getMinutes()).slice(-2) + ':' +
           ('0' + date.getSeconds()).slice(-2);
  }

  calculateRanFor(){
    var ran_string = ""
    if (this.props.job.status == "Running") {
      var hours = Math.floor( ((Date.now() - new Date(this.props.job.running_started)) / (1000 * 60 * 60)))
      var min = Math.floor( ((Date.now() - new Date(this.props.job.running_started)) % (1000*60*60)) / (1000*60) )
      var sec = Math.floor( ((Date.now() - new Date(this.props.job.running_started)) % (1000*60))/1000)
      ran_string = "for: " + hours + "h " + min + "m "+ sec + "s"
    }
    return ran_string
  }


  render() {
    var color = "#E0D9F6";
    switch(this.props.job.status) {
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
          {this.props.settings['column_command_checked']?<td>{this.props.job.command.split('\n').map(str => <p>{str}</p>)}</td>:""}
          {this.props.settings['column_cwd_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.cwd}</div></td>:""}
          {this.props.settings['column_user_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.user}</div></td>:""}
          {this.props.settings['column_timeout_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.timeout}</div></td>:""}
          {this.props.settings['column_targets_checked']?<td><div style={{ maxHeight:"100px", overflow:"auto"}}>
              {Array.isArray(this.props.job.targets) ? (
                this.props.job.targets.map((target, index) => (
                  <div key={index}>{target}</div>
                ))
              ) : (
                <div>{this.props.job.targets}</div>
              )}
            </div>
          </td>
        : ""}

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
            </td> : ""
          }
         {this.props.settings['column_status_checked']?
             <td>
                <div style={{ maxHeight:"100px", overflow:"auto"}}>
                   {this.props.job.status}
                </div>
                <div style={{ maxHeight:"100px", overflow:"auto"}} >
                   {this.calculateRanFor()}
                </div>
             </td>:""
         }
         {this.props.settings['column_last_run_checked']?<td><div style={{ textAlign:"center", maxHeight:"100px", overflow:"auto"}}>{this.props.job.last_run!="" && this.props.tz === "local"?this.formatDateToLocal(new Date(this.props.job.last_run)):this.props.job.last_run!="" && this.props.tz === "utc"?this.formatDateToUTC(new Date(this.props.job.last_run)):""}</div></td>:""}
      </tr>
    );
  }
}

export default withRouter(CronJob);
