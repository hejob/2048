function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.exchangeContainer= document.querySelector(".exchange-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
  this.exchange = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    self.updateExchange(metadata.exchange);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateExchange = function (exchange) {
  this.clearContainer(this.exchangeContainer);

  var difference = exchange - this.exchange;
  this.exchange = exchange

  this.exchangeContainer.textContent = this.exchange;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.exchangeContainer.appendChild(addition);
  } else if (difference < 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "-" + (-difference);

    this.exchangeContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.startExchange = function () {
  this.addClassToWrapper(this.exchangeContainer, "exchange-mode");
}

HTMLActuator.prototype.cancelExchange = function () {
  this.removeClassFromWrapper(this.exchangeContainer, "exchange-mode");
  this.removeClass(".tile", 'tile-exchange');
}

HTMLActuator.prototype.getClasses = function(element) {
  var classtext = element.getAttribute("class");
  if (classtext.trim().length == 0) {
    return [];
  }
  return classtext.trim().split(/\s+/);
}

HTMLActuator.prototype.addClassToWrapper = function(wrapper, classWord) {
//this: wrapper div;  classWord: single word
/////classWord should have been trimmed
  var classes = this.getClasses(wrapper);
  //add if not in array
  var classLabel = "";
  var included = false;
  for (var i=0; i<classes.length; i++) {
    if (classWord === classes[i]) {
      included = true;
    }
    classLabel += " " + classes[i];
  }
  if (!included) {
    classLabel += " " + classWord;
  }
  //this.applyClasses(wrapper, classes);
  wrapper.setAttribute("class", classLabel);
}

HTMLActuator.prototype.removeClassFromWrapper = function(wrapper, classWord) {
//this: wrapper div;  classWord: single word
/////classWord should have been trimmed
  var classes = this.getClasses(wrapper);
  //add if not in array
  var classLabel = "";
  for (var i=0; i<classes.length; i++) {
    if (classWord !== classes[i]) {
      classLabel += " " + classes[i];
    }
  }
  //this.applyClasses(wrapper, classes);
  wrapper.setAttribute("class", classLabel);
}

HTMLActuator.prototype.addClass = function(selector, classWord) {
  var wrappers = document.querySelectorAll(selector);
  for(var i=0; i<wrappers.length; i++) {
    this.addClassToWrapper(wrappers[i], classWord);
  }
}

HTMLActuator.prototype.removeClass = function(selector, classWord) {
  var wrappers = document.querySelectorAll(selector);
  for(var i=0; i<wrappers.length; i++) {
    this.removeClassFromWrapper(wrappers[i], classWord);
  }
}

HTMLActuator.prototype.getTileByWrapper = function(grid, wrapper) {
  //give the selected tile wrapper, get tile object by it's class (xy position)
  var classText = wrapper.getAttribute("class");
  if (!classText) {
    return false;
  }
  var matches = classText.match(/\btile-position-(\d)-(\d)\b/);
  if (matches && matches.length>0) {
    var x = parseInt(matches[1])-1;
    var y = parseInt(matches[2])-1;
    return grid.cells[x][y];
  }
  return false;
}