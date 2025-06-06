import { startSimulation } from "./script.js"

// This is all to get the ui of the web page to work

let sequenceLengths = [3, 3]
let sequences = [[0, 0, 0], [1, 1, 1]]
let outcomePossibilities = [0.5, 0.5]

playerSequenceLengthUI(2)
outcomePossibilitiesUI(2)
resultsUI(2)

function playerSequenceLengthUI(numPlayers) {
    const d = document.getElementById("playerSequenceLengths")
    d.innerHTML = ""

    for (let i = 0; i < numPlayers; i++) {
        const div = document.createElement("div")
        d.append(div)

        const playerLabel = document.createElement("span")
        playerLabel.innerText = `Player ${i + 1}'s Sequence Length: `
        div.append(playerLabel)

        const lengthInput = document.createElement("input")

        if (sequenceLengths[i] == undefined) { sequenceLengths[i] = 3; sequences[i] = [] }

        lengthInput.value = sequenceLengths[i]
        lengthInput.min = 2
        lengthInput.step = 1
        lengthInput.type = "number"
        lengthInput.addEventListener("change", function (e) {
            const v = parseInt(e.target.value)
            if (sequenceLengths[i] > v) { sequences[i].splice(-1, 1) }
            sequenceLengths[i] = v
            playerSequencesUI(numPlayers, sequenceLengths, outcomePossibilities.length)
        })
        div.append(lengthInput)

    }

    if (numPlayers < sequences.length) { sequences.splice(-1, 1) }
    if (numPlayers < sequenceLengths.length) { sequenceLengths.splice(-1, 1) }

    playerSequencesUI(numPlayers, sequenceLengths, outcomePossibilities.length)
}

function playerSequencesUI(numPlayers, sequenceLengths, numOutcomePossibilities) {
    const d = document.getElementById("playerSequences")
    d.innerHTML = ""
    for (let i = 0; i < numPlayers; i++) {
        const playerDiv = document.createElement("div")
        playerDiv.classList.add("playerDiv")
        d.append(playerDiv)

        const label = document.createElement("span")
        label.innerText = `Player ${i + 1}'s Sequence:`
        playerDiv.append(label)
        for (let j = 0; j < sequenceLengths[i]; j++) {
            const sequenceEntryDiv = document.createElement("div")
            sequenceEntryDiv.style = "display:inline-block; padding: 5px;"
            playerDiv.append(sequenceEntryDiv)

            const sequenceEntryInput = document.createElement("input")
            sequenceEntryInput.type = "number"
            if (sequences[i][j] == undefined) { sequences[i][j] = i }
            sequences[i][j] = Math.min(sequences[i][j], numOutcomePossibilities - 1)
            sequenceEntryInput.value = sequences[i][j]
            sequenceEntryInput.min = 0
            sequenceEntryInput.max = numOutcomePossibilities - 1
            sequenceEntryInput.addEventListener("change", function (e) {
                sequences[i][j] = parseInt(e.target.value)
            })
            sequenceEntryDiv.append(sequenceEntryInput)
        }
    }
}

function outcomePossibilitiesUI(numOutcomePossibilities) {
    outcomePossibilities = []

    const d = document.getElementById("flipOutcomeProbabilities")
    d.innerHTML = ""

    for (let i = 0; i < numOutcomePossibilities; i++) {
        const div = document.createElement("div")
        div.style = "display:inline-block; padding: 5px"
        d.append(div)

        const label = document.createElement("span")
        label.innerText = `${i}: `
        div.append(label)

        const input = document.createElement("input")
        input.value = 100 / numOutcomePossibilities
        outcomePossibilities[i] = 1 / numOutcomePossibilities
        input.min = 0
        input.max = 100
        input.type = "number"
        input.addEventListener("change", function (e) {
            outcomePossibilities[i] = parseInt(e.target.value) / 100
            checkProbabilitiesAddUp()
        })
        div.append(input)

        const percentLabel = document.createElement("span")
        percentLabel.innerText = "%"
        div.append(percentLabel)
    }

    checkProbabilitiesAddUp()
}

function checkProbabilitiesAddUp() {
    let sum = 0
    for (let i = 0; i < outcomePossibilities.length; i++) {
        sum += outcomePossibilities[i]
    }

    const p = document.getElementById("probabilitiesWarning")
    if (Math.abs(sum - 1) < 0.01) {
        p.innerText = ""
    }
    else {
        p.innerText = "Warning: probabilities do not add up to 100%!"
    }
}

function resultsUI(numPlayers) {
    const d = document.getElementById("results")
    d.innerHTML = ""

    for (let i = 0; i < numPlayers; i++) {
        const div = document.createElement("div")
        div.style = "padding: 10px"
        d.append(div)

        const label = document.createElement("span")
        label.innerText = `Player ${i + 1}'s win rate: `
        div.append(label)

        const rate = document.createElement("span")
        rate.id = `player${i + 1}Rate`
        rate.classList.add("numberBox")
        rate.innerText = "__%"
        div.append(rate)
    }

    const playedDiv = document.createElement("div")
    playedDiv.style = "padding: 10px"
    d.append(playedDiv)

    const playedLabel = document.createElement("span")
    playedLabel.innerText = "Games Played: "
    playedDiv.append(playedLabel)

    const played = document.createElement("span")
    played.id = "gamesPlayed"
    played.innerText = "0"
    played.classList.add("numberBox")
    playedDiv.append(played)
}

document.getElementById("numPlayersInput").addEventListener("change", function (e) {
    const v = parseInt(e.target.value)
    if (simulationRunning) {
        e.target.value = sequenceLengths.length
        return
    }
    playerSequenceLengthUI(v)
    resultsUI(v)
})

document.getElementById("numFlipOutcomesInput").addEventListener("change", function (e) {
    const v = parseInt(e.target.value)
    playerSequencesUI(
        parseInt(document.getElementById("numPlayersInput").value),
        sequenceLengths,
        v
    )

    outcomePossibilitiesUI(v)
})

updateGamesToPlay()
function updateGamesToPlay() {
    document.getElementById("gamesToPlay").innerText = prettyNumber(parseInt(document.getElementById("simulateWorkgroups1D").value) ** 3 * 16 ** 2 * 50 )
}
document.getElementById("simulateWorkgroups1D").addEventListener("input", updateGamesToPlay)

// creates a copy that isnt linked to the original
function deepCopy(object) {
    return JSON.parse(JSON.stringify(object))
}

// run the simulation when the button is pressed
let simulationRunning = false
document.getElementById("runButton").addEventListener("click", async function () {
    if (simulationRunning) { return }

    simulationRunning = true
    await startSimulation(
        deepCopy(sequences),
        deepCopy(outcomePossibilities),
        parseInt(document.getElementById("simulateWorkgroups1D").value),
        function (wins, gamesPlayed) {
            for (let i = 0; i < wins.length; i++) {
                document.getElementById(`player${i + 1}Rate`).innerText = `${wins[i] * 100}%`
            }
            document.getElementById("gamesPlayed").innerText = prettyNumber(gamesPlayed)
        }
    )
    simulationRunning = false
})

function prettyNumber(number) {
    const s = String(number)
    let o1 = ""
    let j = 1
    for (let i = s.length - 1; i >= 0; i--, j++) {
        o1+=s[i]
        if (j%3==0) {o1+= " "}
    }

    let o2 = ""
    for (let i = o1.length - 1; i >= 0; i--) {
        o2 += o1[i]
    }

    return o2
}