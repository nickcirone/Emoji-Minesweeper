$(document).ready(function() {
    resetField();
    $("#reset").click(resetField);
})

var minesPlaced = 0;
var x = $('#X').val();
var y = 8;
var mineAmt = 8;
var field = $('#minefield');
var mineCoordinates = [];
var adjacentMineAmounts = [];
var alreadyRevealed = [];
var flaggedSpaces = [];
var start;
var timeNow;
var indexCounter = 0;
var won = false;
var lost = false;
var stopwatch;

function resetField() {
    lost = false;
    won = false;
    x = $('#X').val();
    y = $('#Y').val();
    mineAmt = $('#mineAmt').val();
    field = $('#minefield');
    minesPlaced = 0;
    field.empty();
    adjacentMineAmounts = [];
    alreadyRevealed = [];
    flaggedSpaces = [];
    start = new Date();

    stopwatch = setInterval(function() {
        timeNow = Math.floor((new Date - start) / 1000);
        $('.timer').text("time: " + timeNow + " seconds");
    }, 1000);

    $('.minesRemaining').text("mines remaining: " + mineAmt);


    if (x > 40) {
        alert("Minefield width can be no longer than 40.\n Width has been set to 40.");
        x = 40;
    }
    if (x < 8) {
        alert("Minefield width can be no less than 8.\n Width has been set to 8.");
        x = 8;
    }
    if (y > 30) {
        alert("Minefield height can be no longer than 30.\n Height has been set to 30.");
        y = 30;
    }
    if (y < 8) {
        alert("Minefield height can be no less than 8.\n Height has been set to 8.");
        y = 8;
    }
    if (mineAmt > (x*y)-1) {
        alert("Minefield must contain at least one non-mine space.\nAutomatically set to " + (x*y)-1 + ".");
        mineAmt = (x*y)-1;
    }
    if (mineAmt < 1) {
        alert("Minefield must contain at least one mine.\nAutomatically set to 1.")
    }

    for (var i = 0; i < y; i++) {
        var tr = "<tr>";
        for (var j = 0; j < x; j++) {
            tr += "<td><button id=" + "'" + j +"_"+ i + "'" + " onclick='buttonClick(event, this.id)'>⬛</button><td>";
            adjacentMineAmounts.push([[j,i], 0]);
        }
        tr += "</tr>";
        field.append(tr);
    }
    setMines();
}

function setMines() {
    mineCoordinates = [];
    while (minesPlaced < mineAmt) {
        var currMineX = getRandomInt(0, x-1);
        var currMineY = getRandomInt(0, y-1);
        if (arrayContainsArray(mineCoordinates, [currMineX, currMineY])) {
            continue;
        }
        var buttonId = currMineX + "_" + currMineY;
        var currButton = $('#'+buttonId);
        //currButton.append("!");
        mineCoordinates.push([currMineX, currMineY]);
        setAdjacencies(currMineX, currMineY);
        minesPlaced += 1;
    }
    console.log(mineCoordinates);
}

function setAdjacencies(mineX, mineY) {
    var boxColumnStart = mineX-1;
    var boxColumnEnd = mineX+1;
    var boxRowStart = mineY-1;
    var boxRowEnd = mineY+1;
    if (mineX === 0) {
        boxColumnStart = mineX;
    }
    if (mineX === x-1) {
        boxColumnEnd = mineX;
    }
    if (mineY === 0) {
        boxRowStart = mineY;
    }
    if (mineY === y-1) {
        boxRowEnd = mineY;
    }
    for (var i = boxRowStart; i <= boxRowEnd; i++) {
        for (var j = boxColumnStart; j <= boxColumnEnd; j++) {
            for (var k = 0; k < adjacentMineAmounts.length; k++) {
                if (compareTwoArrays(adjacentMineAmounts[k][0], [j, i])) {
                    adjacentMineAmounts[k][1] += 1;
                }
            }
        }
    }
}

