let tables;
let orig_matrices;
const agecats = ['juniors','adults','seniors'];
const labels = {juniors:"Děti",adults:'Dospělí',seniors:'Senioři'}
const env_defaults = {'school':1,'work':1,'other':0.2,'home':1}

function generateContactTables() {
    promise = generateJsonContactTablesPromise();

    $.when(promise).then(function(){
        orig_matrices = arguments[0]['result'];
        tables = drawTables(arguments[0]['result']);
    })
    let handle = $( '#mask_bcg #mask_slider_main #custom-handle' );
    let handle2 = $( '#summarycontainer #summary_mask_main' + " #custom-handle" );

    $('#mask_bcg #mask_slider_main .slider').slider({
      // range: "min",
      value:1,
      //width:'30vw',
      min: 0,
      max: 1,
      step:0.01,
      create: function() {
        handle.text( Math.round(1 * 100) + '%' );
      },
      slide: function( event, ui ) {
        //let environment =  
        handle.text( Math.round(ui.value * 100) + '%');
        $('#summarycontainer #summary_mask_main .slider').slider( "value", ui.value );
        handle2.text( Math.round(ui.value * 100) + '%');

        $('#mask_bcg' + ' .contact_table img').css('opacity',getImageOpacity(ui.value))

      },
    });

    $('#summarycontainer #summary_mask_main .slider').slider({
      value:1,
      min: 0,
      max: 1,
      step:0.01,
      create: function() {
        handle2.text( Math.round(1* 100) + '%' );
      },
      slide: function( event, ui ) {
        //let environment =  
        handle.text( Math.round(ui.value * 100) + '%');
        $( '#mask_bcg #mask_slider_main .slider' ).slider( "value", ui.value );
        handle2.text( Math.round(ui.value * 100) + '%');
        //$('#mask_bcg' + ' .contact_table img').css('opacity',getImageOpacity(ui.value))

      },
    });
    let handle3 = $( '#mask_bcg #mask_slider_senior #custom-handle' );
    let handle4 = $( '#summarycontainer #summary_mask_senior' + " #custom-handle" );

    $('#mask_bcg #mask_slider_senior .slider').slider({
      // range: "min",
      value:1,
      //width:'30vw',
      min: 0,
      max: 1,
      step:0.01,
      create: function() {
        handle3.text( Math.round(1* 100) + '%' );
      },
      slide: function( event, ui ) {
        //let environment =  
        handle3.text( Math.round(ui.value * 100) + '%');
        $('#summarycontainer #summary_mask_senior .slider').slider( "value", ui.value );
        handle4.text( Math.round(ui.value * 100) + '%');

        //$('#mask_bcg' + ' .contact_table img').css('opacity',getImageOpacity(ui.value))

      },
    });

    $('#summarycontainer #summary_mask_senior .slider').slider({
      value:1,
      min: 0,
      max: 1,
      step:0.01,
      create: function() {
        handle4.text( Math.round(1* 100) + '%' );
      },
      slide: function( event, ui ) {
        handle3.text( Math.round(ui.value * 100) + '%');
        $( '#mask_bcg #mask_slider_senior .slider' ).slider( "value", ui.value );
        handle4.text( Math.round(ui.value * 100) + '%');
        //$('#mask_bcg' + ' .contact_table img').css('opacity',getImageOpacity(ui.value))

      },
    });

}

function drawTables(contact_matrices) {

    school = drawTable(contact_matrices['school'],'#school_bcg .table_container','school',[0,1],1)
    work = drawTable(contact_matrices['work'],'#work_bcg .table_container','work',[0,1],1)
    other = drawTable(contact_matrices['other'],'#other_bcg .table_container','other',[0,2],1,true,1,[0,2])
    home = drawTable(contact_matrices['home'],'#home_bcg .table_container','home',[1,2],1,true,1,[1,2])

    return contact_matrices
}

function drawTable(matrix,selector,environment,main_slider_range,main_slider_default,drawSeniorSlider=false,senior_slider_default=null,senior_slider_range=[0,1]) {
    // calculate default values for matrix
    matrix = multiplyMatrix(matrix,main_slider_default,(drawSeniorSlider) ? senior_slider_default : main_slider_default)

    //create div container for contact table
    let div = d3.select(selector).append('div').attr('class','contact_table');

    // draw illustration image
    let img =$('<img />', {src:'img/'+environment+ '.svg'}).appendTo($(selector + ' .contact_table'));
    img.css('opacity',getImageOpacity(main_slider_default-main_slider_range[0]))


    //append table header and body
    let tbl = div.append('table')
    let thead = tbl.append('thead')
    let	tbody = tbl.append('tbody');
    
    // fill table descriptions
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

  //function converting matrix data into d3 understandable format
  let matrix_closure = function(row) {return matrixToTableData(row,matrix)}
  
  // create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(matrix_closure)
	  .enter()
	  .append('td')
	    .text(tableDataToText);

  generateSlider(selector,environment,'main',(drawSeniorSlider) ? 'Dospělí a děti:': 'Všichni:',main_slider_default,main_slider_range,drawSeniorSlider)
  if (drawSeniorSlider) {
    generateSlider(selector,environment,'senior','Senioři:',senior_slider_default,senior_slider_range,true)
  }
  return tbl;
}

