# g-phil-metronome

Demo: Parses click track, and shows a visual metronome which plays along with the provided click track.

Two steps:

1. Use opus_parser.html to open an opus file and automatically convert to json which contains click times. The json file will be automatically downloaded. The opus_parser is not intended to be hosted by g-phil. https://kunstderfug.github.io/gphil-metronome/opus_parser.html
2. Use metronome_from_click_track.html to load the json file (and optionally audio file) to playback on the visual metronome. https://kunstderfug.github.io/gphil-metronome/index.html
