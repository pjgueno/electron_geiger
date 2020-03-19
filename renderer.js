const Serialport = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');
const d3 = require('d3');

var dataGraph=[];

var port;
var parser;

Serialport.list().then(
    ports => {
 if (ports.length === 0) {
    document.getElementById('error').textContent = 'No ports discovered'
  }else {  
    var debut = '<option value="" disabled selected>'+ports.length +' Ports</option>';
    var liste =''
    ports.forEach(function(port) {
        
        liste += '<option value="'+port.path+'">'+port.path+'</option>';
        var html = debut + liste;    
    document.getElementById("ports").innerHTML = html;
  })}},err => {
   document.getElementById('error').textContent = err.message;                   
});


document.getElementById("refresh").onclick = function(){   
Serialport.list().then(
    ports => {
 if (ports.length === 0) {
    document.getElementById('error').textContent = 'No ports discovered'
  }else {  
    var debut = '<option value="" disabled selected>'+ports.length +' Ports</option>';
    var liste =''
    ports.forEach(function(port) {
        
        liste += '<option value="'+port.path+'">'+port.path+'</option>';
        var html = debut + liste;    
    document.getElementById("ports").innerHTML = html;
  })}},err => {
   document.getElementById('error').textContent = err.message;                   
});
};

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[name="ports"]').onchange=changeEventHandler;
},false);

function changeEventHandler(event) {
    // You can use “this” to refer to the selected element.
    if(!event.target.value){
        console.log("No port selected");
    }else{
        console.log(event.target.value);
     port = new Serialport(event.target.value, {
  baudRate: 9600
});    
    port.on('open', function(){ 
    console.log("Port open"); 
    parser = port.pipe(new ByteLength({length: 4}));
    readSerial();
});
}; 
};

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('input[id="cpm"]').onclick=updateGraph;
},false);  

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('input[id="usvh"]').onclick=updateGraph;
},false);

function updateGraph(event) {
    
    x.domain(d3.extent(dataGraph, (d) => d.date));
            
    console.log(document.getElementById("cpm").checked);
    
    
        y.domain([0,d3.max(dataGraph,function(d){            
            if(document.getElementById("cpm").checked == true){
               return d.value1
               };
            if(document.getElementById("usvh").checked == true){
               return d.value2
               }})]);
         //(d) => d.value1)]
                
        var svg = d3.select("#graphd3").transition();
        
        svg.select(".line")   // change the line
            .duration(250)
            .attr("d", valueline)
             .attr("stroke", function(d) {
            if(document.getElementById("cpm").checked == true){
               return "red"
               };
            if(document.getElementById("usvh").checked == true){
               return "blue"
               }
            });

         svg.select(".x")
             .transition()
             .call(x_axis)
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        
        svg.select(".y")
             .transition()
             .call(y_axis);
            
    
    d3.select("#ytext").text(function() {
            if(document.getElementById("cpm").checked == true){
               return "CPM"
               };
            if(document.getElementById("usvh").checked == true){
               return "\u03BCS/h"
               }
            }); 
    
//     var ytext = d3.select(".y axis").transition();
//    
//    console.log(ytext);
//    
//    ytext.select('text')
//    .duration(250)
//    .text(function() {
//            console.log('asdasdasd');
//        
//            if(document.getElementById("cpm").checked == true){
//               return "CPM"
//               };
//            if(document.getElementById("usvh").checked == true){
//               return "\u03BCS/h"
//               }
//            });
//  
};






function readSerial(){
    
    parser.on('data',function(data){
        
        console.log(data);
        var cpm = Buffer.from(data).readUInt32LE(); 
        console.log(cpm);
        
        var usvh = cpm*0.00812037;
        document.getElementById('value1').innerHTML = "CPM= " + cpm;
        document.getElementById('value2').innerHTML = "Radiation= " + usvh.toFixed(4) + " &microS/h";
        
                
        var date = new Date();
         
        var datasample ={date:date,value1:+cpm,value2:+usvh};
        
        dataGraph.push(datasample);
        
        x.domain(d3.extent(dataGraph, (d) => d.date));
        
        y.domain([0,d3.max(dataGraph,function(d){
            if(document.getElementById("cpm").checked == true){
               return d.value1
               };
            if(document.getElementById("usvh").checked == true){
               return d.value2
               }})]);
         //(d) => d.value1)]
                
        var svg = d3.select("#graphd3").transition();
        
        svg.select(".line")   // change the line
            .duration(250)
            .attr("d", valueline);

         svg.select(".x")
             .transition()
             .call(x_axis)
             .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");       
        
        svg.select(".y")
             .transition()
             .call(y_axis);
 
    });
};

 
                  
                  
                  
var svg = d3.select("#graphd3").append("svg")
            .style("visibility","visible")
            .attr("id","linechart");

 
    var widthGraph = 600;
    var heightGraph = 400;

    console.log(widthGraph);
    console.log(heightGraph);
    
    var margin = {top: 20, right: 10, bottom: 30, left: 40},
    width = widthGraph - margin.left - margin.right,
    height = heightGraph - margin.top - margin.bottom;
    
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);    
    
    var valueline = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) {return x(d.date)})
        //.y(function(d) {return y(d.value1)});
        .y(function(d) {
            if(document.getElementById("cpm").checked == true){
               return y(d.value1)
               };
            if(document.getElementById("usvh").checked == true){
               return y(d.value2)
               }
            });
       

            
    x.domain(d3.extent(dataGraph, (d) => d.date));
                
        y.domain([0,d3.max(dataGraph,function(d){            
            if(document.getElementById("cpm").checked == true){
               return d.value1
               };
            if(document.getElementById("usvh").checked == true){
               return d.value2
               }})]);

   svg.append("path")
      .data([dataGraph])
      .attr("class", "line")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("d", valueline)
    .attr("stroke", function() {
            if(document.getElementById("cpm").checked == true){
               return "red"
               };
            if(document.getElementById("usvh").checked == true){
               return "blue"
               }
            });
        
        
var x_axis = d3.axisBottom()
			.scale(x)
            .ticks(20)
            .tickFormat(d3.timeFormat("%H:%M:%S"));
            

var y_axis = d3.axisLeft()
			.scale(y)
            .ticks(10);



 svg.append("g")  
    .attr("transform", "translate(" + margin.left + "," + (heightGraph - 30) + ")")
    .attr("class", "x axis")
    .call(x_axis)
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
     


svg.append("g")
  .attr("class", "y axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(y_axis)
      .append("text")
    .attr("id","ytext")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text(function() {
            if(document.getElementById("cpm").checked == true){
               return "CPM"
               };
            if(document.getElementById("usvh").checked == true){
               return "\u03BCS/h"
               }
            }); 

