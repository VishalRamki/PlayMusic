const fs = require("fs");

let Help = function(discordBot, discordMessage) {
  this.discordBot = discordBot;
  this.discordMessage = discordMessage;

  this.command = this.discordBot.getCommand(discordMessage.content);
  this.command.args = this.command.args.toLowerCase();
};

Help.prototype.exec = function() {

  switch(this.command.args) {

    default:
      this.readMD("features");
      break;
  }

};

Help.prototype.readMD = function(str) {
  let _ = this;
  _.discordBot.sd.show(`Requested ${str}.md`, _.discordBot.sd.events.INFO);
  fs.readFile(str+".md", "UTF-8", function(err, data) {
    if (err) {
      _.discordBot.sd.show(err.toString(), _.discordBot.sd.events.ERROR);
      return;
    }
    var str = "```markdown\n";
    str += data +"\n";
    str += "```";
    _.discordMessage.channel.send(str+"");
  });
};

module.exports = Help;
