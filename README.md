# Animal Coding

This is a turn-based multiplayer game designed to introduce basic text-based programming concepts.

![Animal Coding gameplay: four animals on a farm stage with the code editor on the right](images/screenshot.png)

[Play the Game Here](https://withhawaii.github.io/animalcoding/)

> **Note:** Best played on a laptop or desktop computer with a keyboard. The game is not designed for phones or tablets.

***

## About The Project

Up to four players take turns controlling their animals with code. Your mission is to collect as many coins and gems as possible. 
The stage ends once all coins and gems have been collected or every player reaches the turn limit. 
After the stage concludes, the final scores are compared to determine the winner.

This game was developed as part of my dissertation research. A link to the associated academic publication will be provided once it is available.

### Getting Started

On the title screen, click **Config**, enter the player names, and click **OK**. If you have fewer than four players, leave the remaining name fields blank.

When you’re ready, click **Start** to begin the game.

### Stages and Play Time

Each stage begins with a short introduction video. Plan for **60-70 minutes** to play through all four stages.

| Stage | Topic | Commands Introduced | Play Time |
| :--- | :--- | :--- | :--- |
| 1 | Commands (*sequence*) | `move_forward()`, `turn_left()`, `turn_right()`, `pick_up()` | 10-15 minutes |
| 2 | Loops (*iteration*) | `eat()`, `for` loops | 10-15 minutes |
| 3 | Conditional Statements (*selection*) | `if (path_ahead)`, `if (path_to_the_left)`, `if (path_to_the_right)` | 10-15 minutes |
| 4 | Functions | `steal()`, `function` | 30+ minutes |

### Technical Recommendations

| Feature | Status / Recommendation |
| :--- | :--- |
| **Device Compatibility** | Currently does not function optimally on iPads. |
| **Browser** | Tested with Mozilla Firefox, Google Chrome, and Safari. |

Have fun coding your way through the adventure!

***

## Notes for Educators

To use this project in your classroom, you need to form a group of 2-4 students. Each group should share a PC or a laptop to play a game together.
Each student controls one of the animals with code.

### Who Is This For?

The current version of the game is designed to introduce **text-based programming** to **secondary and higher education students**. Animal Coding works well:

- For fun events such as [Computer Science Education Week](https://www.csedweek.org).
- As a first experience with text-based programming for students who have already used block-based programming.
- To reinforce what students have learned in a block-based programming environment.

For younger students, the [Computer Science Teachers Association (CSTA) Standards](https://csteachers.org/k12standards/) recommend block-based programming (e.g., [Code.org](https://code.org) or [Scratch](https://scratch.mit.edu)) to introduce basic programming concepts first.

A block-based version of the game is planned for the future.

***

## Credits

This project is built with the following open-source libraries and third-party assets:

| Name | Author | Type | License / Terms |
| :--- | :--- | :--- | :--- |
| [Phaser](https://phaser.io) | Phaser Studio Inc. | Library (game engine) | MIT |
| [Ace](https://ace.c9.io) | Ajax.org B.V. | Library (code editor) | BSD-3-Clause |
| [Blockly](https://developers.google.com/blockly) | Google / Raspberry Pi Foundation | Library (block editor) | Apache-2.0 |
| [JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter) | Neil Fraser | Library (runs player code) | Apache-2.0 |
| [Acorn](https://github.com/acornjs/acorn) | Marijn Haverbeke | Library (JavaScript parser, bundled with JS-Interpreter) | MIT |
| [NES.css](https://nostalgic-css.github.io/NES.css/) | B.C.Rikko | Library (UI components) | MIT |
| [Farm, Puzzle & Animals graphics pack](https://comigo.itch.io/farm-puzzle-animals) | [CoMiGo](https://comigo.itch.io/) | Graphics | CC0 (Public Domain) |
| Platformer Autumn Game Tileset | [CraftPix.net](https://craftpix.net) | Graphics | [CraftPix Free License](https://craftpix.net/file-licenses/) |
| [Springin' Sound Stock](https://www.springin.org/sound-stock/) | Shikumi Design Inc. | Audio | [Springin' Sound Stock Terms of Use](https://www.springin.org/sound-stock/guideline/) |
| [TK's Free Sound FX](https://taira-komori.net/freesounden.html) | Taira Komori | Audio | Free sound effects |
| [8BITSOUNDS](https://sounds.udonko.net/) | UDONKONET | Audio | Free for commercial and non-commercial use |
| [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) | CodeMan38 | Font | OFL-1.1 |

These libraries and assets remain the property of their respective owners and are not covered by this project's CC BY-NC-SA license.

***

## License

This project is licensed under the terms of the [CC BY-NC-SA (Attribution-NonCommercial-ShareAlike) 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

If you are interested in using this project for commercial purposes, please contact [info@thinkology.ac](mailto:info@thinkology.ac) to discuss commercial licensing options.

© 2024-26 Thinkology LLC.