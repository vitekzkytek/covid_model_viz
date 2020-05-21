const img_centers = {
    school:{x:x_img_spacing+img_size/2,y:y_img_spacing+img_size/2},
    work:{x:sim_width-x_img_spacing-img_size/2,y:y_img_spacing+img_size/2},
    other:{x:x_img_spacing+img_size/2,y:sim_height-y_img_spacing-img_size/2},
    home:{x:sim_width-x_img_spacing-img_size/2,y:sim_height-y_img_spacing-img_size/2}};
const img_list = Object.keys(img_centers);
let animate;
let animate_svg;
let points;
let lastRender;
const point_radius = 8;
const pixels_per_second = 150;
const img_ratio = 1.5;
const img_radius = img_size/img_ratio;

function random_pos_on_circle(centerX,centerY,radius,angle) {
    return {
        x:centerX + Math.cos(angle)*radius,
        y:centerY + Math.sin(angle)*radius
    }
}

function Point(start) {
    let angle = d3.randomUniform(0,2*Math.PI)()
    let o = {
        img:start,
        vx:Math.cos(angle) * pixels_per_second,
        vy:Math.sin(angle) * pixels_per_second,
        position:random_pos_on_circle(img_centers[start].x, img_centers[start].y,img_radius,angle),
        infected:false
    }
    return o;
}
function assign_infection(points) {
    points[Math.floor(Math.random() * points.length)].infected = true;
    return points
}

function generate_points(n) {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let arr = [];
    
    for (i=0; i<n;i++) {
        arr.push(Point(Object.keys(img_centers)[getRandomInt(0,3)]));
    }
    return arr;
} 

function tick_point(point,progress) {
    point.position.x = point.position.x + point.vx/progress;
    point.position.y = point.position.y + point.vy/progress;

    const bordermargin = 9
    if (point.position.x < (point_radius+bordermargin)) {  
        point.vx = (point.vx < 0) ? point.vx*-1 : point.vx;
    }
    if (point.position.x > (sim_width-point_radius-bordermargin)) {
        point.vx = (point.vx > 0) ? point.vx*-1 : point.vx;
    }

    if (point.position.y < (point_radius+bordermargin)) {  
        point.vy = (point.vy < 0) ? point.vy*-1 : point.vy;
    }
    if (point.position.y > (sim_height-point_radius-bordermargin)) {
        point.vy = (point.vy > 0) ? point.vy*-1 : point.vy;
    }


    
    for (let i=0; i < points.length; i++) {
        let otherpoint = points[i];

        if (point !== otherpoint) {

            if (CheckPointCollision(point,otherpoint)) { 
                //set velocities for both points
                let vx2 = otherpoint.vx; 
                let vy2 = otherpoint.vy;
                let vx1 = point.vx;
                let vy1 = point.vy; 
                otherpoint.vx=vx1;
                otherpoint.vy=vy1;
                point.vx=vx2;
                point.vy=vy2

                if (point.infected) {
                    otherpoint.infected = true;
                }
                if (otherpoint.infected) {
                    point.infected = true;
                }

                while (CheckPointCollision(point, otherpoint)) {
                    point.position.x += vx2/progress;
                    point.position.y += vy2/progress;
    
                    otherpoint.position.x += vx1/progress;
                    otherpoint.position.y += vy1/progress;
                }
            }
        }
    }

    // for (i in img_list) {
    //     img = img_centers[img_list[i]];

    //     if (CheckImageCollision(point,img)) {
    //         point.vx = point.vx * ((point_radius - img_radius)/(point_radius+img_radius)) ;
    //         point.vy = point.vy * ((point_radius - img_radius)/(point_radius+img_radius)) ;
    //         // if ((Math.abs(point.vx)-Math.abs(point.vy)>0)) {
    //         //     point.vx = point.vx * -1;
    //         // } else {
    //         //     point.vy = point.vy * -1;
    //         // }
    //         point.position.x = point.position.x + point.vx/progress;
    //         point.position.y = point.position.y + point.vy/progress;
    //     }
    // }
    return point;
}

function CheckImageCollision(p,img) {
    var absx = Math.abs(p.position.x - img.x);
    var absy = Math.abs(p.position.y - img.y);

    // find distance between two balls.
    var distance = Math.sqrt((absx * absx) + (absy * absy));
    
    // check if distance is less than sum of two radius - if yes, collision
    if (distance < 100) {
        return true;
    }
    return false;

}

function CheckPointCollision(p1, p2) {
    var absx = Math.abs(p2.position.x - p1.position.x);
    var absy = Math.abs(p2.position.y - p1.position.y);

    // find distance between two balls.
    var distance = Math.sqrt((absx * absx) + (absy * absy));
    
    // check if distance is less than sum of two radius - if yes, collision
    if (distance < (2*point_radius)) {
        return true;
    }
    return false;
}

function redraw_points(points,svg) {
    let circles = svg.select('g#circles').selectAll('circle');

    circles
        .data(points)
        .attr('cx',d=>d.position.x)
        .attr('cy',d=>d.position.y)
        .classed('infected',d=>d.infected);
}




function update_points(progress) {
    // Update the state of the world for the elapsed time since last render
    return points.map(p=>tick_point(p,progress));
}

function loop(timestamp) {
    let svg= d3.select('#RunSimSvg');
    if (lastRender === null) lastRender = timestamp;

    var progress = timestamp - lastRender

    if (progress > 25) {

        points = update_points(progress);
        
        redraw_points(points,svg);

        lastRender = timestamp
    }

    if (animate === true ) {
        window.requestAnimationFrame(loop)
    }

}



function launch_animation(n=25,clear_points=true) {
    animate = true;

    animate_svg = d3.select('#RunSimSvg')

    if(clear_points) {
        animate_svg.select('g#circles').remove();
    }

    points = draw_points(animate_svg,n)
    
    lastRender = null;

    window.requestAnimationFrame(loop)
}

function stop_animation() {
    animate = false;
}

function continue_animation() {
    animate = true;

    window.requestAnimationFrame(loop);
}
 

function draw_points(svg,n) {
    points = generate_points(n);
    points = assign_infection(points);
    let g = svg.append('g')
        .attr('id','circles');
    g.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('cx',d=>d.position.x)
        .attr('cy',d=>d.position.y)
        .classed('infected',d=>d.infected)
        .attr('r',point_radius)

    return points;
}





























// function main_animation() {
//     svg_animation = d3.select('#RunSimSvg')

//     svg_animation.select('g#circles').selectAll('*').remove();

//     if (typeof timer !== 'undefined') {
//         timer.stop();
//       }
      
//     points = draw_points(svg_animation,5)

//     timer = d3.timer(t=>step(svg_animation,points));
      
// }

// function step(svg,points){
//     points = points.map(p=>tick_point(p));
        
//     redraw_points(points,svg);
// }




// function drawAndMove(svg,n=25) {
//      points = draw_points(svg,n);

//      points = points.map(p=>tick_point(p));

//      redraw_points(points,svg);

// }

//points = draw_points(d3.select('#RunSimSvg'))   

