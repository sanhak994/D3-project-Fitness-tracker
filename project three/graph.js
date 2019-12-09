//Graph setup
const dims = { height: 1200, width: 500};
const svg = d3.select('.canvas')
              .append('svg')
              .attr('height', dims.width + 100)
              .attr('width', dims.height + 100)

const graph = svg.append('g')
                 .attr('transform', `translate(50, 50)`);

// stratify data
const stratify = d3.stratify()
                   .id(d => d.name)
                   .parentId(d => d.parent);

//Tree method: generator
const tree = d3.tree()
               .size([dims.height, dims.width])//size we want the tree to be

//create ordinal scale
const color = d3.scaleOrdinal(['#247BA0','#70C1B3', '#B2DBBF', '#E7BCFF', '#FF1654'])


//update func
const update = (data) => {

  //remove current nodes
    //basically remove everything so during every update everything becomes a virtual
    //element. Then when it updates everything should look correct. We redo all the
    //attrs from scratch to make everything join up perfectly.
  graph.selectAll('.node').remove();
  graph.selectAll('.link').remove();


 // update ordinal scale domain
 color.domain(data.map(item => item.department))//connect color with a department


  //get updated root node data
  const rootNode = stratify(data);
  // console.log(rootNode);

  const treeData = tree(rootNode); //gives us the x and y data
  // console.log(treeData)


  //get node selection and join data
  const nodes = graph.selectAll('.node')//instead of appending groups we can also append classes
                     .data(treeData.descendants());//descendants makes data into an array format

  // get link selection and join data
  const links = graph.selectAll('.link')
                    .data(treeData.links());//.links() provides data in a way we need to create paths

  // console.log(treeData.links());//each object has a source and a target with coors already inside


  //Enter new links
  links.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#aaa')
        .attr('stroke-width', 2)
        .attr('d', d3.linkVertical() //buitin d3 func that gives us the link paths
                      .x(d => d.x) //just need to provide this and the y
                      .y(d => d.y)
                );



  //Create enter node groups
  const enterNodes = nodes.enter()
                          .append('g')
                          .attr('class', 'node')
                          // access x and y from the data to place items correctly on the page
                          .attr('transform', d => `translate(${d.x}, ${d.y})`);


  // append rects to each node
  enterNodes.append('rect')
            .attr('fill', d => color(d.data.department))
            .attr('stroke', '#555')
            .attr('stroke-width', 2)
            .attr('height', 50)
            .attr('width', d => d.data.name.length * 20)//dependent on node (length of name matters)
            //rect elements need to be shifted
            .attr('transform', d => {
              var x = d.data.name.length * 10 //cut this by half
              return `translate(${-x}, -30)` //go up up 30 px in y direc, x depends on name length
            })

  // append name text
  enterNodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .text(d => d.data.name);


};





//Real time listener: for update purposes
var data = [];
db.collection('employees').onSnapshot(res => {
  res.docChanges().forEach(change => {
                //spread out all the properties of the
                //data (name, parent, department)
                //and spread them out into this new
                // doc. Also, make and grab a newly created id
    const doc = {...change.doc.data(), id: change.doc.id};

    switch(change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
  // console.log(data);
});
