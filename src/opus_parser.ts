import { OggOpusDecoder } from 'ogg-opus-decoder'
const opusDecoder = new OggOpusDecoder()

// wait for the WASM to be compiled
await opusDecoder.ready

export async function handleFileInput(fileSelectionEvent: any) {
  console.clear()
  const files = Array.from(fileSelectionEvent.target.files)
  files.forEach((file: any) => {
    // console.log(file)
    file.arrayBuffer().then(async (opusFileData: Iterable<number>) => {
      const clickTimes = await parseOpusFile(opusFileData)
      await createJsonOutput(file.name, clickTimes)
    })
  })
}

async function parseOpusFile(opusFileData: Iterable<number>) {
  const { sampleRate, channelData } = await opusDecoder.decodeFile(new Uint8Array(opusFileData))
  // const duration = samplesDecoded / sampleRate
  // document.getElementById('duration').innerText = duration + ' seconds'

  // The next time we will accept a click (sampleRate/5) = 300 bpm.
  const clickTimeThreshold = sampleRate / 5

  // The two channels are identical so just pick the left channel.
  const leftChannel = channelData[0]
  let clickTimes = []
  let beatNumber = 1

  for (let i = 0; true; ++i) {
    // console.log(leftChannel[i])
    // Anything less than 0.1 in volume is not a click.
    // Find the local maximum of the waveform.
    for (; i < leftChannel.length - 1 && (leftChannel[i] < 0.05 || leftChannel[i] < leftChannel[i + 1]); ++i) {
      continue
    }

    // The nested loop above means i could go out of bounds.
    // If we are at the last sample then break from the loop to
    // prevent it from being added to clickTimes.
    if (i == leftChannel.length - 1) {
      break
    }

    // The local maximum of the waveform is at index i.
    if (clickTimes.length == 0 || i - clickTimes[clickTimes.length - 1].sampleNumber > clickTimeThreshold) {
      // 0.4 volume is a good volume threshold for downbeats.
      if (leftChannel[i] > 0.4) {
        beatNumber = 1
        // 0.2 volume is a good volume threshold for other beats.
      } else if (leftChannel[i] > 0.05) {
        beatNumber++
      }

      clickTimes.push({
        sampleNumber: i,
        time: Math.round((i * 1000) / sampleRate), // Milliseconds.
        beat: beatNumber
      })
    }
  }
  // console.log('click times: ' + JSON.stringify(clickTimes))
  opusDecoder.reset()
  return clickTimes
}

async function createJsonOutput(filename: string, clickTimes: any[]) {
  // Remove the sample numbers.
  const fileContents = clickTimes.map(entry =>
    Object({
      time: entry.time,
      beat: entry.beat
    })
  )

  // Stolen from https://stackoverflow.com/a/35251739
  const blob = new Blob([JSON.stringify(fileContents)], { type: 'application/json' })
  const dlink = document.createElement('a')
  const fileName1 = filename.substring(0, filename.lastIndexOf('.'))
  dlink.download = fileName1 + '.json'
  dlink.href = window.URL.createObjectURL(blob)
  dlink.onclick = () => {
    // revokeObjectURL needs a delay to work properly
    setTimeout(function () {
      window.URL.revokeObjectURL(dlink.href)
    }, 1500)
  }
  dlink.click()
  dlink.remove()
}
