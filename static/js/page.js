"use strict";

var waypoints;
var shareLink = 'vitekzkytek.cz/InbreedingApp'; //TODO
var shareTitle = 'Odkud se rekrutují výzkumníci?'; //TODO
var fbLink = 'https://www.facebook.com/ideacerge/posts/997690760422768/'; //TODO

function loadJS() {
    waypoints = waypointing();
    
    dragify();
    
    checkResolution();
    
    shareLinks();
    
    generateContactTables();
    
    drawMapGlobals('#regioncontainer','#MapChartContainer',selected_date);

    generateControls('#MapChartControls');

    // lcg = getLineChartGlobals('#chartcontainer')

    draw_runsim('#simcontainer')
}

function shareLinks() {
    //Facebook
    $('#fb').attr('href', "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(shareLink)); //Twitter

    $('#tw').attr('href', "https://twitter.com/intent/tweet?text=" + encodeURI(shareTitle + ' ' + shareLink)); //LinkedIn

    $('#li').attr('href', "http://www.linkedin.com/shareArticle?mini=true&url=" + encodeURI(shareLink) + "&title=" + encodeURI(shareTitle));
    $('#mail').attr('href', "mailto:?subject=" + encodeURIComponent(shareTitle) + "&body=" + encodeURIComponent(shareLink));
}

function checkResolution() {
    var w = $(window).width();
    var weblink = window.location.href;
    if (w < 999) {
        $('#myurl2').val(weblink);
        showModal('modRozliseni');
        //$('#modalWrap').off('click');
    }
}

function waypointing() {
    //FIXING AND FLOATING MENU
    waypoints = $('#menu').waypoint(function (direction) {
        if (direction === 'down') {
            $('#everything').append($('<div class="stickyshadow"></div>'));
            $('#menu').addClass('sticky');
            $('#menu').removeClass('floaty');
            $('#menuempty').css('display', 'block');
        } else {
            $('#menu').addClass('floaty');
            $('#menu').removeClass('sticky');
            $('#menuempty').css('display', 'none');
            $('.stickyshadow').remove();
        }
    }); 
    
    //MENU READING PROGRES BARS
    function addMenuProgressTrigger(trigger_id,menu_id,offset='17%',progress_class='storyPast') {
        return $('#' + trigger_id).waypoint({
            handler: function handler(direction) {
                if (direction === 'down') {
                    $('#' + menu_id).addClass(progress_class);
                } else {
                    $('#' + menu_id).removeClass(progress_class);
                }
            },
            offset: offset
        });
    }

    addMenuProgressTrigger('school','mSchool');
    addMenuProgressTrigger('work','mWork');
    addMenuProgressTrigger('other','mOther');
    addMenuProgressTrigger('home','mHome');
    addMenuProgressTrigger('mask','mMask');
    addMenuProgressTrigger('sim','mSim');


    // Switching backgrounds
    function addBackgroundTrigger(trigger_id,down_id,up_id) {
        function activatefix(selector) {
            $('.fixactive').removeClass('fixactive');
            $(selector).addClass('fixactive');
        };

        $('#'+trigger_id).waypoint(function(direction) {
            if (direction === 'down') {
                activatefix('#' + down_id)
            } else {
                activatefix('#' + up_id)
            }
        })
    }
    
    addBackgroundTrigger('school','school_bcg','intro');
    addBackgroundTrigger('work','work_bcg','school_bcg');
    addBackgroundTrigger('other','other_bcg','work_bcg');
    addBackgroundTrigger('home','home_bcg','other_bcg');
    addBackgroundTrigger('mask','mask_bcg','home_bcg');
    addBackgroundTrigger('region','region_bcg','mask_bcg');
    addBackgroundTrigger('summary','summary_bcg','region_bcg');
    addBackgroundTrigger('sim','sim_bcg','summary_bcg');
    addBackgroundTrigger('sample','sample_bcg','sim_bcg');


    $('#sim').waypoint(function(direction) {
        if (direction === 'down') {
            refresh_image_opacity();
        }
    })


    waypoints = $('#back-to-normal').waypoint(function(direction) {
        if(direction === 'down') {
            $('#scenario.ddl select').val('simintendnret').trigger('change',[false]);
            $('#variable.ddl select').val('Reported').trigger('change',[true]);
        } else {
            $('#scenario.ddl select').val('simint').trigger('change',[false]);
            $('#variable.ddl select').val('Reported').trigger('change',[true]);
        }
    },        {offset:'60%'}
);

waypoints = $('#open-schools').waypoint(function(direction) {
    if(direction === 'down') {
        $('#scenario.ddl select').val('simintendschool').trigger('change',[false]);
        $('#variable.ddl select').val('Reported').trigger('change',[true]);
    } else {
        $('#scenario.ddl select').val('simintendnret').trigger('change',[false]);
        $('#variable.ddl select').val('Reported').trigger('change',[true]);
    }
},        {offset:'60%'}
);

    return waypoints;
};

function showCopyLink() {
    $('#myurl').val(shareLink);
    showModal('modCopyLink'); //copyLink();
}

function dragify() {
    function moveAll(evt) {
        $('.draggable').css('left', $(this).css('left'));
    }

    var drags = $(".draggable");
    drags.draggable({
        handle: ".dragbutton",
        stop: moveAll
    });
}

function MoveOn(selector) {
    var offs = $('#' + selector).offset().top;

    if (selector === 'findings') {
        offs = offs - 100;
    }

    $('html,body').animate({
        scrollTop: offs
    });
}

;

function showModal(modal) {
    if ($('#' + modal).length) {
        $('.modalBackground').fadeIn(200, function () {
            $('#' + modal).addClass('modalActive');
        });
    } else {
        alert('THERE IS NO MODAL NAMED ' + modal + '!!!');
    }
};

function hideAndShow(modal) {
    hideModal();
    showModal(modal);
}

function hideModal() {
    $('.modalBackground').fadeOut(200, function () {});
    $('.modalActive').removeClass('modalActive');
}

;

window.onclick = function (event) {
    var modal = document.getElementById('modalWrap');

    if (event.target == modal) {
        id = $('.modalActive').attr('id');

        if (id != 'modRozliseni') {
            hideModal();
        }
    }
};

$(document).keyup(function (e) {
    if (e.keyCode === 27) {
        hideModal();
    } // esc

});