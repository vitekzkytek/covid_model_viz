let lcg; //LineChartGlobals

let current_variable = 'Reported'
let lines,legend;

let chart_size = {
    viewbox:{width:960,height:500},
    viewport:{width:'80vw',height:'62vh'},
    margin: {top:0,right:0,bottom:25,left:75}}

function drawLineChart(selector) {
    updateLines(current_policy_scenario,current_baseline_scenario,current_variable);
}


function getLineChartGlobals(selector) {
    let div = $('<div />', {id:'LineChartCont'})
    $(selector).append(div);

    let svg = d3.select(selector + ' #LineChartCont')
                .append('svg')
                .attr('id','LineChartSvg')
                .attr('viewBox','0 0 '+ chart_size.viewbox.width +' '+ chart_size.viewbox.height)
                .attr('height',chart_size.viewport.height)
                .attr('width',chart_size.viewport.width)

    let g = svg.append("g")
                .attr("transform", 'translate('+chart_size.margin.left+','+chart_size.margin.top+')');
    
    let parseDate = d3.timeParse('%Y-%m-%d');

    let start = new Date(2020,1,20);
    let today = new Date()
    let end = today.addDays(150); //prototyped function below

    let x_scale = d3.scaleTime()
            .rangeRound([0,chart_size.viewbox.width-chart_size.margin.left - chart_size.margin.right])
            .domain([start,end]); //TODO how to work with time scale, when time pass by?
    
    let y_scale = d3.scaleLinear()
            .range([chart_size.viewbox.height - chart_size.margin.bottom,0])
            .domain([0,1000000]);

    x_axis = g.append('g')
            .attr('id','x-axis')
            .attr('transform','translate(0,' + (chart_size.viewbox.height - chart_size.margin.bottom) + ')')
            .call(d3.axisBottom(x_scale).tickValues(d3.timeMonth.range(start,end)));

    y_axis = g.append('g')
            .attr('id','y-axis')
            .call(d3.axisLeft(y_scale).ticks(6));
    
    
    let line_gen = d3.line()
            .defined(function (d) {return d; })
            .x(function(d) {
                return x_scale(parseDate(d.date));
            })
            .y(function(d) {
                return y_scale(d.value);
            });

    let g_lines = g.append('g').attr('id','lines');
    let g_circles = g.append('g').attr('id','circles')
    let g_legend = g.append('g').attr('id','legend').attr('transform','translate(750,50)')


    return {
        div_container:div,
        svg:svg,
        g:g,
        x_scale:x_scale,
        y_scale:y_scale,
        x_axis:x_axis,
        y_axis:y_axis,
        parseDate:parseDate,
        line_generator:line_gen,
        g_lines:g_lines,
        g_circles:g_circles,
        g_legend:g_legend,
    }
}

function drawLine(json,variable) {

    let data = json.series.values[variable].map((el,i) => ({date:json.series.dates[i],value:el}))
    let g = lcg.g;

    let lines = lcg.g_lines;

    lines.append('path')
        .attr('id','line')
        .datum(data)
        .attr('fill','none')
        .attr('stroke','#bb133e')
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray",0)
        .attr('d',lcg.line_generator)

    let circles = lcg.g_circles;

    circles.append('g').attr('id','circles')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r',3)
        .attr('fill','#bb133e')
        .attr('cy',function(d){
            return lcg.y_scale(d.value)
        })
        .attr('cx',function(d){
            return lcg.x_scale(lcg.parseDate(d.date))
        })

    return {
        circles:circles,
        lines:lines
        }

}

function drawLegend(baseline_scenario,policy_scenario,baseline_color,policy_color){
    let g_legend = lcg.g_legend;
    let legend_data;
    if (baseline_scenario != policy_scenario) {
        legend_data = [{id:policy_scenario,color:policy_color},{id:baseline_scenario,color:baseline_color}]
    } else {
        legend_data = [{id:policy_scenario,color:policy_color}]
    }


    let single_legend = g_legend.selectAll('g')
        .data(legend_data)
        .enter()
        .append('g')
        .attr('id',function(d) {
            return d.id
        })
        .attr('transform',function(d,i) {return 'translate(0,' +i*25 + ')'});
    single_legend.append('circle')
        .attr('r',8)
        .attr('cx',0)
        .attr('cy',0)
        .attr('fill',function(d) {return d.color}); 
    single_legend.append('text')
        .attr('x',12)
        .attr('y',6)
        .text(function(d) {return ddlconfig.scenarios.filter((o)=>{return o.id == d.id})[0].text;});

    return g_legend
    
}

function clearLineChart() {
    //clear paths
    d3.select('#lines').selectAll('*').remove();
    d3.select('#circles').selectAll('*').remove();
    d3.select('#legend').selectAll('*').remove();
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  