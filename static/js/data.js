function generateSamplePromise() {
    return $.getJSON('/sample')
}

function generateJsonContactTablesPromise() {
    return $.getJSON('/contact_matrices')
}


function generateSimulationPromise(params) {
    return $.ajax({
        type:"POST",
        url:'/run_simulation',
        data: JSON.stringify(params),
        contentType:'application/json; charset=utf-8',
        dataType:'json',
    })

    //return $.post('/run_simulation',data=JSON.stringify(params),dataType='json')
}

