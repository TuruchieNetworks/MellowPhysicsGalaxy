import React from 'react';
import { Link } from 'react-router-dom';
import HeaderTitle from './HeaderTitle';
//import '../../HeaderTitle.css';

const HeaderLinks = () => {
  return (
    <Link to="/landing" className='headerTitle'>
      <div>
        <HeaderTitle />
      </div>
    </Link>
  );
};

export default HeaderLinks;
