# collaborative-artificial-life

A real-time collaborative version of the Conway's Game of Life. Optimized for speed, can easily update and show boards of 256 x 256 cells in less than 10 ms. Every single user that loads the website will see and interact exactly the same cell board.

![](http://adelriosantiago.com/articles/images/alife-final-animated.gif)

See the demo at: [tts.adelriosantiago.com](http://tts.adelriosantiago.com)

##### Follow these steps to run your own cell board:

 - Install node (tested on v0.11.16)
 - Do `git clone` the project
 - Do `npm install` to get the dependencies
 - Do `npm start` to run (it already starts with *forever*)
 - Browse *localhost:8998*

##### Known bugs:

 - Drawing cells will not work properly on some mobiles... It is either speed or usability as the board is entirely made on a single ASCII string.
 - Labels are not erased when changing names, refresh the page to erase them.