// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, optional)

function CronParser(props) {
  var parser = require("cron-parser");
  var nextDate;

  var options = {
    currentDate: new Date().toUTCString(),
    tz: "UTC",
  };

  var cronExpression =
    props.sec +
    " " +
    props.min +
    " " +
    props.hour +
    " " +
    props.dom +
    " " +
    props.mon +
    " " +
    props.dow;
  
  try {
    var interval = parser.parseExpression(cronExpression, options);

    nextDate = interval.next().toString();
    // cut the +0000 portion from the date
    nextDate = nextDate.substring(0, nextDate.indexOf("+"));
  } catch (err) {
    nextDate = "Error: " + err.message;
  }

  return nextDate;
}

export default CronParser;
