require('../style.css');
var $ = require('./jquery.min');
require('./tagcloud.min');
// templates
var sideBoxTemplates = require('../templates/templates.html');
document.body.insertAdjacentHTML("beforeend", sideBoxTemplates);
require('../templates/templates');

$(function() {
    var main_input = $('.main_input'), enter = $("#enter"), more = $("#more"), $tagcloud = $(".tagcloud"), $status = $("#status");
    var more_text = more.find("p");
    //升起动画控制
    var iUp = (function() {
        var t = 0,
            d = 200,
            clean = function(){
                t = 0;
            },
            up = function(e) {
                setTimeout(function() {
                    $(e).removeClass("down")
                }, t);
                t += d;
            },
            down = function(e){
                $(e).addClass("down");
            },
            toggle = function(e){
                setTimeout(function() {
                    $(e).toggleClass("down")
                }, t);
                t += d;
            };
        return {
            clean: clean,
            up: up,
            down: down,
            toggle: toggle
        }
    })();
    $(".iUp").each(function(i, e) {
        iUp.up(e);
    });
    var status = {
        reset: function(){
            $status.find("i").attr("class", "reset");
            $status.find("span").text("正在查询中");
        },
        on: function(data, text){
            $status.find("i").attr("class", "on");
            if(!text){
                $status.find("span").text("服务器在线 " + data + "ms");
            }else{
                $status.find("span").text(text);
            }
        },
        off: function(){
            $status.find("i").attr("class", "off");
            $status.find("span").text("服务器超时");
        },
        unknown: function(){
          $status.find("span").text("未知");
        }
    };
    //服务器状态
    var statusQuery = function(){
        status.reset();
        var query = $.ajax({
            url: "//cqu.pt/status.php?" + new Date().getTime(),
            timeout : 10000,
            success: function(data){
                try {
                    data = JSON.parse(data);
                    var ip = data[0],
                        ping = parseInt(data[1]),
                        code = data[2];
                    if(ping <= 0){
                        status.off();
                    }else if(code >= 400){
                        status.off();
                    }else{
                        if(ip){
                            status.on(ping);
                        }else{
                            status.unknown();
                        }
                    }
                }catch(e){}
            },
            complete: function(XMLHttpRequest){
                if(XMLHttpRequest.status !== 200){
                    query.abort();
                    status.unknown();
                }
            }
        });
    };
    statusQuery();
    $status.on("click", statusQuery);
    main_input.on({
        focus: function () {
            if (this.value == this.defaultValue) {
                this.value = "";
            }
            more.hide();
            enter.addClass("active");
        },
        blur: function () {
            if (this.value == "") {
                this.value = this.defaultValue;
            }
            more.hide();
            enter.removeClass("active");
        },
        keypress: function (event) {
            if (event.keyCode == "13") {
                enter.click();
            }
        }
    });
    //转换地址
    var turl = function (in_url) {
        var host, port, out_url, url_array;
        // 白名单 *.yctu.edu.cn, 202.202.32.0/20, 172.16.0.0/12, 222.177.140.0/24, 211.83.208.0/20, 219.153.62.64/26
        var hostWhiteList = /yctu.edu.cn$|^202.202.((3[2-9])|(4[0-7])).\d{1,3}$|^172.((1[6-9])|(2\d)|(3[0-1])).\d{1,3}.\d{1,3}$|^222.177.140.\d{1,3}$|^211.83.((20[8-9])|(21\d)|(22[0-3])).\d{1,3}$|^219.153.62.((6[4-9])|([7-9]\d)|(1[0-1]\d)|(12[0-6]))$/;
        var reg = function (reg, str) {
            return !!reg.test(str);
        };
        var thost = function (in_host, in_port) {
            var out_host, suffix;
            //判断host是否已为转换后的地址
             if (in_host.indexOf("yctu.caitongbo.com") !== -1) {
                 return "http://" + in_host;
             } else {
                 suffix = ".caitongbo.com";
            }
            //判断是否有端口
            if (in_port && in_port != '80') {
                suffix = ".p-" + in_port + suffix;
            }
            //判断host是否为教务在线(特殊)
            if (in_host === "jwgl.yctu.edu.cn") {
                out_host = "http://jwgl.caitongbo.com";
            }else{
                out_host = "http://" + in_host + suffix;
            }
            return out_host;
        };
        //分割原地址
        url_array = in_url.split("/");
        host = url_array[0];
        //提取端口
        if (host.indexOf(":") !== -1) {
            var host_arr = host.split(":");
            host = host_arr[0];
            port = host_arr[1];
        }
        //如果host不是白名单内域名
        if (!reg(hostWhiteList, host)) {
            more_text.html('输入的地址错误或未列入内网外入白名单，无法通过访问。');
            return false;
        }
        out_url = thost(host, port);
        //拼接地址
        for (var j = 1; j < url_array.length; j++) {
            if(url_array[j]){
                out_url += "/" + url_array[j];
            }
        }
        if (url_array[url_array.length-1].indexOf(".") === -1) {
            out_url += "/";
        }
        more_text.html('外网地址为：<a target="_blank" href="' + out_url + '">' + out_url + '</a><br>');
        return out_url;
    };
    //输入框确认点击
    enter.on("click", function () {
        more.show();
        var main_input_val = $.trim(main_input.val());
        // 去掉http://
        if (main_input_val.indexOf("http://") !== -1) {
            main_input_val = main_input_val.split("http://")[1];
            main_input.val(main_input_val);
        }
        // https://转换为443端口
        if (main_input_val.indexOf("https://") !== -1 ) {
            main_input_val = main_input_val.split("https://")[1];
            //分割原地址
            var url_array = main_input_val.split("/");
            url_array[0] = url_array[0] + ":443";
            main_input_val = url_array.join("/");
            main_input.val(main_input_val);
        }
        var url = turl(main_input_val);
        if (url) {
            window.open(url);
        }
    });
    //读取josn数据，tagList快捷链接
    (function(data) {
        var tags = data.tagsList;
        $.each(tags, function (i, e) {
            $tagcloud.append("<a target='_blank' href='" + e.href + "'>" + e.title + "</a>");
        });
        tagcloud({
            radius: 100,
            fontsize: 17
        });
    })(require('../../json/data'));
    //底部信息切换
    setTimeout(show_about, 10000);
    function show_about() {
        $(".about#tome").fadeToggle();
        $(".about#toblues").fadeToggle();
        setTimeout(show_about, 10000);
    }
});
