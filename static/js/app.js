const videoElement = document.getElementById("video");
const metadataElement = document.getElementById("video-details");
const videoPlaylist1Element = document.querySelector('.video-playlist .playlist-sec1');
const videoPlaylist2Element = document.querySelector('.video-playlist .playlist-sec2');
const searchedWordElement = document.querySelector('.search-box .search-ip');

const API_addr = 'http://172.19.0.10:8001'

searchedWordElement.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action (if any)
        searchWord();
    }
});

var searched_text = ''
var matched_words = []
var words = []
var searched_index = 0
var playlist2dict = {}
var vid_id = ''
var clicked_word = ''

var video = []

function searchWord() {
    search_text = searchedWordElement.value.trim().toLowerCase();
    if (search_text == '') {
        searched_text = search_text;
        return
    }
    
    if (search_text != searched_text) {
        matched_words = [];
        var f_word = null;
        for (let i = 0; i < words.length; i++) {
            // console.log(words[i])
            if (search_text == words[i].toLowerCase()) {
                f_word = words[i];
            } else if (words[i].toLowerCase().split(',| |\(|\)|_|-|!|\+').includes(search_text)) {
                matched_words.unshift(words[i]);
            } else if (words[i].toLowerCase().includes(search_text)) {
                matched_words.unshift(words[i]);
            }
        }
        if (f_word != null) {
            matched_words.unshift(f_word);
        }
        searched_index = 0;
        if (matched_words.length == 0){
            alert('Could not find any word!!!');
            return;
        }
    } else {
        searched_index += 1;
        if (matched_words.length >= 1) {
            searched_index %= matched_words.length
        }  
    }
    videoPlaylist1Element.value=matched_words[searched_index];
    playlistAction1();
    searched_text = search_text
}

function showAlert(msg) {
    alert(msg);
}

async function playlistAction1() {
    var selectBox = videoPlaylist1Element;
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    clicked_word = selectedValue
    videoPlaylist2Element.innerHTML = ''
    metadataElement.innerHTML = ''
    videoElement.src = ''

    const response = await fetch(`${API_addr}/api/search_filter?keyword=${encodeURIComponent(selectedValue)}`, {
        method: 'GET',
    });

    const data = await response.json();
    if (data.error) {
        alert(data.error);
    } else {
        playlist2dict = data.results;
        Object.keys(playlist2dict).forEach((vid_details, i) => {
            videoPlaylist2Element.innerHTML += `<option> ${vid_details} </option>`;
        })
    }
}

async function playlistAction2() {
    var selectBox = videoPlaylist2Element;
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    vid_id = playlist2dict[selectedValue]
    metadataElement.innerHTML = ''
    videoElement.src = ''

    const response = await fetch(`${API_addr}/api/get_video?video_id=${encodeURIComponent(vid_id)}`, {
        method: 'GET',
    });

    const data = await response.json();
    if (data.error) {
        alert(data.error);
    } else {
        console.log(data)
        for (const [key, value] of Object.entries(data.details)) {
            const p = document.createElement("p");
            p.textContent = `${key}: ${value}`;
            metadataElement.appendChild(p);
        }
        const base64Response = await fetch(`data:video/mp4;base64,${data.video}`);
        const videoBlob = await base64Response.blob()
        video = videoBlob
        videoElement.src = URL.createObjectURL(videoBlob);  // Adjust path
        videoElement.play();
    }
}

async function loadMetadata() {
    const metadataFile = document.getElementById("metadata").value;
    const rootPath = document.getElementById("root-path").value;

    // Store values in localStorage
    localStorage.setItem("metadata", metadataFile);
    localStorage.setItem("root-path", rootPath);

    const response = await fetch(`${API_addr}/api/load_metadata`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metadata_file: metadataFile, root_path: rootPath })
    });

    const data = await response.json();
    if (data.error) {
        alert(data.error);
    } else {
        words = []
        data.metadata.forEach((text, i) => {
            words.push(text)
            videoPlaylist1Element.innerHTML += `<option> ${text} </option>`;
        })
    }
}

function toggleVideo() {
    if (videoElement.paused) {
        videoElement.play();
    } else {
        videoElement.pause();
    }
}

function nextFrame() {
    videoElement.pause();
    videoElement.currentTime += 0.04;  // Adjust frame time as per video fps
}

function prevFrame() {
    videoElement.pause();
    videoElement.currentTime -= 0.04;  // Adjust frame time as per video fps
}

function downloadVideo() {
    // Create a download link
    var link = document.createElement("a");
    link.download = `${clicked_word}-${vid_id}.mp4`; // <- name instead of 'name'
    link.href = videoElement.src;
    link.click();
    link.remove();
}

// Placeholder functions for keypoints
function showKeypoints() {
    alert("Keypoints functionality not implemented");
}

function toggleKeypointsOnVideo() {
    alert("Keypoints on video functionality not implemented");
}


// Function to load data from localStorage and autofill the form
function loadData() {
    // Retrieve values from localStorage
    const metadataFile = localStorage.getItem("metadata");
    const rootPath = localStorage.getItem("root-path");

    // Autofill the form fields if data is found
    if (metadataFile) {
        document.getElementById("metadata").value = metadataFile;
    }
    if (rootPath) {
        document.getElementById("root-path").value = rootPath;
    }
}

// Call loadData when the page loads
window.onload = loadData;
