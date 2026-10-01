"""Generate the game's sound files from sounds/applause.wav.

iPad Safari only plays the game's sounds through <audio> elements, which can't
change volume or fade, so loudness and fades are baked into the files here.

Usage:  python tools/make_sounds.py
"""
import array
import math
import wave
from pathlib import Path

SOUNDS = Path(__file__).resolve().parent.parent / "sounds"
RATE = 24000


def read_applause():
    with wave.open(str(SOUNDS / "applause.wav")) as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2 and w.getframerate() == RATE
        return array.array("h", w.readframes(w.getnframes()))


def write(name, samples):
    with wave.open(str(SOUNDS / name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(array.array("h", (max(-32768, min(32767, round(s))) for s in samples)).tobytes())
    print(f"{name}: {len(samples) / RATE:.2f} s")


def applause_clip(source, seconds, volume, fade_in=0.05, fade_out=0.7):
    n = int(seconds * RATE)
    out = []
    for i, s in enumerate(source[:n]):
        t = i / RATE
        env = min(1.0, t / fade_in, (seconds - t) / fade_out)
        out.append(s * volume * max(0.0, env))
    return out


def tone(freq, seconds, peak):
    out = []
    for i in range(int((seconds + 0.05) * RATE)):
        t = i / RATE
        phase = (t * freq) % 1.0
        triangle = 4 * abs(phase - 0.5) - 1
        attack = min(1.0, t / 0.02)
        decay = math.exp(-6 * max(0.0, t - 0.02) / seconds)
        out.append(triangle * peak * attack * decay * 32767)
    return out


def main():
    source = read_applause()
    write("applause-short.wav", applause_clip(source, 2.2, 0.6))
    write("applause-long.wav", applause_clip(source, len(source) / RATE, 0.9))
    write("wrong.wav", tone(220, 0.25, 0.12))
    write("ding.wav", tone(880, 0.3, 0.15))


if __name__ == "__main__":
    main()
