import React from 'react';
import { useNavigate } from 'react-router-dom';

const BioHeader = () => {
    const navigate = useNavigate();
    const setDynamicRoute = () => {
        navigate('/');
    };
    return (
    <div className='headerTitle'>
        <div className=''>
            <h2 className="party-lights spreader">
                <div className="bright-cover type-writer" onClick={setDynamicRoute}>
                    <span className="spreader">ECool: The Number 1 Future of Afrobeats</span> 🎶 
                    <span className="fas fa-drum"></span>
                </div>
            </h2>
        </div>
    </div>
    );
};

export default BioHeader;
