let tables;
let orig_matrices;
const agecats = ['juniors','adults','seniors'];
const labels = {juniors:"Děti",adults:'Dospělí',seniors:'Senioři'}

function generateContactTables() {
    promise = generateJsonContactTablesPromise();

    $.when(promise).then(function(){
        orig_matrices = arguments[0]['result'];
        tables = drawTables(arguments[0]['result']);
    })
    let handle = $( '#mask_bcg' + " #custom-handle" );
    let handle2 = $( '#summarycontainer #summary_mask' + " #custom-handle" );

    $('#mask_bcg .slider').slider({
      // range: "min",
      value:0.865,
      //width:'30vw',
      min: 0,
      max: 1,
      step:0.01,
      create: function() {
        handle.text( Math.round(0.865* 100) + '%' );
      },
      slide: function( event, ui ) {
        //let environment =  
        handle.text( Math.round(ui.value * 100) + '%');
        $('#summarycontainer #summary_mask .slider').slider( "value", ui.value );
        handle2.text( Math.round(ui.value * 100) + '%');

        $('#mask_bcg' + ' .contact_table img').css('opacity',getImageOpacity(ui.value))

      },
    });

    $('#summarycontainer #summary_mask .slider').slider({
      // range: "min",
      value:0.865,
      //width:'30vw',
      min: 0,
      max: 1,
      step:0.01,
      create: function() {
        handle2.text( Math.round(0.865* 100) + '%' );
      },
      slide: function( event, ui ) {
        //let environment =  
        handle.text( Math.round(ui.value * 100) + '%');
        $( '#mask_bcg .slider' ).slider( "value", ui.value );
        handle2.text( Math.round(ui.value * 100) + '%');
        $('#mask_bcg' + ' .contact_table img').css('opacity',getImageOpacity(ui.value))

      },
    });

}

function drawTables(contact_matrices) {

    school = drawTable(contact_matrices['school'],'#school_bcg .table_container','school',[0,1],0.01)
    work = drawTable(contact_matrices['work'],'#work_bcg .table_container','work',[0,1],0.5)
    other = drawTable(contact_matrices['other'],'#other_bcg .table_container','other',[0,1],0.2)
    home = drawTable(contact_matrices['home'],'#home_bcg .table_container','home',[1,1.44],1.44)

    return contact_matrices
}

