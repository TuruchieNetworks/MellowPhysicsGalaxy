import React, { useState } from 'react';
import WaveControl from './WaveControl';
import WaveDisplay from './WaveDisplay';

function WaveSlider() {
    const [waveType, setWaveType] = useState(0);

    const handleWaveChange = (value) => {
        setWaveType(value);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Dynamic Waveform Display</h1>
            <WaveControl onWaveChange={handleWaveChange} />
            <WaveDisplay waveType={waveType} />
        </div>
    );
}

export default WaveSlider;