function clearAdjacentZeroes(currX, currY) {
    var boxColumnStart = currX-1;
    var boxColumnEnd = currX+1;
    var boxRowStart = currY-1;
    var boxRowEnd = currY+1;
    if (currX === 0) {
        boxColumnStart = currX;
    }
    if (currX === x-1) {
        boxColumnEnd = currX;
    }
    if (currY === 0) {
        boxRowStart = currY;
    }
    if (currY === y-1) {
        boxRowEnd = currY;
    }
    for (var i = boxRowStart; i <= boxRowEnd; i++) {
        for (var j = boxColumnStart; j <= boxColumnEnd; j++) {
            for (var k = 0; k < adjacentMineAmounts.length; k++) {
                if (i === currY && j === currX) {
                    continue;
                }
                if (compareTwoArrays(adjacentMineAmounts[k][0], [j, i]) && !(arrayContainsArray(mineCoordinates, [j, i]))) {
                    var buttonId = j + "_" + i;
                    var currButton = $('#'+buttonId);
                    if (adjacentMineAmounts[k][1] === 0 ) { // adjacentMineAmounts[k][1] === 0
                        if (!(arrayContainsArray(alreadyRevealed, [j, i]))) {
                            currButton.empty();
                            currButton.append("⬜");
                            alreadyRevealed.push([j, i]);
                            clearAdjacentZeroes(j, i);
                        }
                    } else {
                        if (!(arrayContainsArray(alreadyRevealed, [j, i]))) {
                            currButton.empty();
                            currButton.append(getNumberEmoji(adjacentMineAmounts[k][1]));
                            alreadyRevealed.push([j, i]);
                        }
                    }
                }
            }
        }
    }
}

function clearUnflaggedSpaces(currX, currY, buttonId, currAdjMines) {
    var boxColumnStart = currX-1;
    var boxColumnEnd = currX+1;
    var boxRowStart = currY-1;
    var boxRowEnd = currY+1;
    var button = $('#'+buttonId);

    if (currX === 0) {
        boxColumnStart = currX;
    }
    if (currX === x-1) {
        boxColumnEnd = currX;
    }
    if (currY === 0) {
        boxRowStart = currY;
    }
    if (currY === y-1) {
        boxRowEnd = currY;
    }
    var flagCount = 0;

    for (var i = boxRowStart; i <= boxRowEnd; i++) {
        for (var j = boxColumnStart; j <= boxColumnEnd; j++) {
            var currentId = j + "_" + i;
            if (arrayContainsArray(flaggedSpaces, currentId)) {
                flagCount++;
            }
        }
    }

    if (flagCount === currAdjMines) {
        for (var i = boxRowStart; i <= boxRowEnd; i++) {
            for (var j = boxColumnStart; j <= boxColumnEnd; j++) {
                if (!arrayContainsArray(alreadyRevealed, [j, i])) {
                    for (var k = 0; k < adjacentMineAmounts.length; k++) {
                        var buttonId = j + "_" + i;
                        var currButton = $('#'+buttonId);
                        if (i === currY && j === currX) {
                            continue;
                        }
                        if (compareTwoArrays(adjacentMineAmounts[k][0], [j, i]) && !(arrayContainsArray(mineCoordinates, [j, i]))) {

                            if (adjacentMineAmounts[k][1] === 0 ) { // adjacentMineAmounts[k][1] === 0
                                    currButton.empty();
                                    currButton.append("⬜");
                                    alreadyRevealed.push([j, i]);
                                    clearAdjacentZeroes(j, i);
                            } else {
                                    currButton.empty();
                                    currButton.append(getNumberEmoji(adjacentMineAmounts[k][1]));
                                    alreadyRevealed.push([j, i]);
                            }
                        } else if (arrayContainsArray(mineCoordinates, [j, i]) && !(arrayContainsArray(flaggedSpaces, currentId))) {
                            console.log("explode");
                            currButton.empty();
                            currButton.append("💣");
                            clearInterval(stopwatch);
                            $('.timer').text("time: " + timeNow + " seconds");
                            lost = true;
                            alert("BOOM!\nYou lost in " + timeNow + " seconds!");
                            break;
                        }
                    }
                }
            }
        }
    }
}

function checkForWin() {
    var currentMineCoordinates = [];

    for (var i = 0; i < mineCoordinates.length; i++) {
        var currentX = mineCoordinates[i][0];
        var currentY = mineCoordinates[i][1];
        var XandY = currentX + "_" + currentY;
        currentMineCoordinates.push(XandY);
    }

    var isSameSet = function(array1, array2) {
        return  $(array1).not(array2).length === 0 && $(array2).not(array1).length === 0;
    }

    console.log(currentMineCoordinates);
    console.log(flaggedSpaces);
    var result = isSameSet(currentMineCoordinates, flaggedSpaces);

    if (result) {
        won = true;
        console.log("reached");
        clearInterval(stopwatch);
        $('.timer').text("time: " + timeNow + " seconds");
        alert("YOU WIN!\nCompleted in: " + timeNow + " seconds.");
    }
}