function drawTable(matrix,selector,environment,slider_range,slider_default) {
    //$(selector).remove();
	  matrix = multiplyMatrix(matrix,slider_default)

    let div = d3.select(selector).append('div').attr('class','contact_table');

    let img =$('<img />', {src:'img/'+environment+ '.svg'}).appendTo($(selector + ' .contact_table'));
    img.css('opacity',getImageOpacity(slider_default-slider_range[0]))

    let tbl = div.append('table')
    let thead = tbl.append('thead')
    let	tbody = tbl.append('tbody');
    
	thead.append('tr')
	  .selectAll('th')
	  .data(['Koho → \n Kdo ↓'].concat(agecats.map(x=>labels[x]))).enter()
	  .append('th')
	    .text(function (column) { return column; });
	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(agecats)
	  .enter()
      .append('tr');
    //rows
     // .append('td')
      //.text(function(d) {return d;});

  // create a cell in each row for each column
  let matrix_closure = function(row) {return matrixToTableData(row,matrix)}
	var cells = rows.selectAll('td')
	  .data(matrix_closure)
	  .enter()
	  .append('td')
	    .text(tableDataToText);

    //d3.select(selector).append('div').attr('class','slider');
    $(selector).append($('<h4>Intenzita potkávání: </h4>'));

    let slidercont = $('<div />', {class:'slider_cont'}).appendTo($(selector))
    slidercont.append($('<div />',{class:'slider',id:environment}))
    $(selector + ' div.slider_cont .slider').append($('<div />',{class:'ui-slider-handle',id:'custom-handle'}))
    let handle = $( selector + " #custom-handle" );

    let summary_slider_selector = '#summarycontainer #summary_' + selector.replace('#','').replace('_bcg .table_container','') + ' .slider' 
    let handle2 = $(summary_slider_selector + " #custom-handle" );

    let slide_closure = function(value,seniors) {
      slideIntensity(selector,environment,value,slider_range,seniors);
    }
    
    // $(selector + ' .slider').slider({
    //   // range: "min",
    //   value: slider_default,
    //   //width:'30vw',
    //   min: slider_range[0],
    //   max: slider_range[1],
    //   step:0.01,
    //   create: function() {
    //     handle.text(Math.round(slider_default * 100) +'%')      
    //   },
    //   slide: function(event,ui) {
    //     handle.text( Math.round(ui.value * 100) + '%');
    //   },
    // });

    $(selector + ' .slider').slider({
      // range: "min",
      value: slider_default,
      //width:'30vw',
      min: slider_range[0],
      max: slider_range[1],
      step:0.01,
      create: function() {
        handle.text(Math.round(slider_default * 100) +'%')      
      },
      slide: function(event,ui) {
        handle.text( Math.round(ui.value * 100) + '%');
        $( summary_slider_selector ).slider( "value", ui.value );
        handle2.text( Math.round(ui.value * 100) + '%');

        let env = selector.substring(1,selector.lastIndexOf("_bcg"));
        let seniors = (env == 'other') ? !$('#other_bcg .switch input').is(':checked') : true;
        slide_closure(ui.value,seniors);    

      },
    });

    $(summary_slider_selector).slider({
      // range: "min",
      value: slider_default,
      width:'30vw',
      min: slider_range[0],
      max: slider_range[1],
      step:0.01,
      create: function() {
        handle2.text(Math.round(slider_default * 100) +'%')      
      },
      slide: function(event,ui) {
        handle2.text( Math.round(ui.value * 100) + '%');
        $( selector + ' .slider' ).slider( "value", ui.value );
        handle.text( Math.round(ui.value * 100) + '%');
        
        let env = selector.substring(1,selector.lastIndexOf("_bcg"));
        let seniors = (env == 'other') ? !$('#other_bcg .switch input').is(':checked') : true;
        slide_closure(ui.value,seniors);    
      },
    });

  return tbl;

}


function matrixToTableData(row,matrix){
  return [labels[row]].concat(agecats.map(x=> matrix[row][x]))
}

function tableDataToText(d) {
  return (typeof d === 'string') ? d : (Math.round(d*100)/100).toFixed(2).replace('.',','); 
}

function getImageOpacity(value,c=0.1) {
  return value+c-value*c
}
function slideIntensity(selector,environment,value,slider_range,seniors) {
  //fade the building image
  $(selector + ' .contact_table img').css('opacity',getImageOpacity(value-slider_range[0]))

  //redraw table
  redrawTable(selector,environment,value,seniors);
}

function redrawTable(selector,environment,value,seniors) {
  let matrix = multiplyMatrix(orig_matrices[environment],value,seniors)
  let matrix_closure = function(row) {return matrixToTableData(row,matrix)}

  tbody = d3.select(selector + ' tbody')
  tbody.selectAll("tr")
  .data(agecats)
  .selectAll("td")
  .data(matrix_closure)
  .text(tableDataToText);
}

function multiplyMatrix(matrix,value,seniors) {
  return {
    adults:{
      adults:matrix['adults']['adults']*value,
      juniors:matrix['adults']['juniors']*value,
      seniors: (seniors) ? matrix['adults']['seniors']*value :  matrix['adults']['seniors']
    },
    juniors:{
      adults:matrix['juniors']['adults']*value,
      juniors:matrix['juniors']['juniors']*value,
      seniors:(seniors) ? matrix['juniors']['seniors']*value : matrix['juniors']['seniors']
    },
    seniors:{
      adults: (seniors) ? matrix['seniors']['adults']*value : matrix['seniors']['adults'],
      juniors: (seniors) ? matrix['seniors']['juniors']*value : matrix['seniors']['juniors'],
      seniors: (seniors) ? matrix['seniors']['seniors']*value : matrix['seniors']['seniors']
    }
  }
}