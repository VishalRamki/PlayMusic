# PlayMusic

## Introduction

PlayMusic is a single-guild, self-hosted, YouTube Music Bot for the Discord platform. It is built on Discord.JS, it is a complete rewrite of the original bot. [PlayMusic-Legacy](https://github.com/VishalRamki/PlayMusic-Legacy) is left up for archival purposes.

This iteration of the bot brings a host of new features, including a smoother setup for users and a plugin system that is still in its alpha/beta stages but it is how features and functions where added to the bot to begin with.

Again, like the previous bot, it isn't as feature complete as other bots you'll find on the internet, but I try to keep it simple to use, simple to setup, and easy to extend and modify to match your guilds preferences.

## Developers Note

This is a complete rewrite, as such there are still bugs hidden across all of the systems. Extending the Bot still requires users to touch more code than they should, and I'll be working on improving that going forward. I'll keep this package as `0.0.1`, however I will consider this build, v0.3A. This is the third instance of the rebuild, and it still is in alpha.

## Installation

### Before you install

Please ensure you have FFMPEG installed to your $PATH. `node-ytdl-core` depends on FFMPEG to store and transcode the audio data.

I also use `yarn` for most of my projects, but you can use `npm` if you want. So ensure `yarn` is installed and accessible if you intend to use it.

`node-gyp` also needs to be installed globally as well.

#### Linux

For Linux you'll need the build tools, which you can get with `sudo apt-get install build-essential`.

#### Windows

These Windows Dependencies are a little sketch, as I primary code on a Windows, but I have so much things already setup from previous projects.

You'll need to get Visual Studio and Python 2.7.

You won't actually need the full fat Visual Studio, just the compiler for `node-gyp` to work.

### Install

1. Clone the Repo: `git clone https://github.com/VishalRamki/PlayMusic.git`
2. `yarn install` or `npm install`
3. `node setup.js` - this will check PlayMusic dependencies such as folder structure and $PATH.
4. `node index.js` or `npm start` will launch the bot.

## Development Note

Uses Yarn.

## For Developers

One of the things I wanted to do with this rebuild was incorporate some kind of plugin system, which would let developers quickly extend the function of the bot to match their needs. With this initial rebuild release, I've gotten it to a place that seems easy enough to extend. I use this primarily to extend the PlayMusic feature set. It also helps me keep the bot's files manageable.

### Defining Internal Conventions.

#### Lambda

For internal use, a `Lambda` function is used to control and interact with the user via stateless data. For example, say the user requests `/library`.  This is a lambda function because the function doesn't change or modify any information __**directly**__. That word `directly` is important. A Lambda function can issue a data change/save as evident by `/play` but in most cases once it runs it doesn't store any of its 'session' data. The next time it is called it can function without knowing any information about its previous state.

#### Handlers

Handlers on the other hand, require access to its previous state. This is the case of `/playlist` which needs to track the playlist, the queue, and additional information. It can expose additional commands and instructions for the bot to use. This is why `Handlers` are loaded when the bot itself loads up, it creates an initial state and then provides itself to the lambda functions if necessary. In most cases `Handlers` can function without loading a seperate lambda function by making use of the `System#bind()` function.

### Plugin Structure

'Plugins' as I'm calling them are the commands that are executed when you send the bot a command. For example, you write a plugin to reply 'Hello World' when someone requests the '/hello' command.

Plugins are stored inside the `./lib/lambda` folder. Each folder is a function. So to create our `/hello` example. We would first need to create a folder with the name `hello`. Now when the bot receives a request for `/hello` it will look and determine if `./lib/lambda/hello/index.js` exists. If it does it will load the javascript file and run the function `exec()`.

Here's an example of `index.js`

```js
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
```

As you can see it is modelled after NodeJS own modules, as it loads the plugins as Node Modules internally. Every Plugin Instance will be give access to the current message object as well as the bot object. `exec()` must be included as this is the function that is called internally to fire off your function. These are primarily used for one off functions or instances.

If you require your plugin to have access to 'memory', you'll need to create a handler for your plugin. The Handlers are loaded in when the main bot is created and it sits, with all of your plugins persistence data, as a variable accessible to both your own plugin interface as well all the other plugins as well.

## License

Developed By VishalRamki. Released Under the MIT License.
