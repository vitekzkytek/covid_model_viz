let selected_date = new Date();
let selected_variable = 'Reported';
let regiodata,mapdata;
let map_chart_svg;
let modeldata;
let geoGenerator;


const regionnames = ['Hlavní město Praha', 'Středočeský kraj', 'Jihočeský kraj','Plzeňský kraj','Karlovarský kraj', 'Ústecký kraj', 'Liberecký kraj', 'Královéhradecký kraj',
     'Pardubický kraj', 'Kraj Vysočina', 'Jihomoravský kraj', 'Olomoucký kraj', 'Zlínský kraj', 'Moravskoslezský kraj']

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

function drawMapGlobals(reg_selector) {
    
    d3.json('map/kraje.geojson').then(function(geodata) {
    //    var geoGenerator = d3.geoPath()
    //.projection(d3.geoMercator().fitExtent([[0,0],[960,500]], geo)
    // );
        regiodata = JSON.parse(JSON.stringify(geodata));;
        mapdata = JSON.parse(JSON.stringify(geodata));;
        //let projection = d3.geoMercator().fitSize([0.5*window.innerWidth-30,0.5*window.innerHeight],regiodata);
        let projection = d3.geoMercator().fitExtent([[0,0],[450,350]],regiodata);

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
                updateRegMapSummary();
            });
        updateRegMapSummary();
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
function updateRegMapSummary() {
    let regionbools = $('#regionselector path').toArray().map(x=>$(x).hasClass('active'))
    let textSummary = '';

    if (regionbools.filter(Boolean).length == regionnames.length) {
        textSummary = 'Všechny kraje';
    } else {

    
        if(regionbools.filter(Boolean).length >=7) {
            let unselected = []
            regionbools.forEach((element,index) => {
                if (!element) {
                    unselected.push(regionnames[index]);
                }
            });
            textSummary = 'Nevybrané kraje: ' + unselected.join(', ')
        } else {
            if (regionbools.filter(Boolean).length == 0) {
                textSummary = 'Žádný kraj';
            } else {
                let selected = []
                regionbools.forEach((element,index) => {
                    if (element) {
                        selected.push(regionnames[index]);
                    }
                    
                });
                textSummary = 'Vybrané kraje: ' + selected.join(', ')
            }
        }
    }

    let el = $('#summarycontainer #summary_region #textMap').text(textSummary)
}