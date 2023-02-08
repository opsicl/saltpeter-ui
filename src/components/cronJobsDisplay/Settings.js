import React from "react";
import "./Settings.css";
import { withRouter } from 'react-router-dom';
let apis = require("../../version.json");
const UI_VERSION = apis.version;

class Settings extends React.Component {
  constructor() {
    super();
    this.state = JSON.parse(window.localStorage.getItem('settingsState')) || {
      column_name_checked: true,
      column_command_checked: true,
      column_cwd_checked: false,
      column_user_checked: false,
      column_soft_timeout_checked: false,
      column_hard_timeout_checked: false,
      column_targets_checked: false,
      column_target_type_checked: false,
      column_number_of_targets_checked: false,
      column_dom_checked: false,
      column_dow_checked: false,
      column_hour_checked: false,
      column_min_checked: false,
      column_mon_checked: false,
      column_sec_checked: false,
      column_year_checked: false,
      column_group_checked: true,
      column_batch_size_checked: false,
      column_running_on_checked: true,
      column_result_checked: false,
      column_last_run_checked: true,
      columns_width: "0%",
      column_command_width: "0%",
      backend_version:""
    };
    this.handleData.bind(this);
    this.submitSettings.bind(this);
    this.cancelSettings.bind(this);
  }

  setState(state) {
    window.localStorage.setItem('settingsState', JSON.stringify(state));
    console.log(state)
    super.setState(state);
  }

  handleData(data) {
    if (JSON.parse(data).hasOwnProperty("sp_version")){
        var json_result_version = JSON.parse(data).sp_version;
        this.setState({ backend_version: json_result_version});
    }
  }

