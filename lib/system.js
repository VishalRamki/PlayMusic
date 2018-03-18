const fs = require("fs");

let System = function(options) {
  this.discordClient = options.discordClient;
  this.userOptions = options.userOptions;
  this.lambda_data = {};
  this.externallyBoundCommands = {};


  this.dbHandler = new (require("./handlers/database_handler.js"))(this);
  this.audioHandler = new (require("./handlers/audio_handler.js"))(this);
  this.playListHandler = new (require("./handlers/playlist_handler.js"))(this);
  this.sd = new (require("./handlers/systemdisplay_handler.js"))(this);


};


System.prototype.receiveMessage = function(discordMessage) {
  // are we listening globally on the server for messages?
  console.log(this.userOptions.discord.listenOnOneTextChannel);
  if (this.userOptions.discord.listenOnOneTextChannel === true) {
    // only one channel;
    this.sd.show("Bot is listening on only one channel.", this.sd.events.INFO);
    this.confirmChannelAndExec(discordMessage);
  } else {
    // listen globally;
    this.sd.show("Bot is listening globally.", this.sd.events.INFO);
    this.executeCommand(discordMessage);
  }
};

System.prototype.confirmChannelAndExec = function(discordMessage) {
  let _ = this;
  if (this.allowedChannel(discordMessage.channel.id, discordMessage.channel.name) === true) {
    // execute command;
    /*
      this is to make sure no lambda's or handlers need to account for case senstivity.
    */
    // discordMessage.content = discordMessage.content.toLowerCase();
    // LOL I fucked the entire bot because i forget YouTube Urls is Case-sensetive.
    this.executeCommand(discordMessage);
  }

  if (this.allowedChannel(discordMessage.channel.id, discordMessage.channel.name) === false && this.isCommand(discordMessage.content) === true) {
    /*
      This is required by discord.js
    */
    discordMessage.author.send("Please Use the Channel that has been put aside for the bot: <#"+this.userOptions.discord.tChannel.id+">")
      .catch(function(err) {
        str = "Unable to send you the list because you cannot receive DMs.";
        if(err != "DiscordAPIError: Cannot send messages to this user")
          _.sd.show(err, _.sd.events.ERROR);
        })
      .then(function() {
        console.log("User informed.");
      });
  }
};

System.prototype.allowedChannel = function(id, name) {
  if (this.userOptions.discord.tChannel.connectBy === "name" &&
      this.userOptions.discord.tChannel.name === name) return true;
  else if (this.userOptions.discord.tChannel.connectBy === "id" &&
           this.userOptions.discord.tChannel.id === id) return true;
  return false;
};

System.prototype.executeCommand = function(discordMessage) {
  if (!this.isCommand(discordMessage.content)) return;
  let cmd = this.getCommand(discordMessage.content);
  this.sd.show(`Attemping to Execute Command: ${cmd.command}`, this.sd.events.INFO);
  // console.log(this.externallyBoundCommands[cmd.command]);

  if (this.externallyBoundCommands[cmd.command] != undefined && cmd.command in this.externallyBoundCommands) {
    this.sd.show(`Command ${cmd.command} is now executing from External Handler.`, this.sd.events.INFO);
    let c = this.externallyBoundCommands[cmd.command];
    c.obj[c.fn](discordMessage, cmd);
    return;
  }
  this.sd.show(`Command ${cmd.command} doesn't exist as a bound function`, this.sd.events.WARN);
  // it wasn't bound on boot, so it means it is a lambda function

  if (fs.existsSync("./lib/lambda/"+cmd.command+"/index.js") === true) {
    this.sd.show(`Command ${cmd.command} is now executing from Lambda Function.`, this.sd.events.INFO);
    let CommandStructure = require("./lambda/"+cmd.command+"/index.js");
    let commandBuilder = new CommandStructure(this, discordMessage);
    commandBuilder.exec();
    return;
  }

  this.sd.show(`Command ${cmd.command} doesn't exist as a lambda`, this.sd.events.WARN);
};

System.prototype.clientReady = function() {
  if (this.userOptions.discord.vChannel.connectBy === "name") {
    this.GetChannelByName(this.userOptions.discord.vChannel.name).join();
  } else if (this.userOptions.discord.vChannel.connectBy === "id") {
    this.GetChannelByID(this.userOptions.discord.vChannel.id).join();
  }
  this.sd.show("Client has Connected.", this.sd.events.INFO);
};

System.prototype.isCommand = function(msg) {
  return (msg[0] === this.userOptions.discord.cmd_prefix) ? true : false;
};

System.prototype.getCommand = function(msg) {
  var i = 0;
  while (msg[i] != ' ' && i <= msg.length) i++;
  return {
    command: msg.substr(1, i).toLowerCase().trim(),
    args: msg.substr(i+1, msg.length).trim(),
    length: {
      cmd: i,
      full: msg.length
    }
  };
};

System.prototype.bind = function(key, v) {
  let _ = this;;
  if (Array.isArray(key)) {
    key.forEach((item) => {
      _.externallyBoundCommands[item] = {
        obj: v.obj,
        fn: v.fn
      };
    });
  } else {
    this.externallyBoundCommands[key] = {
      obj: v.obj,
      fn: v.fn
    };
  }

};

System.prototype.GetChannelByName = function(name) {
    return this.discordClient.channels.find(val => val.name === name);
};

System.prototype.GetChannelByID = function(id) {
    return this.discordClient.channels.find(val => val.id === id);
};

System.prototype.getVoiceConnection = function() {
  return this.discordClient.voice.connections.first();
};

System.prototype.getDispatcher = function(vc) {
  return vc.channel.connection.player.dispatcher;
};

module.exports = System;
