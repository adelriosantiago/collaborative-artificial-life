# collaborative-artificial-life

A real-time collaborative version of the Conway's Game of Life. Optimized for speed, can easily update and show boards of 256 x 256 cells in less than 10 ms. Every single user that loads the website will see and interact exactly the same cell board.

![](http://adelriosantiago.com/articles/images/alife-final-animated.gif)

Read the theory at: [http://www.adelriosantiago.com/gitblog/artificial](http://www.adelriosantiago.com/gitblog/artificial)

See the demo at: [http://www.adelriosantiago.com:7000](http://www.adelriosantiago.com:7000)

##### Follow these steps to run your own cell board:

 - Install node (tested on v0.10.34)
 - Do `git clone` the project
 - Do `npm install` to get the dependencies
 - Install [forever](https://www.npmjs.com/package/forever) globally with `npm install -g forever`
 - Do `npm start` to run (it already starts with *forever*)
 - Browse *localhost:7000*
 

##### Known bugs:

 - Drawing cells will not work properly on some mobiles... It was either speed or usability as the board is entirely made on a single ASCII string.
 - Labels are not erased when changing names, refresh the page to erase them.
