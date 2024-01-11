import React  from "react";
import { withRouter } from 'react-router-dom';
import "./CronJob.css";

import { FaSquareXmark } from "react-icons/fa6";
import { FaSquareCaretRight } from "react-icons/fa6";
import { FaSquareCheck } from "react-icons/fa6";

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
        }}>
          {this.props.settings['column_name_checked']?<td onClick={this.handleHistory}><div style={{ maxHeight:"100px", overflow:"auto"}}>{this.props.job.name}</div></td>:""}
          <td>
              <div style={{ maxHeight:"50em", overflow:"auto"}}>
                   {this.props.job.timeline !== [] ? this.props.job.timeline.map((run, i) => {
                        var lastNumber = parseInt(this.props.timelineLast.slice(0, -1))
                        var lastMeasurement = this.props.timelineLast.slice(-1)
                        if (lastMeasurement === "m") {
                          lastMeasurement = 60
                        }
                        if (lastMeasurement === "h") {
                          lastMeasurement = 3600
                        }
                        if (lastMeasurement === "d") {
                          lastMeasurement = 86400
                        }
                        const lastAgo = Date.now() - (lastNumber * lastMeasurement * 1000);
                        const dateLastAgo = new Date(lastAgo);
                        if (run.timestamp) {
                            var cron_timestamp = Date.parse(run.timestamp)
                            var cron_timestamp_date = new Date(run.timestamp).toLocaleString()
                            if (cron_timestamp > dateLastAgo) {
                              //var h = cron_timestamp_date.getUTCHours().toString()
                              //h = h.length === 1 ? "0" + h : h

                              //var m = cron_timestamp_date.getUTCMinutes().toString()
                              //m = m.length === 1 ? "0" + m : m

                              //var s = cron_timestamp_date.getUTCSeconds().toString()
                              //s = s.length === 1 ? "0" + s : s

                              //var y = cron_timestamp_date.getFullYear().toString()
                              
                              //var mo = cron_timestamp_date.getMonth() + 1
                              //mo = mo.toString()
                              //mo = mo.length === 1 ? "0" + mo : mo

                              //var d =  s = cron_timestamp_date.getDate().toString()
                              //d = d.length === 1 ? "0" + d : d

                              // check if it ended with success
                              if ((run.msg_type === 'machine_result') && (run.ret_code == 0)) {
                                return <FaSquareCheck title={cron_timestamp_date} style={{ color: "#76C2AE", size: "10px", marginLeft: "0.5em" }} />
                                //return <p key={run.name + i} style={{ display: "inline-block", width: "1em", height: "1em", backgroundColor: "green", margin: "0 0.5em" }}></p>
                                //<p>{run.msg_type + " - " + cron_timestamp_date.getHours() + ":" + cron_timestamp_date.getMinutes() + ":" + cron_timestamp_date.getSeconds()}</p>
                              }

                              // check if it ended with failure
                              if ((run.msg_type === 'machine_result') && (run.ret_code > 0)) {
                                return <FaSquareXmark title={cron_timestamp_date} style={{ color: "#D9544D", size: "3", marginLeft: "0.5em" }} />
                                //return <p key={run.name + i} style={{ display: "inline-block", width: "2em", height: "1em", backgroundColor: "red", margin: "0 0.5em" }}></p>
                              }

                              // check if it just started
                              if (run.msg_type === 'machine_start') {
                                return <FaSquareCaretRight title={cron_timestamp_date} style={{ color: "#A9D1DF", size: "3", marginLeft: "0.5em" }} />
                               // return <p key={run.name + i} onmouseover="ok" style={{ display: "inline-block", width: "1em", height: "1em", backgroundColor: "blue", margin: "0 0.5em" }}></p>
                              }


                            }
                        }
                    }) : ""}
              </div>
          </td>
      </tr>
    );
  }
}

export default withRouter(CronJobTimeline);
