const moment = require("moment");

let SystemDisplay = function(bigbot) {
  this.sys = bigbot;
  this.events = {
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  this.displayTimeInConsole = true;
};

SystemDisplay.prototype.show = function(message, eventStyle) {
  switch (eventStyle) {

    case this.events.INFO:
      this.info(message);
      break;

    case this.events.WARN:
      this.warn(message);
      break;
    case this.events.ERROR:
      this.error(message);
      break;

    default:
      console.log(message);
      break;
  };
};

/*
  SystemDisplay#info

  used to inform the console of the current processes running through the
  bot's internal logic
*/
SystemDisplay.prototype.info = function(message) {
  let time = moment().format('MMMM Do YYYY, h:mm:ss a') + ": ";
  console.log("INFO > "+ this.displayTime(time) + message);
};

SystemDisplay.prototype.warn = function(message) {
  let time = moment().format('MMMM Do YYYY, h:mm:ss a') + ": ";
  console.log("WARN >> "+ this.displayTime(time) + message);
};

SystemDisplay.prototype.error = function(message) {
  let time = moment().format('MMMM Do YYYY, h:mm:ss a') + ": ";
  console.log("=================================================================");
  console.log(">>>              ERROR                                           ");
  console.log("=================================================================");
  console.log(">>> "+ this.displayTime(time) + message);
  console.log("=================================================================");
  console.log(">>>              /ERROR                                          ");
  console.log("=================================================================");
};

SystemDisplay.prototype.displayTime = function(time) {
  return (this.displayTimeInConsole === true ? time : "");
};

module.exports = SystemDisplay;
