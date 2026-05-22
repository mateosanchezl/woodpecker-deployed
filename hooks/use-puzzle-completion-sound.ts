'use client'

import { useCallback, useEffect, useRef } from 'react'

type BrowserAudioContext = AudioContext

const COMPLETION_SOUND_SRC = '/correct.wav'
const COMPLETION_SOUND_VOLUME = 0.7

let sharedAudioContext: BrowserAudioContext | null = null
let sharedAudioBuffer: AudioBuffer | null = null
let sharedAudioBufferPromise: Promise<AudioBuffer | null> | null = null

function getAudioContext(): BrowserAudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextConstructor =
    window.AudioContext ??
    (
      window as Window & {
        webkitAudioContext?: typeof AudioContext
      }
    ).webkitAudioContext

  if (!AudioContextConstructor) {
    return null
  }

  sharedAudioContext ??= new AudioContextConstructor()
  return sharedAudioContext
}

async function resumeAudioContext(): Promise<BrowserAudioContext | null> {
  const audioContext = getAudioContext()
  if (!audioContext) {
    return null
  }

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
    } catch {
      return null
    }
  }

  return audioContext.state === 'running' ? audioContext : null
}

async function loadCompletionSoundBuffer(
  audioContext: BrowserAudioContext
): Promise<AudioBuffer | null> {
  if (sharedAudioBuffer) {
    return sharedAudioBuffer
  }

  if (!sharedAudioBufferPromise) {
    sharedAudioBufferPromise = fetch(COMPLETION_SOUND_SRC)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch completion sound: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        return audioContext.decodeAudioData(arrayBuffer)
      })
      .then((buffer) => {
        sharedAudioBuffer = buffer
        return buffer
      })
      .catch(() => null)
  }

  return sharedAudioBufferPromise
}

function playAudioBuffer(
  audioContext: BrowserAudioContext,
  audioBuffer: AudioBuffer
) {
  const source = audioContext.createBufferSource()
  const gainNode = audioContext.createGain()

  gainNode.gain.setValueAtTime(COMPLETION_SOUND_VOLUME, audioContext.currentTime)

  source.buffer = audioBuffer
  source.connect(gainNode)
  gainNode.connect(audioContext.destination)
  source.start()

  source.addEventListener(
    'ended',
    () => {
      source.disconnect()
      gainNode.disconnect()
    },
    { once: true }
  )
}

async function playAudioElement(audio: HTMLAudioElement | null) {
  if (!audio) {
    return
  }

  try {
    audio.pause()
    audio.currentTime = 0
    await audio.play()
  } catch {
    // Ignore autoplay and transient playback errors so puzzle flow continues.
  }
}

export function usePuzzleCompletionSound(enabled: boolean) {
  const enabledRef = useRef(enabled)
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const fallbackAudio = new Audio(COMPLETION_SOUND_SRC)
    fallbackAudio.preload = 'auto'
    fallbackAudio.volume = COMPLETION_SOUND_VOLUME
    fallbackAudioRef.current = fallbackAudio

    const handleUserInteraction = () => {
      void resumeAudioContext()
    }

    window.addEventListener('pointerdown', handleUserInteraction, {
      passive: true,
    })
    window.addEventListener('keydown', handleUserInteraction)

    const audioContext = getAudioContext()
    if (audioContext) {
      void loadCompletionSoundBuffer(audioContext)
    } else {
      fallbackAudio.load()
    }

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)

      fallbackAudio.pause()
      fallbackAudio.currentTime = 0

      if (fallbackAudioRef.current === fallbackAudio) {
        fallbackAudioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      const audioContext = getAudioContext()
      if (audioContext) {
        void loadCompletionSoundBuffer(audioContext)
      } else {
        fallbackAudioRef.current?.load()
      }
      return
    }

    const fallbackAudio = fallbackAudioRef.current
    if (!fallbackAudio) {
      return
    }

    fallbackAudio.pause()
    fallbackAudio.currentTime = 0
  }, [enabled])

  return useCallback(async () => {
    if (!enabledRef.current) {
      return
    }

    const audioContext = await resumeAudioContext()
    if (audioContext) {
      const audioBuffer = await loadCompletionSoundBuffer(audioContext)
      if (audioBuffer) {
        playAudioBuffer(audioContext, audioBuffer)
        return
      }
    }

    await playAudioElement(fallbackAudioRef.current)
  }, [])
}
