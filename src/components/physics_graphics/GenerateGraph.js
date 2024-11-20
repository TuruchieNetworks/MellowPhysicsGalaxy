import * as d3 from "d3";
import { useEffect, useRef } from "react";

const GenerateGraph = ({ data, width = 600, height = 400 }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Select or create the SVG element
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Clear previous content
        svg.selectAll("*").remove();

        // Create a group for the graph
        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X and Y Scales
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.x))
            .range([0, innerWidth]);

        const yScale = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.y))
            .range([innerHeight, 0]);

        // Create Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
            .call(xAxis)
            .attr("transform", `translate(0,${innerHeight})`);

        g.append("g").call(yAxis);

        // Plot the data
        const lineGenerator = d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(d3.curveBasis); // Smooth curve

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        // Add points for data
        g.selectAll(".point")
            .data(data)
            .join("circle")
            .attr("class", "point")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 3)
            .attr("fill", "red");
    }, [data, width, height]);

    return <svg ref={svgRef} />;
};

export default GenerateGraph;