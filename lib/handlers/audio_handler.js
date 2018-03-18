let AudioHandler = function() {
  this.events = {
    REQUESTED_STOP: -1,
    NORMAL_STOP: 0
  };
};

AudioHandler.prototype.stop = function(dispatcher, event = this.events.NORMAL_STOP) {
  dispatcher.end(event);
};

AudioHandler.prototype.pause = function(dispatcher) {
  dispatcher.pause();
};

AudioHandler.prototype.playFile = function(voiceConnection, filePath) {
  voiceConnection.channel.connection.playFile(filePath);
};


module.exports = AudioHandler;
