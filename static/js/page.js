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
    function activatefix(selector) {
        $('.fixactive').removeClass('fixactive');
        $(selector).addClass('fixactive');
    }

    ;

    function fixBox(selector, parent, target, toppos) {
        var element = $(parent + ' ' + selector).detach();
        $(target).append(element);
        $(target + ' ' + selector).css({
            top: toppos,
            'box-shadow': '0 0 0 0'
        });
    }

    function floatBox(selector, parent, target) {
        var element = $(parent + ' ' + selector).detach();
        $(target).append(element);
        $(element).css({
            top: '0px',
            'box-shadow': '0px 0px 20px 4px #d1d4d3'
        });
    } // fixing menu and adding shadow


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
    }); // MENU INTERACTIONS

    waypoints = $('#context').waypoint({
        handler: function handler(direction) {
            if (direction === 'down') {
                $('#mIntro').addClass('storyPast');
            } else {
                $('#mIntro').removeClass('storyPast');
            }
        },
        offset: '17%'
    });
    waypoints = $('#context').waypoint(function (direction) {
        if (direction === 'down') {
            activatefix('#app');
        } else {
            activatefix('#intro');
        }
    });
    waypoints = $('#empt-app').waypoint({
        handler: function handler(direction) {
            if (direction === 'down') {
                $('#mapp').addClass('storyPast');

                if (!$('#help').hasClass('rotate')) {
                    $('#help').addClass('rotate');
                }
            } else {
                $('#mapp').removeClass('storyPast');
            }
        },
        offset: '17%'
    });
    waypoints = $('#school-close').waypoint({
        handler: function handler(direction) {
            if (direction === 'down') {
                $('#mSchools').addClass('storyPast');
            } else {
                $('#mSchools').removeClass('storyPast');
            }
        },
        offset: '17%'
    });
    waypoints = $('#senior-isolation').waypoint({
        handler: function handler(direction) {
            if (direction === 'down') {
                $('#mSeniors').addClass('storyPast');
            } else {
                $('#mSeniors').removeClass('storyPast');
            }
        },
        offset: '17%'
    }); // CHART INTERACTIONS

    waypoints = $('#conclusion').waypoint({
        handler: function handler(direction) {
            if (direction === 'down') {} else {}
        },
        offset: '60%'
    });
    return waypoints;
}

;

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
}

;

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