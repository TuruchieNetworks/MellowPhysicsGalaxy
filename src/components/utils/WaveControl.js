import React, { useState } from 'react';

function WaveControl({ onWaveChange }) {
    const [waveType, setWaveType] = useState(0); // Slider range from 0 to 2

    const handleSliderChange = (event) => {
        const newValue = parseFloat(event.target.value);
        setWaveType(newValue);
        onWaveChange(newValue); // Pass updated value to parent
    };

    return (
        <div style={{ padding: '10px', textAlign: 'center' }}>
            <h3>Waveform Control</h3>
            <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={waveType}
                onChange={handleSliderChange}
            />
            <p>Wave Type: {waveType.toFixed(2)}</p>
            <p>0 = Sine, 1 = Saw, 2 = Square</p>
        </div>
    );
}

export default WaveControl;