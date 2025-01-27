const Notes = function (selector, tuner) {
  this.tuner = tuner;
  this.isAutoMode = true;
  this.$root = document.querySelector(selector);
  this.$notesList = this.$root.querySelector(".notes-list");
  this.$frequency = this.$root.querySelector(".frequency");
  this.$notes = [];
  this.$notesMap = {};
  this.createNotes();
  this.$notesList.addEventListener("touchstart", (event) =>
    event.stopPropagation()
  );
};

Notes.prototype.createNotes = function () {
  this.$notesList.innerHTML = "";
  const minOctave = 1;
  const maxOctave = 8;
  for (var octave = minOctave; octave <= maxOctave; octave += 1) {
    for (var n = 0; n < 12; n += 1) {
      const $note = document.createElement("div");
      $note.className = "note";
      $note.dataset.name = this.tuner.noteStrings[n];
      $note.dataset.value = 12 * (octave + 1) + n;
      $note.dataset.octave = octave.toString();
      $note.dataset.frequency = this.tuner.getStandardFrequency(
        $note.dataset.value
      );
      $note.innerHTML =
        $note.dataset.name[0] +
        '<span class="note-sharp">' +
        ($note.dataset.name[1] || "") +
        "</span>" +
        '<span class="note-octave">' +
        $note.dataset.octave +
        "</span>";
      this.$notesList.appendChild($note);
      this.$notes.push($note);
      this.$notesMap[$note.dataset.value] = $note;
    }
  }

  const self = this;
  this.$notes.forEach(function ($note) {
    $note.addEventListener("click", function () {
      if (self.isAutoMode) {
        return;
      }

      const $active = self.$notesList.querySelector(".active");
      if ($active === this) {
        self.tuner.stopOscillator();
        $active.classList.remove("active");
      } else {
        self.tuner.play(this.dataset.frequency);
        self.update($note.dataset);
      }
    });
  });
};

Notes.prototype.active = function ($note) {
  this.clearActive();
  $note.classList.add("active");
  this.$notesList.scrollLeft =
    $note.offsetLeft - (this.$notesList.clientWidth - $note.clientWidth) / 2;
};

Notes.prototype.clearActive = function () {
  const $active = this.$notesList.querySelector(".active");
  if ($active) {
    $active.classList.remove("active");
  }
};

//(G-G)Twinkle, (D-D)twinkle, (E-E)little (D)star,(C)How (C)I (B-B)wonder (A)what (A)you (G)are!
const expectedNotes = ["G", "G", "D", "D", "E", "E", "D", "C", "C", "B", "B", "A", "A", "G"]
//const expectedNotes = ["G", "D", "E", "D", "C", "B", "A", "G"]
let expectedNoteIndex = 0
let lastNote = "X"
let count = 0

Notes.prototype.update = function (note) {
  if (note.value in this.$notesMap) {
    noteString = this.$notesMap[note.value].dataset.name;
  } else {
    noteString = "X";
  }

  if (noteString == lastNote) {
    count++;
  } else {
    lastNote = noteString;
    count = 1;
  }
  if (count == 5 && noteString != "X") {
    console.log("Current Note:" + noteString + "   Golden:" + expectedNotes[expectedNoteIndex]);
    expectedNoteIndex++;
  }

  if (noteString != "X") {
    this.active(this.$notesMap[note.value]);
    this.$frequency.childNodes[0].textContent = parseFloat(
      note.frequency
    ).toFixed(1);
  }
};

Notes.prototype.toggleAutoMode = function () {
  if (!this.isAutoMode) {
    this.tuner.stopOscillator();
  }
  count = 0
  expectedNoteIndex = 0
  lastNote = "X"
  this.clearActive();
  this.isAutoMode = !this.isAutoMode;
};
