import React from "react";
import CronJobTimeline from "./CronJobTimeline";
import "./Timeline.css";
import { socket } from "./socket.js";
import { Link } from "react-router-dom";

let apis = require("../../version.json");
const UI_VERSION = apis.version;

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timelineLast: "30m", /////////////////////
      refresh: 10000, ////////////////////////
      jobs: [],
      search: "",
      backend_version:"",
      settings: {
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
        column_batch_size_checked: false,
        column_running_on_checked: true, 
        column_last_run_checked: true, 
        column_group_checked: true, 
        column_result_checked: false,
        columns_width:"15%",
        column_command_width:"40%"
      },
      column_asc_sort:"",
      column_desc_sort:"",
      active_columns:[],
      config_received: false,
    };
    socket.debug=true;
    socket.timeoutInterval = 5400;
    this.handleData.bind(this)
    this.sortColumn.bind(this)
    this.sendToSettings.bind(this)
    this.getTimeline.bind(this)
  }

  sendToSettings(){
      const nextTitle = 'Saltpeter';
      const nextURL = "settings";
      const nextState = { additionalInformation: 'Updated the URL with JS' };
      window.history.pushState(nextState,nextTitle,nextURL);
  }

  updateSearch(event) {
    this.setState({ search: event.target.value.substr(0, 20) });
    if (event.target.value.substr(0, 20)) {
        const nextTitle = 'Saltpeter';
        const nextURL = "?search=" + event.target.value.substr(0, 20);
        const nextState = { additionalInformation: 'Updated the URL with JS' };
        // This will create a new entry in the browser's history, without reloading
        window.history.replaceState(nextState,nextTitle,nextURL);
    } else {
        const nextURL = "/"
        const nextTitle = 'Saltpeter';
        const nextState = { additionalInformation: 'Updated the URL with JS' };
        // This will create a new entry in the browser's history, without reloading
        window.history.replaceState(nextState,nextTitle,nextURL);
    }

  }

  getTimeline() {
    // send message to ws to get timeline info
    var obj = {}
    obj.last = this.state.timelineLast
    var obj_send = {}
    obj_send.getTimeline = obj
    var jsonString = JSON.stringify(obj_send)
    socket.send(jsonString);

  }

  handleData(data) {
    sessionStorage.setItem('savedState', JSON.stringify(this.state))

    // get backend version
    if (JSON.parse(data).hasOwnProperty("sp_version")){
        var json_result_version = JSON.parse(data).sp_version;
        this.setState({ backend_version: json_result_version});
    }

    //config
    if (JSON.parse(data).hasOwnProperty("config")) {
      var json_result_config = JSON.parse(data).config.crons;
      var keys = Object.keys(json_result_config);
      var cronJobs = [];
      this.setState({ config_received: true});

      for (var i = 0; i < keys.length; i++) {
         // set default number of target to 0
        var no_of_targets = json_result_config[keys[i]]["number_of_targets"]
        if (!no_of_targets) {
            no_of_targets = "0"
        }

        cronJobs.push({
          id: i,
          name: keys[i],
          command: json_result_config[keys[i]]["command"],
          cwd: json_result_config[keys[i]]["cwd"],
          user: json_result_config[keys[i]]["user"],
          soft_timeout: json_result_config[keys[i]]["soft_timeout"],
          hard_timeout: json_result_config[keys[i]]["hard_timeout"],
          targets: json_result_config[keys[i]]["targets"],
          target_type: json_result_config[keys[i]]["target_type"],
          number_of_targets: no_of_targets,
          dom: json_result_config[keys[i]]["dom"],
          dow: json_result_config[keys[i]]["dow"],
          hour: json_result_config[keys[i]]["hour"],
          min: json_result_config[keys[i]]["min"],
          mon: json_result_config[keys[i]]["mon"],
          sec: json_result_config[keys[i]]["sec"],
          year: json_result_config[keys[i]]["year"],
          group: json_result_config[keys[i]]["group"],
          batch_size: json_result_config[keys[i]]["batch_size"],
          runningOn: [],
          result: 'NotRun',
          last_run: "",
          timeline: []
        });
      }
      this.setState({jobs: cronJobs})
    }
    if ((JSON.parse(data).hasOwnProperty("running")) && (this.state.config_received === true)) {
      cronJobs = this.state.jobs;
      //clear previous data
      for (i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["runningOn"] = [];
      }

      var json_result_running = JSON.parse(data).running;
      var keys_running = Object.keys(json_result_running);
      for (i = 0; i < keys_running.length; i++) {
        var key_running = json_result_running[keys_running[i]]["name"];
        for (var j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] === key_running) {
            cronJobs[j]["runningOn"] = json_result_running[keys_running[i]]["machines"];
            cronJobs[j]["result"] = "Running";
            break;
          }
        }
      }

      this.setState({ jobs: cronJobs });
    }

    if ((JSON.parse(data).hasOwnProperty("last_state")) && (this.state.config_received === true)) {
      cronJobs = this.state.jobs;
      //clear previous data
      for (i = 0; i < cronJobs.length; i++) {
        cronJobs[i]["result"] = 0;
        cronJobs[i]["result"] = "Notrun";
      }

      var json_result_last_state = JSON.parse(data).last_state;
      var keys_last_state = Object.keys(json_result_last_state);
      for (i = 0; i < keys_last_state.length; i++) {
        var key_name = keys_last_state[i]
        for (j = 0; j < cronJobs.length; j++) {
          if (cronJobs[j]["name"] === key_name) {
            if (json_result_last_state[key_name]["result_ok"] === false) {
                cronJobs[j]["result"] = "Fail"
            } else {
                cronJobs[j]["result"] = "Success"
            }
            cronJobs[j]["last_run"] = json_result_last_state[key_name]["last_run"];
            break;
          }
        }
      }
      this.setState({ jobs: cronJobs }); /////////////////////////
    }

    // get timeline
    if ((JSON.parse(data).hasOwnProperty("timeline"))  && (this.state.config_received === true)) {
      cronJobs = this.state.jobs  
      var timeline = JSON.parse(data).timeline.content;   
      for (i = 0; i < cronJobs.length; i++) {
        var cronJobName = cronJobs[i]["name"]
        var cronTimeline = []
        for (j = 0; j < timeline.length; j++) {
          if (cronJobName === timeline[j]["cron"]) {
            cronTimeline.push(timeline[j])
          }
        }
        cronJobs[i]["timeline"] = cronTimeline
      }
      this.setState({ jobs: cronJobs });
    }

    if (this.state.config_received === false) {
      window.location.reload(false);
    }

  }

  sortColumn(column){
      function compareAsc(a, b) {
        try {
          if (a[column] === undefined){
            a[column] = ""
          }
          if (b[column] === undefined){
            b[column] = ""
          }
          
          var groupA = a[column]
          var groupB = b[column]

          if (typeof a[column] === 'string' || a[column] instanceof String) {
            groupA = a[column].toUpperCase();
          }

          if (typeof b[column] === 'string' || b[column] instanceof String) {
            groupB = b[column].toUpperCase();
          }

          if (column == 'number_of_targets'){
            groupA = parseInt(a[column])
            groupB = parseInt(b[column])
          }
            let comparison = 0;
            if (groupA > groupB) {
                comparison = 1;  
            } else if (groupA < groupB) {
                comparison = -1;
            }
            return comparison;
        } catch (error) {
            console.log(error)
            let comparison = 0
            return comparison;
        }
      }

      function compareDesc(a, b) {
        try {
            if (a[column] === undefined){
              a[column] = ""
            }
            if (b[column] === undefined){
              b[column] = ""
            }

            var groupA = a[column]
            var groupB = b[column]

            if (typeof a[column] === 'string' || a[column] instanceof String) {
              groupA = a[column].toUpperCase();
            }

            if (typeof b[column] === 'string' || b[column] instanceof String) {
              groupB = b[column].toUpperCase();
            }
            
            if (column == 'number_of_targets'){
              groupA = parseInt(a[column])
              groupB = parseInt(b[column])
            }

            let comparison = 0;  
            if (groupA < groupB) {
                comparison = 1;
            } else if (groupA < groupB) {
                comparison = -1;
            }
            return comparison;
        } catch (error) {
            let comparison = 0
            return comparison;
        }
      }
  
      var cronJobs = this.state.jobs
      var keys = ["name","command","cwd","user","soft_timeout","hard_timeout","targets","target_type","number_of_targets","dom","dow","hour","min","mon","sec","year","group","batch_size","running_on","resultst","last_run"]
      for (let i=0; i < keys.length; i++) {
          var column_name = keys[i]
          if (keys[i].includes("_")) {
             column_name = keys[i].replace("_"," ")
          }
          try {
            var elem_key = document.getElementById(keys[i])
            elem_key.textContent = column_name
          } catch (error) {
              //continue
          }
        }
      const elem = document.getElementById(column);
      column_name = column
      if (column.includes("_")) {
          column_name = column.replace("_"," ")
      } 

      if (this.state.column_asc_sort == column) {
          //desc sort
          elem.textContent = column_name + " \u2191"
          this.setState({ column_asc_sort: "", column_desc_sort: column, jobs: cronJobs.sort(compareDesc)});
      /*} 
      else if (this.state.column_desc_sort == column) {
          elem.textContent = column
          this.setState({ column_asc_sort: "", column_desc_sort: "", jobs: cronJobs});
          */
      } else {
          // asc sort
          elem.textContent = column_name + " \u2193"
          this.setState({ column_asc_sort: column, column_desc_sort: "", jobs: cronJobs.sort(compareAsc)});
      }
  }


  componentDidMount() {
    //const rehydrate = JSON.parse(localStorage.getItem('savedState'))
    const rehydrate = JSON.parse(sessionStorage.getItem('savedState'))
    this.setState(rehydrate)
    const queryParams = new URLSearchParams(window.location.search);
    const search_word = queryParams.get('search');
    if (search_word){
        this.setState({ search: search_word });
    } else {
        this.setState({ search:""})
    }
    
    var self = this;
    this.interval = setInterval(
     () => self.getTimeline(),
     this.state.refresh);


    //const fetchTimeline = () => {
    //    self.getTimeline();
    //    this.interval = setTimeout(fetchTimeline, this.state.refresh);
   // };

    //self.getTimeline();
    //this.interval = setTimeout(fetchTimeline, this.state.refresh);
    
    socket.onmessage =  function(event) {
      self.handleData(event.data);
    };

    socket.onclose = function(event) {
      self.setState({jobs: []});
    }
    if (window.localStorage.getItem('settingsState')){
      this.setState({ settings: JSON.parse(window.localStorage.getItem('settingsState'))})
    }

    
    var settings = JSON.parse(window.localStorage.getItem('settingsState'))
    if (settings == null) {
      settings = {
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
        column_batch_size_checked: false,
        column_running_on_checked: true,
        column_last_run_checked: true,
        column_group_checked: true,
        column_result_checked: false,
        columns_width:"15%",
        column_command_width:"40%",
        column_timeline_width: "45%"
      }
    }
    this.setState({ settings: settings})
    var active_columns = []
    if (settings) {
        for (const col in settings) {
            if (settings[col]){
                if ((col != "column_command_width") && (col != "columns_width")) {
                    //var col_name = col.replace("column_","").replace("_checked","").replace("_"," ")
                    var col_name = col.replace("column_","").replace("_checked","")
                    active_columns.push(col_name)
                }
            }
        }
    } else {
        active_columns=["name"]
    }
    this.setState({ active_columns: active_columns})
  }

  componentWillUnmount() {
    //localStorage.setItem('savedState', JSON.stringify(this.state))
    sessionStorage.setItem('savedState', JSON.stringify(this.state))
    clearInterval(this.interval);
  }

  render() {
    window.addEventListener("keydown",function (e) {             
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {        
        e.preventDefault();         
        document.getElementById("searchBarInput").focus()
      }      
    })
    let filteredJobs = this.state.jobs.filter((job) => {
      return (
        job.command.toLowerCase().indexOf(this.state.search.toLowerCase()) !==
          -1 ||
        job.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 ||
        job.group.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 || 
        job.result.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 
      );
    });

    var tableData = filteredJobs.map((item) => (
      <CronJobTimeline key={item.id} job={item} backend_version={this.state.backend_version} settings={this.state.settings} timelineLast={this.state.timelineLast}/>
    ));

    return (
      <div>
        <table className="tableName">
          <tbody>
            <tr>
              <th>Crons</th>
            </tr>
          </tbody>
        </table>
        <table className="tableName2">
          <tbody>
            <tr style={{textAlign:"left"}}>
              <th style={{cursor:"pointer",paddingLeft:"30px",textAlign:"left",verticalAlign:"bottom",width:"30%", fontSize:"9px", color:"#576AE2"}}>
                <Link className="cols" to="/settings">set columns</Link>
              </th>
              <th style={{width:"70%", textAlign:"left"}}>
                <input
                  type="text"
                  id="searchBarInput"
                  className="searchBar"
                  placeholder="Search"
                  value={this.state.search}
                  onChange={this.updateSearch.bind(this)}
                  autoFocus
                />
              </th>
            </tr>
          </tbody>
        </table>
        <table id="cronsTable" className="data">
        <div className="cronsdiv">
          <tbody>  
            <tr style={{cursor:"pointer"}}>
              {this.state.settings['column_name_checked']?<th id="name" style={{ width: this.state.settings['columns_width']}} onClick={this.sortColumn.bind(this,'name')}>Name</th>:""}
              <th id="timeline" style={{ width: "85%" }}>Timeline</th>
            </tr>
          </tbody>
          <tbody>
              {tableData}
          </tbody>
        </div>
        </table>
        <p
          style={{
            padding: "5px",
            fontSize: "12px",
            textAlign: "center",
            columnSpan: "all",
            color:"#d6d6d6"
          }}
        >
          {filteredJobs == "" ? "No Data Available" : ""}
        </p>
        <div className = "versions">
            <p>UI: {UI_VERSION}</p>
            <p>Backend: {this.state.backend_version}</p>
        </div>
      </div>
    );
  }
}

export default Timeline;
