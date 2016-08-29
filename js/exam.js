var kscomment = function() {
    var cls = function() {
        this.commentapiurl = "/questioncomment";
        this.commentpagesize = 2
    };
    cls.prototype = {
        loadcomment: function(id, page, callback, lastfunction) {
            var pageindex = page || 1;
            $.ajax({
                url: this.commentapiurl,
                data: {
                    page: pageindex,
                    pagesize: this.commentpagesize,
                    id: id
                },
                dataType: "json",
                success: function(list) {
                    callback(list)
                }
            })
        }
    };
    return new cls
} ();
var kslx = function() {
    var facepath = "http://j2.58cdn.com.cn/jxedt/mobile/mnks/images/uface/{face}.png";
    var kslxcls = function() {
        this.dbversion = "v_";
        this.cartype = "c";
        this.chapterid = "";
        this.questions = [];
        this.collectquestionids = [];
        this.rightquestionids = [];
        this.wrongquestionids = [];
        this.index = 0;
        this.hassaveindex = false;
        this.checkanswer = true;
        this.tibancolor = {
            0 : "gray",
            1 : "green",
            2 : "red",
            3 : "pred"
        };
        this.collecttext = {
            yes: "收藏本题",
            no: "移除收藏"
        };
        this.explaintext = {
            yes: "本题解释",
            no: "关闭解释"
        };
        this.ifemptygourl = null;
        this.isshowcommentlist = true;
        this.hasloadcommentyet = false;
        this.tiban_item_size = {
            w: 50,
            h: 50
        };
        this.commentllistpagesize = 10;
        this.commentlistpageindex = 1;
        this.exam_resultpostion = null;
        this.isexamfinish = false;
        this.isexam = false;
        this.ismnexam = false;
        this.exammaxerrors = 0;
        this.isautosubmit = false;
        this.errorcount = 0;
        this.totalexamtimes = 0;
        this.examtimes = 0;
        this.questionpoint = {
            1 : 1,
            2 : 1,
            3 : 1
        };
        this.manscorecount = 10;
        this.passexamscore = 90;
        this.autonext = {
            open: true,
            time: 1e3
        };
        this.autonexttimer = null;
        this.questiondetailapi = "/mnksnew/g.asp?id={id}";
        this.tibanid = "div_answercard";
        this.tibancontentid = "web_tiban";
        this.question_best_explain = "question_best_explain";
        this.commemt_list_main = "commemt_list_main";
        this.mulselectsubmit = "btn_muselectsubmit";
        this.btn_load_comment = "btn_load_comment";
        this.btn_explain_switch = "btn_explain_switch";
        this.btn_collect = "btn_collect";
        this.btn_removewrong = "btn_removewrong";
        this.btn_answercard = "btn_answercard";
        this.examwrongcount = "wrongcount";
        this.examtimer = "examtimer";
        this.btn_submitexam = "btn_submitexam";
        this.footer_actions = "footer_actions";
        this.imagefilter = ".commpadding";
        this.exam_result_uname_id = "my_name";
        this.tiban_item_templateid = "tiban_template_item";
        this.tiban_templateid = "tiban_template";
        this.question_templateid = "question_template";
        this.question_content = "question_content";
        this.question_pic_template = "question_pic_template";
        this.question_video_template = "question_video_template";
        this.question_option_template = "question_option_template";
        this.question_best_explain_template = "question_best_explain_template";
        this.comment_template = "comment_template";
        this.commemt_list = "commemt_list";
        this.exam_result_template = "exam_result_template";
        this.exam_result_content_template = {
            pass: "exam_result_pass_template",
            unpass: "exam_result_unpass_template"
        };
        this.footactions_templates = {
            mnks: "footactions_template_mnks",
            fzks: "footactions_template_ks",
            lx: "footactions_template_lx"
        };
        this.isclooectlx = false;
        this.issubmitanswered = false;
        this.videoplayid = "myplayvideo"
    };
    function getfromquestionids(questionids) {
        var _ = [];
        if (mjx.isArray(questionids[0])) {
            for (var i = 0,
            l = questionids.length; i < l; i++) {
                for (var j = questionids[i][0], max = questionids[i][1]; j <= max; j++) {
                    _.push(j)
                }
            }
        } else {
            for (var i = 0,
            l = questionids.length; i < l; i++) {
                _.push(questionids[i])
            }
        }
        return _
    }
    function ordermulselect(v) {
        var _ = [1, 2, 3, 4];
        var result = [];
        for (var i = 0,
        l = _.length; i < l; i++) {
            if (v.indexOf(_[i]) > -1) {
                result.push(_[i])
            }
        }
        return result.join("")
    }
    function getmulselects(obj) {
        var mulselects = "";
        $(obj).parent().find("a").each(function() {
            if ($(this).hasClass("on")) {
                mulselects += $(this).attr("answer")
            }
        });
        return mulselects
    }
    kslxcls.prototype = {
        initlx: function(cartype, chapterid, questionids, hassaveindex, israndom) {
            this.cartype = cartype || "c";
            this.chapterid = chapterid;
            if (israndom) {
                mjx.randomOrderArray(questionids)
            }
            var questionids = getfromquestionids(questionids);
            this._initquestionids(questionids);
            if (typeof hassaveindex != "undefined") {
                this.hassaveindex = hassaveindex
            }
            this.loadcollect();
            this.bindexplainaction();
            var _loadquestionsoon_ = true;
            if (hassaveindex) {
                var _localindex = this.getlxindex();
                if (_localindex > 0) {
                    var _g_ = this;
                    _loadquestionsoon_ = false;
                    if (_g_.ismakesuregoto()) {
                        this.dialog("开始练习", "上次练习到第" + (_localindex + 1) + "题，是否继续？", {
                            yes: "确定",
                            no: "取消",
                            yescallback: function() {
                                _g_.loadquestion(_localindex)
                            },
                            nocallback: function() {
                                _g_.loadquestion(0)
                            }
                        })
                    } else {
                        _g_.setmakesuregoto(true);
                        _g_.loadquestion(_localindex)
                    }
                }
            }
            if (_loadquestionsoon_) {
                this.loadquestion(0)
            }
        },
        initexam: function(cartype, questionids, examsecond, checkanswersoon) {
            examsecond = examsecond || 45 * 60;
            this.cartype = cartype || "c";
            this.checkanswer = checkanswersoon;
            this.ismnexam = !checkanswersoon;
            this.isexam = true;
            this.isshowcommentlist = false;
            this.totalexamtimes = examsecond;
            this.examtimes = examsecond;
            var questionids = getfromquestionids(questionids);
            if (this.checkanswer) {
                this.exammaxerrors = 10
            }
            if (questionids.length == 50) {
                this.questionpoint = {
                    1 : 2,
                    2 : 2,
                    3 : 2
                };
                if (this.checkanswer) {
                    this.exammaxerrors = 5
                }
            }
            this._initquestionids(questionids);
            this.loadquestion(0);
            this.updateexamerror(false);
            this.runexamtimer();
            this.bindsubmitexam()
        },
        _initquestionids: function(questionids) {
            for (var i = 0,
            l = questionids.length; i < l; i++) {
                var _item_ = {
                    id: questionids[i],
                    status: 0,
                    myanswer: ""
                };
                this.questions.push(_item_)
            }
            this._initmydoquestions();
            this.bindbottomactions();
            this.bindanswerbuttons()
        },
        _initmydoquestions: function() {
            this.rightquestionids = this.getmydoquestions(true);
            this.wrongquestionids = this.getmydoquestions(false)
        },
        _autonext: function(isright) {
            if (!this.autonext.open) {
                return
            }
            var flag = false;
            if (!this.isexam) {
                flag = isright
            } else {
                flag = !this.isexamfinish
            }
            if (flag && this.issubmitanswered) {
                var _g_ = this;
                _g_.autonexttimer = setTimeout(function() {
                    _g_.gonext()
                },
                _g_.autonext.time)
            }
        },
        _getquestionbyid: function(id) {
            for (var i = 0,
            l = this.questions.length; i < l; i++) {
                if (this.questions[i].id == id) {
                    return this.questions[i].question || {}
                }
            }
            return {}
        },
        bindanswerbuttons: function() {
            var _g_ = this;
            $("#" + _g_.btn_answercard).unbind("click").bind("click",
            function() {
                _g_.showanswercard()
            })
        },
        bindbottomactions: function() {
            var temp = this.isexam ? this.ismnexam ? $("#" + this.footactions_templates.mnks).html() : $("#" + this.footactions_templates.fzks).html() : $("#" + this.footactions_templates.lx).html();
            temp = $("#" + this.footer_actions).html(temp);
            var _g_ = this;
            $("#" + this.footer_actions + " .pre").bind("click",
            function() {
                _g_.goprev()
            });
            $("#" + this.footer_actions + " .next").bind("click",
            function() {
                _g_.gonext()
            });
            var wrongbtn = $("#" + _g_.btn_removewrong);
            if (wrongbtn.length > 0) {
                wrongbtn.unbind("click").bind("click",
                function() {
                    var currlen = _g_.questions.length;
                    _g_.removewrong(_g_.questions[_g_.index].id);
                    _g_.questions.splice(_g_.index, 1);
                    if (currlen < 2) {
                        mjx.dialog.dialog("移除错题", "错题已经清空。", {
                            text: "确定",
                            callback: function() {
                                if (_g_.ifemptygourl == null) {
                                    window.location.reload()
                                } else {
                                    window.location = _g_.ifemptygourl
                                }
                            }
                        });
                        return
                    }
                    if (_g_.questions.length <= _g_.index) {
                        _g_.index = _g_.questions.length - 1
                    }
                    _g_.loadquestion(_g_.index)
                })
            }
        },
        getid: function(ix, isprompt) {
            if (ix < 0) {
                if (isprompt) {
                    mjx.dialog.dialog("已经是第一题", "已经是第一题", {
                        text: "确定",
                        callback: function() {}
                    })
                }
                return false
            }
            if (ix >= this.questions.length) {
                if (isprompt) {
                    mjx.dialog.dialog("已经是最后一题", "已经是最后一题", {
                        text: "确定",
                        callback: function() {}
                    })
                }
                return false
            }
            return this.questions[ix].id
        },
        loadquestion: function(ix, istobindquestion) {
            var isbindsoon = false;
            if (typeof istobindquestion == "undefined") {
                isbindsoon = true
            }
            var id = this.getid(ix, isbindsoon);
            if (id === false) {
                return
            }
            var g = this;
            if (typeof g.doafterloadquestion == "function") {
                g.doafterloadquestion()
            }
            if (typeof g.questions[ix]["question"] != "undefined") {
                if (isbindsoon) {
                    g.bindquestion(ix)
                }
            } else {
                var _url_ = g.questiondetailapi.replace("{id}", id);
                $.ajax({
                    url: _url_,
                    data: {
                        id: id
                    },
                    dataType: "text",
                    success: function(d) {
                        var question = eval("(" + d + ")");
                        g.questions[ix].question = question;
                        if (isbindsoon) {
                            g.bindquestion(ix)
                        }
                    }
                })
            }
        },
        savemyanswer: function(mychoose) {
            this.questions[this.index].myanswer = mychoose;
            this.questions[this.index].status = 3
        },
        savemmyanswerresult: function(isright) {
            this.questions[this.index].status = isright ? 1 : 2;
            this.upatemydoquestions(isright, this.questions[this.index].id);
            if (this.isexam) {
                this.updateexamerror(!isright)
            }
        },
        bindmychoose: function(optionllist, mychoose, _type_) {
            var _toaddclass_ = "on";
            if (_type_ == "3") {
                optionllist.find("a").each(function() {
                    var _itemanswer_ = $(this).attr("answer");
                    var _ismychoose_ = mychoose.indexOf(_itemanswer_) > -1;
                    if (_ismychoose_) {
                        $(this).addClass(_toaddclass_)
                    }
                });
                $("#" + this.mulselectsubmit).removeClass("gray").removeClass("disable")
            } else {
                optionllist.find("a").each(function() {
                    if ($(this).attr("answer") == mychoose) {
                        $(this).addClass("on");
                        return false
                    }
                })
            }
        },
        showchooseresult: function(optionllist) {
            var mychoose = this.questions[this.index].myanswer || "";
            var mystatus = this.questions[this.index].status;
            var _type_ = this.questions[this.index].question.type;
            if (mystatus == 3) {
                this.bindmychoose(optionllist, mychoose, _type_);
                this._autonext(true);
                return
            }
            var trueanswer = this.questions[this.index].question.trueanswer;
            var isright = trueanswer == mychoose;
            this._autonext(isright);
            if (_type_ == "3") {
                optionllist.find("a").each(function() {
                    var _itemanswer_ = $(this).attr("answer");
                    var _isitemright_ = trueanswer.indexOf(_itemanswer_) > -1;
                    var _ismychoose_ = mychoose.indexOf(_itemanswer_) > -1;
                    var _toaddclass_ = "";
                    if (_isitemright_) {
                        _toaddclass_ = _ismychoose_ ? "item_right": "item_right_no"
                    } else {
                        _toaddclass_ = _ismychoose_ ? "item_wrong": ""
                    }
                    $(this).addClass(_toaddclass_);
                    $(this).attr("onclick", "")
                })
            } else {
                if (mychoose == "") {
                    optionllist.find("a").each(function() {
                        if ($(this).attr("answer") == trueanswer) {
                            $(this).addClass("item_right").addClass("on")
                        }
                    })
                } else {
                    optionllist.find("a").each(function() {
                        if ($(this).attr("answer") == mychoose) {
                            $(this).addClass(isright ? "item_right": "item_wrong").addClass("on")
                        } else if ($(this).attr("answer") == trueanswer) {
                            $(this).removeClass("on").addClass("item_right")
                        } else {
                            $(this).removeClass("on").removeClass("item_right").removeClass("item_wrong")
                        }
                        $(this).attr("onclick", "")
                    })
                }
            }
        },
        chooseoption: function(obj) {
            this.issubmitanswered = true;
            var mychoose = $(obj).attr("answer");
            this.savemyanswer(mychoose);
            if (this.checkanswer) {
                var trueanswer = $(obj).parent().attr("trueanswer");
                var isright = trueanswer == mychoose;
                this.savemmyanswerresult(isright);
                this.showchooseresult($(obj).parent());
                this.showbestandcomment(!this.isshowcommentlist)
            } else {
                $(obj).addClass("on");
                $(obj).siblings("a").removeClass("on");
                this._autonext()
            }
        },
        choosemuloption: function(obj) {
            if ($(obj).hasClass("on")) {
                $(obj).removeClass("on")
            } else {
                $(obj).addClass("on")
            }
            var myanswer = getmulselects(obj);
            if (myanswer.length > 1) {
                $("#" + this.mulselectsubmit).removeClass("gray").removeClass("disable")
            } else {
                $("#" + this.mulselectsubmit).addClass("gray").addClass("disable")
            }
        },
        submitmuloption: function(obj) {
            if ($(obj).hasClass("disable")) {
                return
            }
            this.issubmitanswered = true;
            var _parnet = $(obj).parent();
            var mychoose = getmulselects(_parnet);
            this.savemyanswer(mychoose);
            if (this.checkanswer) {
                var trueanswer = _parnet.parent().attr("trueanswer");
                var isright = trueanswer == mychoose;
                this.savemmyanswerresult(isright);
                this.showchooseresult(_parnet.parent());
                _parnet.remove();
                this.showbestandcomment()
            } else {
                this._autonext()
            }
        },
        togglebestanswer: function() {
            var isshownw = this.isshowcommentnow();
            if (isshownw) {
                this.showbestandcomment(true)
            } else {
                this.showbestandcomment()
            }
        },
        showbestandcomment: function(ishidden) {
            ishidden = ishidden || false;
            var _best_explain = "block",
            _list_main = "block";
            if (ishidden) {
                _best_explain = "none";
                _list_main = "none";
                this.resetshowexplaincomment()
            } else {
                var _g_ = this;
                if (!_g_.hasloadcommentyet) {
                    _g_.hasloadcommentyet = true;
                    _g_.commentlistpageindex = 1;
                    $("#" + _g_.commemt_list).html("");
                    var itemobj = _g_.questions[this.index].question;
                    _g_.loadcommentlist(itemobj.bestanswerid);
                    var btnloadcomment = $("#" + _g_.btn_load_comment);
                    btnloadcomment.unbind("click").bind("click",
                    function() {
                        _g_.loadcommentlist(itemobj.bestanswerid)
                    })
                }
                _g_.setshowexplaincomment()
            }
            $("#" + this.question_best_explain).css("display", _best_explain);
            $("#" + this.commemt_list_main).css({
                display: _list_main,
                overflow: "hidden"
            })
        },
        commentgood: function(o) {
            if ($(o).attr("dp") == "yes") {
                mjx.dialog.dialog("评论", "您已经评价过了", {
                    text: "确定",
                    callback: function() {}
                });
                return
            }
            var goodval = parseInt($(o).html(), 10);
            $(o).html(goodval + 1);
            $(o).attr("dp", "yes");
            mjx.dialog.dialog("评论", "感谢您的评价", {
                text: "确定",
                callback: function() {}
            })
        },
        loadcommentlist: function(id) {
            var g = this;
            var pi = g.commentlistpageindex++;
            kscomment.loadcomment(id, pi,
            function(result) {
                var template = $("#" + g.comment_template).html();
                var htmlArray = [];
                var _qs_ = parseInt(Math.random() * 20, 10);
                for (var i = 0,
                l = result.length; i < l; i++) {
                    result[i].face = facepath.replace("{face}", (i + _qs_) % 22);
                    htmlArray.push(mjx.bindTemp(template, result[i]))
                }
                $("#" + g.commemt_list).append(htmlArray.join(""))
            })
        },
        bindsubmitexam: function() {
            var _g_ = this;
            $("#" + this.btn_submitexam).bind("click",
            function() {
                _g_.submitexam()
            })
        },
        bindcollectaction: function() {
            var _g_ = this;
            var obj = $("#" + _g_.btn_collect);
            var id = _g_.getid(_g_.index);
            if (_g_.isincollect(id)) {
                obj.addClass("collecton").html(_g_.collecttext.no)
            } else {
                obj.removeClass("collecton").html(_g_.collecttext.yes)
            }
            obj.unbind("click").bind("click",
            function() {
                if (!_g_.isincollect(id)) {
                    _g_.addcollect(id);
                    obj.addClass("collecton").html(_g_.collecttext.no)
                } else {
                    _g_.removecollect(id);
                    if (_g_.isclooectlx) {
                        _g_.questions.splice(_g_.index, 1);
                        var currlen = _g_.questions.length;
                        if (currlen < 1) {
                            mjx.dialog.dialog("移除收藏", "收藏的题已经清空。", {
                                text: "确定",
                                callback: function() {
                                    if (_g_.ifemptygourl == null) {
                                        window.location.reload()
                                    } else {
                                        window.location = _g_.ifemptygourl
                                    }
                                }
                            });
                            return
                        }
                        if (_g_.questions.length <= _g_.index) {
                            _g_.index = _g_.questions.length - 1
                        }
                        _g_.loadquestion(_g_.index);
                        return
                    }
                    obj.removeClass("collecton").html(_g_.collecttext.yes)
                }
            })
        },
        bindexplainaction: function() {
            var _g_ = this;
            $("#" + _g_.btn_explain_switch).bind("click",
            function() {
                _g_.togglebestanswer()
            })
        },
        bindquestion: function(ix) {
            var _g_ = this;
            if (_g_.autonexttimer) {
                clearTimeout(_g_.autonexttimer)
            }
            _g_.loadquestion(ix - 1, false);
            _g_.loadquestion(ix + 1, false);
            _g_.index = ix;
            window.scrollTo(0, 0);
            var questiontemplate = $("#" + _g_.question_templateid).html();
            var itemobj = _g_.questions[ix].question;
            itemobj.ix = ix + 1;
            itemobj.total = this.questions.length;
            itemobj.question_pic_template = this.bindquestionpic(itemobj);
            itemobj.question_options = this.bindoption(this.questions[ix]);
            itemobj.trueanswer = itemobj.answertrue;
            $("#" + this.question_content).html(mjx.bindTemp(questiontemplate, itemobj));
            this.bindimagescale();
            _g_.issubmitanswered = false;
            if (typeof itemobj.explain != "undefined") {
                this.bindexplain(itemobj.explain)
            }
            this.resetshowexplaincomment();
            _g_.hasloadcommentyet = false;
            if (_g_.isshowcommentlist) {
                _g_.hasloadcommentyet = true;
                _g_.commentlistpageindex = 1;
                $("#" + _g_.commemt_list).html("");
                _g_.loadcommentlist(itemobj.bestanswerid);
                var btnloadcomment = $("#" + _g_.btn_load_comment);
                btnloadcomment.unbind("click").bind("click",
                function() {
                    _g_.loadcommentlist(itemobj.bestanswerid)
                })
            }
            if (_g_.isexamfinish || _g_.questions[ix].status != 0) {
                _g_.showchooseresult($("#" + this.question_content).find(".item"));
                if (_g_.isshowcommentlist) {
                    _g_.showbestandcomment()
                }
            } else {
                _g_.showbestandcomment(true)
            }
            if (_g_.hassaveindex) {
                _g_.savelxindex(ix)
            }
            if (!_g_.isexam) {
                var _iscollect_ = _g_.isincollect(itemobj.id);
                _g_.bindcollectaction()
            }
        },
        bindquestionpic: function(o) {
            var imageurl = o.imageurl;
            if (imageurl != "") {
                if (imageurl.indexOf(".swf") > 0) {
                    if (typeof this.videowidth == "undefined") {
                        var _w_ = parseInt($(window).width(), 10) - 30;
                        this.videowidth = _w_
                    }
                    var mp4url = this.returnqqvedio(o.imageurl);
                    var qqvideo = "<sc" + 'ript>__qv__("' + mp4url + '","' + this.videowidth + '","",document.getElementById("' + this.videoplayid + '"));</scr' + "ipt>";
                    var temp = $("#" + this.question_video_template).html();
                    return temp.replace("{video}", qqvideo)
                } else {
                    var temp = $("#" + this.question_pic_template).html();
                    if (typeof o.sohuimg != "undefined" && o.sohuimg != "") {
                        return temp.replace("{image}", "http://img.itc.cn/photo/" + o.sohuimg + "_w320")
                    } else {
                        return temp.replace("{image}", imageurl)
                    }
                }
            }
            return ""
        },
        bindimagescale: function() {
            if (typeof ImagesZoom == "undefined") {
                return
            }
            var imagefilter = this.imagefilter;
            ImagesZoom.init({
                elem: imagefilter
            })
        },
        bindoption: function(questiondetail) {
            var optiontemplate = $("#" + this.question_option_template).html();
            var optionArray = [];
            var o = questiondetail.question;
            var isnoanswered = questiondetail.status == 0 || questiondetail.status == 3;
            if (this.isexamfinish) {
                isnoanswered = false
            }
            if (o.type == 1) {
                var action = isnoanswered ? "kslx.chooseoption(this)": "";
                var jsonArray = [{
                    show: "A",
                    text: "正确\r\n",
                    code: "1",
                    action: action
                },
                {
                    show: "B",
                    text: "错误",
                    code: "2",
                    action: action
                }];
                return mjx.bindTempList(optiontemplate, jsonArray)
            } else {
                var action, appendhtml = "";
                if (o.type == 2) {
                    action = isnoanswered ? "kslx.chooseoption(this)": ""
                } else if (o.type == 3) {
                    action = "";
                    if (isnoanswered) {
                        action = "kslx.choosemuloption(this)";
                        appendhtml = '<div style="padding: 10px 20px;"><div class="btn gray disable" onclick="kslx.submitmuloption(this)" id="' + this.mulselectsubmit + '">确定</div></div>'
                    }
                }
                var jsonArray = [{
                    show: "A",
                    text: o.an1,
                    code: "1",
                    action: action
                },
                {
                    show: "B",
                    text: o.an2,
                    code: "2",
                    action: action
                },
                {
                    show: "C",
                    text: o.an3,
                    code: "3",
                    action: action
                }];
                if (typeof o["an4"] != "undefined" && o["an4"] != "") {
                    jsonArray.push({
                        show: "D",
                        text: o.an4,
                        code: "4",
                        action: action
                    })
                }
                return mjx.bindTempList(optiontemplate, jsonArray) + appendhtml
            }
            return ""
        },
        bindexplain: function(explain) {
            var explaintemplate = $("#" + this.question_best_explain_template).html();
            var explainHtml = mjx.bindTemp(explaintemplate, {
                best_explain: explain
            });
            $("#" + this.question_best_explain).html(explainHtml)
        },
        goprev: function() {
            this.loadquestion(this.index - 1)
        },
        gonext: function() {
            this.loadquestion(this.index + 1)
        },
        tocollect: function() {
            alert("tocollect")
        },
        jump: function(ix) {
            this.closeanswercard();
            this.loadquestion(ix)
        },
        showzhezhao: function() {
            mjx.dialog.showzhezhao()
        },
        closezhezhao: function() {
            mjx.dialog.closezhezhao()
        },
        settiban_scroll: function() {
            var container = $("#" + this.tibancontentid).parent();
            var scrollTo = $("#" + this.tibancontentid).children().eq(this.index);
            var _scrollto_ = scrollTo.offset().top - container.offset().top + container.scrollTop();
            container.scrollTop(_scrollto_)
        },
        showanswercard: function() {
            alert("1");
            if (!this.tibanconfig) {
                var winheight = $(window).height();
                var height = parseInt(winheight * .8, 10);
                this.tibanconfig = {
                    height: height,
                    winheight: winheight,
                    top: winheight - height,
                    containerheight: height - 150
                }
            }
            this.showhidevideo(false);
            var _tbitems = [];
            var _qitemtemp = $("#" + this.tiban_item_templateid).html();
            var _item_status_, _item_color, right_num = 0,
            error_num = 0,
            no_num = 0;
            for (var i = 0,
            l = this.questions.length; i < l; i++) {
                _item_status_ = this.questions[i].status;
                _item_color_ = this.tibancolor[_item_status_ + ""];
                if (_item_status_ == 0) {
                    no_num++
                } else if (_item_status_ == 1) {
                    right_num++
                } else {
                    error_num++
                }
                _tbitems.push(mjx.bindTemp(_qitemtemp, {
                    color: _item_color_,
                    show: i + 1,
                    ix: i
                }))
            }
            var _qitemtemphtml = _tbitems.join("");
            var tibanJson = {
                timulist: _qitemtemphtml,
                right_num: right_num,
                error_num: error_num,
                no_num: no_num
            };
            var tiban_temp = $("#" + this.tiban_templateid).html();
            tiban_temp = mjx.bindTemp(tiban_temp, tibanJson);
            var _tbid = this.tibanid;
            if ($("#" + _tbid).length > 0) {
                $("#" + _tbid).remove()
            }
            $("body").append(tiban_temp);
            var g = this;
            if (g.isexam) {
                $("#" + _tbid).find(".result").hide()
            }
            $("#" + _tbid).find(".cern_btn").bind("click",
            function() {
                var _ix_ = $("#" + _tbid).find("input").val();
                if (_ix_ == "0") {
                    g.jump(0);
                    return
                }
                if (mjx.isInteger(_ix_)) {
                    var ix = parseInt(_ix_, 10);
                    if (ix > g.questions.length) {
                        ix = g.questions.length - 1;
                        g.closeanswercard();
                        mjx.dialog.dialog("跳转", "输入题号大于最大题号,跳转至最后一题", {
                            text: "确定",
                            callback: function() {
                                g.jump(ix)
                            }
                        })
                    } else {
                        g.jump(ix - 1)
                    }
                } else {
                    g.closeanswercard();
                    return
                }
            });
            $("#" + _tbid).css({
                top: this.tibanconfig.winheight,
                height: this.tibanconfig.height
            });
            $("#" + this.tibancontentid).parent().css({
                height: this.tibanconfig.containerheight
            });
            $("#" + _tbid + " .pic").hide();
            var _tb_height_ = this.tibanconfig.height;
            setTimeout(function() {
                $("#" + _tbid).css({
                    transform: "translate(0,-" + _tb_height_ + "px)",
                    "-webkit-transform": "translate(0,-" + _tb_height_ + "px)",
                    "padding-bottom": "10000px",
                    display: "block"
                });
                g.settiban_scroll()
            },
            10);
            $("#" + _tbid).bind("touchmove",
            function(e) {
                e.preventDefault()
            });
            $("#" + _tbid + " .tiban").bind("touchmove",
            function(e) {
                e.stopPropagation()
            });
            this.showzhezhao();
            var g = this;
            var _findobj = "#" + mjx.dialog.getzhezhaoid();
            $(_findobj).bind("click",
            function(e) {
                e.stopPropagation();
                g.closeanswercard()
            })
        },
        closeanswercard: function() {
            $("#" + this.tibanid).css({
                transform: "translate(0,-" + this.tibanconfig.height + "px)",
                "-webkit-transform": "translate(0,0)",
                display: "none"
            });
            this.closezhezhao();
            this.showhidevideo(true)
        },
        showhidevideo: function(flag) {
            var hidden = flag ? "visible": "hidden";
            $("#" + this.videoplayid).css({
                visibility: hidden
            })
        },
        dialog: function(title, content, btnArray, isclose) {
            mjx.dialog.dialog(title, content, btnArray, isclose)
        },
        dialog_close: function() {
            mjx.dialog.dialog_close()
        },
        getnodoqueston: function() {
            var isfinish = true;
            var count = 0;
            var ix = 0;
            for (var i = 0,
            l = this.questions.length; i < l; i++) {
                if (this.questions[i].status == 0) {
                    if (isfinish) {
                        isfinish = false;
                        ix = i
                    }
                    count++
                }
            }
            return {
                isfinish: isfinish,
                count: count,
                ix: ix
            }
        },
        getexamresult: function() {
            var score = 0;
            for (var i = 0,
            l = this.questions.length; i < l; i++) {
                var _status_ = this.questions[i].status;
                if (_status_ == 3) {
                    var isright = this.questions[i].question.trueanswer == this.questions[i].myanswer;
                    _status_ = isright ? 1 : 2;
                    this.questions[i].status = _status_;
                    this.upatemydoquestions(isright, this.questions[i].id)
                }
                if (_status_ == 1) {
                    score += this.questionpoint[this.questions[i].question.type]
                }
            }
            return score
        },
        examreview: function() {
            this._show_examresult(false);
            window.scrollTo(0, 0);
            this.loadquestion(0);
            this.showanswercard();
            this.isshowcommentlist = true
        },
        _show_examresult: function(isshow) {
            if (isshow) {
                $("#" + this.question_content).hide();
                $("#" + this.footer_actions).parent().hide();
                $("#" + this.exam_result_id).show()
            } else {
                $("#" + this.question_content).show();
                $("#" + this.footer_actions).parent().show();
                $("#" + this.exam_result_id).hide()
            }
        },
        submitexam: function() {
            var checkexam = this.getnodoqueston();
            if (checkexam.isfinish || this.isautosubmit) {
                this.dosubmitexam()
            } else {
                var dtext = "还有" + checkexam.count + "道题目没有做，确认交卷吗？";
                var ix = checkexam.ix;
                var _g_ = this;
                mjx.dialog.dialog("确认交卷", dtext, {
                    yes: "查看未做题",
                    no: "确定",
                    yescallback: function() {
                        _g_.loadquestion(ix)
                    },
                    nocallback: function() {
                        _g_.dosubmitexam()
                    }
                })
            }
        },
        dosubmitexam: function() {
            if (typeof this._exam_timer != "undefined") {
                clearTimeout(this._exam_timer)
            }
            $("#" + this.btn_submitexam).hide();
            this.isexamfinish = true;
            var score = this.getexamresult();
            var scorehtml = $("#" + this.exam_result_template).html();
            var costtime = this.totalexamtimes - this.examtimes;
            if (typeof saibo != "undefined") {
                var km = 1;
                var cx = this.cartype;
                if (cx.indexOf("s") > 0) {
                    km = 4;
                    cx = cx.replace("s", "")
                }
                var cx = this.cartype;
                saibo.upresult(km, cx, score, costtime)
            }
            var timestring = mjx.formarttimeZH(costtime);
            var exam_result_content_templateobjid = score < this.passexamscore ? this.exam_result_content_template.unpass: this.exam_result_content_template.pass;
            var exam_result_content_template = $("#" + exam_result_content_templateobjid).html();
            var scoreJson = {
                score: score,
                time: timestring,
                passcontent: exam_result_content_template
            };
            var savescoreJson = {
                score: score,
                time: costtime,
                dt: mjx.timestamp()
            };
            this.savescores(savescoreJson);
            scorehtml = mjx.bindTemp(scorehtml, scoreJson);
            var height = $(window).height();
            var top = 0;
            if (this.exam_resultpostion == null) {
                top = $("#" + this.question_content).position().top
            } else {
                top = this.exam_resultpostion.top
            }
            var resultId = "examresult_" + mjx.timestamp();
            this.exam_result_id = resultId;
            var html = '<div id="' + resultId + '" style="position: absolute;background-color:#fff;z-index: 999;width: 100%;min-height:' + height + "px;top:" + top + 'px;overflow:hidden;">' + scorehtml + "</div>";
            $("body").append(html);
            var _g_ = this;
            var local_my_exam_name = this.examresultusername();
            $("#" + this.exam_result_uname_id).val(local_my_exam_name);
            $("#" + this.exam_result_uname_id).unbind("blur").bind("blur",
            function() {
                var curr_name = $(this).val();
                if (!curr_name.match(/^[\u4E00-\u9FA5a-zA-Z0-9_]{2,8}$/)) {
                    alert("请输入2-8个字符，可支持汉字、数字、下划线");
                    $(this).val("")
                } else {
                    _g_.examresultusername(curr_name)
                }
            });
            this._show_examresult(true);
            var bths = $("#" + resultId + " .exam_result_btns").children();
            bths.eq(0).bind("click",
            function() {
                _g_.examreview()
            });
            bths.eq(1).bind("click",
            function() {
                window.location = window.location.href
            });
            bths.eq(2).bind("click",
            function() {
                alert("分享")
            })
        },
        examresultusername: function(v) {
            var key = "my_exam_name";
            if (typeof v == "undefined") {
                return mjx.db.get(key)
            } else {
                mjx.db.save(key, v)
            }
        },
        updateexamerror: function(isadd) {
            if (isadd) {
                this.errorcount++;
                if (this.errorcount > this.exammaxerrors) {
                    var _g_ = this;
                    _g_.autonext.open = false;
                    mjx.dialog.dialog("自动交卷", "您的错题已经超过" + _g_.exammaxerrors + "题，自动交卷", {
                        text: "确定",
                        callback: function() {
                            _g_.isautosubmit = true;
                            _g_.submitexam()
                        }
                    })
                }
            }
            $("#" + this.examwrongcount).html(this.errorcount)
        },
        runexamtimer: function() {
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
                _g_.submitexam()
            }
            $("#" + _g_.examtimer).html(_showtime_)
        },
        _getlxindexkey: function() {
            var key = this.dbversion + this.cartype + "dix";
            if (this.chapterid != "") {
                key += "_" + this.chapterid
            }
            return key
        },
        savelxindex: function(ix) {
            var key = this._getlxindexkey();
            mjx.db.save(key, ix)
        },
        getlxindex: function() {
            var key = this._getlxindexkey();
            var _ix_ = mjx.db.get(key);
            if (!mjx.isInteger(_ix_)) {
                return 0
            }
            return parseInt(_ix_, 10)
        },
        isshowcommentnow: function() {
            return $("#" + this.btn_explain_switch).hasClass("explainon")
        },
        resetshowexplaincomment: function() {
            $("#" + this.btn_explain_switch).removeClass("explainon").html(this.explaintext.yes)
        },
        setshowexplaincomment: function() {
            if (this.isshowcommentlist) {
                $("#" + this.btn_explain_switch).addClass("explainon").html(this.explaintext.no)
            }
        },
        getcollectkey: function() {
            return this.dbversion + this.cartype + "_collect"
        },
        loadcollect: function() {
            var key = this.getcollectkey();
            var collectstring = mjx.db.get(key);
            this.collectquestionids = mjx.stringToObjectArray(collectstring)
        },
        getcollectsbychapters: function(chapterids) {
            this.loadcollect();
            var arr = this.collectquestionids;
            var json = mjx.getObjectArrayAllCountByKey(arr, "c", chapterids, "chapter", "total");
            return json
        },
        getcollectsbychapterid: function(chapterid) {
            this.loadcollect();
            var arr = this.collectquestionids;
            if (chapterid == 0) {
                return mjx.getKeysObjectArray(arr, "id")
            }
            return mjx.getKeysObjectArrayByKey(arr, "id", "c", chapterid)
        },
        clearallcollects: function() {
            var key = this.getcollectkey();
            this.collectquestionids = [];
            mjx.db.delete(key)
        },
        isincollect: function(id) {
            return mjx.inObjectArray(this.collectquestionids, "id", id)
        },
        addcollect: function(id) {
            if (!this.isincollect(id)) {
                var question = this._getquestionbyid(id);
                id = parseInt(id);
                var _c = question.chapterid;
                if (typeof _c == "undefined" || _c == "") {
                    _c = 0
                } else {
                    _c = parseInt(_c)
                }
                var toaddobj = {
                    id: id,
                    c: _c
                };
                this.collectquestionids.push(toaddobj);
                var collectstring = mjx.objectToString(this.collectquestionids);
                var key = this.getcollectkey();
                mjx.db.save(key, collectstring)
            }
        },
        removecollect: function(id) {
            var _index_ = -1;
            for (var i = 0,
            l = this.collectquestionids.length; i < l; i++) {
                if (this.collectquestionids[i].id == id) {
                    _index_ = i;
                    break
                }
            }
            if (_index_ > -1) {
                this.collectquestionids.splice(_index_, 1);
                var collectstring = mjx.objectToString(this.collectquestionids);
                var key = this.getcollectkey();
                mjx.db.save(key, collectstring)
            }
        },
        getscoreskey: function() {
            return this.dbversion + this.cartype + "_cores"
        },
        getscores: function() {
            var key = this.getscoreskey();
            var _s_ = mjx.db.get(key);
            return mjx.stringToObjectArray(_s_)
        },
        savescores: function(scoreobj) {
            var oldArray = this.getscores();
            if (oldArray.length >= this.manscorecount) {
                var removeCount = oldArray.length - this.manscorecount + 1;
                oldArray.splice(0, removeCount)
            }
            oldArray.push(scoreobj);
            var key = this.getscoreskey();
            var _s_ = mjx.objectToString(oldArray);
            mjx.db.save(key, _s_)
        },
        getmydoquestionkey: function(isright) {
            return this.dbversion + this.cartype + "_mq_" + (isright ? "right": "wrong")
        },
        getmydoquestionsall: function() {
            var _right_ = this.getmydoquestions(true);
            var _wronng_ = this.getmydoquestions(false);
            var result = mjx.concatObjectArray("id", [_right_, _wronng_]);
            return result
        },
        getmydoquestionscount: function() {
            return this.getmydoquestionsall().length
        },
        getmydoquestions: function(isright) {
            var key = this.getmydoquestionkey(isright);
            var questionidsstring = mjx.db.get(key);
            var _array_ = mjx.stringToObjectArray(questionidsstring);
            var _key_arrays_ = [];
            var result = mjx.removeObjectArrayRepeat(_array_, "id");
            var _array_len_ = _array_.length;
            if (result.length != _array_len_) {
                var idstring = mjx.objectToString(result);
                mjx.db.save(key, idstring)
            }
            return result
        },
        getwrongbychapters: function(chapterids) {
            var arr = this.getmydoquestions(false);
            var json = mjx.getObjectArrayAllCountByKey(arr, "c", chapterids, "chapter", "total");
            return json
        },
        getwrongbychapterid: function(chapterid) {
            var arr = this.getmydoquestions(false);
            if (chapterid == 0) {
                return mjx.getKeysObjectArray(arr, "id")
            }
            return mjx.getKeysObjectArrayByKey(arr, "id", "c", chapterid)
        },
        removewrong: function(id) {
            if (mjx.inObjectArray(this.wrongquestionids, "id", id)) {
                mjx.removeObjectArrayByKey(this.wrongquestionids, "id", id);
                var wrongkey = this.getmydoquestionkey(false);
                var wrongidsstring = mjx.objectToString(this.wrongquestionids);
                mjx.db.save(wrongkey, wrongidsstring)
            }
        },
        clearallwrongs: function() {
            var wrongkey = this.getmydoquestionkey(false);
            this.wrongquestionids = [];
            mjx.db.delete(wrongkey)
        },
        upatemydoquestionsObject: function(isright, toaddobj, id) {
            var tosaveright = false,
            tosavewrong = false,
            removeIndex;
            if (isright) {
                if (!mjx.inObjectArray(this.rightquestionids, "id", id)) {
                    this.rightquestionids.push(toaddobj);
                    tosaveright = true
                }
                if (mjx.inObjectArray(this.wrongquestionids, "id", id)) {
                    mjx.removeObjectArrayByKey(this.wrongquestionids, "id", id);
                    tosavewrong = true
                }
            } else {
                if (!mjx.inObjectArray(this.wrongquestionids, "id", id)) {
                    this.wrongquestionids.push(toaddobj);
                    tosavewrong = true
                }
                if (mjx.inObjectArray(this.rightquestionids, "id", id)) {
                    mjx.removeObjectArrayByKey(this.rightquestionids, "id", id);
                    tosaveright = true
                }
            }
            if (tosaveright) {
                var rightkey = this.getmydoquestionkey(true);
                var rightidsstring = mjx.objectToString(this.rightquestionids);
                mjx.db.save(rightkey, rightidsstring)
            }
            if (tosavewrong) {
                var wrongkey = this.getmydoquestionkey(false);
                var wrongidsstring = mjx.objectToString(this.wrongquestionids);
                mjx.db.save(wrongkey, wrongidsstring)
            }
        },
        upatemydoquestions: function(isright, id) {
            var question = this._getquestionbyid(id);
            var _c = question.chapterid;
            if (typeof _c == "undefined" || _c == "") {
                _c = 0
            } else {
                _c = parseInt(_c, 10)
            }
            var toaddobj = {
                id: id,
                c: _c
            };
            this.upatemydoquestionsObject(isright, toaddobj, id)
        },
        ismakesuregotokey: function() {
            return this.dbversion + "ms_load_nf"
        },
        ismakesuregoto: function() {
            var key = this.ismakesuregotokey();
            var _ismakesuregoto_ = mjx.db.get(key);
            return _ismakesuregoto_ != "no"
        },
        setmakesuregoto: function(hasmakesure) {
            var key = this.ismakesuregotokey();
            if (hasmakesure) {
                mjx.db.delete(key)
            } else {
                mjx.db.save(key, "no")
            }
        },
        returnqqvedio: function(iid) {
            var url = iid.toLowerCase();
            var _qqvedio = [["40001", "s0112vwz3rb"], ["40002", "s0112y4rlfo"], ["40003", "r0112qwrcgx"], ["40004", "h01120bib43"], ["40005", "o0112yx8y2s"], ["40006", "q0112inh4t5"], ["40007", "r0112j5lqng"], ["40008", "c0112ukr4f1"], ["40067", "n0112m603iu"], ["40068", "k0112gpjpwo"], ["40077", "w0112o7x6kk"], ["40091", "l0112uo6hdl"], ["40125", "r0112jt9k3l"], ["40132", "m0112nnmtid"], ["40141", "g0112lvinrb"], ["40152", "i0112lwffj0"], ["40155", "l0112n3irma"], ["40393", "f0112n49uaf"], ["40401", "s01128eoy96"], ["40463", "i0112ce0r99"], ["40527", "u0112d0s460"], ["40556", "m0112tkrto1"], ["40557", "o0112cdwsa3"]];
            var isMatchFull = url.indexOf("/") < 0;
            for (var i = 0,
            l = _qqvedio.length; i < l; i++) {
                if (isMatchFull) {
                    if (url == _qqvedio[i][0] + ".swf") {
                        return _qqvedio[i][1];
                        break
                    }
                } else {
                    if (url.indexOf("/" + _qqvedio[i][0] + ".swf") > -1) {
                        return _qqvedio[i][1];
                        break
                    }
                }
            }
            return iid
        }
    };
    return new kslxcls
} ();
kslx.kuaice = function(kslx) {
    var cls = function() {
        this.questionindex = 0;
        this.videowidth = 0;
        this.videoside = 15;
        this.videofilter = ".videoplayer";
        this.questionfilter = ".question";
        this.choosetypeattr = "choosetype";
        this.questionidattr = "questionid";
        this.chapteridattr = "chapterid";
        this.trueanswerattr = "trueanswer";
        this.answervalueattr = "answervalue";
        this.myanswerfilter = ".item";
        this.choosefilter = this.myanswerfilter + " a";
        this.selectedclass = "on";
        this.choosetype = {
            single: "single",
            multiple: "multiple"
        };
        this.examresulttemplates = {
            pass: "#examresult_pass",
            unpass: "#examresult_unpass"
        };
        this.submitbuttonfilter = "#btn_kc_submitexam";
        this.resetexambuttonfilter = "#btn_kc_reexam";
        this.btnsfilter = "#exam_btns";
        this.resultcontainerfilter = "#exam_result";
        this.questionpoint = 10;
        this.passpoint = 90;
        this.begintime = mjx.timestamp()
    };
    cls.prototype = {
        init: function(cartype) {
            kslx.cartype = cartype;
            kslx.bindimagescale();
            kslx._initmydoquestions();
            this.initvideo();
            this.bindselecter();
            this.bindbuttons();
            this.index = 0;
            window.scrollTo(0, 0)
        },
        setscroll: function(obj) {
            var next = obj.next();
            if (next.attr("questionid")) {
                scroller(next)
            }
        },
        initvideo: function() {
            var _g_ = this;
            $(_g_.videofilter).each(function() {
                if (_g_.videowidth == 0) {
                    _g_.videowidth = $(this).parent().width() - _g_.videoside * 2
                }
                var videosrc = $(this).attr("videosrc");
                var containerid = $(this).attr("id");
                var mp4url = kslx.returnqqvedio(videosrc);
                var qqvideo = "<sc" + 'ript>__qv__("' + mp4url + '","' + _g_.videowidth + '","",document.getElementById("' + containerid + '"));</scr' + "ipt>";
                $(this).html(qqvideo)
            })
        },
        bindselecter: function() {
            var _g_ = this;
            $(_g_.questionfilter).each(function() {
                if ($(this).attr(_g_.choosetypeattr) == _g_.choosetype.single) {
                    $(this).find(_g_.choosefilter).each(function() {
                        $(this).bind("click",
                        function() {
                            $(this).siblings().removeClass(_g_.selectedclass);
                            $(this).addClass(_g_.selectedclass);
                            _g_.setscroll($(this).parent().parent())
                        })
                    })
                } else {
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
                }
            })
        },
        bindbuttons: function() {
            $(this.resetexambuttonfilter).bind("click",
            function() {
                window.location = window.location.href
            });
            var _g_ = this;
            $(this.submitbuttonfilter).bind("click",
            function() {
                _g_.showresult()
            })
        },
        showresult: function() {
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
                    mmyanswer = "";
                    $(this).find(_g_.choosefilter).each(function() {
                        itemanswer = $(this).attr(_g_.answervalueattr);
                        if ($(this).hasClass(_g_.selectedclass)) {
                            mmyanswer = itemanswer;
                            if (mmyanswer == trueanswer) {
                                $(this).addClass("item_right");
                                score += _g_.questionpoint;
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
                        if (mmyanswer == trueanswer) {
                            score += _g_.questionpoint
                        }
                    })
                }
                if (mmyanswer != "") {
                    var toaddobj = {
                        id: questionid,
                        c: chapterid
                    };
                    kslx.upatemydoquestionsObject(mmyanswer == trueanswer, toaddobj, questionid)
                }
            });
            var templatefilter = score < _g_.passpoint ? _g_.examresulttemplates.unpass: _g_.examresulttemplates.pass;
            var template = $(templatefilter).html();
            var resultcontent = mjx.bindTemp(template, {
                score: score
            });
            var endtime = mjx.timestamp();
            var costtime = parseInt((endtime - this.begintime) / 1e3, 10);
            var savescoreJson = {
                score: score,
                time: costtime,
                dt: endtime
            };
            kslx.savescores(savescoreJson);
            $(_g_.btnsfilter).hide();
            $(_g_.resultcontainerfilter).html(resultcontent).show()
        }
    };
    return new cls
} (kslx);
var scroller = function(obj) {
    var step = 5;
    var interval = 5;
    if (typeof obj == "string") {
        obj = $("#" + obj)
    }
    var pos = $(window).scrollTop();
    var target = $(obj).offset().top;
    var isdown = target - pos > 0;
    var timer = null;
    function smoothScroll(m) {
        var isstop;
        if (isdown) {
            pos += step;
            isstop = pos > m
        } else {
            pos -= step;
            isstop = pos < m
        }
        if (isstop) {
            window.clearInterval(timer);
            return
        }
        window.scrollTo(0, pos)
    }
    timer = setInterval(function() {
        smoothScroll(target)
    },
    interval)
};