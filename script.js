class DJConsole {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.decks = {
            left: this.createDeck('left'),
            right: this.createDeck('right')
        };
        this.setupCrossfader();
        this.setupVisualizer();
    }

    createDeck(side) {
        const deck = {
            audio: null,
            source: null,
            gainNode: this.audioContext.createGain(),
            delayNode: this.createDelayEffect(),
            reverbNode: this.createReverbEffect(),
            playing: false,
            speed: 1
        };

        const fileInput = document.getElementById(`audio-file-${side}`);
        const uploadBtn = document.querySelector(`.upload-btn[data-deck="${side}"]`);
        const playBtn = document.querySelector(`.play-btn[data-deck="${side}"]`);
        const speedControl = document.querySelector(`.speed-control[data-deck="${side}"]`);
        const delayControl = document.querySelector(`.delay-control[data-deck="${side}"]`);
        const reverbControl = document.querySelector(`.reverb-control[data-deck="${side}"]`);
        const vinyl = document.querySelector(`.turntable.${side} .vinyl`);

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e, deck, vinyl));
        playBtn.addEventListener('click', () => this.togglePlay(deck, playBtn, vinyl));
        speedControl.addEventListener('input', (e) => this.adjustSpeed(deck, e.target.value));
        delayControl.addEventListener('input', (e) => this.adjustDelay(deck, e.target.value));
        reverbControl.addEventListener('input', (e) => this.adjustReverb(deck, e.target.value));

        deck.source && deck.source.connect(deck.delayNode);
        deck.delayNode.connect(deck.reverbNode);
        deck.reverbNode.connect(deck.gainNode);
        deck.gainNode.connect(this.audioContext.destination);
        return deck;
    }

    createDelayEffect() {
        const delayNode = this.audioContext.createDelay(5.0);
        delayNode.delayTime.value = 0;
        const feedbackGain = this.audioContext.createGain();
        feedbackGain.gain.value = 0;
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        return delayNode;
    }

    createReverbEffect() {
        const convolver = this.audioContext.createConvolver();
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = 0;
        this.generateReverb(convolver);
        convolver.connect(reverbGain);
        return reverbGain;
    }

    generateReverb(convolver) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-i / (sampleRate * 0.1));
            leftChannel[i] = (Math.random() * 2 - 1) * decay;
            rightChannel[i] = (Math.random() * 2 - 1) * decay;
        }

        convolver.buffer = impulse;
    }

    adjustDelay(deck, value) {
        const normalizedValue = value / 100;
        deck.delayNode.delayTime.value = normalizedValue * 0.5;
    }

    adjustReverb(deck, value) {
        const normalizedValue = value / 100;
        deck.reverbNode.gain.value = normalizedValue;
    }

    handleFileSelect(event, deck, vinyl) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            this.audioContext.decodeAudioData(e.target.result)
                .then(buffer => {
                    deck.audio = buffer;
                    vinyl.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
                })
                .catch(error => console.error('Error decoding audio data:', error));
        };

        reader.readAsArrayBuffer(file);
    }

    togglePlay(deck, button, vinyl) {
        if (!deck.audio) return;

        if (deck.playing) {
            const currentTime = this.audioContext.currentTime;
            deck.gainNode.gain.setValueAtTime(deck.gainNode.gain.value, currentTime);
            deck.gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3);
            
            const scratchOsc = this.audioContext.createOscillator();
            const scratchGain = this.audioContext.createGain();
            scratchOsc.type = 'sawtooth';
            scratchOsc.frequency.setValueAtTime(1000, currentTime);
            scratchOsc.frequency.exponentialRampToValueAtTime(50, currentTime + 0.2);
            scratchGain.gain.setValueAtTime(0.1, currentTime);
            scratchGain.gain.linearRampToValueAtTime(0, currentTime + 0.2);
            
            scratchOsc.connect(scratchGain);
            scratchGain.connect(this.audioContext.destination);
            scratchOsc.start(currentTime);
            scratchOsc.stop(currentTime + 0.2);
            
            setTimeout(() => {
                deck.pausedAt = this.audioContext.currentTime - deck.startedAt;
                deck.source.stop();
                deck.playing = false;
                button.textContent = deck.pausedAt ? 'Resume' : 'Play';
                vinyl.classList.remove('playing');
                vinyl.closest('.platter').querySelector('.tonearm').style.transform = 'rotate(-20deg)';
            }, 300);
        } else {
            deck.source = this.audioContext.createBufferSource();
            deck.source.buffer = deck.audio;
            deck.source.playbackRate.value = deck.speed;
            deck.source.connect(deck.delayNode);
            
            const offset = deck.pausedAt || 0;
            deck.startedAt = this.audioContext.currentTime - offset;
            deck.source.start(0, offset);
            deck.playing = true;
            button.textContent = 'Stop';
            vinyl.classList.add('playing');
            vinyl.closest('.platter').querySelector('.tonearm').style.transform = 'rotate(0deg)';

            deck.source.onended = () => {
                deck.playing = false;
                deck.pausedAt = 0;
                button.textContent = 'Play';
                vinyl.classList.remove('playing');
            };
        }
    }

    adjustSpeed(deck, speed) {
        deck.speed = parseFloat(speed);
        if (deck.source && deck.playing) {
            deck.source.playbackRate.value = deck.speed;
        }
    }

    setupCrossfader() {
        const crossfader = document.querySelector('.crossfader');
        crossfader.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.decks.left.gainNode.gain.value = 1 - value;
            this.decks.right.gainNode.gain.value = value;
        });
    }

    setupVisualizer() {
        const canvas = document.getElementById('visualizer');
        const ctx = canvas.getContext('2d');
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;

        this.decks.left.gainNode.connect(analyser);
        this.decks.right.gainNode.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = canvas.width / bufferLength;

        const draw = () => {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            dataArray.forEach((value, i) => {
                const barHeight = (value / 255) * canvas.height;
                const hue = (i / bufferLength) * 360;
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
            });
        };

        draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DJConsole();
});