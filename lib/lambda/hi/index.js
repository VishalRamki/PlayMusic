let HelloFunction = function(discordBot, discordMessage) {
  this.discordBot = discordBot;
  this.discordMessage = discordMessage;
};

HelloFunction.prototype.exec = function() {
  this.discordMessage.channel.send("Hello!")
    .catch(function(err) {
      str = "Unable to send you the list because you cannot receive DMs.";
      if(err != "DiscordAPIError: Cannot send messages to this user")
        console.log(err);
      })
    .then(function() {
      console.log("User informed.");
    });
};

module.exports = HelloFunction;
