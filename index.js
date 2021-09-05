const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs')
const readline = require('readline');


const argv = yargs(hideBin(process.argv)).argv;


readAndParseNames().then((players) => {
    const allPlayers = players;

    let malePlayers = players.filter(({gender}) => gender === 'm');
    let femalePlayers = players.filter(({gender}) => gender === 'f');



    let uniquesMalePlayer = Array.from(new Set(malePlayers.map((player) => player.name)))
    let uniquesFemalePlayer = Array.from(new Set(femalePlayers.map((player) => player.name)))

    let smallestTeam = uniquesFemalePlayer.length > uniquesMalePlayer.length? uniquesMalePlayer: uniquesFemalePlayer;

    let results = [];

    for(let i =0; i< smallestTeam.length; i++){
        let result = matchPlayers(uniquesFemalePlayer[i], uniquesMalePlayer[i]);
        results.push(result);
    }


    results = results.sort(function (a,b) {
        return  b.match - a.match;
    })

    fs.writeFile('output.txt', results.map((result) => result.message).join('\n'), function (){
        console.log(results.map((result) => result.message))
    } )
}).catch((e) => {
    console.error(e)
});






function readAndParseNames(){

    return new Promise((resolve, reject) => {
        const src = argv.src;
        const players = [];
        if(!src){
            reject('Please specific file to read from via the --src option')
        }
        if(!fs.existsSync(src)){
            reject(src+ 'does not exist it is not readable')
        }

        const readInterface = readline.createInterface({
            input: fs.createReadStream(src),
            // output: process.stdout,
            console: false
        });

        readInterface.on('line', function(line) {
            if(line){
                let playerDetails = line.split(',')
                let player = {
                    name: playerDetails[0].trim(),
                    gender: playerDetails[1].trim()
                }
                players.push(player);
            }

        });
        readInterface.on('close', function (){
            resolve(players)
        })
    });
}



/**
 * Accepting Two strings
 *
 */
function checkIfTwoPlayersMatch(){
    const playerOne = argv.playerone;
    const playerTwo = argv.playertwo;
    if(playerOne && playerTwo){
        if(playerOne.match(/^[A-Za-z]*$/) && playerTwo.match(/^[A-Za-z]*$/)){
            console.log(matchPlayers(argv.playerone, argv.playertwo))
        }else {
            throw new Error('only alphabetic characters is accepted for --playerone and --playertwo options')
        }
    }else {
        throw new Error('--playerone and --playertwo option is required')
    }

}


function matchPlayers(player1, player2){
    const occurrences = {};
    const fullMatchSentence = `${player1}matches${player2}`.toLowerCase();
    for(let i=0; i<fullMatchSentence.length; i++){
        if(!occurrences[fullMatchSentence[i]]){
            occurrences[fullMatchSentence[i]] = 1;
            for(let j=i+1; j< fullMatchSentence.length; j++){
                if(fullMatchSentence[i] === fullMatchSentence[j]){
                    occurrences[fullMatchSentence[i]] +=1
                }
            }
        }
    }
    let total =  sumArrays(Object.values(occurrences));
    let result = {
        match: total,
        message: ''
    }
    if(total < 81){
        result.message =  `${player1} matches ${player2} ${total}%`
    }else {
       result.message =  `${player1} matches ${player2} ${total}, good match%`
    }

    return result
}

function sumArrays(numbers){
    numbers = numbers.join('').split('').map((i) => parseInt(i));
    let start = 0;
    let end = numbers.length-1;
    let newNumberArray = []
    while (start < end){
        newNumberArray.push(numbers[start]+numbers[end]);
        start+=1;
        end-=1
    }
    if(numbers.length % 2 !== 0){
        newNumberArray.push(numbers[start])
    }
    if(numbers.length === 2){
        return numbers[0]+''+numbers[1]
    }else {
        return sumArrays(newNumberArray)
    }
}
