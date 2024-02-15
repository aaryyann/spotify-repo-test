console.log("lets write java script");

let currentSong = new Audio();

let songs;

let currentFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currentFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all songs in playlist

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `<li>
        <img class="reverse" src="images/music.svg" alt="" srcset="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Aryan</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="reverse" src="images/play2.svg" alt="" srcset="">
        </div>
        </li>`;
  }
  // event listener to songs

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

// playing Music

const playMusic = (music, pause = false) => {
  currentSong.src = `/${currentFolder}/` + music;

  if (!pause) {
    currentSong.play();
    play.src = "images/pause.svg";
  }

  document.querySelector(".songTrack").innerHTML = decodeURI(music);
  document.querySelector(".songTime").innerHTML = "00:00/00:00";
};

// Create album

async function displayAlbum() {
  let a = await fetch(`./songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardTop = document.querySelector(".cardTop");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-1)[0];

      //    get meta data
      let a = await fetch(`./songs/${folder}/info.json`);
      let response = await a.json();

      cardTop.innerHTML += `<div data-folder="${folder}" class="card border">
      <div class="play">
        <img src="images/play.svg" alt="" />
      </div>
      <img src="/songs/${folder}/cover.jpg" alt="" />
      <h3>${response.title}</h3>
      <p>${response.description}</p>
    </div>`;
    }
  }

  // load playlist music

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/lofibeats");

  playMusic(songs[0], true);

  // album display

  await displayAlbum();

  //  event listener for play previos and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/play2.svg";
    }
  });

  // time updater

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let value = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = value + "%";

    currentSong.currentTime = (currentSong.duration * value) / 100;
  });

  // hammerContainer

  document.querySelector(".hammer").addEventListener("click", () => {
    document.querySelector("#left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector("#left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
}

main();
