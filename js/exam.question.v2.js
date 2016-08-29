var reloadvideo = function(videoobjid) {
    if (typeof kslx != "undefined") {
        if (typeof kslx.allquestionexam != "undefined") {
            if (typeof kslx.allquestionexam.videowidth != "undefined") {
                var videoobj = $("#" + videoobjid).parent();
                var containerid = videoobj.attr("id");
                var videosrc = videoobj.attr("videosrc");
                var mp4url = kslx.returnqqvedio(videosrc);
                var videowidth = kslx.allquestionexam.videowidth;
                var qqvideo = "<sc" + 'ript>__multqv__("' + mp4url + '","' + videowidth + '","",document.getElementById("' + containerid + '"),qqvideocallback);</scr' + "ipt>";
                videoobj.html(qqvideo)
            }
        }
    }
};
var qqvideoplayerror = function(obj, id) {
    var reloadbtn = document.createElement("div");
    reloadbtn.className = "reload";
    reloadbtn.innerHTML = '<a class="btn" href="javascript:reloadvideo(\'' + id + "')\">重新加载</a>";
    obj.parentNode.appendChild(reloadbtn)
};
var qqvideocallback = function(obj) {
    var objid = obj.getAttribute("id");
    obj.addEventListener("error",
    function() {
        qqvideoplayerror(obj, objid)
    })
};
var allquestion = function() {};
allquestion.prototype = kslx.kuaice;
allquestion.prototype.initvideo = function() {
    var _g_ = this;
    $(_g_.videofilter).each(function() {
        if (_g_.videowidth == 0) {
            _g_.videowidth = $(this).parent().width() - _g_.videoside * 2
        }
        var videosrc = $(this).attr("videosrc");
        var containerid = $(this).attr("id");
        var mp4url = kslx.returnqqvedio(videosrc);
        var qqvideo = "<sc" + 'ript>__multqv__("' + mp4url + '","' + _g_.videowidth + '","",document.getElementById("' + containerid + '"),qqvideocallback);</scr' + "ipt>";
        $(this).html(qqvideo)
    })
};
allquestion.prototype.getquestioninfo = function(o) {
    var answeritem = $(o).find(this.myanswerfilter).eq(0);
    var answer = answeritem.attr(this.trueanswerattr);
    var questionid = $(o).attr(this.questionidattr);
    var chapterid = $(o).attr(this.chapteridattr);
    if (typeof chapterid == "undefined" || chapterid == null) {
        chapterid = 0
    } else {
        chapterid = parseInt(chapterid)
    }
    var type, score;
    if ($(o).attr(this.choosetypeattr) != this.choosetype.single) {
        type = 3;
        score = this.examconfig.multipleSorce
    } else {
        var isjudge = $(o).attr("judge") == "yes";
        if (isjudge) {
            type = 1;
            score = this.examconfig.judgeSorce
        } else {
            type = 2;
            score = this.examconfig.choiceSorce
        }
    }
    return {
        type: type,
        score: score,
        answer: answer,
        chapterid: chapterid,
        questionid: questionid
    }
};
allquestion.prototype.savedoquestioninfo = function(questionid, chapterid, isright) {
    var toaddobj = {
        id: questionid,
        c: chapterid
    };
    kslx.upatemydoquestionsObject(isright, toaddobj, questionid)
};
allquestion.prototype.autosubmitfzks = function() {
    var _g_ = this;
    if (_g_.errorscorealready > _g_.maxerrorscores) {
        var endtime = mjx.timestamp();
        var costtime = parseInt((endtime - _g_.begintime) / 1e3, 10);
        var savescoreJson = {
            score: _g_.examscoresalready,
            time: costtime,
            dt: endtime
        };
        kslx.savescores(savescoreJson);
        mjx.dialog.dialog("自动交卷", "您的扣分已经超过" + _g_.maxerrorscores + "分，自动交卷", {
            text: "确定",
            callback: function() {
                _g_.showresultcard(_g_.examscoresalready, costtime);
                _g_.unbindselecter();
                _g_.runexamtimerdisplay();
                _g_.showresultnotdo();
                window.scrollTo(0, 0);
                $(_g_.submitbuttonfilter).unbind("click");
                $(_g_.submitbuttonfilter).parent().hide()
            }
        });
        return true
    }
    return false
};
allquestion.prototype.bindmultiplesubmit = function() {
    var _g_ = this;
    $(_g_.btnmultiplefilter).bind("click",
    function() {
        var _myanswercount_ = 0;
        $(this).siblings().each(function() {
            if ($(this).hasClass(_g_.selectedclass)) {
                _myanswercount_++
            }
        });
        if (_myanswercount_ < 2) {
            mjx.dialog.dialog("提示", "此题为多选，请至少选择两个答案", {
                text: "确定",
                callback: function() {}
            });
            return
        }
        var questionobj = $(this).parent().parent();
        if (_g_.checkanswerson) {
            var itemquestioninfo = _g_.getquestioninfo(questionobj);
            var trueanswer = itemquestioninfo.answer;
            var myanswer = "";
            $(this).unbind("click");
            $(this).siblings().each(function() {
                $(this).unbind("click");
                var _v_ = $(this).attr(_g_.answervalueattr);
                var _istrue_ = trueanswer.indexOf(_v_) > -1;
                if ($(this).hasClass(_g_.selectedclass)) {
                    myanswer += _v_;
                    if (_istrue_) {
                        $(this).addClass("item_right")
                    } else {
                        $(this).addClass("item_wrong")
                    }
                } else {
                    if (_istrue_) {
                        $(this).addClass("item_right_no")
                    }
                }
            });
            var _isright = false;
            if (trueanswer == myanswer) {
                _isright = true;
                _g_.examscoresalready += itemquestioninfo.score
            } else {
                _g_.errorscorealready += itemquestioninfo.score
            }
            _g_.savedoquestioninfo(itemquestioninfo.questionid, itemquestioninfo.chapterid, _isright);
            if (_g_.autosubmitfzks()) {
                return
            }
        } else {}
        _g_.setscroll(questionobj)
    })
};
allquestion.prototype.bindselecter = function() {
    var _g_ = this;
    $(_g_.questionfilter).each(function() {
        var itemquestioninfo = _g_.getquestioninfo(this);
        if (itemquestioninfo.type == 3) {
            $(this).find(_g_.choosefilter).each(function() {
                $(this).bind("click",
                function() {
                    if ($(this).hasClass(_g_.selectedclass)) {
                        $(this).removeClass(_g_.selectedclass)
                    } else {
                        $(this).addClass(_g_.selectedclass)
                    }
                })
            })
        } else {
            $(this).find(_g_.choosefilter).each(function() {
                $(this).bind("click",
                function() {
                    $(this).siblings().removeClass(_g_.selectedclass);
                    $(this).addClass(_g_.selectedclass);
                    if (_g_.checkanswerson) {
                        $(this).unbind("click");
                        $(this).siblings().unbind("click");
                        var myanswer = $(this).attr(_g_.answervalueattr);
                        var _isright = false;
                        if (myanswer != itemquestioninfo.answer) {
                            _g_.errorscorealready += itemquestioninfo.score;
                            $(this).addClass("item_wrong")
                        } else {
                            _isright = true;
                            $(this).addClass("item_right");
                            _g_.examscoresalready += itemquestioninfo.score
                        }
                        _g_.savedoquestioninfo(itemquestioninfo.questionid, itemquestioninfo.chapterid, _isright);
                        if (_g_.autosubmitfzks()) {
                            return
                        }
                        _g_.setscroll($(this).parent().parent());
                        return
                    }
                    _g_.setscroll($(this).parent().parent())
                })
            })
        }
    })
};
allquestion.prototype.unbindselecter = function() {
    var _g_ = this;
    $(_g_.questionfilter).each(function() {
        $(this).find(_g_.choosefilter).each(function() {
            $(this).unbind("click")
        })
    })
};
allquestion.prototype.hiddenquestion = function(isshow) {
    isshow ? $(this.questionfilter).show() : $(this.questionfilter).hide()
};
allquestion.prototype.hiddenbesaanswer = function(isshow) {
    isshow ? $(this.bestexplainfilter).show() : $(this.bestexplainfilter).hide();
    if (isshow) {
        $(this.btnmultiplefilter).hide()
    }
};
allquestion.prototype.showresultcard = function(score, costtime) {
    if (typeof saibo != "undefined") {
        var km = 1;
        var cx = kslx.cartype;
        if (cx.indexOf("s") > 0) {
            km = 4;
            cx = cx.replace("s", "")
        }
        var cx = kslx.cartype;
        saibo.upresult(km, cx, score, costtime)
    }
    var scorehtml = $("#" + kslx.exam_result_template).html();
    var timestring = mjx.formarttimeZH(costtime);
    var exam_result_content_templateobjid = score < this.examconfig.passscore ? kslx.exam_result_content_template.unpass: kslx.exam_result_content_template.pass;
    var exam_result_content_template = $("#" + exam_result_content_templateobjid).html();
    var scoreJson = {
        score: score,
        time: timestring,
        passcontent: exam_result_content_template
    };
    scorehtml = mjx.bindTemp(scorehtml, scoreJson) + '<div style="clear:both;height:30px;"></div>';
    var resultId = "examresult_" + mjx.timestamp();
    this.exam_result_id = resultId;
    var height = $(window).height();
    var top = 0;
    top = $(this.examconfig.showresulttopobj).position().top + this.examconfig.showresulttoppyl;
    var html = '<div id="' + resultId + '" style="position: absolute;background-color:#fff;z-index: 999;width: 100%;min-height:' + (height - top) + "px;top:" + top + 'px;overflow:hidden;">' + scorehtml + "</div>";
    $("body").append(html);
    var local_my_exam_name = kslx.examresultusername();
    $("#" + kslx.exam_result_uname_id).val(local_my_exam_name);
    $("#" + kslx.exam_result_uname_id).unbind("blur").bind("blur",
    function() {
        var curr_name = $(this).val();
        if (!curr_name.match(/^[\u4E00-\u9FA5a-zA-Z0-9_]{2,8}$/)) {
            alert("请输入2-8个字符，可支持汉字、数字、下划线");
            $(this).val("")
        } else {
            kslx.examresultusername(curr_name)
        }
    });
    var bths = $("#" + resultId + " .exam_result_btns").children();
    var _g_ = this;
    bths.eq(0).bind("click",
    function() {
        $("#" + resultId).remove();
        _g_.hiddenquestion(true);
        _g_.hiddenbesaanswer(true)
    });
    bths.eq(1).bind("click",
    function() {
        window.location = window.location.href
    });
    this.hiddenquestion(false)
};
allquestion.prototype.showresultnotdo = function() {
    var _g_ = this;
    $(_g_.questionfilter).each(function() {
        var choosetype = $(this).attr(_g_.choosetypeattr);
        var questionitem = $(this).find(_g_.myanswerfilter).eq(0);
        var trueanswer = questionitem.attr(_g_.trueanswerattr);
        var mmyanswer = "",
        itemanswer = "";
        var _has_right = $(this).find(_g_.choosefilter + ".item_right").length,
        _has_wrong = $(this).find(_g_.choosefilter + ".item_wrong").length;
        if (_has_right > 0) {
            return true
        }
        if (choosetype == _g_.choosetype.single) {
            $(this).find(_g_.choosefilter).each(function() {
                itemanswer = $(this).attr(_g_.answervalueattr);
                if (itemanswer == trueanswer) {
                    $(this).addClass(_has_wrong == 0 ? "item_right_no": "item_right")
                }
            })
        } else {
            mmyanswer = "";
            $(this).find(_g_.choosefilter).each(function() {
                itemanswer = $(this).attr(_g_.answervalueattr);
                var isselected = $(this).hasClass(_g_.selectedclass);
                if (trueanswer.indexOf(itemanswer) > -1) {
                    $(this).addClass(isselected ? "item_right": "item_right_no")
                } else {
                    if (isselected) {
                        $(this).addClass("item_wrong")
                    }
                }
            })
        }
    })
};
allquestion.prototype.showresult = function() {
    var _g_ = this;
    var score = 0;
    $(_g_.questionfilter).each(function() {
        var questionid = $(this).attr(_g_.questionidattr);
        var chapterid = $(this).attr(_g_.chapteridattr);
        if (typeof chapterid == "undefined" || chapterid == null) {
            chapterid = 0
        } else {
            chapterid = parseInt(chapterid)
        }
        questionid = parseInt(questionid);
        var choosetype = $(this).attr(_g_.choosetypeattr);
        var questionitem = $(this).find(_g_.myanswerfilter).eq(0);
        var trueanswer = questionitem.attr(_g_.trueanswerattr);
        var mmyanswer = "",
        itemanswer = "";
        if (choosetype == _g_.choosetype.single) {
            var isjudge = $(this).attr("judge") == "yes";
            mmyanswer = "";
            $(this).find(_g_.choosefilter).each(function() {
                itemanswer = $(this).attr(_g_.answervalueattr);
                if ($(this).hasClass(_g_.selectedclass)) {
                    mmyanswer = itemanswer;
                    if (mmyanswer == trueanswer) {
                        $(this).addClass("item_right");
                        if (isjudge) {
                            score += _g_.examconfig.judgeSorce
                        } else {
                            score += _g_.examconfig.choiceSorce
                        }
                        return false
                    } else {
                        $(this).addClass("item_wrong")
                    }
                } else {
                    if (itemanswer == trueanswer) {
                        $(this).addClass("item_right_no")
                    }
                }
            })
        } else {
            mmyanswer = "";
            $(this).find(_g_.choosefilter).each(function() {
                itemanswer = $(this).attr(_g_.answervalueattr);
                if ($(this).hasClass(_g_.selectedclass)) {
                    mmyanswer += $(this).attr(_g_.answervalueattr);
                    if (trueanswer.indexOf(itemanswer) > -1) {
                        $(this).addClass("item_right")
                    } else {
                        $(this).addClass("item_wrong")
                    }
                } else {
                    if (trueanswer.indexOf(itemanswer) > -1) {
                        $(this).addClass("item_right_no")
                    }
                }
            });
            if (mmyanswer == trueanswer) {
                score += _g_.examconfig.multipleSorce
            }
        }
        if (mmyanswer != "") {
            var toaddobj = {
                id: questionid,
                c: chapterid
            };
            kslx.upatemydoquestionsObject(mmyanswer == trueanswer, toaddobj, questionid)
        }
    });
    var endtime = mjx.timestamp();
    var costtime = parseInt((endtime - this.begintime) / 1e3, 10);
    var savescoreJson = {
        score: score,
        time: costtime,
        dt: endtime
    };
    kslx.savescores(savescoreJson);
    _g_.showresultcard(score, costtime)
};
allquestion.prototype.showresultallquestion = function(score) {
    this.unbindselecter();
    this.runexamtimerdisplay();
    this.showresult();
    window.scrollTo(0, 0)
};
allquestion.prototype.setscroll = function(obj) {
    var next = obj.next();
    if (next.hasClass("best_explain")) {
        next = next.next()
    }
    if (next.attr("questionid")) {
        scroller(next)
    }
};
allquestion.prototype.checkeexamfinish = function() {
    var _g_ = this;
    var question = "";
    var _total = 0,
    _hasdocount = 0,
    hasgoobj = false,
    goquestiontop = 0,
    errortype = 0;
    $(_g_.questionfilter).each(function() {
        var itemanswer = 0;
        _total++;
        var haschoose = false;
        var issingle = $(this).attr(_g_.choosetypeattr) == _g_.choosetype.single;
        $(this).find(_g_.choosefilter).each(function() {
            if ($(this).hasClass(_g_.selectedclass)) {
                haschoose = true;
                return true
            }
        });
        if (haschoose) {
            _hasdocount++
        } else {
            if (!hasgoobj) {
                hasgoobj = true;
                if (itemanswer > 0) {
                    errortype = 1
                }
                goquestiontop = $(this).position().top
            }
        }
    });
    if (_total == _hasdocount) {
        return true
    }
    var result = {
        total: _total,
        notdo: _total - _hasdocount,
        positiontop: goquestiontop,
        errortype: errortype
    };
    return result
};
allquestion.prototype.actionbuttons = function($btn) {
    this.showresultallquestion();
    $(this.submitbuttonfilter).hide();
    $(this.resetexambuttonfilter).show();
    $btn.unbind("click")
};
allquestion.prototype.bindbuttons = function() {
    var _g_ = this;
    $(_g_.submitbuttonfilter).bind("click",
    function() {
        var $btn = $(this);
        var checkresult = _g_.checkeexamfinish();
        if (checkresult == true) {
            _g_.actionbuttons($btn)
        } else {
            var dtext = "还有" + checkresult.notdo + "道题目没有做，确认交卷吗？";
            mjx.dialog.dialog("确认交卷", dtext, {
                yes: "查看未做题",
                no: "确定",
                yescallback: function() {
                    window.scrollTo(0, checkresult.positiontop)
                },
                nocallback: function() {
                    _g_.actionbuttons($btn)
                }
            })
        }
    });
    $(_g_.resetexambuttonfilter).bind("click",
    function() {
        window.location = window.location.href
    })
};
allquestion.prototype.runexamtimerdisplay = function() {
    var _g_ = this;
    if (_g_._exam_timer) {
        clearTimeout(_g_._exam_timer)
    }
    $("#" + _g_.examconfig.timerid).html("")
};
allquestion.prototype.runexamtimer = function() {
    var _g_ = this;
    var _showtime_ = "";
    if (_g_.examtimes > 0) {
        _showtime_ = mjx.formarttime(_g_.examtimes);
        _g_._exam_timer = setTimeout(function() {
            _g_.examtimes--;
            _g_.runexamtimer()
        },
        1e3)
    } else {
        _showtime_ = "时间到";
        _g_.runexamtimerdisplay();
        var dtext = "考试时间到，系统自动交卷！";
        var _g_ = this;
        mjx.dialog.dialog("考试时间到", dtext, {
            text: "确定",
            callback: function() {
                _g_.actionbuttons($(_g_.submitbuttonfilter))
            }
        })
    }
    $("#" + _g_.examconfig.timerid).html(_showtime_)
};
allquestion.prototype.initexamallq = function(config) {
    this.examconfig = config;
    var _g_ = this;
    _g_.bestexplainfilter = ".best_explain";
    _g_.btnmultiplefilter = ".btn-multiple";
    _g_.checkanswerson = config.checkanswerson;
    _g_.maxerrorscores = config.fullscore;
    _g_.errorscorealready = 0;
    _g_.examscoresalready = 0;
    if (_g_.checkanswerson) {
        _g_.maxerrorscores = config.fullscore - config.passscore
    }
    _g_.init(config.kstype);
    _g_.examtimes = config.examtime;
    _g_.runexamtimer();
    _g_.bindmultiplesubmit()
};
kslx.allquestionexam = new allquestion;
$(function() {
    $("body").append("<div id='ap_goto_top'></div>");
    $("#ap_goto_top").click(function() {
        window.scrollTo(0, 0)
    });
    var basebodyheight = $(document).height();
    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        var ap_goto_top = $("#ap_goto_top");
        if (scrollTop > 800) {
            $(ap_goto_top).addClass("show")
        } else {
            $(ap_goto_top).removeClass("show")
        }
    })
});