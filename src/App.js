import React from "react";
import "./App.css";
import JobsTable from "./components/cronJobsDisplay/JobsTable";
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={JobsTable} />
          {/* <Route path="/running" exact component={RunningJobsTable} /> */}
        </Switch>
      </Router>
    </div>
  );
}

export default App;

// NEXT STEPS:
// 1. Cron Parser next run - new column - DONE!
// Add script output as details - + alte detalii: last run, last succesfull run, etc
// 2. Add sidebar
// 3. Navbar + search - DONE
// 4. Click on a job and show full details
// 5. Icons, package build, config file etc