function buttonClick(event, buttonId) {
    var button = $('#'+buttonId);
    console.log(buttonId);

    var XandY = buttonId.split("_");

    var currentX = Number(XandY[0]);
    var currentY = Number(XandY[1]);
    console.log([currentX, currentY]);
    console.log(timeNow);

    if (!lost && !won) {
        if (event.shiftKey) {
            console.log("shift pressed");
            if (!arrayContainsArray(alreadyRevealed, [currentX, currentY])) {
                if (arrayContainsArray(flaggedSpaces, buttonId)) {
                    var index = flaggedSpaces.indexOf(buttonId);
                    if (index > -1) {
                        flaggedSpaces.splice(index, 1);
                        button.empty();
                        button.append("⬛");
                        console.log(flaggedSpaces);
                        mineAmt++;
                        $('.minesRemaining').text("mines remaining: " + mineAmt);
                    }
                } else {
                    flaggedSpaces.push(buttonId);
                    button.empty();
                    button.append("🚩");
                    console.log(flaggedSpaces);
                    mineAmt--;
                    $('.minesRemaining').text("mines remaining: " + mineAmt);
                    if (mineAmt === 0) {
                        checkForWin();
                    }
                }
            }
        } else if (arrayContainsArray(mineCoordinates, [currentX, currentY]) && !(arrayContainsArray(flaggedSpaces, buttonId))) {
            console.log("explode");
            button.empty();
            button.append("💣");
            clearInterval(stopwatch);
            $('.timer').text("time: " + timeNow + " seconds");
            lost = true;
            alert("BOOM!\nYou lost in " + timeNow + " seconds!");
        } else {
            if (!(arrayContainsArray(flaggedSpaces, buttonId))) {
                var currentAdjacentMines = 0;
                for (var k = 0; k < adjacentMineAmounts.length; k++) {
                    if (compareTwoArrays(adjacentMineAmounts[k][0], [currentX, currentY])) {
                        currentAdjacentMines = adjacentMineAmounts[k][1];
                    }
                }
                if (currentAdjacentMines === 0) {
                    clearAdjacentZeroes(currentX, currentY);
                }
                if (!(arrayContainsArray(alreadyRevealed, [currentX, currentY]))) {
                    button.empty();
                    var buttonPic = getNumberEmoji(currentAdjacentMines);
                    button.append(buttonPic);
                    alreadyRevealed.push([currentX, currentY]);
                }
                if (arrayContainsArray(alreadyRevealed, [currentX, currentY])) {
                    clearUnflaggedSpaces(currentX, currentY, buttonId, currentAdjacentMines);
                }
            }
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arrayContainsArray(array1, array2) {
    indexCounter = 0;
    for (var i = 0; i < array1.length; i++) {
        if (compareTwoArrays(array1[i], array2)) {
            return true;
        }
        indexCounter++;
    }
    return false;
}

function compareTwoArrays(arrayA, arrayB) {
    if (arrayA.length !== arrayB.length) {
        return false;
    }
    for (var i = 0; i < arrayA.length; i++) {
        if (arrayA[i] !== arrayB[i]) {
            return false;
        }
    }

    return true;
}

function getNumberEmoji(currNum) {
    var buttonMarker = "";
    switch (currNum) {
        case 1:
            buttonMarker = "1️⃣";
            break;
        case 2:
            buttonMarker = "2️⃣";
            break;
        case 3:
            buttonMarker = "3️⃣";
            break;
        case 4:
            buttonMarker = "4️⃣";
            break;
        case 5:
            buttonMarker = "5️⃣";
            break;
        case 6:
            buttonMarker = "6️⃣";
            break;
        case 7:
            buttonMarker = "7️⃣";
            break;
        case 8:
            buttonMarker = "8️⃣";
            break;
        case 9:
            buttonMarker = "9️⃣";
            break;
    }
    return buttonMarker;
}