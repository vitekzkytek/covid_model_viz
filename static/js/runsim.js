let img_size = 150;
let x_img_spacing = 150;
let y_img_spacing = 100;
let sim_height = 800;
let sim_width = 960;
let env_images = [{env:'school',x:x_img_spacing,y:y_img_spacing},
                  {env:'work',x:sim_width-x_img_spacing-img_size,y:y_img_spacing},
                  {env:'other',x:x_img_spacing,y:sim_height-y_img_spacing-img_size},
                  {env:'home',x:sim_width-x_img_spacing-img_size,y:sim_height-y_img_spacing-img_size}];

function draw_runsim(selector) {
    let svg = d3.select(selector).append('svg')
        .attr('id','RunSimSvg')
        .attr('height','85vh')
        .attr('width','50vw')
        .attr('viewBox','0 0 ' +sim_width + ' ' + sim_height);
    svg.append('g')
        .attr('transform','translate(5,5)')
        .append('rect')
        .attr('id','border')
        .attr('x',0)
        .attr('y',0)
        .attr('width',sim_width-10)
        .attr('height',sim_height-10)
        .attr('rx',20)
        .attr('rx',20);

    svg.selectAll('image')
        .data(env_images)
        .enter()
        .append('g')
        .attr('id',d=>d.env)
        .attr('class','imgicon')
        .attr('transform',d=>'translate('+ d.x + ',' + d.y + ')')
        .append('svg:image')
        .attr('xlink:href',d=>'img/' + d.env + '.svg')
        .attr('width',img_size)
        .attr('height',img_size);
    let gbutton = svg.append('g')
        .attr('id','run_button')
    gbutton.append('rect')
        //.attr('id','run_button')
        .attr('width',200)
        .attr('height',60)
        .attr('x',(sim_width-200)/2)
        .attr('y',(sim_height-60)/2)
        .attr('rx',20)
        .attr('ry',20)
        .on('mouseover',function() {
            d3.select(this).classed('hovered_button',true);
            d3.select('#run_button text').classed('hovered_button',true);
        })
        .on('mouseout',function() {
            d3.select(this).classed('hovered_button',false);
            d3.select('#run_button text').classed('hovered_button',false);
        })
        .on('click',run_simulation);

;

    gbutton.append('text')
        //.attr('id','run_button_text')
        .attr('text-anchor','middle')
        .attr('x','50%')
        .attr('y','50%')
        .attr('dominant-baseline','middle')
        .text('Simuluj!')
        .on('mouseover',function() {
            d3.select(this).classed('hovered_button',true);
            d3.select('#run_button rect').classed('hovered_button',true);
        })
        .on('mouseout',function() {
            d3.select(this).classed('hovered_button',false);
            d3.select('#run_button rect').classed('hovered_button',false);
        })
        .on('click',run_simulation);

}


function refresh_image_opacity() {
    let ids = env_images.map(env=>env.env)
    for (id in ids) {
        let simimg = $('#RunSimSvg #'+ids[id])
        let table_img = $('#' + ids[id] +'_bcg img')
        simimg.css('opacity',table_img.css('opacity'))
    }
    return ids
}

function run_simulation(){

}