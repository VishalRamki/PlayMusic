let PlayListHandler = function(opts) {
  this.discordClient = opts.discordClient;
  this.sys = opts;
  this.playlistItems = [];
  this.playlistHead = null;

  this.playListEvents = {
    END_BY_NEXT: 100,
    USR_STOPPED: 200
  };

  // audio handling on behalf of audio_handler
  this.isPlaying = false;

  // bind special functions;
  this.sys.bind(["queue", "playlist"], {
    obj: this,
    fn: "showQueue"
  });

  this.sys.bind("whatplaying", {
    obj: this,
    fn: "whatPlaying"
  });

  this.sys.bind("next", {
    obj: this,
    fn: "next"
  });

  this.sys.bind("stop", {
    obj: this,
    fn: "stop"
  });

};

PlayListHandler.prototype.queue = function(doc, discordMessage) {
  this.playlistItems.push(doc);
  discordMessage.channel.send(`**${doc.title}** has been queued.`);
  this.handlePlay(discordMessage);
};

PlayListHandler.prototype.showQueue = function(discordMessage, parsedCommand) {
  let str = "";
  if (this.playlistHead != null) {
    str += "__**Currently Playing**__ :: "+ this.playlistHead.title + " by " + this.playlistHead.artist;
  }
  if (this.playlistItems.length > 0) {
    str += "```";
    for (let i = 0; i < this.playlistItems.length; i++) {
      str += (i+1) + ". " + this.playlistItems[i].title + " - " + this.playlistItems[i].artist + "\n";
    }
    if (this.playlistItems <= 0) {
      str += "There is nothing queued.";
    }
    str += "```";
  }
  if (this.playlistHead === null || this.playlistItems <= 0) {
    str += "``` Nothing is currently queued/playing. ```";
  }
  discordMessage.channel.send(str);
};

PlayListHandler.prototype.whatPlaying = function(discordMessage, parsedCommand) {
  if (this.playlistHead === null) {
    discordMessage.reply("There is currently nothing playing.");
    return;
  }
  discordMessage.reply("__**Currently Playing**__ :: "+ this.playlistHead.title + " by " + this.playlistHead.artist);
};

PlayListHandler.prototype.next = function(discordMessage, parsedCommand) {
  if (this.playlistItems.length > 0) {
    let d = this.sys.getDispatcher(this.sys.getVoiceConnection());
    d.end();
  } else {
    discordMessage.reply("Cannot skip track as there are no tracks queued. ");
  }
};

PlayListHandler.prototype.stop = function(discordMessage, parsedCommand) {
  if (this.isPlaying === true) {
    let dispatcher = this.sys.getDispatcher(this.sys.getVoiceConnection());
    dispatcher.end(this.playListEvents.USR_STOPPED);
  }
};

PlayListHandler.prototype.handlePlay = function(discordMessage) {
  if (this.playlistItems.length <= 0){
    discordMessage.channel.send("There is nothing to play.");
    return;
  }
  if (this.playlistHead === null && this.isPlaying === false) {
    // there is nothing queued up, and nothing is being played.
    if (this.playlistItems.length > 0) this.playlistHead = this.playlistItems.pop();

    if (this.playlistHead != null) {
      this.sys.audioHandler.playFile(this.sys.getVoiceConnection(),this.playlistHead.path);
      // console.log(this.playlistHead);
      console.log(`${this.playlistHead.title} is now playing.`);
      discordMessage.channel.send('**'+ `${this.playlistHead.title}`+'**'+` is now playing.`);
      this.isPlaying = true;
    }
    /*
      This was previously outside this if statement. It resulted in the end event,
      being triggered multiple times and eventually crashing.
    */
    let dispatcher = this.sys.getDispatcher(this.sys.getVoiceConnection());

    let _ = this;
    /*
      VoiceChannels 'end' event.
    */
    dispatcher.on("end", (reason) => {
      if (_.sys.userOptions.playlist.infoDone === true) {
        console.log("Song has finished");
        if (_.playlistHead != null) discordMessage.channel.send(`**${_.playlistHead.title}** has ended.`);
      }

      _.isPlaying = false;
      _.playlistHead = null;
      if (_.playlistItems.length > 0 && !(reason === _.playListEvents.USR_STOPPED)) {
      // it means there are more songs queued up.
      _.handlePlay(discordMessage);
      }
    });
  }
};


module.exports = PlayListHandler;
