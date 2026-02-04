class MetronomeWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleRate = sampleRate;
    this.isRunning = false;
    this.started = false;
    this.startFrame = 0;
    this.segments = [];
    this.segmentIndex = 0;
    this.segmentSamples = 0;
    this.samplesIntoSegment = 0;
    this.samplesPerBeat = Infinity;
    this.samplesUntilNextBeat = Infinity;
    this.clickType = 'wood';
    this.clickSamplesRemaining = 0;
    this.clickSamplesTotal = 0;
    this.clickPhase = 0;
    this.noiseSeed = 1;

    this.port.onmessage = (event) => {
      const msg = event.data || {};
      if (msg.type === 'start') {
        this.startAt(msg.startAt || 0, msg.segments || [], msg.clickType || 'wood');
      } else if (msg.type === 'stop') {
        this.stop();
      } else if (msg.type === 'clickType') {
        this.clickType = msg.value || this.clickType;
      }
    };
  }

  startAt(startAt, segments, clickType) {
    this.segments = Array.isArray(segments) ? segments : [];
    this.segmentIndex = 0;
    this.samplesIntoSegment = 0;
    this.startFrame = Math.max(0, Math.floor(startAt * this.sampleRate));
    this.started = false;
    this.isRunning = this.segments.length > 0;
    this.clickType = clickType || this.clickType;
    this.clickSamplesRemaining = 0;
    this.samplesUntilNextBeat = Infinity;
  }

  stop() {
    this.isRunning = false;
    this.started = false;
    this.segments = [];
    this.segmentIndex = 0;
    this.segmentSamples = 0;
    this.samplesIntoSegment = 0;
    this.samplesPerBeat = Infinity;
    this.samplesUntilNextBeat = Infinity;
    this.clickSamplesRemaining = 0;
  }

  setupSegment(index) {
    const segment = this.segments[index];
    if (!segment) {
      this.isRunning = false;
      return;
    }
    const duration = Math.max(0, segment.duration || 0);
    this.segmentSamples = Math.max(1, Math.floor(duration * this.sampleRate));
    this.samplesIntoSegment = 0;
    if (segment.bpm && segment.bpm > 0) {
      this.samplesPerBeat = Math.max(1, Math.round(this.sampleRate * 60 / segment.bpm));
      this.samplesUntilNextBeat = 0;
    } else {
      this.samplesPerBeat = Infinity;
      this.samplesUntilNextBeat = Infinity;
    }
  }

  advanceSegment() {
    this.segmentIndex += 1;
    if (this.segmentIndex >= this.segments.length) {
      this.isRunning = false;
      return;
    }
    this.setupSegment(this.segmentIndex);
  }

  triggerClick() {
    this.clickSamplesTotal = Math.max(1, Math.round(this.sampleRate * 0.08));
    this.clickSamplesRemaining = this.clickSamplesTotal;
    this.clickPhase = 0;
  }

  nextNoise() {
    this.noiseSeed = (this.noiseSeed * 16807) % 2147483647;
    return (this.noiseSeed / 1073741824) - 1;
  }

  renderClickSample() {
    if (this.clickSamplesRemaining <= 0) return 0;
    const progress = 1 - (this.clickSamplesRemaining / this.clickSamplesTotal);
    const env = Math.exp(-8 * progress);
    let sample = 0;

    if (this.clickType === 'beep') {
      const freq = 880;
      sample = Math.sin(this.clickPhase);
      this.clickPhase += (2 * Math.PI * freq) / this.sampleRate;
    } else if (this.clickType === 'wood') {
      const freq = 300;
      sample = Math.sin(this.clickPhase) + 0.4 * Math.sin(this.clickPhase * 2);
      this.clickPhase += (2 * Math.PI * freq) / this.sampleRate;
    } else {
      sample = this.nextNoise();
    }

    this.clickSamplesRemaining -= 1;
    return sample * env * 0.6;
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const channelCount = output.length;
    const frames = output[0].length;

    for (let i = 0; i < frames; i += 1) {
      let sample = 0;

      if (this.isRunning) {
        const frameIndex = currentFrame + i;
        if (!this.started) {
          if (frameIndex >= this.startFrame) {
            this.started = true;
            this.setupSegment(0);
          }
        }

        if (this.started && this.isRunning) {
          while (this.isRunning && this.segmentSamples <= 0) {
            this.advanceSegment();
          }

          if (this.isRunning) {
            if (this.samplesUntilNextBeat <= 0) {
              this.triggerClick();
              this.samplesUntilNextBeat += this.samplesPerBeat;
            }

            sample = this.renderClickSample();
            this.samplesUntilNextBeat -= 1;
            this.samplesIntoSegment += 1;

            if (this.samplesIntoSegment >= this.segmentSamples) {
              this.advanceSegment();
            }
          }
        }
      }

      for (let channel = 0; channel < channelCount; channel += 1) {
        output[channel][i] = sample;
      }
    }

    return true;
  }
}

registerProcessor('metronome-worklet', MetronomeWorklet);
