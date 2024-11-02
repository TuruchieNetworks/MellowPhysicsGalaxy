import React, { useEffect, useRef, useState } from 'react';
import '../../styles/ScrollAnimation.css';

const ScrollAnimation = () => {
  const [showTab, setShowTab] = useState('');
  const [tabContents] = useState([
    {
      tab: 'box',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae illum minima, tempora ad neque aut fuga magnam odit ex officia. Animi officia odio molestiae, iure distinctio ratione! Repellendus, quaerat sunt?'
    },
    {
      tab: 'box',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae illum minima, tempora ad neque aut fuga magnam odit ex officia. Animi officia odio molestiae, iure distinctio ratione! Repellendus, quaerat sunt?'
    },
    {
      tab: 'box',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae illum minima, tempora ad neque aut fuga magnam odit ex officia. Animi officia odio molestiae, iure distinctio ratione! Repellendus, quaerat sunt?'
    },
    {
      tab: 'box',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae illum minima, tempora ad neque aut fuga magnam odit ex officia. Animi officia odio molestiae, iure distinctio ratione! Repellendus, quaerat sunt?'
    },
    {
      tab: 'box',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae illum minima, tempora ad neque aut fuga magnam odit ex officia. Animi officia odio molestiae, iure distinctio ratione! Repellendus, quaerat sunt?'
    },
  ]);
  
  const boxesRef = useRef([]);
  const triggerPoint = window.innerHeight / 5 * 4;

  useEffect(() => {
    const handleScroll = () => {
      boxesRef.current.forEach((box) => {
        if (box) {
          const boxTop = box.getBoundingClientRect().top; // Get the position of the box
          // If the top of the box is less than the trigger point, add show
          if (boxTop < triggerPoint) {
            box.classList.add('show');
          } else {
            box.classList.remove('show');
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [triggerPoint]); // Re-run effect if triggerPoint changes

  return (
    <div className="container">
      <h1 className="scroll-header">Scroll To See Content</h1>
      {tabContents.map((block, i) => {
        // Create a ref for each box
        boxesRef.current[i] = React.createRef();
        
        return (
          <div className={block.tab} ref={boxesRef.current[i]} key={i}>
            <h2 className={block.tab === 'box' ? 'show' : ''}>
              {block.content}
            </h2>
          </div>
        );
      })}
    </div>
  );
};

export default ScrollAnimation;
