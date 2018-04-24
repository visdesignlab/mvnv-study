function loadBoardroom() {
    $(function() {
        function loadForeSight(){
        // Load the searchbox if foresight condition
        if(userData.condition === "foresight")
            {
                d3.selectAll('.foresight').style('display','block')
            }
        }

        loadForeSight();

        function e() {
            At = $("h2[index ='1']").offset().top, Nt = $("h2[index ='2']").offset().top, It = $("h2[index ='3']").offset().top, Gt = $("h2[index ='4']").offset().top, Rt = $("h2[index ='5']").offset().top
        }

        function t(e) {
            return At >= e ? 0 : e > At && Nt >= e ? 1 : e > Nt && It >= e ? 2 : e > It && Gt >= e ? 3 : e > Gt && Rt >= e ? 4 : e > Rt && Mt >= e && "iPad" != rt ? 5 : e > Mt && "iPad" != rt ? 6 : 5
        }

        function n() {
            W = 600, Z = 320, Q = 45, j = 22, J = W / Q, q = Z / j, et = 200, tt = 12, nt = et / tt, at = 6, ot = 28, Yt.attr("width", W).attr("height", Z), Ot.range([0, W]).domain([0, Q]), Tt.range([0, Z - q]).domain([0, j])
        }

        function a() {
            W = 520, Z = 260, Q = 45, j = 22, J = W / Q, q = Z / j, at = 5, Yt.attr("width", W).attr("height", Z), Ot.range([0, W]).domain([0, Q]), Tt.range([0, Z - q]).domain([0, j])
        }

        function o() {
            W = 400, Z = 255, Q = 40, j = 23, J = W / Q, q = Z / j, et = 160, tt = 13, nt = et / tt, at = 4.5, ot = 22, Yt.attr("width", W).attr("height", Z), Ot.range([0, W]).domain([0, Q]), Tt.range([0, Z - q]).domain([0, j])
        }

        function r() {
            W = 280, Z = 220, Q = 40, j = 23, J = W / Q, q = Z / j, et = 160, tt = 13, nt = et / tt, at = 3, ot = 22, Yt.attr("width", W).attr("height", Z), Ot.range([0, W]).domain([0, Q]), Tt.range([0, Z - q]).domain([0, j])
        }

        function i() {
            for (var e = 0; e < Dt.length; e++) {
                var t = d3.select("div#" + Dt[e]).append("svg");
                t.attr("width", W).attr("height", Z), t.append("text").attr("class", "mobile-group-text").attr("textnum", "0").attr("x", 3).attr("y", 0), t.append("text").attr("class", "mobile-group-text").attr("textnum", "1").attr("x", 3).attr("y", 0), t.append("text").attr("class", "mobile-group-text").attr("textnum", "2").attr("x", 3).attr("y", 0), t.append("text").attr("class", "mobile-group-text").attr("textnum", "3").attr("x", 3).attr("y", 0), $("div#" + Dt[e] + " p.mobile-subhed").html(Kt[e]), b(t, !0);
                var n = Dt[e];
                s(t, Bt[n].x, Bt[n].y, Bt[n].textRows, Bt[n].groupText, n), S(n, Bt[n].keyNumbers, Bt[n].rangeOfColors, "mobileCompanies", n), "mktcap" == n ? (c(n, "AAPL", "#231f20"), c(n, "CNX", "#727272")) : "female" == n ? (c(n, "NAVI", "#231f20"), c(n, "KORS", "#231f20"), c(n, "GCI", "#231f20")) : "unrelated" == n ? (c(n, "MCD", "#231f20"), c(n, "KHC", "#231f20"), c(n, "RIG", "#231f20")) : "age" == n ? (c(n, "CBS", "#231f20"), c(n, "FB", "#727272")) : "tenure" == n ? (c(n, "TSS", "#231f20"), c(n, "DRI", "#727272")) : "medianpay" == n && (c(n, "CELG", "#231f20"), c(n, "REGN", "#231f20"), c(n, "HCA", "#727272"), c(n, "AMZN", "#727272"), c(n, "BRKA", "#727272"))
            }
        }

        function c(e, t, n) {
            d3.select("div#" + e + " circle.mobile-company[ticker='" + t + "']").style("fill", n)
        }

        function l(e, t) {
            d3.select("circle.company[ticker='" + e + "']").style("fill", t)
        }

        function s(e, t, n, a, o, r) {
            e.selectAll("circle.mobile-company").attr("cx", function(e) {
                return Ot(e[t])
            }).attr("cy", function(e) {
                return Tt(e[n])
            }), d3.select("div#" + r + " svg text[textnum='3']").attr("y", Tt(a[0] - 1)).text(o[0]), d3.select("div#" + r + " svg text[textnum='2']").attr("y", Tt(a[1])).text(o[1]), d3.select("div#" + r + " svg text[textnum='1']").attr("y", Tt(a[2])).text(o[2]), d3.select("div#" + r + " svg text[textnum='0']").attr("y", Tt(a[3])).text(o[3])
        }

        function d() {
            Yt.append("text").attr("class", "group-text").attr("textnum", "0").attr("x", 3).attr("y", 0), Yt.append("text").attr("class", "group-text").attr("textnum", "1").attr("x", 3).attr("y", 0), Yt.append("text").attr("class", "group-text").attr("textnum", "2").attr("x", 3).attr("y", 0), Yt.append("text").attr("class", "group-text").attr("textnum", "3").attr("x", 3).attr("y", 0)
        }

        function m(e, t) {
            Et = 1.5, Lt = 1.5;
            for (var n = 0, a = 0; a < ht.length; a++) n % Q === 0 && (Et = .5, Lt += 1), n++, ht[a][e] = Et, ht[a][t] = Lt, Et += 1
        }

        function u(e, t, n, a, o, r, i) {
            Et = .5, Lt = .5;
            for (var c = 1, l = 0, s = 1, d = 0; d < e.length; d++) {
                var m = e[d][o];
                l++, c != m && (c = m, Et = .5, Lt += 2, s += 2, r && r.push(s - .25), l = 0), l % Q === 0 && 0 !== d && (Et = .5, Lt += 1, s++), e[d][t] = Et, e[d][n] = Lt, e[d][a] = d, i && (e[d][i + "GroupIndex"] = l), Et += 1
            }
            r && r.push(s - 2)
        }

        function p(e, t, n, a, o, r, i) {
            if (d3.selectAll("circle.company[age='-1']").style("visibility", "visible"), d3.selectAll("circle.company[tenure='-1']").style("visibility", "visible"), d3.selectAll("circle.company[medianpay='-1']").style("visibility", "visible"), i || (n == Bt.medianpay.index ? d3.selectAll("circle.company[medianpay='-1']").style("visibility", "hidden") : n == Bt.tenure.index ? d3.selectAll("circle.company[tenure='-1']").style("visibility", "hidden") : n == Bt.age.index && d3.selectAll("circle.company[age='-1']").style("visibility", "hidden")), Yt.selectAll("circle.company").transition().duration(1e3).attr("index", function(e) {
                    return e[n]
                }).attr("cx", function(t) {
                    return Ot(t[e])
                }).attr("cy", function(e) {
                    return Tt(e[t])
                }), a) {
                Yt.selectAll("circle.company").attr("groupindex", function(e, t) {
                    return ht[t][r + "Index"]
                }).attr("groupnum", function(e, t) {
                    return ht[t][r]
                }), i && Yt.selectAll("circle.company").attr("colororderindex", function(e, t) {
                    return ht[t][i + "GroupIndex"]
                }), d3.select("div.svg-container svg text[textnum='3']").transition().duration(1e3).attr("y", Tt(a[0] - 1)).text(o[0]), d3.select("div.svg-container svg text[textnum='2']").transition().duration(1e3).attr("y", Tt(a[1])).text(o[1]), d3.select("div.svg-container svg text[textnum='1']").transition().duration(1e3).attr("y", Tt(a[2])).text(o[2]), d3.select("div.svg-container svg text[textnum='0']").transition().duration(1e3).attr("y", Tt(a[3])).text(o[3]), kt = a[4], bt = kt * q, Ct = [], Ct.push(a[0] - 1.75), Ct.push(a[1] - .75), Ct.push(a[2] - .75), Ct.push(a[3] - .75); {
                    var c = (a[1] - a[0]) * q,
                        l = (a[2] - a[1] - 1) * q,
                        s = (a[3] - a[2] - 1) * q;
                    (a[4] - a[3]) * q
                }
                gt = c / q - 1, vt = l / q - 1, $t = s / q - 1, d3.select("rect.groupRect").attr("y", q).attr("height", bt).on("mousemove", x)
            }
            Ht && ($("div.tooltip").css("opacity", 0), setTimeout(function() {
                T(Xt)
            }, 1100))
        }

        function y() {
            Yt.append("rect").attr("class", "overlay resetRect").attr("y", ot).attr("width", W).attr("height", et - 2 * nt).on("mouseout", g).on("mousemove", v)
        }

        function f() {
            Yt.append("rect").attr("class", "overlay groupRect").attr("width", W).on("mouseout", g)
        }

        function recordVisit(item){
            // record previous
            if(currentVisit && currentVisit['chartCode'] !== item){
                currentVisit['end'] = Date.now()
                currentVisit['duration'] = currentVisit['end'] - currentVisit['start'];
                userData['visitLog'].push(currentVisit);
                currentVisit = null;
                //console.log(userData['visitLog'])
            }

            // start a new visit
            if(!currentVisit && item){
                //console.log(item)
                currentVisit = {}
                currentVisit['start'] = Date.now();
                currentVisit['chartCode'] = item;
                currentVisit['searchId'] = currentSearch ? currentSearch['id'] : -1;
                currentVisit['sectionId'] = currentSection['id']
                currentVisit['sectionCode'] = currentSection['code']
            }
            
        }
        function x() {
            if (!Modernizr.touch && 0 == Ht) {
                var e, t, n = d3.scale.linear().range([0, W]).domain([0, Q]),
                    a = d3.scale.linear().range([0, bt]).domain([0, kt + 1]),
                    o = Math.floor(n.invert(d3.mouse(this)[0])),
                    r = Math.floor(a.invert(d3.mouse(this)[1]));
                r > Ct[0] && r < Ct[1] - 1 ? (t = "group3", e = r - 2) : r > Ct[1] && r < Ct[2] - 1 ? (t = "group2", e = r - 4 - Math.floor(gt)) : r > Ct[2] && r < Ct[3] - 1 ? (t = "group1", e = r - 6 - Math.floor(vt) - Math.floor(gt)) : r > Ct[3] ? (t = "group0", e = r - 8 - Math.floor($t) - Math.floor(vt) - Math.floor(gt)) : (t = "none", e = 0), "none" == t ? g() : $("div.tooltip").css("opacity", 1);
                
                var i, c = o + e * Q;
                // i = yt && ft ? d3.select("circle.company[groupnum='" + t + "'][colororderindex='" + c + "']").attr("index") : d3.select("circle.company[groupnum='" + t + "'][groupindex='" + c + "']").attr("index"), k(i)
                // Convert to the long form and fix the original bug
                if (yt && ft) {
                  if (!d3.select("circle.company[groupnum='" + t + "'][colororderindex='" + c + "']").empty()) {
                    i = d3.select("circle.company[groupnum='" + t + "'][colororderindex='" + c + "']").attr("index");
                  }
                } else {
                  if (!d3.select("circle.company[groupnum='" + t + "'][groupindex='" + c + "']").empty()) {
                    i = d3.select("circle.company[groupnum='" + t + "'][groupindex='" + c + "']").attr("index");
                    k(i);

                  }
                }
            }
        }

        function g() {
            0 == Ht && ($("div.tooltip").css("opacity", 0), d3.selectAll("circle.company").attr("stroke", "#fff"), $("div.tooltip").css({
                left: 0,
                top: 0
            }), d3.select("line.hover-line").remove(), d3.select("text.hover-text").remove())
            recordVisit(null)
        }

        function v() {
            if (!Modernizr.touch && 0 == Ht) {
                var e = d3.scale.linear().range([0, W]).domain([0, Q]),
                    t = d3.scale.linear().range([0, et - nt]).domain([-2, tt - 1]),
                    n = Math.floor(e.invert(d3.mouse(this)[0])),
                    a = Math.floor(t.invert(d3.mouse(this)[1])),
                    o = n + a * Q;
                o < ht.length && ($("div.tooltip").css("opacity", 1), k(o))
            }
        }

        function b(e, t) {
            e.selectAll("circle").data(ht).enter().append("circle").attr("r", at).attr("class", function() {
                return t ? "mobile-company" : "company"
            }).attr("mktcap", function(e) {
                return e.mktcap
            }).attr("industry", function(e) {
                return e.industry
            }).attr("directorstotal", function(e) {
                return e.directorstotal
            }).attr("age", function(e) {
                return e.age
            }).attr("medianpay", function(e) {
                return e.medianpay
            }).attr("female", function(e) {
                return e.female
            }).attr("unrelated", function(e) {
                return e.unrelated
            }).attr("tenure", function(e) {
                return e.tenure
            }).attr("companyName", function(e) {
                return e.companyname
            }).attr("ticker", function(e) {
                return e.ticker
            }).attr("cx", 0).attr("cy", 0).style("fill-opacity", 1).attr("stroke", "#fff").attr("stroke-width", 1.5)
        }

        function k(e) {
            var t = d3.select("circle[index='" + e + "']");
            if (!Modernizr.touch && !t.empty()) {
                var n, a = t.attr("companyName"),
                    o = parseInt(t.attr("cy")),
                    r = parseInt(t.attr("cx")),
                    i = t.attr("mktcap"),
                    c = t.attr("industry"),
                    l = t.attr("medianpay"),
                    s = t.attr("directorstotal"),
                    d = t.attr("tenure"),
                    m = t.attr("age"),
                    u = t.attr("female"),
                    p = t.attr("unrelated");

                recordVisit(a)

                if (St || (n = W / 2), St && (n = .5 * W), r > n ? r = r - $("div.tooltip").width() - 3 * J : r += 2 * J, !St) {
                    var y = bt + 10;
                    o += q
                }
                St && (y = bt / 2, o > y ? o = o - $("div.tooltip").height() - 2 * q : o += q), $("h5.companyName").html(a), $("td.industry").html(c), $("td.market-cap").html("$" + Math.round(i / 1e3 * 100) / 100 + " billion"), $("td.directors").html(s), $("td.salary").html(function() {
                    return -1 == l ? "N/A" : "$" + addCommas(l)
                }), $("td.female").html(Math.floor(100 * u) + "%"), $("td.unrelated").html(Math.floor(100 * p) + "%"), $("td.age").html(function() {
                    return -1 == m ? "N/A" : m + " years old"
                }), $("td.tenure").html(function() {
                    return -1 == d ? "N/A" : d + " years"
                }), $("div.tooltip").css({
                    left: r + "px",
                    top: o + "px"
                }), $("img.closebtn").css("left", $("div.tooltip").width() + 5 + "px")
            }

            d3.selectAll("circle.company")
               // .classed("selectedCompany",false)
                .attr("stroke", "#fff"), 
            t//.classed("selectedCompany",true)
            .attr("stroke", "#231f20")

        }

        function C() {
            var e = Bt[pt].textRows,
                t = Bt[pt].groupText,
                n = Bt[pt].group;
            p(pt + "Group" + ut + "X", pt + "Group" + ut + "Y", pt + "Group" + ut + "Index", e, t, n, pt + "Group" + ut)
        }

        function w(e) {
            0 == e ? (pt = "mktcap", A()) : 1 == e ? (pt = "female", A()) : 2 == e ? (pt = "unrelated", A()) : 3 == e ? (pt = "age", A()) : 4 == e ? (pt = "tenure", A()) : 5 == e ? (pt = "medianpay", A()) : 6 == e && (pt = "reset", p("introX", "introY", "introIndex"))
        }

        function A() {
            yt && ft ? C() : p(Bt[pt].x, Bt[pt].y, Bt[pt].index, Bt[pt].textRows, Bt[pt].groupText, Bt[pt].group)
        }

        function N(e) {
            d3.select("rect.groupRect").remove(), f(), R(e), w(e), X(e), G(e), $("tr.board-fig").hide(), $("tr.board-fig[index='" + e + "']").show()
        }

        function I(e) {
            (6 != parseInt(e) || "iPad" != rt) && (wt = parseInt(e), Ht && $("button.clear-company").click(), Ft && $("button.clear-industry").click(), $("p.custom-color-subhed").html(""), 0 == xt && 6 != wt && (d(), xt = !0), 6 != wt ? $("div.well-wrap").fadeOut(1e3) : $("div.well-wrap").fadeIn(1e3), $("div.tooltip table tr").removeClass("second-selected"), $("div.tooltip table tr").removeClass("selected"), $("div.tooltip table tr[index='" + e + "']").addClass("selected"), d3.select("rect.resetRect").remove(), d3.select("rect.groupRect").remove(), 6 == wt ? (y(), $("button.reset").addClass("disabled").removeAttr("style"), $("button.order-list").removeClass("selected"), $("button.color-list").removeClass("selected"), d3.selectAll("text.group-text").remove(), $("button.custom-example").show(), xt = !1) : (f(), $("button.custom-example").hide()), R(wt), w(wt), X(wt), G(wt), yt = !1, ft = !1, Modernizr.touch && d3.selectAll("circle.company").attr("stroke", "#fff"))
            recordSection(wt)
        }

        function G(e) {
            $("li.main-list a, li.embed-list a").removeClass("selected"), $("li.main-list a, li.main-list a").css("background-color", "#fff"), $("li.main-list a[num='" + e + "'], li.embed-list a[num='" + e + "']").addClass("selected"), $("li.main-list a[num='" + e + "'], li.embed-list a[num='" + e + "']").removeAttr("style")
        }

        function R(e) {
            0 == e ? (ut = "mktcap", M()) : 1 == e ? (ut = "female", M()) : 2 == e ? (ut = "unrelated", M()) : 3 == e ? (ut = "age", M()) : 4 == e ? (ut = "tenure", M()) : 5 == e ? (ut = "medianpay", M()) : 6 == e && (d3.selectAll("circle.company").style("fill", "#e2e3e4"), ut = "reset")
        }

        function M() {
            S(ut, Bt[ut].keyNumbers, Bt[ut].rangeOfColors, "companies"), ft && ($("a.custom-color-pill").css("background-color", Bt[ut].color), yt ? C() : p(Bt[ut].noGroupX, Bt[ut].noGroupY, Bt[ut].index))
        }

        function X(e) {
            $("p.subhed").html(Kt[e])
            //console.log(e)
        }

        function S(e, t, n, a, o) {
            function r(e) {
                return e <= t[0] ? n[0] : e > t[0] && e <= t[1] ? n[1] : e > t[1] && e <= t[2] ? n[2] : e >= t[3] ? n[3] : void 0
            }
            return "companies" == a && (d3.selectAll("circle.company").style("fill", function(t) {
                return -1 == t[e] ? "#eeeff0" : r(t[e])
            }), St || (0 == wt ? (l("AAPL", "#231f20"), l("CNX", "#727272")) : 1 == wt ? (l("NAVI", "#231f20"), l("KORS", "#231f20"), l("GCI", "#231f20")) : 2 == wt ? (l("MCD", "#231f20"), l("KHC", "#231f20"), l("RIG", "#231f20")) : 3 == wt ? (l("CBS", "#231f20"), l("FB", "#727272")) : 4 == wt ? (l("TSS", "#231f20"), l("DRI", "#727272")) : 5 == wt && (l("CELG", "#231f20"), l("REGN", "#231f20"), l("HCA", "#727272"), l("AMZN", "#727272"), l("BRKA", "#727272"))), Modernizr.touch || (St ? Y(e) : "mktcap" != e || ft ? g() : Y(e))), "pills" == a ? r(e) : void("mobileCompanies" == a && d3.selectAll("div#" + o + " circle.mobile-company").style("fill", function(t) {
                return -1 == t[e] ? "#eeeff0" : r(t[e])
            }))
        }

        function Y(e) {
            g();
            var t, n, a, o = [],
                r = e + "Group",
                i = e + "GroupIndex",
                c = e + "X",
                l = e + "Y";
            d3.selectAll("circle.company").each(function(e) {
                "group3" == e[r] && o.push(e)
            });
            var s = d3.max(o, function(e) {
                return e[i]
            });
            d3.selectAll("circle.company").each(function(e) {
                "group3" == e[r] && e[i] == s && (t = e.companyname, n = e[c], a = e[l])
            });
            var d = d3.select("circle.company[companyName = '" + t + "']");
            d.attr("stroke", "#000"), Yt.append("line").attr("class", "hover-line").attr("x1", Ot(n)).attr("y1", Tt(a)).attr("x2", Ot(n + 1)).attr("y2", Tt(a)).attr("stroke-width", 2).attr("stroke", "#000"), Yt.append("text").attr("class", "hover-text").text("Select to learn more").attr("x", Ot(n + 1.25)).attr("y", Tt(a + .5))
        }

        function O(e, t) {
            t ? wt == e ? wt = 0 : wt++ : 0 == wt ? wt = e : wt--
        }

        function T(e) {
            var t = d3.select("circle.company[ticker='" + e + "']").attr("index");
            Modernizr.touch || $("div.tooltip").css("opacity", 1), k(parseInt(t))
        }

        function D() {
            for (var e = 0; e < ht.length; e++) $("select.chzn-select").append("<option companyID ='" + ht[e].ticker + "'>" + ht[e].companyname + "</option>")
        }

        function P() {
            for (var e = 0; e < ht.length; e++) ht[e].mktcap = Math.floor(ht[e].mktcap), "#N/A" == ht[e].age && (ht[e].age = -1), "#N/A" == ht[e].tenure && (ht[e].tenure = -1), "#N/A" == ht[e].medianpay && (ht[e].medianpay = -1), "The Coca-Cola Co" == ht[e].companyname && (ht[e].companyname = "Coca-Cola"), "The Western Union Company" == ht[e].companyname && (ht[e].companyname = "Western Union"), "Fluor Corporation (NEW)" == ht[e].companyname && (ht[e].companyname = "Fluor"), ", Incorporated" == ht[e].companyname.slice(-14) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 14) : "Incorporated" == ht[e].companyname.slice(-12) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 12) : "Corporation" == ht[e].companyname.slice(-11) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 11) : ", Limited" == ht[e].companyname.slice(-9) || "& Company" == ht[e].companyname.slice(-9) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 9) : "Inc./DE/" == ht[e].companyname.slice(-8) || "Limited." == ht[e].companyname.slice(-8) || "Holdings" == ht[e].companyname.slice(-8) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 8) : "Limited" == ht[e].companyname.slice(-7) || "Company" == ht[e].companyname.slice(-7) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 8) : ", Inc." == ht[e].companyname.slice(-6) || "and Co" == ht[e].companyname.slice(-6) || ", inc." == ht[e].companyname.slice(-6) || "And Co" == ht[e].companyname.slice(-6) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 6) : "Corp." == ht[e].companyname.slice(-5) || "& Co." == ht[e].companyname.slice(-5) || ", Inc" == ht[e].companyname.slice(-5) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 5) : "Inc." == ht[e].companyname.slice(-4) || "Corp" == ht[e].companyname.slice(-4) || "Ltd." == ht[e].companyname.slice(-4) || "& Co" == ht[e].companyname.slice(-4) ? "KeyCorp" != ht[e].companyname && "News Corp" != ht[e].companyname && (ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 5)) : "Plc" == ht[e].companyname.slice(-3) || "PLC" == ht[e].companyname.slice(-3) || "plc" == ht[e].companyname.slice(-3) || "Inc" == ht[e].companyname.slice(-3) || "Ltd" == ht[e].companyname.slice(-3) || "Co." == ht[e].companyname.slice(-3) || "LTD" == ht[e].companyname.slice(-3) ? ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 3) : ("Co" == ht[e].companyname.slice(-2) || "CO" == ht[e].companyname.slice(-2) || "NV" == ht[e].companyname.slice(-2)) && (ht[e].companyname = ht[e].companyname.substr(0, ht[e].companyname.length - 2)), "QUALCOMM" == ht[e].companyname && (ht[e].companyname = "Qualcomm"), "CONSOL Energy" == ht[e].companyname && (ht[e].companyname = "Consol Energy"), ht[e].index = e, "Consumer Discretionary" == ht[e].industry ? ht[e].industryNum = 1 : "Consumer Staples" == ht[e].industry ? ht[e].industryNum = 2 : "Energy" == ht[e].industry ? ht[e].industryNum = 3 : "Financials" == ht[e].industry ? ht[e].industryNum = 4 : "Health Care" == ht[e].industry ? ht[e].industryNum = 5 : "Industrials" == ht[e].industry ? ht[e].industryNum = 6 : "Information Technology" == ht[e].industry ? ht[e].industryNum = 7 : "Materials" == ht[e].industry ? ht[e].industryNum = 8 : "Telecommunications Services" == ht[e].industry ? ht[e].industryNum = 8 : "Utilities" == ht[e].industry && (ht[e].industryNum = 10)
        }

        function B(e, t) {
            e.sort(function(e, n) {
                return n[t] - e[t]
            })
        }

        function E(e, t, n) {
            zt = [];
            var a, o = 0,
                r = 0,
                i = 0,
                c = 0;
            lt = [], st = [], dt = [], mt = [];
            for (var l = 0; l < ht.length; l++) ht[l][t] <= e[0] ? (a = "group0", ht[l][n] = a, ht[l][n + "Index"] = o, o++, lt.push(ht[l])) : ht[l][t] > e[0] && ht[l][t] <= e[1] ? (a = "group1", ht[l][n] = a, ht[l][n + "Index"] = r, r++, st.push(ht[l])) : ht[l][t] > e[1] && ht[l][t] <= e[2] ? (a = "group2", ht[l][n] = a, ht[l][n + "Index"] = i, i++, dt.push(ht[l])) : ht[l][t] >= e[3] && (a = "group3", ht[l][n] = a, ht[l][n + "Index"] = c, c++, mt.push(ht[l])), l == ht.length - 1 && (L(Dt[0], n), L(Dt[1], n), L(Dt[2], n), L(Dt[3], n), L(Dt[4], n), L(Dt[5], n))
        }

        function L(e, t) {
            B(lt, e), B(st, e), B(dt, e), B(mt, e), zt = mt.concat(dt, st, lt), u(zt, t + e + "X", t + e + "Y", t + e + "Index", t, !1, t + e)
        }

        function z(e) {
            var t;
            t = e ? 235 : 0 == wt ? -50 : 235, $("html,body").animate({
                scrollTop: $(".intro-text h2[index=" + wt + "]").offset().top + t
            }, "fast")
        }

        function K() {
            $.getJSON("./data/data.json", function(n) {

                //build search data
                var companyname = n.map(function(d){
                    // var length = d['companyname'].length
                    // if(d['companyname'][length-1] === ' ')
                    //     d['companyname'] = d['companyname'].substring(0,length-2)
                    return d['companyname']
                })
                var industry = n.map(function(d){return d['industry']})
                searchData = companyname.concat(industry)
                //console.log(searchData)

                F(), 
                St || $(".sticky-me").waypoint("sticky"), 
                rt = V(), 
                ht = n, 
                $(".chzn-select").chosen({
                    width: "100%"
                }), 
                D(), 
                $("select.chzn-select").val("").trigger("chosen:updated"), 
                //P(), 
                d(), 
                xt = !0, _(), b(Yt), 
                St && N(wt), 
                St || (U(), e(), it = t($(window).scrollTop()), 
                I(it), 
                //H(), 
                "iPad" == rt && (i(), Pt = !0))

            })
        }

        // function H() {
        //     $(window).keydown(function(e) {
        //         40 == e.keyCode ? (e.preventDefault(), 6 != wt && (wt += 1), z()) : 38 == e.keyCode && (e.preventDefault(), 0 != wt && (wt -= 1), z())
        //     })
        // }

        function F() {
            var e = window.location.search.replace("?", "");
            "embed=0" == e || "embed=1" == e || "embed=2" == e || "embed=3" == e || "embed=4" == e || "embed=5" == e ? (St = !0, it = e.slice(-1), wt = parseInt(it)) : St = !1
        }

        function _() {
            u(ht, "introX", "introY", "introIndex");
            for (var e = 0; e < Dt.length; e++) {
                var t = Dt[e];
                B(ht, t), E(Bt[t].keyNumbers, t, Bt[t].group), u(ht, Bt[t].x, Bt[t].y, Bt[t].index, Bt[t].group, Bt[t].textRows), m(Bt[t].noGroupX, Bt[t].noGroupY)
            }
        }

        function U() {
            $(".intro-text h2").waypoint(function() {
                if (_t) {
                    var e = $(this).attr("index");
                    parseInt(e) != wt && (wt = parseInt(e), I(wt))
                }
            }), $("p.to-top").waypoint(function() {
                "iPad" == rt && $("div.sticky-me").removeClass("stuck")
            }), $(".intro-text p.company-info").waypoint(function() {
                var e, t = $(this).attr("trigger");
                "mktCap2" == t ? e = 0 : "women2" == t ? e = 1 : "independence3" == t ? e = 2 : "age2" == t ? e = 3 : "tenure" == t ? e = 4 : "salary5" == t && (e = 5, "iPad" == rt && $("div.sticky-me").addClass("stuck")), e >= 0 && e !== wt && (wt = e, I(wt))
            }), $("a.pill").mouseover(function() {
                var e = $(this).attr("trigger");
                recordVisit(e)
                Modernizr.touch && d3.selectAll("circle.company").attr("stroke", "#fff"), "mktCap1" == e ? T("AAPL") : "mktCap2" == e ? T("CNX") : "women1" == e ? (d3.select("circle.company[ticker='NAVI']").attr("stroke", "#231f20"), d3.select("circle.company[ticker='KORS']").attr("stroke", "#231f20"), d3.select("circle.company[ticker='GCI']").attr("stroke", "#231f20")) : "women2" == e ? d3.selectAll("circle.company").attr("stroke", function(e) {
                    return 0 == e.female ? "#231f20" : "#fff"
                }) : "independence2" == e ? (d3.select("circle.company[ticker='MCD']").attr("stroke", "#231f20"), d3.select("circle.company[ticker='KHC']").attr("stroke", "#231f20"), d3.select("circle.company[ticker='RIG']").attr("stroke", "#231f20")) : "age1" == e ? T("CBS") : "age2" == e ? T("FB") : "tenure1" == e ? T("TSS") : "tenure2" == e ? T("DRI") : "salary1" == e ? T("CELG") : "salary2" == e ? T("REGN") : "salary3" == e ? T("HCA") : "salary4" == e ? T("AMZN") : "salary6" == e && T("BRKA")
            }).mouseout(function() {
                g()
            })
        }

        function V() {
            var e, t = $(window).width();
            userData['windowWidth'] = $(window).width();
            userData['windowHeight'] = $(window).height();
            if (!St)
                if (991 > t && t > 767) {
                    e = "narrowDesktop", o(), $("div.sticky-wrapper").css("left", "322px");
                    var i = (t - $("div.row").width()) / 2 + $("div.intro-text").width() + 45;
                    $("div.sticky-me").css("left", i + "px"), ct = !1
                } else if (767 >= t)
                if (e = "iPad", r(), 620 >= t) ct = !0;
                else {
                    var i = (t - $("div.row").width()) / 2 + $("div.intro-text").width() + 45;
                    $("div.sticky-wrapper").css("left", "325px"), $("div.sticky-me").removeClass("full-width").css("left", i + "px"), ct && ($("div.sticky-me").addClass("stuck"), ct = !1, 6 == wt && (wt = 0), z(!1))
                }
            else {
                e = "desktop", n(), $("div.sticky-wrapper").css("left", "333px");
                var i = (t - $("div.row").width()) / 2 + $("div.intro-text").width() + 45;
                $("div.sticky-me").css("left", i + "px"), ct = !1
            }
            return St && (520 >= t && t > 400 ? (e = "medEmbed", o()) : 400 >= t ? (e = "smallEmbed", r()) : 600 >= t && t > 520 ? (e = "wideEmbed", a()) : (e = "extraWideEmbed", n())), e
        }
        var W, Z, Q, j, J, q, et, tt, nt, at, ot, rt, it, ct, lt, st, dt, mt, ut, pt, yt, ft, ht, xt, gt, vt, $t, bt, kt, Ct, wt, At, Nt, It, Gt, Rt, Mt, Xt, St, Yt = d3.select("div#board div.svg-container").append("svg"),
            Ot = d3.scale.linear(),
            Tt = d3.scale.linear(),
            Dt = ["mktcap", "female", "unrelated", "age", "tenure", "medianpay"],
            Pt = !1,
            Bt = {
                mktcap: {
                    scale: d3.scale.linear().range(["#e2e3e4", "#e29320"]).domain([1500, 7e5]),
                    color: "#e29320",
                    rangeOfColors: ["#e2e3e4", "#fdc47c", "#f9a224", "#e29320"],
                    keyNumbers: [9990, 19990, 199990, 1e5],
                    groupText: ["$200 billion - $700 billion", "$20 billion - $199.99 billion", "$10 billion - $19.99 billion", "$9.99 billion or less"],
                    textRows: [],
                    group: "mktcapGroup",
                    index: "marketcapIndex",
                    x: "mktcapX",
                    y: "mktcapY",
                    noGroupX: "marketCapNoGroupX",
                    noGroupY: "marketCapNoGroupY"
                },
                female: {
                    scale: d3.scale.linear().range(["#e2e3e4", "#ce3139"]).domain([0, .55]),
                    color: "#ce3139",
                    rangeOfColors: ["#e2e3e4", "#fcd6ca", "#ee3a43", "#ce3139"],
                    keyNumbers: [0, .24, .49, .5],
                    groupText: ["50% - 54%", "25 - 49%", "1 - 24%", "0%"],
                    textRows: [],
                    group: "femaleGroup",
                    index: "femaleIndex",
                    x: "femaleX",
                    y: "femaleY",
                    noGroupX: "femaleNoGroupX",
                    noGroupY: "femaleNoGroupY"
                },
                unrelated: {
                    scale: d3.scale.linear().range(["#e2e3e4", "#52a045"]).domain([.4, 1]),
                    color: "#52a045",
                    rangeOfColors: ["#e2e3e4", "#a2d292", "#63bc51", "#52a045"],
                    keyNumbers: [.5, .7, .9, .91],
                    groupText: ["91% - 100%", "71 - 90%", "51 - 70%", "50% or less"],
                    textRows: [],
                    group: "unrelatedGroup",
                    index: "unrelatedIndex",
                    x: "unrelatedX",
                    y: "unrelatedY",
                    noGroupX: "unrelatedNoGroupX",
                    noGroupY: "unrelatedNoGroupY"
                },
                age: {
                    scale: d3.scale.linear().range(["#e2e3e4", "#edc639"]).domain([45, 79]),
                    color: "#c3a730",
                    rangeOfColors: ["#e2e3e4", "#ffd63d", "#edc639", "#c3a730"],
                    keyNumbers: [49.5, 59.5, 69.5, 70],
                    groupText: ["70 - 76 years", "60 - 69.5 years", "50 - 59.5 years", "49.5 years or less"],
                    textRows: [],
                    group: "ageGroup",
                    index: "ageIndex",
                    x: "ageX",
                    y: "ageY",
                    noGroupX: "ageNoGroupX",
                    noGroupY: "ageNoGroupY"
                },
                tenure: {
                    scale: d3.scale.linear().range(["#e2e3e4", "#0079ae"]).domain([0, 23]),
                    color: "#0079ae",
                    rangeOfColors: ["#e2e3e4", "#95cbee", "#0098db", "#0079ae"],
                    keyNumbers: [2.5, 7.5, 12.5, 13],
                    groupText: ["13 - 23 years", "8 - 12.5 years", "3 - 7.5 years", "2.5 years or less"],
                    textRows: [],
                    group: "tenureGroup",
                    index: "tenureIndex",
                    x: "tenureX",
                    y: "tenureY",
                    noGroupX: "tenureNoGroupX",
                    noGroupY: "tenureNoGroupY"
                },
                medianpay: {
                    scale: d3.scale.linear().range(["#e2e3e4", "#bb2b77"]).domain([6e3, 18e5]),
                    color: "#bb2b77",
                    rangeOfColors: ["#e2e3e4", "#f1daeb", "#d991b2", "#bb2b77"],
                    keyNumbers: [25e4, 3e5, 499999, 5e5],
                    groupText: ["$500,001 to $1,800,000", "$300,001 - $500,000", "$250,001 - $300,000", "$250,000 or less"],
                    textRows: [],
                    group: "medianpayGroup",
                    index: "medianpayIndex",
                    x: "medianpayX",
                    y: "medianpayY",
                    noGroupX: "salaryNoGroupX",
                    noGroupY: "salaryNoGroupY"
                }
            },
            Et = .5,
            Lt = .5,
            zt = [],
            Kt = ["Market capitalization", "Percent of directors who are women", "Percent of directors considered independent", "Median age of company directors", "Median tenure of company directors", "Median pay of company directors", "Sort and filter information about the boards of S&P 500 companies. Choose your own categories for grouping and coloring."],
            Ht = !1,
            Ft = !1,
            _t = !0;
        // user log
        function recordSection(code){
            //record previous one
            if(currentSection && currentSection['code'] !== code){
                currentSection['end'] = Date.now();
                currentSection['duration'] = currentSection['end'] - currentSection['start'];
                if(currentSection['duration'] > 100){
                    userData['sectionLog'].push(currentSection);
                    //console.log(userData['sectionLog'])
                }
                currentSection = null;
            }
            // start a new one
            if(!currentSection){
                currentSection = {}
                currentSection['id'] = userData['sectionLog'].length
                currentSection['start'] = Date.now()
                currentSection['code'] = code
            }
        }

        // record the first one
        recordSection(0)

        $("li.main-list a").click(function() {
            var e = $(this).attr("num");
            return wt = parseInt(e), z(!1), !1
        }), $("li.embed-list a").click(function() {
            var e = $(this).attr("num");
            return wt = parseInt(e), N(e), !1
        }), $("button.custom-example").click(function() {
            $(this).hide(), $("button.order-list[num='0']").click(), $("button.color-list[num='5']").click()
        }), $("button.order-list").click(function() {
            0 == xt && (d(), xt = !0), yt = !0, Yt.attr("height", Z);
            var e = $(this).attr("num");
            return d3.select("rect.resetRect").remove(), d3.select("rect.groupRect").remove(), f(), $("div.tooltip table tr").removeClass("selected"), $("div.tooltip table tr[index='" + e + "']").addClass("selected"), $("button.order-list").removeClass("selected"), $(this).addClass("selected"), $("p.subhed").html("<span>Grouped by: </span>" + Kt[e]), w(parseInt(e)), $("button.reset").removeClass("disabled").css("background-color", "#fff"), $("button.custom-example").hide(), !1
        }), $("button.color-list").click(function() {
            ft = !0;
            var e = $(this).attr("num");
            return $("div.tooltip table tr").removeClass("second-selected"), $("div.tooltip table tr[index='" + e + "']").addClass("second-selected"), $("button.color-list").removeClass("selected"), $(this).addClass("selected"), $("p.custom-color-subhed").html("<span>Colored by:</span> <a class='pill color custom-color-pill'>" + Kt[e] + "</a>"), 0 == yt && $("p.subhed").html(""), R(parseInt(e)), $("button.reset").removeClass("disabled").css("background-color", "#fff"), $("button.custom-example").hide(), !1
        }), $("button.reset").click(function() {
            $(this).hasClass("disabled") || I(wt)
        }), $("ul.main-pagination li.arrow").click(function() {
            var e = $(this).hasClass("next");
            return O(6, e), 0 == xt && (d(), xt = !0), z(!1), !1
        }), $("ul.embed-pagination li.arrow").click(function() {
            var e = $(this).hasClass("next");
            return O(5, e), N(wt), !1
        }), $("select.chzn-select").change(function() {
            Ht = !0, $("button.clear-company").removeClass("disabled").css("background-color", "#fff"), Xt = $("option:selected", this).attr("companyID"), T(Xt), $("img.closebtn").show()
        }), $("select.form-control").change(function() {
            Ft = !0;
            var e = $("option:selected", this).val();
            "All industries" != e ? (d3.selectAll("circle.company").style("fill-opacity", .2), d3.selectAll("circle.company[industry='" + e + "']").style("fill-opacity", 1), $("button.clear-industry").removeClass("disabled").css("background-color", "#fff")) : (d3.selectAll("circle.company").style("fill-opacity", 1), $("button.clear-industry").addClass("disabled").removeAttr("style"))
        }), $("button.clear-industry").click(function() {
            return $(this).hasClass("disabled") || (Ft = !1, $("select.form-control").val("All industries").change()), !1
        }), $("div#board").click(function() {
            $("button.clear-company").click()
        }), $("button.clear-company").click(function() {
            return $(this).hasClass("disabled") || (Ht = !1, $(this).addClass("disabled").removeAttr("style"), $("select.chzn-select").val("").trigger("chosen:updated"), g(), $("img.closebtn").hide()), !1
        }), $("button.scroll-btn").click(function() {
            var e = parseInt($(this).attr("scrollTo"));
            wt = e, z(!0)
        }), $(window).resize(function() {
            userData['windowWidth'] = $(window).width()
            userData['windowHeight'] = $(window).height()
            var t = V();
            _t = !1, t != rt && (rt = t, d3.selectAll("circle.company").remove(), d3.selectAll("text.group-text").attr("y", 0), Bt.female.textRows = [], Bt.unrelated.textRows = [], Bt.age.textRows = [], Bt.tenure.textRows = [], Bt.mktcap.textRows = [], Bt.medianpay.textRows = [], _(), b(Yt), St || (I(wt), e()), St && N(wt), "iPad" == t && (Pt || (i(), Pt = !0)))
        }), $(window).scroll(function() {
            St || (_t = !0)
        }), K(), socialRiser.create({
            text: "See how the biggest U.S. companies stack up in terms of board pay, independence and women directors"
        });
        
    })
}