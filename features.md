# Feature List

## Support Functions

`/help` - displays this file.

## Library Functions

`/library` - Displays the first x entries of the library which is sorted in alphabetical order.
`/library pg #` - Displays the next # * x entries in the library sorted in alphabetical order.

## Playlist Features

`/whatplaying` - Displays the current song that the bot is serving.
`/queue` - displays the list of songs that have been queued up to play.
`/playlist` - an alias for `/queue`. For User Semantic purposes.
`/next` - stops the current song and goes to the next song on the playlist.
`/stop` - stops the song, but keeps the queue. Must use `/play` to begin the queue once again.

## Play Features

`/play '[title] or [artist]'` - will search the library for a song that matches query it was given. If it finds multiple entries, it will list the entries for the user to decide what it wants to listen to.

`/play [youtube-url]` - will search the library for a song matching its youtube id. If not is found it will fire off an event to download the youtube audio and automatically queue it up once it has been completed.

`/play [youtube-url] [title] or [artist] > [title]` will download a youtube like and set its respective artist/title as defined.

`/play [artist] > [title]` - will play the song by the artist you've specified. This is done in case there are multiple songs to choose from.
