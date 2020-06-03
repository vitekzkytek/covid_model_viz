let selected_date = new Date();
let selected_variable = 'Reported';
let regiodata,mapdata;
let map_chart_svg;
let modeldata;
let geoGenerator;
let tooltip;

const legmax ={Reported:1000000,Dead:100000,Infected:10000000,Hospital:100000}
const czech_pop = 10000000;

const leg_cells = [0.0001,0.001,0.01,0.1];
const ddlconfig = {
    variables:[
        {
            id:"Reported",
            text:"Detekovaní nakažení",
            title:'Počet a podíl detekovaných nakažených na populaci kraje',
            legmax:1
    
        },
        {
            id:"Infected",
            text:"Aktuálně nakažení",
            title:'Počet a podíl aktuálně nakažených na populaci kraje',
            legmax:1
        },        
    ]
}

function drawMapGlobals(reg_selector,map_selector,init_date,start = new Date(2020,2,1),end = new Date(2020,6,31)) {
    
    d3.json('map/kraje.geojson').then(function(geodata) {
    //    var geoGenerator = d3.geoPath()
    //.projection(d3.geoMercator().fitExtent([[0,0],[960,500]], geo)
    // );
        regiodata = JSON.parse(JSON.stringify(geodata));;
        mapdata = JSON.parse(JSON.stringify(geodata));;
        let projection = d3.geoMercator().fitSize([0.5*window.innerWidth-30,0.5*window.innerHeight],regiodata);
        let geoGenerator = d3.geoPath().projection(projection);
        mapdata.features.forEach(function (f) {
            f.properties.centroid = geoGenerator.centroid(f.geometry)

            if (f.properties.nazev === 'Hlavní město Praha') {
                f.properties.centroid[1] -= 15
                f.properties.centroid[0] += 28
            }
            if (f.properties.nazev === 'Středočeský kraj') {
                f.properties.centroid[0] -= 15
                f.properties.centroid[1] += 30
            }
            if (f.properties.nazev === 'Olomoucký kraj') {
                f.properties.centroid[1] += 15
            }
        })
        regiodata.features.forEach(function(f) { f.properties.active = true });

        tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        let g =  d3.select(reg_selector)
            .append('svg')
            .attr('id','regionselector')
            .attr('width','50vw')
            .attr('height','50vh')
            .append('g');
        g.selectAll('path')
            .data(regiodata.features)
            .enter()
            .append('path')
            .classed('active',function(d) {
                return d.properties.active;
            })
            .attr('d',geoGenerator)
            .on('click',function(d) {
                d.properties.active = !d.properties.active;
                d3.select(this).classed('active',d.properties.active)
            });

        map_chart_svg = d3.select(map_selector + ' #MapChart').append('svg').attr('width','50vw').attr('height','50vh').attr('id','MapChartSvg');
            
        let g2 = map_chart_svg
            .append('g')
            .selectAll('path')
            .data(mapdata.features)
            .enter()
            .append('path')
            .attr('id',d=>d.properties.id)
            .attr('class','kraj')
            .attr('d',geoGenerator)
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .8)
                    .style('background-color','#bb133e')
                    .style('color','white')
                tooltip.html('Kraj: '+d.properties.nazev +' <br /> Datum: ' +selected_date.toLocaleDateString('cs') +'<br/> ' + ddlconfig.variables.filter(x=>x.id===selected_variable)[0].text+': '+ Math.round(d.properties.value).toLocaleString('cs') + ',<br /> což je: '+ Math.round((d.properties.value/d.properties.pop2011)*100*1000)/1000 +'% populace kraje')
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 84) + "px");
            })
            .on("mousemove", function (d) {
                tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 84) + "px");

            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    ;

        map_chart_svg.append('g').attr('id','labels')
        .selectAll('text')
            .data(mapdata.features)
            .enter()
            .append('text');

        p1 = projection([14.45,50.086]);
        p2 = projection([14.85,50.18]);

        map_chart_svg 
            .append('line')
            .attr('id','helpPrague')
            .attr('x1',p1[0])
            .attr('y1',p1[1])
            .attr('x2',p2[0])
            .attr('y2',p2[1])
            .attr('stroke','white');
        
        let leg_g =map_chart_svg
            .append('g')
            .attr('id','legend')
            .attr('transform','translate(500,0)');

        let g3 = leg_g.selectAll('g')
            .data(leg_cells)
            .enter()
            .append('g')
            .attr('class','leg_g')
            .attr('transform',function(d,i) {return 'translate(0,' + i*25 + ')'});
        
        g3.append('rect')
            .attr('width',15)
            .attr('height',15)
            .attr('fill','#bb133e')
        g3.append('text')
            .attr('transform','translate(20,12.5)')
            .text(function(d) {return (d*100 + '%').replace('.',',')})
            

        let total_g =map_chart_svg
            .append('g')
            .attr('id','total')
            .attr('transform','translate(100,25)')
            .append('text')
            .attr('x',0)
            .attr('y',0);

    });
    
    
    $(map_selector + ' #map_slider').slider({
        // range: "min",
        value:init_date.valueOf(),
        //width:'30vw',
        min: start.valueOf(),
        max: end.valueOf(),
        step:86400000,
        create: function(event,ui) {
          $( map_selector +' #map_slider #custom-handle' ).text( init_date.toLocaleString('cs'));
          selected_date = init_date;
        },
        slide: function( event, ui ) {
          selected_date = new Date(ui.value)
          $(map_selector + ' #map_slider #custom-handle' ).text(selected_date.toLocaleString('cs'));

          updateMapChart(map_selector,modeldata,selected_variable,selected_date)
        },
      });

}


function updateMapChart(selector,modeldata,variable,selected_date) {

    let svg = d3.select(selector + ' svg');
    let conf = ddlconfig.variables.filter(x=>(x.id === variable))[0]
    d3.select(selector + ' #MapTitle').text(conf.title);

    function formatDate(d) {
        return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
    }    

    var logScale = d3.scaleLog()
    .domain([0.00000001, conf.legmax])
    .range([0, 1]);

    let idxDate = modeldata.series.dates.indexOf(formatDate(selected_date));

    let reglist = modeldata.series.regions[variable].map(r=>r[idxDate])

    //update mapdata
    mapdata.features.forEach(function(f) {f.properties.value = reglist[f.properties.id]});


    svg.selectAll('path')
        .data(mapdata.features)
        .attr('fill-opacity',function(d) {
        return ((d.properties.value/d.properties.pop2011)>0) ? logScale(d.properties.value/d.properties.pop2011) : 0
    });
    svg.select('g#labels').selectAll('text')
        .data(mapdata.features)
        .attr('x',function(d) {return d.properties.centroid[0]})
        .attr('y',function(d) {return d.properties.centroid[1]})
        .text(function(d) {return Math.round(d.properties.value)});


        svg.select('g#total text').text('Celkem: ' + Math.round(modeldata.series.values[variable][idxDate]));

    updateLegend(selector,logScale)
}

function  updateLegend(selector,scale,n=100) {

    d3.selectAll(selector +' .leg_g')
        .data(leg_cells)
        .select('rect')
        .attr('fill-opacity',function(d) {
            return scale(d)
        });
}

function drawMapChart(selector,variable,date) {

    promise = generateSamplePromise();

    $.when(promise).then(function(data) {
        modeldata = data['result'];
        updateMapChart(selector,modeldata,variable,date)
    });


}