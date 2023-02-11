import React from "react";
import "./App.css";
import JobsTable from "./components/cronJobsDisplay/JobsTable";
import CronJobDetails from "./components/cronJobsDisplay/CronJobDetails";
import Settings from "./components/cronJobsDisplay/Settings";
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
//import { useHistory } from "react-router-dom";

function App(){
    return (
      <div>
         <Router>
           <Navbar />
           <Switch>
             <Route path="/" exact component={JobsTable} />
	         <Route path="/settings" exact component={Settings} />
	         <Route path="/details/:id" render={(props) => <CronJobDetails {...props} />} />
           </Switch>
         </Router>
      </div>
    );
}

export default App;
