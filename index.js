const Discord = require("discord.js");
const UserOptions = require("./settings.json");
const BotSystem = require("./lib/system.js");




let client = new Discord.Client();
let discordBot = new BotSystem({
  discordClient: client,
  userOptions: UserOptions
});
// Client Data beyond here;
/*

  This is all that should be here.

*/

client.on('ready', () => {
  discordBot.clientReady();
});

client.on("error", err => {
    console.log("There has been an error Initializin the client.");
    console.log(err);
});

client.on("message", message => {
  // pass the message over to the bot, so that the bot can perform the actions;
  // it needs to.
  discordBot.receiveMessage(message);
});

client.login(UserOptions.discord.bot_token);
