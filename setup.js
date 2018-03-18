const fs = require("fs");
const commandExistsSync = require('command-exists').sync;
const SystemDisplay = new (require("./lib/handlers/systemdisplay_handler.js"));

SystemDisplay.info("Welcome to PlayMusic's Setup Utility. This Utility will handle creating the empty folders, and checking things such as PATH to ensure PlayMusic can start without a hitch.");

/*

  Create Dirs required by PlayMusic.
  - audio
  - database

*/

checkAndMakeDir("./audio");
checkAndMakeDir("./database");

/*

  System additionals that are needed
  - FFMPEG

*/

checkForCommand("ffmpeg");

function checkAndMakeDir(dir) {
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
      SystemDisplay.info(`${dir} has been created.`);
  } else {
    SystemDisplay.warn(`${dir} has been found. Skipping.`);
  }
};

function checkForCommand(cmd) {
  if (commandExistsSync(cmd)) {
    SystemDisplay.info(`${cmd} has been found in your path.`);
  } else {
    SystemDisplay.error(`${cmd} has not been found in your path. Please rectify the issue.`);
  }
};
