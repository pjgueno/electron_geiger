const Serialport = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');
const d3 = require('d3');
const {dialog} = require('electron').remote;
const fs = require('fs');

var dataGraph=[];

var port;
var parser;

var datePrecedente = new Date();

var dateStart = datePrecedente;

var duree = 0;

var expositionTotale = 0;

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

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('input[id="usvhm"]').onclick=updateGraph;
},false);  

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('input[id="expotot"]').onclick=updateGraph;
},false);  


document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('button[id="save"]').onclick=saveData;
},false);

function saveData(event) {
    
    var formatTime = d3.timeFormat("D%Y_%m_%dT%H_%M_%S");
    var file = formatTime(new Date);
    
    dialog.showSaveDialog({
        title: "Save Data",
        defaultPath:"/Users/PJ/Desktop/" + file +".csv",
        properties: ['createDirectory', 'showOverwriteConfirmation']
    }).then(function(result){
        
        console.log(result.filePath)
    
if (dataGraph != 0){
    
    var replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
var header = Object.keys(dataGraph[0]);

var csv = dataGraph.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(';'));
csv.unshift(header.join(';'));
csv = csv.join('\r\n');

console.log(csv);
    
fs.writeFile(result.filePath, csv, (err) => {
  if (err) throw err;
        
         dialog.showMessageBox({
            message: 'The file has been saved!',
            buttons: ['OK']
          });
})}else{console.log("NO DATA")}});   
};



function updateGraph(event) {
    
    x.domain(d3.extent(dataGraph, (d) => d.date));    
    
        y.domain([0,d3.max(dataGraph,function(d){            
            if(document.getElementById("cpm").checked == true){
               return d.value1
               };
            if(document.getElementById("usvh").checked == true){
               return d.value2
               };
        if(document.getElementById("usvhm").checked == true){
               return d.value3
               };
            if(document.getElementById("expotot").checked == true){
               return d.value4
               }
        
        
        })]);
                
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
               };
            if(document.getElementById("usvhm").checked == true){
               return "green"
               };
            if(document.getElementById("expotot").checked == true){
               return "black"
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
               };
            if(document.getElementById("usvhm").checked == true){
               return "\u03BCS/h"
               };
            if(document.getElementById("expotot").checked == true){
               return "\u03BCS"
               }
            }); 
    
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
        
        var elapsed = d3.timeSecond.count(datePrecedente,date);
        var elapsedStart = d3.timeSecond.count(dateStart,date);                
        var exposition = (usvh/3600)*elapsed;
        
        expositionTotale += exposition;
                
        var usvhMoyenne = (expositionTotale/elapsedStart)*3600;
        
        duree += elapsed;
        datePrecedente = date;
        
        document.getElementById('value3').innerHTML = "Radiation moyenne= " + usvhMoyenne.toFixed(4) + " &microS/h";
        document.getElementById('value4').innerHTML = "Exposition totale= " + expositionTotale.toFixed(5) + " &microS";

        var datasample ={date:date,value1:+cpm,value2:+usvh.toFixed(4),value3:+usvhMoyenne.toFixed(4),value4:+expositionTotale.toFixed(5)};
        
        dataGraph.push(datasample);
        
        x.domain(d3.extent(dataGraph, (d) => d.date));
        
        y.domain([0,d3.max(dataGraph,function(d){
            if(document.getElementById("cpm").checked == true){
               return d.value1
               };
            if(document.getElementById("usvh").checked == true){
               return d.value2
               };
        if(document.getElementById("usvhm").checked == true){
               return d.value3
               };
            if(document.getElementById("expotot").checked == true){
               return d.value4
               }
    
        })]);
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
    
    var margin = {top: 20, right: 10, bottom: 30, left: 40},
    width = widthGraph - margin.left - margin.right,
    height = heightGraph - margin.top - margin.bottom;
    
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);    
    
    var valueline = d3.line()
        //.curve(d3.curveBasis)
        .curve(d3.curveMonotoneX)
        .x(function(d) {return x(d.date)})
        .y(function(d) {
                        
            if(document.getElementById("cpm").checked == true){
               return y(d.value1)
               };
            if(document.getElementById("usvh").checked == true){
               return y(d.value2)
               };
            if(document.getElementById("usvhm").checked == true){
               return y(d.value3)
               };
            if(document.getElementById("expotot").checked == true){
               return y(d.value4)
               }
            });
       

            
    x.domain(d3.extent(dataGraph, (d) => d.date));
                
        y.domain([0,d3.max(dataGraph,function(d){            
            if(document.getElementById("cpm").checked == true){
               return d.value1
               };
            if(document.getElementById("usvh").checked == true){
               return d.value2
               };
            if(document.getElementById("usvhm").checked == true){
               return d.value3
               };
            if(document.getElementById("expotot").checked == true){
               return d.value4
               }
        })]);

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
               };
            if(document.getElementById("usvhm").checked == true){
               return "green"
               };
            if(document.getElementById("expotot").checked == true){
               return "black"
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
               };
            if(document.getElementById("usvhm").checked == true){
               return "\u03BCS/h"
               };
            if(document.getElementById("expotot").checked == true){
               return "\u03BCS"
               }
            }); 

