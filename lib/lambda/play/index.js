const ytdl = require("ytdl-core");
const fs = require("fs");
const artistTitle = require("get-artist-title");

let Play = function(discordBot, discordMessage) {
  this.discordBot = discordBot;
  this.discordMessage = discordMessage;

  this.command = discordBot.getCommand(discordMessage.content);
};

Play.prototype.exec = function() {

  /*
    This is to capture just the `/play`. This will basically restart the queue
    if it has stopped.
  */
  if (this.command.args === "") {
    this.discordBot.playListHandler.handlePlay(this.discordMessage);
    return;
  }

  // determine if it is a youtube video or not.
  let a = isYouTubeLinkValid(this.command.args);
  this.discordBot.sd.show(`Is it a YouTube URL? {${a}}`, this.discordBot.sd.events.INFO);
  if (a === true) {
    // as per request, we're going to include the ability to give the d/l a name
    /*
      Example:

        /play [youttube-link]
        /play [youtube-link] "title"
        /play [youtube-link] "artist > title"

        if no additional args is discovered, we simply carry on like usual,
        testing if it has already been downloaded.

        if additional arguments are found, then we fracture off into
        a new chain.
    */

    let aa = isThereANameRequest(this.command.args);
    console.log(this.command.args);
    if (aa === true) {
      /*
        Okay the user passed in some arguments. We Need to extra them as
        cleanly as possible.
      */
      let bx = this.command.args.split(/\s(.+)/);
      let videoArgs = {
        videoURL: bx[0],
        args: bx[1]
      };

      let x = this.buildArtistTitleFromArgs(videoArgs.args);
      this.isThisYouTubeURLAlreadyDownloaded(videoArgs.videoURL, x);

    } else {
      /*
        Just a Standard YouTube URL. Test Ordinary Path.
      */
      this.discordBot.sd.show("Just a Standard YouTube URL. Test Ordinary Path.", this.discordBot.sd.events.INFO);
      this.isThisYouTubeURLAlreadyDownloaded(this.command.args);
    }

    return;
  }
  // determines if the user requested Artist > title
  let b = isItArtistIntoTitle(this.command.args);
  if (b === true) {
    this.searchArtistIntoTitle(this.command.args);
    return;
  }

  // it is neither a youtube video nor an `Artist > Title`.
  // search for the artist data and play from the AudioHandler Internal.
  let _ = this;
  this.discordBot.dbHandler.find({ $or: [{ artist: {$regex: new RegExp(this.command.args, "i")}}, { title: {$regex: new RegExp(this.command.args, "i")} }] }, (err, docs) => {
    if (err) {
      _.discordBot.sd.show(err, _.discordBot.sd.events.ERROR);
      return;
    }
    /*
      If there are no documents which match the query;
    */
    if (docs.length <= 0) {
      _.discordMessage.reply("There are no songs which match "+ _.command.args);
      return;
    }
    /*
      If the search returns only one document.
    */
    if (docs.length === 1) {
      _.discordBot.sd.show(`Only One File Found With Search Query, "${_.command.args}", => ${docs[0].title}, ${docs[0].artist}`, _.discordBot.sd.events.INFO);
      _.discordBot.playListHandler.queue(docs[0], _.discordMessage);
      // _.discordBot.audioHandler.playFile(this.discordBot.getVoiceConnection(),docs[0].path);
    }
    /*
      If the search returns multiple documents.
    */
    if (docs.length > 1) {
      let str = `**Multiple Songs Found with query __'${_.command.args}'__**\nPlease Review Your Selection\n`;
      let sel = "```";
      let x = 1;
      docs.forEach((item) => {
        sel += ""+x+".  "+item.artist +" - "+ item.title + "\n";
        x++;
      });
      sel += "```";
      _.discordMessage.reply(str);
      _.discordMessage.channel.send(sel);
    }
  });
};


// support functions;

isYouTubeLinkValid = function(str) {
  if (str.includes("youtube.com")) return true;
  return false;
};

isItArtistIntoTitle = function(str) {
  if (str.includes(">")) return true;
  return false;
};

isThereANameRequest = function(s) {
  return (s.split(" ")).length >= 2 ? true : false;
}

Play.prototype.extratArtistTitleFromUserString = function(str) {
  if (str.includes(">")) {
    // there is an artist > title
    return this.buildArtistTitleFromArgs(str);
  } else {
    // there is just a title.
    return str.trim();
  }
};

Play.prototype.buildArtistTitleFromArgs = function(args) {
  if (!args.includes(">")) return args;
  let mArgs = args.split(">");
  if (mArgs.length < 1) return;
  mArgs[0] = mArgs[0].trim();
  if (mArgs.length === 2) mArgs[1] = mArgs[1].trim();
  return {
    artist: mArgs[0],
    title: mArgs[1]
  };
};

