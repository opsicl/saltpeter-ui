import React from "react";
import CronParser from "./CronParser";

function CronJob(props) {
  const nextRun = (
    <CronParser
      year={props.job.year}
      mon={props.job.mon}
      dow={props.job.dow}
      dom={props.job.dom}
      hour={props.job.hour}
      min={props.job.min}
      sec={props.job.sec}
    />
  );

  if (props.job.runningOn != "") {
    return (
      <tr key={props.job.id} style={{ backgroundColor: "#addfad" }}>
        <td>{props.job.name}</td>
        <td>{props.job.command}</td>
        <td>
          {props.job.runningOn.map((machine) => {
            return <p>{machine}</p>;
          })}
        </td>
        <td>{nextRun}</td>
      </tr>
    );
  } else {
    return (
      <tr key={props.job.id}>
        <td>{props.job.name}</td>
        <td>{props.job.command}</td>
        <td> - </td>
        <td>{nextRun}</td>
      </tr>
    );
  }
}

export default CronJob;