function generateSlider(contact_table_selector,environment,type,header,slider_default,slider_range,seniorSliderExists) {//type should be `main` or `senior`
      //Append main slider header
      $(contact_table_selector).append($('<h4>'+ header +'</h4>'));

      //Generate main slider
      let slidercont = $('<div />', {class:'slider_cont',id:environment+'_'+type}).appendTo($(contact_table_selector))
      let slider_cont_selector = contact_table_selector + ' #' + environment+'_'+ type +'.slider_cont'
      slidercont.append($('<div />',{class:'slider',id:environment}))
      $(slider_cont_selector + ' .slider').append($('<div />',{class:'ui-slider-handle',id:'custom-handle'}))
      let handle = $( slider_cont_selector + " #custom-handle" );
      let summary_slider_selector;
      if (seniorSliderExists) {
        summary_slider_selector = '#summarycontainer #summary_' + contact_table_selector.replace('#','').replace('_bcg .table_container','')+'_' + type + ' .slider'  
      } else {
        summary_slider_selector = '#summarycontainer #summary_' + contact_table_selector.replace('#','').replace('_bcg .table_container','')+ ' .slider'  
      }
      let handle2 = $(summary_slider_selector + " #custom-handle" );
  
      let slide_closure = function(value,type) {
        slideIntensity(contact_table_selector,environment,value,slider_range,type,seniorSliderExists);
      }
      
      $(slider_cont_selector + ' .slider').slider({
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
  
          let env = contact_table_selector.substring(1,contact_table_selector.lastIndexOf("_bcg"));
          slide_closure(ui.value,type);
        },
      });
  
      $(summary_slider_selector).slider({
        // range: "min",
        value: slider_default,
        min: slider_range[0],
        max: slider_range[1],
        step:0.01,
        create: function() {
          handle2.text(Math.round(slider_default * 100) +'%')      
        },
        slide: function(event,ui) {
          handle2.text( Math.round(ui.value * 100) + '%');
          $( contact_table_selector + ' .slider' ).slider( "value", ui.value );
          handle.text( Math.round(ui.value * 100) + '%');
          
          slide_closure(ui.value,type);    
        },
      });
  
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
function slideIntensity(selector,environment,value,slider_range,type,seniorSliderExists) {
  //fade the building image
  if (type === 'main') {
    $(selector + ' .contact_table img').css('opacity',getImageOpacity(value-slider_range[0]))
  }
  let main_value,senior_value;

  if(seniorSliderExists) {
    if(type ==='main') {
      main_value=value;
      senior_value = '';
    } else {
      main_value='';
      senior_value = value;
    } 
  } else {
    main_value=value;
    senior_value=null;
  }

  //redraw table
  redrawTable(selector,environment,main_value,senior_value,type,seniorSliderExists);
}

function redrawTable(selector,environment,main_value,senior_value,type,seniorSliderExists) {
  let matrix = multiplyMatrix(orig_matrices[environment],main_value,senior_value)
  let matrix_closure = function(row) {return matrixToTableData(row,matrix)}

  tbody = d3.select(selector + ' tbody')
  tbody.selectAll("tr")
  .data(agecats)
  .selectAll("td")
  .data(matrix_closure)
  .text(tableDataToText);
}

function multiplyMatrix(matrix,main_multiplicator,senior_multiplicator=null) {
  
  senior_multiplicator = (senior_multiplicator === null) ? main_multiplicator : senior_multiplicator;

  return {
    adults:{
      adults:matrix['adults']['adults']*main_multiplicator,
      juniors:matrix['adults']['juniors']*main_multiplicator,
      seniors:matrix['adults']['seniors']*senior_multiplicator
    },
    juniors:{
      adults:matrix['juniors']['adults']*main_multiplicator,
      juniors:matrix['juniors']['juniors']*main_multiplicator,
      seniors:matrix['juniors']['seniors']*senior_multiplicator
    },
    seniors:{
      adults: matrix['seniors']['adults']*senior_multiplicator,
      juniors: matrix['seniors']['juniors']*senior_multiplicator,
      seniors: matrix['seniors']['seniors']*senior_multiplicator
    }
  }
}