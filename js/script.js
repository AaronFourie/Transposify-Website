async function transposeSong(event) {
    event.preventDefault();
  
    const songName = document.getElementById('songName').value;
    const songKey = document.getElementById('songKey').value;
    const songSheet = document.getElementById('songSheet').value;
    const transposeKey = document.getElementById('transposeKey').value;
  
    const transposedSongSheet = transposeChords(songSheet, songKey, transposeKey);
  
    if (transposedSongSheet) {
      const transposedSheetWithChords = insertChordsAboveLyrics(transposedSongSheet);
      document.getElementById('transposedSongSheet').innerHTML = transposedSheetWithChords;
      openPopup('Transposition Successful');
  
      const wordButton = document.getElementById('wordButton');
      wordButton.addEventListener('click', () => {
        downloadAsWord(transposedSheetWithChords, songName);
      });
  
      const pdfButton = document.getElementById('pdfButton');
      pdfButton.addEventListener('click', () => {
        downloadAsPDF(transposedSheetWithChords, songName);
      });
  
    } else {
      openPopup('Transposition Error');
    }
  }

  function downloadAsWord(content, fileName) {
    const songName = document.getElementById('songName').value;
    const transposeKey = document.getElementById('transposeKey').value;
    const htmlContent = `
    <html>
    <head>
        <meta charset="utf-8">
        <title>${fileName}_transposed</title>
        <style>
          body {
            font-family: "Arial", sans-serif;
          }
        </style>
      </head>
        <body>
        <h1>${songName}</h1>
        <h2>Key: ${transposeKey}</h2>
        <br>${content}
        </body>
    </html>`;
  
    const element = document.createElement('a');
  const file = new Blob([htmlContent], { type: 'application/msword' });
  element.href = URL.createObjectURL(file);
  element.download = `${fileName}_transposed.doc`;
  document.body.appendChild(element); // Required for Firefox
  element.click();
  document.body.removeChild(element);
  }
  
  async function downloadAsPDF(content, fileName) {
    try {
      const pdfDoc = await PDFLib.PDFDocument.create();
      const page = pdfDoc.addPage();
  
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontSize = 12;
  
      const textLines = content.split('\n');
      const textHeight = font.heightAtSize(fontSize);
  
      let currentY = page.getSize().height - 50;
      for (const line of textLines) {
        page.drawText(line, {
          x: 50,
          y: currentY,
          size: fontSize,
          font: font,
          color: PDFLib.rgb(0, 0, 0),
        });
        currentY -= textHeight;
      }
  
      const pdfBytes = await pdfDoc.save();
      const file = new Blob([pdfBytes], { type: 'application/pdf' });
  
      const element = document.createElement('a');
      element.href = URL.createObjectURL(pdfBlob);
      element.download = `${fileName}_transposed.pdf`;
      document.body.appendChild(element); // Required for Firefox
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }
  
  function transposeChords(songSheet, songKey, transposeKey) {
    const lines = songSheet.split('\n');
    const transposedLines = lines.map(line => {
      const chords = getChordsFromLine(line);
      const transposedChords = chords.map(chord => transposeChord(chord, songKey, transposeKey));
      const transposedLine = replaceChordsInLine(line, chords, transposedChords);
      return transposedLine;
    });
  
    return transposedLines.join('\n');
  }
  
  function getChordsFromLine(line) {
    const chordRegex = /\b([A-G](#|b)?(m|maj|dim|aug|sus)?)\b/g;
    const chords = line.match(chordRegex);
    return chords ? chords : [];
  }
  
  function transposeChord(chord, originalKey, transposedKey) {
    const noteRegex = /[A-G](#|b)?/;
    const match = chord.match(noteRegex);
  
    if (match) {
      const originalNote = match[0].toUpperCase();
      const originalModifier = chord.substring(originalNote.length);
      const originalIndex = getNoteIndex(originalNote);
      const transposedIndex = (originalIndex + getTransposeSemitones(originalKey, transposedKey)) % 12;
      const transposedNote = getNoteByIndex(transposedIndex);
      const transposedChord = transposedNote + originalModifier;
      return transposedChord;
    }
  
    return chord;
  }
  
  function replaceChordsInLine(line, chords, transposedChords) {
    let transposedLine = line;
  
    for (let i = 0; i < chords.length; i++) {
      transposedLine = transposedLine.replace(chords[i], transposedChords[i]);
    }
  
    return transposedLine;
  }
  
  function getNoteIndex(note) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteOrder.indexOf(note);
  }
  
  function getNoteByIndex(index) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteOrder[index];
  }
  
  function getTransposeSemitones(originalKey, transposedKey) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const originalIndex = noteOrder.indexOf(originalKey);
    const transposedIndex = noteOrder.indexOf(transposedKey);
    return transposedIndex - originalIndex;
  }
  // Continued from the previous response...

function getNoteIndex(note) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteOrder.indexOf(note);
  }
  
  function getNoteByIndex(index) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteOrder[index];
  }
  
  function getTransposeSemitones(originalKey, transposedKey) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const originalIndex = noteOrder.indexOf(originalKey);
    const transposedIndex = noteOrder.indexOf(transposedKey);
    return transposedIndex - originalIndex;
  }
  
  function insertChordsAboveLyrics(transposedSongSheet) {
    const lines = transposedSongSheet.split("\n");
    const transposedLines = lines.map(line => {
      const chordRegex = /\b([A-G])(#|b)?(m|maj|dim|aug|sus)?\b/g;
      let match;
      let result = '';
  
      while ((match = chordRegex.exec(line)) !== null) {
        const chord = match[0];
        const chordIndex = match.index;
  
        result += line.substring(0, chordIndex);
        result += `<span class="chord">${chord}</span>`;
        line = line.substring(chordIndex + chord.length);
      }
  
      result += line;
      return result;
    });
  
    return transposedLines.join('<br>');
  }
  
  function openPopup(message) {
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = message;
  
    const popup = document.getElementById('resultPopup');
    popup.style.display = 'block';
  }
  
  function closePopup() {
    const popup = document.getElementById('resultPopup');
    popup.style.display = 'none';
  }
  
  document.getElementById('transposeForm').addEventListener('submit', transposeSong);
  