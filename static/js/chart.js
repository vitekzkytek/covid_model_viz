let lcg; //LineChartGlobals

let current_policy_scenario = 'simint';
let current_baseline_scenario = 'simint'
let current_variable = 'Reported'
let lines,legend;

function drawLineChart(selector) {
    lcg = getLineChartGlobals(selector)

    updateLines(current_policy_scenario,current_baseline_scenario,current_variable);
}


function getLineChartGlobals(selector) {
    let div = $('<div />', {id:'LineChartCont'})
    $(selector).append(div);

    let svg = d3.select(selector + ' #LineChartCont')
                .append('svg')
                .attr('id','LineChartSvg')
                .attr('viewBox','0 0 960 500')
                .attr('height','82vh')
                .attr('width','80vw')

    let g = svg.append("g")
                .attr("transform", 'translate(20,20)');
    
    let parseDate = d3.timeParse('%Y-%m-%d');

    let start = new Date(2020,1,20);
    let today = new Date()
    let end = today.addDays(150); //prototyped function below

    let x_scale = d3.scaleTime()
            .rangeRound([0,864])
            .domain([start,end]); //TODO how to work with time scale, when time pass by?
    
    let y_scale = d3.scaleLinear()
            .rangeRound([450,0])
            .domain([0,1000000]);

    x_axis = g.append('g')
            .attr('id','x-axis')
            .attr('transform','translate(0,' + 450 + ')')
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

    tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    
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
        tooltip:tooltip
    }
}

function updateLines(policy_scenario,baseline_scenario,current_variable,baseline_color='#8d8d8d',policy_color='#bb133e') {
    promises = generateJsonSamplePromises(policy_scenario,baseline_scenario);
    $.when.apply($,promises).then(function() {
        lines = clearLineChart();
        lines = {
            baseline: drawLine(arguments[0][0]['result'],current_variable,baseline_scenario,true,baseline_color,policy_color),
            policy: drawLine(arguments[1][0]['result'],current_variable,policy_scenario,false,baseline_color,policy_color)
        }
        legend = drawLegend(baseline_scenario,policy_scenario,baseline_color,policy_color)
    })
}

function drawLine(json,variable,scenario,baseline,baseline_color,policy_color) {
    let series = json.series.filter(obj => {
        return obj.name === variable
      })[0]
      
    let data = process_series(series['data']);

    let g = lcg.g;

    let lines = lcg.g_lines;

    lines.append('path')
        .attr('id',scenario)
        .datum(data)
        .attr('fill','none')
        .attr('stroke',(baseline) ? baseline_color : policy_color)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", (baseline) ? 1.5: 1.5)
        .attr("stroke-dasharray",(baseline) ? 8: 0)
        .attr('d',lcg.line_generator)

    let circles = lcg.g_circles;

    circles.append('g').attr('id',scenario)
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r',3)
        .attr('fill',(baseline) ? baseline_color : policy_color)
        .attr('cy',function(d){
            return lcg.y_scale(d.value)
        })
        .attr('cx',function(d){
            return lcg.x_scale(lcg.parseDate(d.date))
        })
        .on("mouseover", function (d) {
            let color= d3.select('#'+$(this).parent().attr('id') + ' circle').attr('fill');
            let rgbc = hexToRgb(color);
            let varname = ddlconfig.variables.filter((o)=>{return o.id == current_variable})[0].text;
            let scnname = ddlconfig.scenarios.filter((o)=>{return o.id == scenario})[0].text;
            lcg.tooltip.transition()
                .duration(200)
                .style("opacity", .9)
                .style('background-color','rgba(' + rgbc.r + ','+ rgbc.g + ',' + rgbc.b + ',' + '0.1)');
            lcg.tooltip.html('Scénář: '+ scnname + ' <br />Datum: ' + d.date.toLocaleString('cs') + ' <br /> ' + varname + ': '+ Math.round(d.value).toLocaleString('cs'))
                .style('color',color)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 84) + "px");
        })
        .on("mouseout", function (d) {
            lcg.tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

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
  