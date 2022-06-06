// output from fetch
async function getTip(){
    const URL = 'https://jargonauts-api.herokuapp.com/api/'
    try {
        const res = await fetch(URL+'tips')
        const data = await res.json()
        document.querySelector('p[data-output="proTip"]').textContent = data[Math.floor(Math.random()*data.length)]
    }catch(error){
        console.log(error)
    }
}
getTip();


// make sections visible or not
document.querySelector('a[data-action="startMsg"]').addEventListener('click', function(){showSection('#generator')})
document.querySelector('a[data-action="goAbout"]').addEventListener('click', function(){showSection('#about')})
document.querySelector('footer h3').addEventListener('click', function(){showSection('#creds')})

function showSection(selector){
    document.querySelector(selector).classList.toggle('hidden')
}

// reveal recommended sentence
document.querySelector('form[data-type="tonal"]').addEventListener('submit', function(event){
    event.preventDefault();
    getPhrase();
})

// copies to clipboard on click
let copy;
let messagePrinted = document.querySelector('p[data-content="messageBody"]')

document.querySelector('p[data-content="messageBody"]').addEventListener('click', function(){
    copy = messagePrinted.innerText;
    navigator.clipboard.writeText(copy);
})

async function getPhrase(){ //to rewrite w proper params
    try {
        const res = await fetch('https://jargonauts-api.herokuapp.com/api/tone/')
        const data = await res.json()
        let tonalChoice = document.querySelector('select[data-type="tone"]').value
        if (tonalChoice !== "tone of choice"){
            messagePrinted.textContent = data[tonalChoice][Math.floor(Math.random()*data[tonalChoice].length)]
            document.querySelector('#phrase').classList.remove('hidden');
        }else {
            document.querySelector('#phrase').classList.add('hidden');
        }
    }catch(error){
        console.log(error)
    }
    // document.querySelector('#generator').classList.add('hidden')
}

//space for audio - hear read aloud. remove default action of submit. 
document.querySelector('#audible').addEventListener('click', readAloud)

function readAloud(){
    let synth = window.speechSynthesis;
    let audibleJargon = new SpeechSynthesisUtterance(messagePrinted.innerText);
    synth.speak(audibleJargon);
}
// styling- if #generator does not have class .hidden, remove border from nav item

// dictionary
let dictionary;
let dictionaryList;
let tempHolder= document.querySelector('#holder')  //currently no tab available
let searchBox = document.querySelector('#wordPhrase')
let guess;
let searchResult = document.querySelector('#searchResult')
let definition = document.querySelector('#definition')

let sendWord = document.querySelector('#sendWord') //button

async function getDictionary(){ //is async - using fetch for now
    try {
        searchBox.value = ""// also reset search bar for each pg refresh
        let response = await fetch('https://jargonauts-api.herokuapp.com/api/dictionary')
        let results = await response.json()
        dictionary = results;
        dictionaryList = Object.keys(dictionary);
    }catch(error){
        console.log(error)
    }
}

function guessInput() {
    let wipWord = searchBox.value.toLowerCase()
    if (wipWord.length < 1) return; //exit if empty
    else {
        if (dictionary === undefined || dictionaryList === undefined) getDictionary();
        guess = dictionaryList.find(word => word.slice(0,wipWord.length) === wipWord)
    }
}

function giveResult(){
    let thingToFind = searchBox.value.toLowerCase()
        if (thingToFind.length === 0){
            return
        }else if (dictionary[thingToFind]){
            searchResult.textContent = thingToFind
            definition.textContent = dictionary[thingToFind]
            definition.classList.remove('clickMe')
            definition.removeAttribute('title')
        }else {
            if (guess !== undefined){
                searchResult.textContent = ""
                definition.textContent = `Did you mean to look up "${guess}"?`
                definition.classList.add('clickMe')
                definition.setAttribute('title', 'Go to definition')
                definition.addEventListener('click', function(){
                    searchBox.value = guess;
                    giveResult();
                })
            }else {
                searchResult.textContent = ""
                definition.textContent = dictionary['not found']
            }
        }
}

getDictionary(); //populate on pageload
searchBox.addEventListener('input', guessInput)
sendWord.addEventListener('click', giveResult)
document.querySelector('#lookup').addEventListener('submit', function(e){e.preventDefault(); giveResult})
