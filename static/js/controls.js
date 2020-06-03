let controllers = {};

function generateControls(selector) {
    $(selector).append($('<div />', {id: 'controls'}));

    controllers['ddl_variables'] = generateVariablesSelect(selector + ' #controls')
    controllers['btn_new_sim'] = generateNewSimButton(selector + ' #controls')
}

function generateVariablesSelect(selector) {
    let div = $('<div />',{class:'ddl',id:'variable'}).appendTo($(selector))
    var ddlel = $('<select />').appendTo(div);
    ddlel.select2({
        placeholder: 'vyberte proměnnou ...',
        allowClear: false,
        data: ddlconfig['variables'],
        width: '35vw',
        multiple: false,
    });

    ddlel.val('Reported').trigger('change',[false]);

    ddlel.on('change',changeEvent);//,data=[true]);

    return {
        div_selector:selector,
        select2element:ddlel
    }
}

function changeEvent(event) {
    selected_variable = $('#variable.ddl select').val()
    updateMapChart('#MapChartContainer',modeldata,selected_variable,selected_date)    
}

function generateNewSimButton(selector) {
    var ddlel = $('<a onclick="new_sim()" id="run_sim" class="button buttonActive">Nová simulace</a>').appendTo(selector);

}
function new_sim() {
    MoveOn('empty-intro')
    hide_chart();
    d3.select('#simcontainer').selectAll('*').remove();
    draw_runsim('#simcontainer')
    show_sim();
}