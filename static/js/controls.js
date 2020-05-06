let controllers = {};

function generateControls(selector) {
    $(selector).append($('<div />', {id: 'controls'}));

    controllers['ddl_scenarios'] = generateScenarioSelect(selector + ' #controls')
    controllers['ddl_variables'] = generateVariablesSelect(selector + ' #controls')

}

function generateScenarioSelect(selector) {
    let div = $('<div />',{class:'ddl',id:'scenario'}).appendTo($(selector))
    let ddlel = $('<select />').appendTo(div);

    ddlel.select2({
        placeholder: 'vyberte scénář ...',
        allowClear: false,
        data: ddlconfig['scenarios'],
        width: '100%',
        multiple: false,
            });

    ddlel.val('simint').trigger('change',[false]);

    ddlel.on('change',changeEvent);//,data=[true]);
        

    return {
        div_selector:selector,
        select2element:ddlel
    }
}

function generateVariablesSelect(selector) {
    let div = $('<div />',{class:'ddl',id:'variable'}).appendTo($(selector))
    var ddlel = $('<select />').appendTo(div);
    ddlel.select2({
        placeholder: 'vyberte proměnnou ...',
        allowClear: false,
        data: ddlconfig['variables'],
        width: '100%',
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
    let update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    current_policy_scenario = $('#scenario.ddl select').val()
    current_variable = $('#variable.ddl select').val()

    if (update) {
        updateLines(current_policy_scenario,current_baseline_scenario,current_variable)
    }
}