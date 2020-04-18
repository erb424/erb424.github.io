var audio = WaveSurfer.create({
    container: '#waveform',
    scrollParent:true,
    waveColor: "black",
    progressColor: "grey",
    hideScrollbar: "true",
    cursorColor: "red",
    autoCenter: true,
    barWidth: 2,
    barHeight: 2,
    responsive: true
});

function loadExercise() {

    let headlines = [];
    let articles = [];
    const RSS_URL = "https://rss.dw.com/xml/DKpodcast_lgn_de";

    fetch(RSS_URL)
        .then(response => response.text())
        .then(str => new DOMParser().parseFromString(str, "text/xml"))
        .then(xmlDoc => {

            const items = xmlDoc.getElementsByTagName("item");
            let heute = items[0];
            let title = heute.getElementsByTagName("title")[0].innerHTML;

            if (title != localStorage.session){

                localStorage.clear();

                localStorage.session = title;

                localStorage.media = heute.getElementsByTagName("enclosure")[0].getAttribute("url");

                localStorage.out = heute.getElementsByTagName("link")[0].textContent;

                let description = heute.getElementsByTagName("description")[0].textContent;
                let = headerMark = 'Audio-Datei.';
                transcript = description.slice(description.indexOf(headerMark) + headerMark.length); 
                
                let segs = transcript.split("\n\n\n\n");   
                numSegs = segs.length;
                localStorage.numSegs = numSegs;

                for (i=0; i<numSegs; i++){
                    let currentSeg = segs[i].split("\n");
                    headlines.push(currentSeg[0]);
                    articles.push(currentSeg[2]);
                }
                localStorage.setItem("headlines", JSON.stringify(headlines));
                localStorage.setItem("articles", JSON.stringify(articles));
            }

            renderPage();         
        })
}

function renderPage(){

    audio.load(localStorage.media);
    audio.on('ready', function(){
        document.getElementById("loading").innerHTML = "";
    })

    let numSegs = Number(localStorage.numSegs);
    let headlines = JSON.parse(localStorage.getItem("headlines"));

    let responseOutput = `
    <a href=${localStorage.out}><span data-tooltip="Zur heutigen Folge" class="title tooltip-bottom"> ${localStorage.session} </span></a>
    `;
    document.getElementById("response").innerHTML = responseOutput;


    let transcriptOutput = "";
    for(i=0; i<numSegs; i++){
        transcriptOutput += `<div class="answers" id="div${i}"></div>`;
    }
    document.getElementById("transcript").innerHTML = transcriptOutput;


    for (i=0; i<numSegs; i++){

        if (localStorage.getItem("response"+i)){
            renderDone(i, headlines)
        }

        else{
            renderNew(i, headlines)
        }
    }
}

function revealTranscript(i) {

    let articles = JSON.parse(localStorage.getItem("articles"));
    let headlines = JSON.parse(localStorage.getItem("headlines"));

    let article = articles[i].replace(/&quot;/g,'"');

    let inputText = document.getElementById(`inputText${i}`).value;

    let totalCharCount = article.length;
    let countCorrect = 0;

    let diff = JsDiff.diffChars(article, inputText);
    
    let outputText = ''    
    diff.forEach(function(el){
        if(el.added){
            countCorrect -= el.value.length;
            outputText += `<span class="added">${el.value}</span>`;
        }
        else if(el.removed){
            outputText += `<span class="removed">${el.value}</span>`
        }
        else{
            countCorrect += el.value.length;
            outputText += `<span class="correct">${el.value}</span>`
        };
    });

    score = (countCorrect / totalCharCount)*100;

    localStorage.setItem("response"+i, outputText);
    localStorage.setItem("score"+i, score.toFixed(1));

    renderDone(i, headlines);
}



function renderNew(i, headlines){
    name = "Transkript " + [i + 1];
    segOutput = `
                <h3>${headlines[i]}</h3>
                <form id="form${i}">
                    <textarea id="inputText${i}" class="form-control" rows="10" no-resize placeholder="Diktat schreiben" spellcheck="false"></textarea>
                    <br>
                </form>
                    <button id="submit${i}" class="btn btn-primary" onclick="revealTranscript(${i})">${name} prüfen</button>
                `;
            document.getElementById("div"+i).innerHTML = segOutput;
}

function renderDone(i, headlines){
    doneText = localStorage.getItem("response"+i);
    doneScore = Number(localStorage.getItem("score"+i));
    completedSegOutput = `
                         <h3>${headlines[i]}</h3>
                         <br>
                         <p>${doneText}
                         <h5 class="alert alert-info">Resultat = ${doneScore.toFixed(1)}% </h5>
                         `;  
    document.getElementById("div"+i).innerHTML = completedSegOutput;
}

function clearAndReload(){
    localStorage.clear();
    loadExercise();
}



// Audio player controls and keybindings

document.onkeyup = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.altKey && e.ctrlKey && e.keyCode == '40') {
        // down arrow
        e.preventDefault();
        playerPlay();
    }
    else if (e.altKey && e.ctrlKey && e.keyCode == '37') {
        //left
        e.preventDefault();
        playerBack();
    }
    else if (e.altKey && e.ctrlKey && e.keyCode == '39') {
        // right
        e.preventDefault()
        playerForward();
    }

}

function playerBack(){
    audio.skipBackward(5);
}

function playerPlay(){
    audio.playPause();
    if (audio.isPlaying()){
        document.getElementById("playPause").src = "icons/pause-fill.svg"
    }else{
        document.getElementById("playPause").src = "icons/play-fill.svg"
    }
}

function playerForward(){
    audio.skipForward(5);
}











// if (typeof(Storage) !== "undefined") {
//     // Code for localStorage/sessionStorage.
//   } else {
//     // Sorry! No Web Storage support..
//   }