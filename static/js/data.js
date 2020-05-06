function generateJsonSamplePromises(policy_scenario, baseline_scenario) {
    let policy_ajax = $.getJSON('/sample/' + policy_scenario)
    let baseline_ajax = $.getJSON('/sample/' + baseline_scenario)

    return [baseline_ajax,policy_ajax]
}

function process_series(series) {
    let dates = series['dates'];
    let values = series['values'];
    let result = [];
    for (i in values) {
        result.push({date:dates[i],value:values[i]});
    }
    return result;
}