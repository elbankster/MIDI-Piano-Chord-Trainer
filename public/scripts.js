document.addEventListener('DOMContentLoaded', () => {
    const midiDeviceSelect = document.getElementById('midiDeviceSelect');

    // Check if the browser supports the Web MIDI API
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn('Web MIDI API is not supported in your browser.');
    }

    function onMIDISuccess(midiAccess) {
        const inputs = midiAccess.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            const option = document.createElement('option');
            option.value = input.value.id;
            option.text = input.value.name;
            midiDeviceSelect.appendChild(option);

            // Add an event listener for 'midimessage' event
            input.value.onmidimessage = onMIDIMessage;
        }
    }

    function onMIDIFailure(error) {
        console.error('Failed to get MIDI access:', error);
    }

    function onMIDIMessage(event) {
        const data = event.data;
        const type = data[0] & 0xf0; // channel agnostic message type
        const note = data[1];
        const velocity = data[2];
    
        console.log('MIDI Message received', data);
           
        // Note On messages (type: 0x90)
        if (type === 0x90) {
            // Some devices send Note On with zero velocity as Note Off
            if (velocity > 0) {
                handleNoteOn(note, velocity, performance.now());
            } else {
                handleNoteOff(note);
            }
        }

        // Note Off messages (type: 0x80)
        if (type === 0x80) {
            handleNoteOff(note);
        }
    }

    keysPressed = [];

    function handleNoteOn(note, velocity, timestamp) {
        //console.log(`Note On: ${note}, velocity: ${velocity}, timestamp: ${timestamp}`);

        const noteValue = midiNoteNumberToNoteValue(note);
        //console.log(noteValue); // Outputs "C4"

        // Handle Note On messages (e.g., play a note, highlight a key, etc.)
            // Add the note to the keysPressed array if it's not already in the list
        if (!keysPressed.includes(note)) {
            keysPressed.push(note);
        }

        // Check if the length of keysPressed is 3 or more
        if (keysPressed.length >= 3) {
            // Check if the prompted chord is being played (assuming you have a function called `checkPromptedChord`)
            keysPressed.sort((a, b) => a - b);
            checkPromptedChord();
        }
    }
    
    function handleNoteOff(note) {
        //console.log(`Note Off: ${note}`);
        // Handle Note Off messages (e.g., stop playing a note, unhighlight a key, etc.)
        const noteIndex = keysPressed.indexOf(note);
        if (noteIndex > -1) {
            keysPressed.splice(noteIndex, 1);
        }
    }

    function checkPromptedChord() {
        console.log('checking chord')
        let chordRoot = null;
        let chordQuality = null;
        let chordInversion = null;
        let isFlat = false;
        let isQuadrad = false;

        isQuadrad = randomChord.chordType.includes('7');
        const semitones = getSemitonesFromKeysPressed();
        
        // MAJOR CHORD INTERVALS
        if(semitones.toString() == [0, 4, 7].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[0]];
            chordQuality = "major";
            chordInversion = "root";
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);
        } else if(semitones.toString() == [0, 5, 9].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[1]]
            chordQuality = "major"
            chordInversion = "1st inversion"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);
        } else if(semitones.toString() == [0, 3, 8].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[2]]
            chordQuality = "major"
            chordInversion = "2nd inversion"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);

        // MINOR CHORD INTERVALS
        } else if(semitones.toString() == [0, 3, 7].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[0]]
            chordQuality = "minor"
            chordInversion = "root"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);

        } else if(semitones.toString() == [0, 5, 8].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[1]]
            chordQuality = "minor"
            chordInversion = "1st inversion"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);

        } else if(semitones.toString() == [0, 4, 9].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[2]]
            chordQuality = "minor"
            chordInversion = "2nd inversion"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);

        // DIMINISHED CHORD INTERVALS
        } else if(semitones.toString() == [0, 3, 6].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[0]]
            chordQuality = "diminished"
            chordInversion = "root"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);
        } else if(semitones.toString() == [0, 6, 9].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[1]]
            chordQuality = "diminished"
            chordInversion = "1st inversion"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);
        } else if(semitones.toString() == [0, 3, 9].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[2]]
            chordQuality = "diminished"
            chordInversion = "2nd inversion"
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);

        // AUGMENTED CHORD INTERVALS
        }  else if(semitones.toString() == [0, 4, 8].toString() && isQuadrad == false) {
            chordRoot = midiNoteNumberMap[keysPressed[0]];
            chordQuality = "augmented";
            chordInversion = randomChord.chordInversion.toString();
            //chordInversion = "root" - every position is 0 4 8. what do?
            console.log(chordRoot + " " + chordQuality + " " + chordInversion);
        };       
       
        /*
        TODO :: MAJOR 7THs
        */

        if(chordRoot != null) {

            if(randomChord.note.includes('b')) {
                isFlat = true;

                if(chordRoot == "A#") {
                    chordRoot = "Bb"
                } else if(chordRoot == "B#") {
                    chordRoot = "C"
                } else if(chordRoot == "C#") {
                    chordRoot = "Db"
                } else if(chordRoot == "D#") {
                    chordRoot = "Eb"
                } else if(chordRoot == "F#") {
                    chordRoot = "Gb"
                } else if(chordRoot == "G#") {
                    chordRoot = "Ab"
                }

                /*
                if chordRoot == "A#":
                    chordRoot = "Bb"
                elif chordRoot == "B#":
                    chordRoot = "C"
                elif chordRoot == "C#":
                    chordRoot = "Db"
                elif chordRoot == "D#":
                    chordRoot = "Eb"
                elif chordRoot == "E":
                    chordRoot = "Fb"
                elif chordRoot == "F#":
                    chordRoot = "Gb"
                elif chordRoot == "G#":
                    chordRoot = "Ab"
                */ 

                console.log('note: ' + randomChord.note + " " + chordRoot);
                console.log('chordType: ' + randomChord.chordType + " " + chordQuality);
                console.log('inversion: ' + randomChord.inversion + ", " + inversion);

                if(randomChord.note == chordRoot && randomChord.chordType == chordQuality && randomChord.inversion == chordInversion) {
                    console.log('correct!');
                }
            }
        }
    }

    function getSemitonesFromKeysPressed() {
        const semitones = [...keysPressed];
        const lowestNoteNumber = semitones[0];
      
        for (let i = 0; i < semitones.length; i++) {
          semitones[i] -= lowestNoteNumber;
        }
      
        return semitones;
      }

    midiNoteNumberMap = [
        // 0 - 11
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 12 - 23
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A", // start of piano full
        "A#",
        "B",
    
        // 24 - 35
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 36 - 47
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 48 - 59
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 60 - 71
        "C", // middle C
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 72 - 83
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 84 - 95
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 96 - 107
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 108 - 119
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    
        // 120 - 127
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G"
    ]

    function midiNoteNumberToNoteValue(midiNoteNumber) {
        const note = midiNoteNumberMap[midiNoteNumber % 12];
        const octave = Math.floor(midiNoteNumber / 12);
        return note + (octave-1);
    }
    

    /*
    MIDI-related code above this line
    *************************************************************************************************
    Website-related code below this line
    */

    document.getElementById("startButton").addEventListener("click", () => {
        // Get the selected options and generate the chord pool
        const selectedOptions = getSelectedOptions();
        const chordPool = generateChordPool(selectedOptions);

        // Pick a random chord and display the prompt
        const randomChord = pickRandomChord(chordPool);
        //clearCanvas();
        displayChordPrompt(randomChord);
    
        
        // Begin tracking MIDI keypresses
        // (Assuming you have a function called `startMidiTracking`)
        //startMidiTracking();
        });

    function getSelectedOptions() {
        const accidentals = [];
        if (document.getElementById("naturals").checked) accidentals.push("");
        if (document.getElementById("sharps").checked) accidentals.push("#");
        if (document.getElementById("flats").checked) accidentals.push("b");
        
        const chordTypes = [];
        if (document.getElementById("majorChords").checked) chordTypes.push("major");
        if (document.getElementById("minorChords").checked) chordTypes.push("minor");
        if (document.getElementById("diminishedChords").checked) chordTypes.push("diminished");
        if (document.getElementById("augmentedChords").checked) chordTypes.push("augmented");
        if (document.getElementById("majorSeventhChords").checked) chordTypes.push("major7");
        if (document.getElementById("minorSeventhChords").checked) chordTypes.push("minor7");
        
        const inversions = [];
        if (document.getElementById("rootPosition").checked) inversions.push("root position");
        if (document.getElementById("firstInversion").checked) inversions.push("first inversion");
        if (document.getElementById("secondInversion").checked) inversions.push("second inversion");
        if (document.getElementById("thirdInversion").checked) inversions.push("third inversion");
        
        return { accidentals, chordTypes, inversions };
    }

    function generateChordPool(selectedOptions) {
        const notes = ["C", "D", "E", "F", "G", "A", "B"];
        const chordPool = [];
        
        selectedOptions.accidentals.forEach((accidental) => {
            notes.forEach((note) => {
            selectedOptions.chordTypes.forEach((chordType) => {
                selectedOptions.inversions.forEach((inversion) => {
                const chord = {
                    note: accidental === "#" ? `${note}#` : accidental === "b" ? `${note}b` : note,
                    chordType: chordType,
                    inversion: inversion,
                };
                chordPool.push(chord);
                });
            });
            });
        });
        
        return chordPool;
    }

    const majorSeventhChords = document.getElementById('majorSeventhChords');
    const minorSeventhChords = document.getElementById('minorSeventhChords');
    const thirdInversion = document.getElementById('thirdInversion');

    // Disable the third inversion checkbox initially
    thirdInversion.disabled = true;

    // Function to update the third inversion checkbox state
    const updateThirdInversionState = () => {
        console.log('should I check one of the boxes for the user?')
        const inversionCheckboxes = document.querySelectorAll("#inversionOptions .form-check-input:not(#thirdInversion)");
        
        thirdInversion.disabled = !(majorSeventhChords.checked || minorSeventhChords.checked);

        // Check if no inversion options are selected
        if (!hasAtLeastOneChecked(inversionCheckboxes)) {
            // Select root position by default
            rootPosition.checked = true;
        }
    };

    // Add event listeners to the major and minor seventh chord checkboxes
    majorSeventhChords.addEventListener('change', updateThirdInversionState);
    minorSeventhChords.addEventListener('change', updateThirdInversionState);
      
    function pickRandomChord(chordPool) {
        const randomIndex = Math.floor(Math.random() * chordPool.length);
        return chordPool[randomIndex];
    }
      
    const selectedOptions = getSelectedOptions();
    const chordPool = generateChordPool(selectedOptions);
    const randomChord = pickRandomChord(chordPool);

    function displayChordPrompt(chord) {
        const chordPromptElement = document.getElementById("chordPrompt");
        chordPromptElement.innerHTML = `${chord.note} ${chord.chordType}<br>(${chord.inversion})`;

        renderChord(chord, 'output');
    }
      
    function hasAtLeastOneChecked(group) {
        console.log('checking if at least one is checked');
        return Array.from(group).some((checkbox) => checkbox.checked);
    }

    function addOptionListeners() {
        const accidentalCheckboxes = document.querySelectorAll("#accidentalOptions .form-check-input");
        const chordCheckboxes = document.querySelectorAll("#chordOptions .form-check-input");
        const inversionCheckboxes = document.querySelectorAll("#inversionOptions .form-check-input");
      
        accidentalCheckboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            if (!hasAtLeastOneChecked(accidentalCheckboxes)) {
              checkbox.checked = true;
            }
          });
        });
      
        chordCheckboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            if (!hasAtLeastOneChecked(chordCheckboxes)) {
              checkbox.checked = true;
            }
          });
        });
      
        inversionCheckboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            if (!hasAtLeastOneChecked(inversionCheckboxes)) {
              checkbox.checked = true;
            }
          });
        });

        console.log('listeners added');
    }
    // Call the function to add event listeners to the checkboxes
    addOptionListeners();
    
    function renderChord(chord, canvas_id) {
        console.log(chord)
        const chord_notes = ['c/4', 'e/4', 'g/4'];
        updateStaff(chord_notes);

    }

    function clearCanvas() {
        const VF = Vex.Flow;
        const renderer = new VF.Renderer(document.getElementById('chordCanvas'), VF.Renderer.Backends.SVG);
    
        const context = renderer.getContext();
        const canvas = document.getElementById('chordCanvas');
        
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      

    function drawBlankStaff(canvas_id) {

        const { Renderer, Stave } = Vex.Flow;

        // Create an SVG renderer and attach it to the DIV element named "output".
        const div = document.getElementById(canvas_id);
        const renderer = new Renderer(div, Renderer.Backends.SVG);

        // Add a clef and time signature.
        stave.addClef("treble")

        // Connect it to the rendering context and draw!
        stave.setContext(context).draw();
    }

  
    function updateStaff(chord_notes) {

        //context.clearRect(0,0,500,500)

        
        // Create the notes
        const notes = [

            // A C-Major chord.
            new StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "w" }),
        ];
        
        const voice = new Voice({ num_beats: 4, beat_value: 4 });

        voice.addTickables(notes);

        // Format and justify the notes to 400 pixels.
        new Formatter().joinVoices([voice]).format([voice], 550);

        // Render voice
        voice.draw(context, stave);
    }
      
    
    var vf = new Vex.Flow.Factory({renderer:{elementId:'output'}})
    var score = vf.EasyScore()
    var system = vf.System()

    const {
    Renderer,
    Stave,
    StaveNote,
    Voice,
    Formatter,
    StaveConnector,
    } = Vex.Flow;

    const div = document.getElementById('output');
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(200, 300);
    const context = renderer.getContext();

    console.log('drawing blank staff')
    // Create a stave of width 400 at position 10, 40 on the canvas.
    const stave = new Stave(10, 40, 489);
    stave.addClef('treble')

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
    
    //drawBlankStaff('output');      

});
