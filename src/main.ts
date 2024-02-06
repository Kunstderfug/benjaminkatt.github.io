import { handleFileInput } from './opus_parser.ts'
import { startMetronome, stopMetronome } from './metronome.ts'

const buttonStart = document.getElementById('start_metronome')!
const buttonStop = document.getElementById('stop_metronome')!

document.getElementById('file-input')!.addEventListener('change', event => handleFileInput(event))
buttonStart.addEventListener('click', () => startMetronome())
buttonStop.addEventListener('click', () => stopMetronome())
