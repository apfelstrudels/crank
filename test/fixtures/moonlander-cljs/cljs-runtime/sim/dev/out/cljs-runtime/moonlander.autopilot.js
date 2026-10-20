goog.provide('moonlander.autopilot');
/**
 * Fastest descent rate (rows/s) that still leaves the main engine room to
 * brake to the safe touchdown speed from this altitude, with a 30% margin
 * for the per-tick bang-bang overshoot. High up this cruises fast - a
 * hover-descent at the gentle final rate burns the whole tank before the
 * ground arrives once gravity escalates; near the ground it tapers to the
 * gentle final-approach rate. The vertical braking force is the cos
 * component of the axial main thrust, so the current lean shrinks the
 * budget.
 */
moonlander.autopilot.descent_cap = (function moonlander$autopilot$descent_cap(p__7233,angle,alt){
var map__7234 = p__7233;
var map__7234__$1 = cljs.core.__destructure_map(map__7234);
var gravity = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7234__$1,new cljs.core.Keyword(null,"gravity","gravity",-1815198225));
var main_thrust = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7234__$1,new cljs.core.Keyword(null,"main-thrust","main-thrust",943519674));
var rad = (angle * (Math.PI / 180.0));
var brake = (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = ((main_thrust * Math.cos(rad)) - gravity);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var x__5087__auto__ = (function (){var x__5090__auto__ = Math.sqrt((((2.0 * brake) * 0.7) * (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = alt;
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})()));
var y__5091__auto__ = 8.0;
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var y__5088__auto__ = 2.2;
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
});
/**
 * Thrust flags for this tick. Under tilt physics the side engines are
 * attitude thrusters, so the brain flies an attitude plan: pick a target
 * lean from the lateral velocity error (lean toward where the pad wants
 * us to accelerate), fade that lean to zero near the ground so the craft
 * is level at touchdown, and bang-bang the side engines on the spin rate
 * to track the plan. The main engine fires along the axis to brake the
 * descent, and that burn doubles as the lateral engine: the lean picks
 * how much of it goes sideways. Pure function of the game state; returns
 * {:up? bool :left? bool :right? bool}.
 */
moonlander.autopilot.commands = (function moonlander$autopilot$commands(p__7235){
var map__7236 = p__7235;
var map__7236__$1 = cljs.core.__destructure_map(map__7236);
var s = map__7236__$1;
var lander = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7236__$1,new cljs.core.Keyword(null,"lander","lander",439860228));
var terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7236__$1,new cljs.core.Keyword(null,"terrain","terrain",704966005));
var params = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7236__$1,new cljs.core.Keyword(null,"params","params",710516235));
var pad_c = ((new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"pad","pad",-36734541).cljs$core$IFn$_invoke$arity$1(terrain)) + new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"pad","pad",-36734541).cljs$core$IFn$_invoke$arity$1(terrain))) / (2));
var cols = cljs.core.count(new cljs.core.Keyword(null,"heights","heights",-1501719023).cljs$core$IFn$_invoke$arity$1(terrain));
var rows = new cljs.core.Keyword(null,"rows","rows",850049680).cljs$core$IFn$_invoke$arity$1(terrain);
var c = ((function (){var x__5090__auto__ = (function (){var x__5087__auto__ = new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander);
var y__5088__auto__ = (0);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = (cols - (1));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})() | (0));
var g_row = ((rows - (1)) - cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"heights","heights",-1501719023).cljs$core$IFn$_invoke$arity$1(terrain),c));
var alt = (g_row - (new cljs.core.Keyword(null,"y","y",-1757859776).cljs$core$IFn$_invoke$arity$1(lander) + (1)));
var dx = (pad_c - new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander));
var vx_max = (function (){var x__5090__auto__ = (function (){var x__5090__auto__ = 6.5;
var y__5091__auto__ = (function (){var x__5087__auto__ = 0.8;
var y__5088__auto__ = (0.4 * alt);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var y__5091__auto__ = (((alt < 8.0))?2.0:6.5);
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var vx_want = ((((dx < (0)))?-1.0:1.0) * (function (){var x__5090__auto__ = (0.45 * Math.abs(dx));
var y__5091__auto__ = vx_max;
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})());
var vx_err = (vx_want - new cljs.core.Keyword(null,"vx","vx",-1685168462).cljs$core$IFn$_invoke$arity$1(lander));
var a_want = (function (){var x__5090__auto__ = (function (){var x__5087__auto__ = (1.5 * vx_err);
var y__5088__auto__ = -5.0;
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = 5.0;
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var lean_ff = (Math.atan((a_want / new cljs.core.Keyword(null,"gravity","gravity",-1815198225).cljs$core$IFn$_invoke$arity$1(params))) * (180.0 / Math.PI));
var lean_max = (function (){var x__5087__auto__ = 5.0;
var y__5088__auto__ = (38.0 * (function (){var x__5090__auto__ = 1.0;
var y__5091__auto__ = (alt / 10.0);
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})());
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var ang_want = (function (){var x__5090__auto__ = (function (){var x__5087__auto__ = lean_ff;
var y__5088__auto__ = (- lean_max);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = lean_max;
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var ang_err = (ang_want - new cljs.core.Keyword(null,"angle","angle",1622094254).cljs$core$IFn$_invoke$arity$1(lander));
var spin_cap = (function (){var x__5090__auto__ = 35.0;
var y__5091__auto__ = Math.sqrt(((2.0 * 60.0) * Math.abs(ang_err)));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var spin_want = (function (){var x__5090__auto__ = (function (){var x__5087__auto__ = (3.5 * ang_err);
var y__5088__auto__ = (- spin_cap);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = spin_cap;
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var spin = new cljs.core.Keyword(null,"spin","spin",-869832076).cljs$core$IFn$_invoke$arity$1(lander);
var cap = (function (){var x__5090__auto__ = moonlander.autopilot.descent_cap(params,new cljs.core.Keyword(null,"angle","angle",1622094254).cljs$core$IFn$_invoke$arity$1(lander),alt);
var y__5091__auto__ = (function (){var x__5087__auto__ = 2.2;
var y__5088__auto__ = (4.5 * (alt / (function (){var x__5087__auto____$1 = 1.0;
var y__5088__auto__ = Math.abs(dx);
return ((x__5087__auto____$1 > y__5088__auto__) ? x__5087__auto____$1 : y__5088__auto__);
})()));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"up?","up?",77854972),(new cljs.core.Keyword(null,"vy","vy",-2018509997).cljs$core$IFn$_invoke$arity$1(lander) > cap),new cljs.core.Keyword(null,"left?","left?",1009526930),(spin > (spin_want + 4.0)),new cljs.core.Keyword(null,"right?","right?",380310444),(spin < (spin_want - 4.0))], null);
});

//# sourceMappingURL=moonlander.autopilot.js.map