  submitSettings() {
     var column_name = document.getElementById("name")
     var column_command = document.getElementById("command")
     var column_cwd = document.getElementById("cwd")
     var column_user = document.getElementById("user")
     var column_soft_timeout = document.getElementById("soft_timeout")
     var column_hard_timeout = document.getElementById("hard_timeout")
     var column_targets = document.getElementById("targets")
     var column_target_type = document.getElementById("target_type")
     var column_number_of_targets = document.getElementById("number_of_targets")
     var column_dom = document.getElementById("dom")
     var column_dow = document.getElementById("dow")
     var column_hour = document.getElementById("hour")
     var column_min = document.getElementById("min")
     var column_mon = document.getElementById("mon")
     var column_sec = document.getElementById("sec")
     var column_year = document.getElementById("year")
     var column_group = document.getElementById("group")
     var column_batch_size = document.getElementById("batch_size")
     var column_running_on = document.getElementById("running_on")
     var column_result = document.getElementById("result")
     var column_last_run = document.getElementById("last_run")

     var active_columns_count = 0
     var column_name_checked = false 
     if (column_name.checked) {
	    column_name_checked = true
	    active_columns_count = active_columns_count + 1 
     }

     var column_cwd_checked = false
     if (column_cwd.checked) {
        column_cwd_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_user_checked = false
     if (column_user.checked) {
        column_user_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_soft_timeout_checked = false
     if (column_soft_timeout.checked) {
        column_soft_timeout_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_hard_timeout_checked = false
     if (column_hard_timeout.checked) {
        column_hard_timeout_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_targets_checked = false
     if (column_targets.checked) {
        column_targets_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_target_type_checked = false
     if (column_target_type.checked) {
        column_target_type_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_number_of_targets_checked = false
     if (column_number_of_targets.checked) {
        column_number_of_targets_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_dom_checked = false
     if (column_dom.checked) {
        column_dom_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_dow_checked = false
     if (column_dow.checked) {
        column_dow_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_hour_checked = false
     if (column_hour.checked) {
        column_hour_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_min_checked = false
     if (column_min.checked) {
        column_min_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_mon_checked = false
     if (column_mon.checked) {
        column_mon_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_sec_checked = false
     if (column_sec.checked) {
        column_sec_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_year_checked = false
     if (column_year.checked) {
        column_year_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_group_checked = false
     if (column_group.checked) {
        column_group_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_batch_size_checked = false
     if (column_batch_size.checked) {
        column_batch_size_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_running_on_checked = false
     if (column_running_on.checked) {
        column_running_on_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_result_checked = false
     if (column_result.checked) {
        column_result_checked = true
        active_columns_count = active_columns_count + 1
     }

     var column_last_run_checked = false
     if (column_last_run.checked) {
        column_last_run_checked = true
        active_columns_count = active_columns_count + 1
     }

     var columns_width = "0%"
     var column_command_width = "0%"
     // last one
     var column_command_checked = false
     if (column_command.checked) {
        column_command_checked = true
	active_columns_count = active_columns_count + 1
	columns_width = 80/active_columns_count
	column_command_width = columns_width + 20
	columns_width = columns_width + "%"
	column_command_width = column_command_width + "%"
     } else {
        columns_width = 100/active_columns_count + "%"
     }

     this.setState({ 
	     column_name_checked: column_name_checked, 
	     column_command_checked: column_command_checked, 
	     column_cwd_checked: column_cwd_checked, 
	     column_user_checked: column_user_checked,
	     column_soft_timeout_checked: column_soft_timeout_checked,
	     column_hard_timeout_checked: column_hard_timeout_checked,
	     column_targets_checked: column_targets_checked,
	     column_target_type_checked: column_target_type_checked,
	     column_number_of_targets_checked: column_number_of_targets_checked,
	     column_dom_checked: column_dom_checked,
	     column_dow_checked: column_dow_checked,
	     column_hour_checked: column_hour_checked,
	     column_min_checked: column_min_checked,
	     column_mon_checked: column_mon_checked,
	     column_sec_checked: column_sec_checked,
	     column_year_checked: column_year_checked,
	     column_group_checked: column_group_checked,
	     column_batch_size_checked: column_batch_size_checked,
	     column_running_on_checked: column_running_on_checked,
	     column_result_checked: column_result_checked,
	     column_last_run_checked: column_last_run_checked,
	     columns_width: columns_width, 
	     column_command_width: column_command_width
     });
     const { history } = this.props;
     history.push({
      pathname: "/"})
  }

  cancelSettings() {
     const { history } = this.props;
     history.push({
     pathname: "/"})
  }

  componentDidMount() {
    //const rehydrate = JSON.parse(localStorage.getItem('settingsState'))
    //this.setState(rehydrate)
    console.log(this.state)
    var column_name = document.getElementById("name")
    var column_command = document.getElementById("command")
    var column_cwd = document.getElementById("cwd")
    var column_user = document.getElementById("user")
    var column_soft_timeout = document.getElementById("soft_timeout")
    var column_hard_timeout = document.getElementById("hard_timeout")
    var column_targets = document.getElementById("targets")
    var column_target_type = document.getElementById("target_type")
    var column_number_of_targets = document.getElementById("number_of_targets")
    var column_dom = document.getElementById("dom")
    var column_dow = document.getElementById("dow")
    var column_hour = document.getElementById("hour")
    var column_min = document.getElementById("min")
    var column_mon = document.getElementById("mon")
    var column_sec = document.getElementById("sec")
    var column_year = document.getElementById("year")
    var column_group = document.getElementById("group")
    var column_batch_size = document.getElementById("batch_size")
    var column_running_on = document.getElementById("running_on")
    var column_result = document.getElementById("result")
    var column_last_run = document.getElementById("last_run")

    column_name.checked = this.state.column_name_checked
    column_command.checked = this.state.column_command_checked
    column_cwd.checked = this.state.column_cwd_checked
    column_user.checked = this.state.column_user_checked
    column_soft_timeout.checked = this.state.column_soft_timeout_checked
    column_hard_timeout.checked = this.state.column_hard_timeout_checked
    column_targets.checked = this.state.column_targets_checked
    column_target_type.checked = this.state.column_target_type_checked
    column_number_of_targets.checked = this.state.column_number_of_targets_checked
    column_dom.checked = this.state.column_dom_checked
    column_dow.checked = this.state.column_dow_checked
    column_hour.checked = this.state.column_hour_checked
    column_min.checked = this.state.column_min_checked
    column_mon.checked = this.state.column_mon_checked
    column_sec.checked = this.state.column_sec_checked
    column_year.checked = this.state.column_year_checked
    column_group.checked = this.state.column_group_checked
    column_batch_size.checked = this.state.column_batch_size_checked
    column_running_on.checked = this.state.column_running_on_checked
    column_result.checked = this.state.column_result_checked
    column_last_run.checked = this.state.column_last_run_checked
  }

  componentWillUnmount() {
    //localStorage.setItem('settingsState', JSON.stringify(this.state))
  }

  render() { 
    return (
    <div>
        <h1 className="sectionSettings"><span> COLUMNS </span></h1>
        <div className = "settingsText">
            <label class="container">name
                <input type="checkbox" id="name" name="name"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">command
                <input type="checkbox" id="command" name="command"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">cwd
                <input type="checkbox" id="cwd" name="cwd"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">user
                <input type="checkbox" id="user" name="user"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">group
                <input type="checkbox" id="group" name="group"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">soft timeout
                <input type="checkbox" id="soft_timeout" name="soft_timeout"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">hard timeout
                <input type="checkbox" id="hard_timeout" name="hard_timeout"/>
                <span class="checkmark"></span>
            </label>
        </div>
        <div className = "settingsText">
            <label class="container">targets
                <input type="checkbox" id="targets" name="targets"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">target type
                <input type="checkbox" id="target_type" name="target_type"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">no. of targets
                <input type="checkbox" id="number_of_targets" name="number_of_targets"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">batch size
                <input type="checkbox" id="batch_size" name="batch_size"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">running on
                <input type="checkbox" id="running_on" name="running_on"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">result
                <input type="checkbox" id="result" name="result"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">last run
                <input type="checkbox" id="last_run" name="last_run"/>
                <span class="checkmark"></span>
            </label>
        </div>
        <div className = "settingsText">
            <label class="container">day of month(dom)
                <input type="checkbox" id="dom" name="dom"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">day of week(dow)
                <input type="checkbox" id="dow" name="dow"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">hour
                <input type="checkbox" id="hour" name="hour"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">min
                <input type="checkbox" id="min" name="min"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">sec
                <input type="checkbox" id="sec" name="sec"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">month(mon)
                <input type="checkbox" id="mon" name="mon"/>
                <span class="checkmark"></span>
            </label>
            <label class="container">year
                <input type="checkbox" id="year" name="year"/>
                <span class="checkmark"></span>
            </label>
        </div>
        <div style={{width:"100%", position:"fixed",bottom: "10%",left: "4%"}}>
            <button className="button" style={{backgroundColor: "#292929", color:"#ffffff"}} onClick={this.submitSettings.bind(this)}>Save</button>
            <button className="button" style={{backgroundColor: "#292929", color:"#ffffff"}} onClick={this.cancelSettings.bind(this)}>Cancel</button>
        </div>
    </div>
    );
  }
}

export default Settings;
