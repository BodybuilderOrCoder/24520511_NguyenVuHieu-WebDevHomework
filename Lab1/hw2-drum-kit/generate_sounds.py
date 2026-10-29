
import math
import random
import wave
from pathlib import Path

SAMPLE_RATE = 44100
OUTPUT_DIR = Path(__file__).parent / "sounds"
OUTPUT_DIR.mkdir(exist_ok=True)

random.seed(42)


def save_wav(filename, samples):
    path = OUTPUT_DIR / filename

    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(SAMPLE_RATE)

        data = bytearray()

        for sample in samples:
            value = max(-1.0, min(1.0, sample))
            integer = int(value * 32767)
            data.extend(integer.to_bytes(2, "little", signed=True))

        audio.writeframes(data)

    print(f"Created: {path.name}")


def generate_drum(duration, frequency, decay, noise_level):
    samples = []
    count = int(SAMPLE_RATE * duration)

    for i in range(count):
        t = i / SAMPLE_RATE

        envelope = math.exp(-decay * t)
        tone = math.sin(2 * math.pi * frequency * t)
        noise = random.uniform(-1, 1)

        sample = envelope * (
            (1 - noise_level) * tone
            + noise_level * noise
        )

        samples.append(sample * 0.7)

    return samples


sounds = {
    "kick.wav": (0.45, 65, 12, 0.08),
    "snare.wav": (0.30, 180, 16, 0.75),
    "hihat.wav": (0.15, 900, 35, 0.95),
    "clap.wav": (0.25, 450, 20, 0.90),
    "tom1.wav": (0.40, 150, 10, 0.10),
    "tom2.wav": (0.45, 100, 10, 0.10),
    "crash.wav": (1.20, 1200, 4, 0.95),
}

for filename, settings in sounds.items():
    samples = generate_drum(*settings)
    save_wav(filename, samples)

print("All 7 drum sounds generated successfully!")
