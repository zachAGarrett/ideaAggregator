const fs = require('fs');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const d3 = Object.assign({}, require("d3-selection"));
const readPath = `${__dirname}/images.json`;
const readSentences = (path) => {
    return JSON.parse(
        fs.readFileSync(path, 'utf-8')
    );
};
const sentences = readSentences(readPath);
console.log(sentences);
for (const sentence of sentences) {
    const data = sentence.sentence;
    console.log(data);
    const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    const scaleFactor = 10;
    const bounds = (sentence.bounds* scaleFactor) + 1 ,
        squareDim = 1 * scaleFactor;
    const uid = sentence.id;
    const body = d3.select(dom.window.document.querySelector("body"))
    const svg = body.append('svg')
                    .attr('width', bounds)
                    .attr('height', bounds)
                    .attr('xmlns', 'http://www.w3.org/2000/svg');
    svg.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr('width', bounds)
        .attr('height', bounds)
        .style("fill", "black");                    
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr("x", (d) => {return d.x * scaleFactor})
        .attr("y", (d) => {return d.y * scaleFactor})
        .attr('width', squareDim)
        .attr('height', squareDim)
        .style("fill", "white");
    console.log('Appended!')

    fs.writeFileSync(`${__dirname}/${uid}.svg`, body.html());
    console.log('Written!')
}