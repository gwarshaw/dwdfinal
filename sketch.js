let socket = io();

socket.on("connect", function(){
  console.log('socket connected');
});

let cells = [
  [], //roll pattern
  [], //hho pattern
  [], //hh1 pattern
  [], //hh2 pattern
  [], //snare pattern
  [], //kick pattern
];

let cellNum = 32;
let trackNum = 6;

for (let i=0; i<cellNum;i++){
  for(let j=0; j<trackNum; j++){
    cells[j][i]=0;
  }  
}

let beat;
let w = 15;
let h = 60;

//Offsets for each component
let hhopenOffset;
let hh1Offset;
let clapOffset;
let snareOffset;
let kickOffset;

count = 0;
// Click the mouse to play kick drum

// Create a Players object and load the drum kit files
const kit = new Tone.Players({
  snare: "samples/505/snare.wav",
  kick: "samples/505/kick.wav",
  hh1: "samples/505/hh1.wav",
  hhopen: "samples/505/hhopen.wav",
  clap: "samples/505/clap.wav",
  roll: "samples/505/roll.wav",
});
kit.toDestination();

//Try
// let containerDiv;


let slider;
// Play the kick drum once per second

Tone.Transport.bpm.value = 120;
Tone.Transport.scheduleRepeat(playPulse, "16n");

// Interface: p5 functions
function setup() {

    let containerDiv = createDiv();
    containerDiv.addClass('slider-container');

  socket.on('updateCells', function(data){
    cells=data;
  })

  createCanvas(480, 500);

  //Play Button
  playBtn = createButton("play");
  playBtn.mousePressed(togglePlay);
  playBtn.position(0, height);

  //BPM Slider
  BPMSlider = createSlider(20, 100, 100);
  BPMSlider.position(width - 130, height);
  BPMSlider.input(updateTempo);

  //Offset Sliders

  //Roll Offset
  rollOffset = createSlider(0, 100, 50);
  rollOffset.position(width + 10, h - h / 1.6);
  rollOffset.changed(function (){
    socket.emit('rollMoved', rollOffset.value());
  });
  socket.on('rollMoved', function(data){
    rollOffset.value(data);
  });

  //Open HH Offset
  hhopenOffset = createSlider(0, 100, 50);
  hhopenOffset.position(width + 10, 2 * h - h / 1.6);
  hhopenOffset.changed(function (){
    socket.emit('hhopenMoved', hhopenOffset.value());
  });
  socket.on('hhopenMoved', function(data){
    hhopenOffset.value(data);
  });

  //HH1 Offset
  hh1Offset = createSlider(0, 100, 50);
  hh1Offset.position(width + 10, 3 * h - h / 1.6);
  hh1Offset.changed(function (){
    socket.emit('hh1Moved', hh1Offset.value());
  });
  socket.on('hh1Moved', function(data){
    hh1Offset.value(data);
  });

  //Clap Offset
  clapOffset = createSlider(0, 100, 50);
  clapOffset.position(width + 10, 4 * h - h / 1.6);
  clapOffset.changed(function (){
    socket.emit('clapOffset', clapOffset.value());
  });
  socket.on('clapOffset', function(data){
    clapOffset.value(data);
  });

  //Snare Offset
  snareOffset = createSlider(0, 100, 50);
  snareOffset.position(width + 10, 5 * h - h / 1.6);
  snareOffset.changed(function (){
    socket.emit('snareOffset', snareOffset.value());
  });
  socket.on('snareOffset', function(data){
    snareOffset.value(data);
  });

  //Kick Offset
  kickOffset = createSlider(0, 100, 50);
  kickOffset.position(width + 10, 6 * h - h / 1.6);
  kickOffset.changed(function (){
    socket.emit('kickOffset', kickOffset.value());
  });
  socket.on('kickOffset', function(data){
    kickOffset.value(data);
  });
}

function draw() {
  // Draw the grid
  strokeWeight(0.05);
  for (let step = 0; step < 32; step++) {
    for (let track = 0; track < 6; track++) {
      if (cells[track][step] == 1) {
        fill(0, 214, 206);
      } else {
        fill(255);
      }
      rect(step * w, track * h, w, h);
    }
  }

  // Hightlight the current step
  fill(212, 200, 242, 90);
  rect(beat * w, 0, w, h * 6);
}

function playPulse(time) {
  beat = count++ % 32;

  if (cells[0][beat] == 1) {
    kit.player("roll").start(time + rollOffset.value() / 500);
  }

  if (cells[1][beat] == 1) {
    kit.player("hhopen").start(time + hhopenOffset.value() / 500);
  }

  if (cells[2][beat] == 1) {
    kit.player("hh1").start(time + hh1Offset.value() / 500);
  }

  if (cells[3][beat] == 1) {
    kit.player("snare").start(time + clapOffset.value() / 500);
  }

  if (cells[4][beat] == 1) {
    kit.player("clap").start(time + snareOffset.value() / 500);
  }

  if (cells[5][beat] == 1) {
    kit.player("kick").start(time + kickOffset.value() / 500);
  }
}

function updateTempo() {
  console.log("changed: ", BPMSlider.value());
  Tone.Transport.bpm.value = BPMSlider.value();
}

function togglePlay() {
  if (Tone.Transport.state == "started") {
    Tone.Transport.pause();
    playBtn.html("play");
  } else {
    Tone.start();
    Tone.Transport.start();
    playBtn.html("pause");
  }
}

function mousePressed() {
  //toggle cell
  let step = floor(mouseX / w);
  let track = floor(mouseY / h);
  
  if ((track<trackNum) && (step<cellNum)){
      cells[track][step] = !cells[track][step];
      socket.emit('cellClicked', {cell : cells[track][step], track : track, step : step});
  };
  
}