Play.prototype.searchArtistIntoTitle = function(args) {
  let at = this.buildArtistTitleFromArgs(args);
  let _ = this;
  console.log(at);
  this.discordBot.dbHandler.find({artist: {$regex: new RegExp(at.artist, "i")}, title: {$regex: new RegExp(at.title,"i")}}, (err, docs) => {
    if (err) {
      _.discordBot.sd.show(err, _.discordBot.sd.events.ERROR);
      return;
    }
    if (docs === null || docs.length <= 0) {
      _.discordBot.sd.show("Artist/Title Combination Has Found A Document: false", _.discordBot.sd.events.INFO);
      _.discordMessage.reply(`No Artist/Title Combination has been found with your query: {A: ${at.artist}, T: ${at.title}}`);
    } else if (docs.length === 1) {
      _.discordBot.sd.show("Artist/Title Combination Has Found A Document: true", _.discordBot.sd.events.INFO);
      _.discordBot.playListHandler.queue(docs[0], _.discordMessage);
    } else {
      _.discordMessage.reply(`Please Refine Your Search. The Query {A: ${at.artist}, T: ${at.title}}, seems to have returned more results than it should've.`);
    }
  });
};

Play.prototype.isThisYouTubeURLAlreadyDownloaded = function(url, optionalArgs) {
  let _ = this;
  this.discordBot.dbHandler.find({video_id: getYTId(url)}, function(err, doc) {
    if (err) {
      _.discordBot.sd.show(err, _.discordBot.sd.events.ERROR);
      return;
    }

    if (doc === null || doc.length <= 0) {
      _.discordBot.sd.show("YouTube URL Was Found In Cache: false", _.discordBot.sd.events.INFO);
      _.discordMessage.reply("The Requested Song Was Not Found In Library, attemping to `fetch`.");
      _.downloadYouTubeAudio(_.command.args, optionalArgs);
      return false;
    } else {
      _.discordBot.sd.show("YouTube URL Was Found In Cache: true", _.discordBot.sd.events.INFO);
      _.discordBot.playListHandler.queue(doc[0], _.discordMessage);
      return true;
    }

  });
};

getYTId = function(url) {
  url = url.replace("http://www.youtube.com/watch?v=", "");
  url = url.replace("http://youtube.com/watch?v=", "");
  url = url.replace("https://www.youtube.com/watch?v=", "");
  url = url.replace("https://youtube.com/watch?v=", "");
  if (url.indexOf("&") > 0) {
    var pos = url.indexOf("&");
    url = url.substr(0, pos-1);
  }
  return url;
};

Play.prototype.downloadYouTubeAudio = async function(url, optionalArgs) {
  let _ = this;
  ytdl.getInfo(url.trim(), null, function(err, info) {
    _.discordBot.sd.show(`Attempting to Download: ${info.title}.`, _.discordBot.sd.events.INFO);
    // we're currently pretending there will be no errors, but put error cehcking here.
    // For the initial builds we'll be sending the raw error data to the console,
    // as well as telling the user why the fuck up.
    // but we should prolly make a better error checker.
    if (err) {
      _.discordBot.sd.show(`There was an error processing ${url}.\n` + err.toString(), _.discordBot.sd.events.ERROR);
      _.discordMessage.reply(err.toString());
      return;
    }

    if (info.length_seconds > _.discordBot.userOptions.song.maxLength.int) {
      _.discordBot.sd.show(`${info.title} is too long of a song to download/stream. Enforces Max Song Length: ${_.discordBot.userOptions.song.maxLength.int}.`, _.discordBot.sd.events.ERROR);
      _.discordMessage.reply(`${info.title} is too long of a song to download/stream. Enforces Max Song Length: ${_.discordBot.userOptions.song.maxLength.int}.`);
      return;
    }

    // @TODO
    // this will fail with most japanese titles, Korean Titles are little more forgiving.
    // for now we will simply use the video title for both artist and title.
    // also quick notes, most music videos use the standard English format
    // Title - Artist or some variation
    /********************************************************************
      THE FOLLOWING IS PURELY FOR FUNCTION ONLY. THIS HAS TO BE REWRITTEN.
    ********************************************************************/
    var artist = "", title ="";
    let at = artistTitle(info.title);
    if (at === undefined) {
      // artist should be the channel name if we can't extract it from the title.
      artist = info.title;
      title = info.title;
    } else {
      //  @TODO
      // this needs to be changed as well.
      [artist, title] = artistTitle(info.title);
      // artist = at[0];
      // title = at[1];
    }
    /********************************************************************
      THE PRECEEDING IS PURELY FOR FUNCTION ONLY. THIS HAS TO BE REWRITTEN.
    ********************************************************************/


    /*
      Here we're going to evaluate what the user passed into the function.
    */
    if (optionalArgs != null || optionalArgs != undefined) {
      if (typeof optionalArgs === "object") {
        artist = optionalArgs.artist;
        title = optionalArgs.title;
      } else {
        title = optionalArgs;
      }
    }

    _.discordBot.dbHandler.insert({
      artist: artist,
      title: title,
      path: "audio/"+info.video_id+".ogg",
      uploader: info.author,
      keywords: info.keywords,
      video_id: info.video_id,
      video_title: info.title
    });

    ytdl(url, {quality: "highestaudio"}).pipe(fs.createWriteStream("audio/"+info.video_id+".ogg")
    .on("close", function() {
      _.discordBot.sd.show("Audio Data Saved Sucessfully to /audio/"+info.video_id+".ogg", _.discordBot.sd.events.INFO);
      _.discordBot.dbHandler.find({video_id: info.video_id}, (err, doc) => {
        if (err) {
          _.discordBot.sd.show(err, _.discordBot.sd.events.ERROR);
          return;
        }
        _.discordBot.playListHandler.queue(doc[0], _.discordMessage);
      });
    }));

  });

};

module.exports = Play;
