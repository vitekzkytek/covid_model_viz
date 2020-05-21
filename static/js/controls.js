let controllers = {};

function generateControls(selector) {
    $(selector).append($('<div />', {id: 'controls'}));

    //controllers['ddl_scenarios'] = generateScenarioSelect(selector + ' #controls')
    controllers['ddl_variables'] = generateVariablesSelect(selector + ' #controls')

}

function generateVariablesSelect(selector) {
    let div = $('<div />',{class:'ddl',id:'variable'}).appendTo($(selector))
    var ddlel = $('<select />').appendTo(div);
    ddlel.select2({
        placeholder: 'vyberte proměnnou ...',
        allowClear: false,
        data: ddlconfig['variables'],
        width: '50vw',
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