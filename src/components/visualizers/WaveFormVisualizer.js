import React, { useRef, useEffect } from 'react';

const WaveformVisualizer = () => {
    const canvasRef = useRef();
    const audioCtxRef = useRef();
    const analyserRef = useRef();
    const dataArrayRef = useRef();
    const bufferLengthRef = useRef();
    
    useEffect(() => {
        // Set up Audio Context
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;

        // Create Oscillator (Sawtooth wave)
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sawtooth'; // Change to 'sine', 'square', etc. for different waves
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
        oscillator.start();

        // Set up Analyser
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048; // Fine tune for resolution vs. performance
        analyserRef.current = analyser;

        // Connect nodes
        oscillator.connect(analyser);
        analyser.connect(audioCtx.destination);

        // Set up data array for waveform
        bufferLengthRef.current = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

        // Cleanup on unmount
        return () => {
            oscillator.stop();
            audioCtx.close();
        };
    }, []);

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const bufferLength = bufferLengthRef.current;
        const dataArray = dataArrayRef.current;

        // Set Canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = 200;

        // Draw Loop
        const draw = () => {
            requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            // Clear Canvas
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Style for the waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'limegreen';

            // Draw the waveform path
            ctx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };
        draw();
    };

    useEffect(() => {
        drawWaveform();
    }, []);

    return <canvas ref={canvasRef} />;
};

export default WaveformVisualizer;