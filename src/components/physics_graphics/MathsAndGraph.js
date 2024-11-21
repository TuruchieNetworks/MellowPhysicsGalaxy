import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import * as d3 from 'd3';

const math = create(all);

const MathAndGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const points = [];
    // Generating some data using mathjs (e.g., y = x^2)
    for (let x = -10; x <= 10; x++) {
      const y = math.evaluate(`${x}^2`);  // mathjs used for calculation
      points.push({ x, y });
    }
    setData(points);  // Set data for visualization
  }, []);

  return (
    <div>
      <h1>Math and Graph Example</h1>
      <LineChart data={data} />
    </div>
  );
};

const LineChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', 500)
      .attr('height', 300);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
      .range([0, 480]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
      .range([280, 0]);

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .attr('fill', 'red');

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default MathAndGraph;
