
$(document).ready(function () {
    hljs.highlightAll();
    
    openInNewTab();
    setImgWidth();
    goToTop();

    // $(".builtWith").hide();
});

// 设置超链接新页面打开
function openInNewTab() {
    var aTagArr = [].slice.apply(document.getElementsByTagName("a"));

    aTagArr.forEach(function (e, i) {
        if (e.href.indexOf("?_blank") > -1) {
            e.target = "_blank";
            e.href = e.href.substring(0,e.href.length - 7);
        }
    });
}

// 设置图片大小
function setImgWidth(){
    var aTagArr = [].slice.apply(document.getElementsByTagName("img"));

    aTagArr.forEach(function (e, i) {
        if (/^\d{2}$/.test(e.alt)) {
            e.style = "max-width:"+e.alt.toString()+"%;";
        }
    });
}

// 设置回到顶部
function goToTop() {
    $("body").append('<a href="javascript:;" id="goToTop"><img src="/img/goto_top.png" title="回到顶部" style="width:30px;height:30px;position:fixed;right:30px;bottom:30px;"/></a>');

    if ($(window).scrollTop()<1500) {
        $('#goToTop').hide(); //滚动条距离顶端的距离小于 showDistance 是隐藏 goToTop 按钮
    }
    $(window).scroll(function () {
        if ($(this).scrollTop()>1500) {
            $('#goToTop').fadeIn();
        } else {
            $('#goToTop').fadeOut();
        }
    });
    $("#goToTop").click(function () {
        $('html,body').animate({
            scrollTop:0
        }, 800);
        return false;
    });
}
