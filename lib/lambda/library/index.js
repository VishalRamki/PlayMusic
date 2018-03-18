
let Library = function(discordBot, discordMessage) {
  this.discordBot = discordBot;
  this.discordMessage = discordMessage;

  this.command = discordBot.getCommand(discordMessage.content);

  this.maxPageSize = this.discordBot.userOptions.library.maxPageSize;
};

Library.prototype.exec = function() {
  let libArgs = this.extractCommand(this.command.args);
  let _ = this;
  /*
    Someone Just requested the entire fucking library.
    THE.WHOLE.THING.
    Positively.Brutal.
  */


  if (libArgs <= 0) {
    /*
      now we need to make a few considerations. We obviously can't send across the
      entire database at once. I also refuse to write this code more than I need to.
      The first twenty times was enough.

      So we'll just create a helper function that pulls the documents between
      n1 and n2.

      For libArgs <= we'll assume its like document 0 to 15 or some shit.

      With 15 being the page size.
    */

    _.discordBot.dbHandler.countHandler((err, count) => {
      _.getLibraryAfterHelper(0, 0, count);
    });

    return;
  }

  if (libArgs[0] === 'pg') {
    let requestedPg = parseInt(libArgs[1]) - 1;

    /*
      I Ended up having to repeat code anyway. Fuck.
      Do I look like a rePEAter??
    */
    _.discordBot.dbHandler.countHandler((err, count) => {
      _.getLibraryAfterHelper(requestedPg,requestedPg*_.maxPageSize, count);
    });
    return;
  }


};

Library.prototype.getLibraryAfter = function(n1, cb) {
  if (n1 <= 0) {
    // we'll assume that there is no skipping if n1 is 0.
    this.discordBot.dbHandler.findWithSortAndLimit({}, {artist: 1, title: 1}, this.maxPageSize, (err, docs) => cb(err, docs));
  } else if (n1 > 0) {
    // okay so n1 is clearly additional pages into the library.
    this.discordBot.dbHandler.findWithSortAndLimitAndSkip({}, {artist: 1, title: 1}, this.maxPageSize, n1, (err, docs) => cb(err, docs));
  }
};

Library.prototype.getLibraryAfterHelper = function(pg, val, total) {
  this.getLibraryAfter(val, (err, docs) => {
    if (err) {
      console.log(err);
      this.discordMessage.channel.send(err);
      return;
    }

    if (docs.length <= 0) {
      this.discordMessage.channel.send("``` There is nothing left in the Library. ```");
      return;
    }
    var fields = [];
    docs.forEach(function(item) {
      fields.push({
        name: item.artist,
        value: item.title
      });
    });
    this.discordMessage.channel.send({embed: {
        color: 3447003,
        title: 'Music Library',
        description: "",
        fields: fields,
        // timestamp: new Date(),
        footer: {
          // icon_url: client.user.avatarURL,
          text: `Page ${pg+1}/${Math.ceil(total/this.maxPageSize)}`
        }
      }
    });
  });
}

Library.prototype.extractCommand = function(str) {
  let etc = str.split(" ");
  return etc;
};

module.exports = Library;
