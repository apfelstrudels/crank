goog.provide('moonlander.core');
moonlander.core.config = new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"cols","cols",-1914801295),(120),new cljs.core.Keyword(null,"rows","rows",850049680),(43),new cljs.core.Keyword(null,"spawn-y","spawn-y",1722353548),2.0,new cljs.core.Keyword(null,"alt-scale","alt-scale",257752941),20.0,new cljs.core.Keyword(null,"vel-scale","vel-scale",-689525211),10.0], null);
if((typeof moonlander !== 'undefined') && (typeof moonlander.core !== 'undefined') && (typeof moonlander.core.state !== 'undefined')){
} else {
moonlander.core.state = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(null);
}
/**
 * Start a new game. With no arguments picks a random base seed; pass a
 * seed (and optionally a level) for deterministic, reproducible rounds.
 */
moonlander.core.new_round = (function moonlander$core$new_round(var_args){
var G__10769 = arguments.length;
switch (G__10769) {
case 0:
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$0();

break;
case 1:
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(moonlander.core.new_round.cljs$core$IFn$_invoke$arity$0 = (function (){
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$1(cljs.core.long$((cljs.core.rand.cljs$core$IFn$_invoke$arity$0() * (4294967296))));
}));

(moonlander.core.new_round.cljs$core$IFn$_invoke$arity$1 = (function (seed){
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$2(seed,(1));
}));

(moonlander.core.new_round.cljs$core$IFn$_invoke$arity$2 = (function (seed,level){
var params = moonlander.levels.params_for_level(level);
var lseed = moonlander.levels.level_seed(seed,level);
var terrain = moonlander.levels.gen_terrain(moonlander.core.config,params,lseed);
var stars = moonlander.levels.gen_stars(moonlander.core.config,params,lseed);
var map__10770 = moonlander.core.config;
var map__10770__$1 = cljs.core.__destructure_map(map__10770);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10770__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var spawn_y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10770__$1,new cljs.core.Keyword(null,"spawn-y","spawn-y",1722353548));
return cljs.core.PersistentHashMap.fromArrays([new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221),new cljs.core.Keyword(null,"burn","burn",-458179293),new cljs.core.Keyword(null,"lander","lander",439860228),new cljs.core.Keyword(null,"params","params",710516235),new cljs.core.Keyword(null,"auto?","auto?",1295579150),new cljs.core.Keyword(null,"seed","seed",68613327),new cljs.core.Keyword(null,"level","level",1290497552),new cljs.core.Keyword(null,"assist?","assist?",343291089),new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"stars","stars",-556837771),new cljs.core.Keyword(null,"terrain","terrain",704966005),new cljs.core.Keyword(null,"used-auto?","used-auto?",1067059862),new cljs.core.Keyword(null,"t","t",-1397832519),new cljs.core.Keyword(null,"message","message",-406056002),new cljs.core.Keyword(null,"explosion","explosion",-1564989537)],[null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"up?","up?",77854972),false,new cljs.core.Keyword(null,"left?","left?",1009526930),false,new cljs.core.Keyword(null,"right?","right?",380310444),false], null),cljs.core.PersistentHashMap.fromArrays([new cljs.core.Keyword(null,"y","y",-1757859776),new cljs.core.Keyword(null,"right?","right?",380310444),new cljs.core.Keyword(null,"fuel","fuel",10405485),new cljs.core.Keyword(null,"angle","angle",1622094254),new cljs.core.Keyword(null,"left?","left?",1009526930),new cljs.core.Keyword(null,"vx","vx",-1685168462),new cljs.core.Keyword(null,"vy","vy",-2018509997),new cljs.core.Keyword(null,"spin","spin",-869832076),new cljs.core.Keyword(null,"x","x",2099068185),new cljs.core.Keyword(null,"up?","up?",77854972)],[spawn_y,false,new cljs.core.Keyword(null,"fuel-start","fuel-start",-1733243178).cljs$core$IFn$_invoke$arity$1(params),0.0,false,0.0,0.0,0.0,(cols / (2)),false]),params,false,seed,level,false,new cljs.core.Keyword(null,"flying","flying",-1854780019),stars,terrain,false,0.0,null,null]);
}));

(moonlander.core.new_round.cljs$lang$maxFixedArity = 2);

/**
 * Fresh round on the next level, same base seed.
 */
moonlander.core.next_level = (function moonlander$core$next_level(p__10771){
var map__10772 = p__10771;
var map__10772__$1 = cljs.core.__destructure_map(map__10772);
var seed = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10772__$1,new cljs.core.Keyword(null,"seed","seed",68613327));
var level = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10772__$1,new cljs.core.Keyword(null,"level","level",1290497552));
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$2(seed,(level + (1)));
});
/**
 * Fresh round on the same level (identical terrain), same base seed.
 */
moonlander.core.retry_level = (function moonlander$core$retry_level(p__10773){
var map__10774 = p__10773;
var map__10774__$1 = cljs.core.__destructure_map(map__10774);
var seed = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10774__$1,new cljs.core.Keyword(null,"seed","seed",68613327));
var level = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10774__$1,new cljs.core.Keyword(null,"level","level",1290497552));
return moonlander.core.new_round.cljs$core$IFn$_invoke$arity$2(seed,level);
});
/**
 * Top row index occupied by ground at `col`.
 */
moonlander.core.ground_row = (function moonlander$core$ground_row(p__10775,heights,col){
var map__10776 = p__10775;
var map__10776__$1 = cljs.core.__destructure_map(map__10776);
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10776__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10776__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var c = ((function (){var x__5090__auto__ = (function (){var x__5087__auto__ = col;
var y__5088__auto__ = (0);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = (cols - (1));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})() | (0));
return ((rows - (1)) - cljs.core.nth.cljs$core$IFn$_invoke$arity$2(heights,c));
});
moonlander.core.on_pad_QMARK_ = (function moonlander$core$on_pad_QMARK_(p__10794,x){
var map__10795 = p__10794;
var map__10795__$1 = cljs.core.__destructure_map(map__10795);
var pad = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10795__$1,new cljs.core.Keyword(null,"pad","pad",-36734541));
return (((new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad) <= (x | (0)))) && (((x | (0)) <= new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad))));
});
/**
 * The end-of-round overlay/message text for a touchdown or crash at `level`,
 * tagged with the AUTO/MANUAL `mode`. Factored out of `step` so the replay
 * driver can rebuild it when overriding the displayed landing mode.
 */
moonlander.core.touchdown_message = (function moonlander$core$touchdown_message(level,safe_QMARK_,mode){
var mode_str = ((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"auto","auto",-566279492),mode))?"AUTO":"MANUAL");
if(cljs.core.truth_(safe_QMARK_)){
return ["*** TOUCHDOWN! Level ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(level)," complete."," LANDING: ",mode_str," [R] for level ",cljs.core.str.cljs$core$IFn$_invoke$arity$1((level + (1)))," ***"].join('');
} else {
return ["*** CRASH! Too fast, off-pad, or tipped over."," LANDING: ",mode_str," [R] to retry level ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(level)," ***"].join('');
}
});
/**
 * Always-on landing assist: near the ground, adds thrust to cap the descent
 * rate and horizontal speed at the safe-landing limits. It only ever ADDS
 * thrust - it dampens, it does not fly the ship - and it never sets the
 * AUTO flag. It burns the player's fuel; with a dry tank there is nothing
 * to burn and it stays out of the way. The caps sit at 75% of the safe
 * limits, leaving margin for the per-tick bang-bang overshoot.
 */
moonlander.core.assist_flags = (function moonlander$core$assist_flags(p__10798){
var map__10799 = p__10798;
var map__10799__$1 = cljs.core.__destructure_map(map__10799);
var lander = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10799__$1,new cljs.core.Keyword(null,"lander","lander",439860228));
var terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10799__$1,new cljs.core.Keyword(null,"terrain","terrain",704966005));
var params = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10799__$1,new cljs.core.Keyword(null,"params","params",710516235));
var map__10801 = params;
var map__10801__$1 = cljs.core.__destructure_map(map__10801);
var safe_vy = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10801__$1,new cljs.core.Keyword(null,"safe-vy","safe-vy",-27798355));
var safe_vx = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10801__$1,new cljs.core.Keyword(null,"safe-vx","safe-vx",-977480865));
var safe_angle = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10801__$1,new cljs.core.Keyword(null,"safe-angle","safe-angle",-1495036034));
var assist_alt = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10801__$1,new cljs.core.Keyword(null,"assist-alt","assist-alt",-1658236226));
var cap_vy = (0.75 * safe_vy);
var cap_vx = (0.75 * safe_vx);
var cap_lean = (0.75 * safe_angle);
var cap_spin = 20.0;
var g_row = moonlander.core.ground_row(moonlander.core.config,new cljs.core.Keyword(null,"heights","heights",-1501719023).cljs$core$IFn$_invoke$arity$1(terrain),new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander));
var alt = (g_row - (new cljs.core.Keyword(null,"y","y",-1757859776).cljs$core$IFn$_invoke$arity$1(lander) + (1)));
var map__10802 = lander;
var map__10802__$1 = cljs.core.__destructure_map(map__10802);
var vx = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10802__$1,new cljs.core.Keyword(null,"vx","vx",-1685168462));
var angle = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10802__$1,new cljs.core.Keyword(null,"angle","angle",1622094254));
var spin = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10802__$1,new cljs.core.Keyword(null,"spin","spin",-869832076));
var drift_l_QMARK_ = (vx > cap_vx);
var drift_r_QMARK_ = (vx < (- cap_vx));
var lean_rate = 10.0;
if((((new cljs.core.Keyword(null,"fuel","fuel",10405485).cljs$core$IFn$_invoke$arity$1(lander) > (0))) && ((alt <= assist_alt)))){
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"up?","up?",77854972),(new cljs.core.Keyword(null,"vy","vy",-2018509997).cljs$core$IFn$_invoke$arity$1(lander) > cap_vy),new cljs.core.Keyword(null,"left?","left?",1009526930),(((angle > cap_lean)) || ((((spin > cap_spin)) || (((drift_l_QMARK_) && ((((angle > (- cap_lean))) && ((spin > (- lean_rate)))))))))),new cljs.core.Keyword(null,"right?","right?",380310444),(((angle < (- cap_lean))) || ((((spin < (- cap_spin))) || (((drift_r_QMARK_) && ((((angle < cap_lean)) && ((spin < lean_rate)))))))))], null);
} else {
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"up?","up?",77854972),false,new cljs.core.Keyword(null,"left?","left?",1009526930),false,new cljs.core.Keyword(null,"right?","right?",380310444),false], null);
}
});
/**
 * Pure state transition. `dt` is seconds elapsed. Elapsed time `:t` always
 * advances (it drives the animations), even after the round has ended.
 */
moonlander.core.step = (function moonlander$core$step(p__10806,dt){
var map__10807 = p__10806;
var map__10807__$1 = cljs.core.__destructure_map(map__10807);
var s = map__10807__$1;
var lander = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10807__$1,new cljs.core.Keyword(null,"lander","lander",439860228));
var terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10807__$1,new cljs.core.Keyword(null,"terrain","terrain",704966005));
var params = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10807__$1,new cljs.core.Keyword(null,"params","params",710516235));
var t_SINGLEQUOTE_ = (new cljs.core.Keyword(null,"t","t",-1397832519).cljs$core$IFn$_invoke$arity$1(s) + dt);
if(cljs.core.not_EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"flying","flying",-1854780019),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(s))){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(s,new cljs.core.Keyword(null,"t","t",-1397832519),t_SINGLEQUOTE_);
} else {
var map__10808 = params;
var map__10808__$1 = cljs.core.__destructure_map(map__10808);
var burn_main = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"burn-main","burn-main",1646634457));
var ang_torque = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"ang-torque","ang-torque",-71137542));
var main_thrust = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"main-thrust","main-thrust",943519674));
var safe_angle = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"safe-angle","safe-angle",-1495036034));
var safe_vx = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"safe-vx","safe-vx",-977480865));
var safe_vy = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"safe-vy","safe-vy",-27798355));
var gravity = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"gravity","gravity",-1815198225));
var burn_side = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"burn-side","burn-side",1169603762));
var ang_damp = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10808__$1,new cljs.core.Keyword(null,"ang-damp","ang-damp",-1847060811));
var fuel = new cljs.core.Keyword(null,"fuel","fuel",10405485).cljs$core$IFn$_invoke$arity$1(lander);
var engaged_QMARK_ = cljs.core.boolean$(new cljs.core.Keyword(null,"auto?","auto?",1295579150).cljs$core$IFn$_invoke$arity$1(s));
var base = ((engaged_QMARK_)?moonlander.autopilot.commands(s):cljs.core.select_keys(lander,new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"up?","up?",77854972),new cljs.core.Keyword(null,"left?","left?",1009526930),new cljs.core.Keyword(null,"right?","right?",380310444)], null)));
var assist = moonlander.core.assist_flags(s);
var eff = cljs.core.merge_with.cljs$core$IFn$_invoke$arity$variadic((function (p1__10804_SHARP_,p2__10805_SHARP_){
var or__5002__auto__ = p1__10804_SHARP_;
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return p2__10805_SHARP_;
}
}),cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([base,assist], 0));
var up_QMARK_ = (function (){var and__5000__auto__ = new cljs.core.Keyword(null,"up?","up?",77854972).cljs$core$IFn$_invoke$arity$1(eff);
if(cljs.core.truth_(and__5000__auto__)){
return (fuel > (0));
} else {
return and__5000__auto__;
}
})();
var left_QMARK_ = (function (){var and__5000__auto__ = new cljs.core.Keyword(null,"left?","left?",1009526930).cljs$core$IFn$_invoke$arity$1(eff);
if(cljs.core.truth_(and__5000__auto__)){
return (fuel > (0));
} else {
return and__5000__auto__;
}
})();
var right_QMARK_ = (function (){var and__5000__auto__ = new cljs.core.Keyword(null,"right?","right?",380310444).cljs$core$IFn$_invoke$arity$1(eff);
if(cljs.core.truth_(and__5000__auto__)){
return (fuel > (0));
} else {
return and__5000__auto__;
}
})();
var burn = (((cljs.core.truth_(up_QMARK_)?burn_main:(0)) + (cljs.core.truth_(left_QMARK_)?burn_side:(0))) + (cljs.core.truth_(right_QMARK_)?burn_side:(0)));
var fuel_SINGLEQUOTE_ = (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = (fuel - (burn * dt));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var ang_acc = ((cljs.core.truth_(left_QMARK_)?(- ang_torque):0.0) + (cljs.core.truth_(right_QMARK_)?ang_torque:0.0));
var spin_SINGLEQUOTE_ = (new cljs.core.Keyword(null,"spin","spin",-869832076).cljs$core$IFn$_invoke$arity$1(lander) + ((ang_acc - (ang_damp * new cljs.core.Keyword(null,"spin","spin",-869832076).cljs$core$IFn$_invoke$arity$1(lander))) * dt));
var angle_SINGLEQUOTE_ = (new cljs.core.Keyword(null,"angle","angle",1622094254).cljs$core$IFn$_invoke$arity$1(lander) + (spin_SINGLEQUOTE_ * dt));
var rad = (angle_SINGLEQUOTE_ * (Math.PI / 180.0));
var ax = (cljs.core.truth_(up_QMARK_)?(main_thrust * Math.sin(rad)):0.0);
var ay = (gravity - (cljs.core.truth_(up_QMARK_)?(main_thrust * Math.cos(rad)):0.0));
var vx_SINGLEQUOTE_ = (new cljs.core.Keyword(null,"vx","vx",-1685168462).cljs$core$IFn$_invoke$arity$1(lander) + (ax * dt));
var vy_SINGLEQUOTE_ = (new cljs.core.Keyword(null,"vy","vy",-2018509997).cljs$core$IFn$_invoke$arity$1(lander) + (ay * dt));
var x_SINGLEQUOTE_ = (function (){var x__5090__auto__ = (function (){var x__5087__auto__ = (new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander) + (vx_SINGLEQUOTE_ * dt));
var y__5088__auto__ = (0);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = (new cljs.core.Keyword(null,"cols","cols",-1914801295).cljs$core$IFn$_invoke$arity$1(moonlander.core.config) - (1));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var y_SINGLEQUOTE_ = (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = (new cljs.core.Keyword(null,"y","y",-1757859776).cljs$core$IFn$_invoke$arity$1(lander) + (vy_SINGLEQUOTE_ * dt));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var g_row = moonlander.core.ground_row(moonlander.core.config,new cljs.core.Keyword(null,"heights","heights",-1501719023).cljs$core$IFn$_invoke$arity$1(terrain),x_SINGLEQUOTE_);
var touched = ((y_SINGLEQUOTE_ + (1)) >= g_row);
var used_auto_SINGLEQUOTE_ = (function (){var or__5002__auto__ = new cljs.core.Keyword(null,"used-auto?","used-auto?",1067059862).cljs$core$IFn$_invoke$arity$1(s);
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return engaged_QMARK_;
}
})();
var assist_on_QMARK_ = cljs.core.boolean$((function (){var and__5000__auto__ = (fuel > (0));
if(and__5000__auto__){
return cljs.core.some(cljs.core.true_QMARK_,cljs.core.vals(assist));
} else {
return and__5000__auto__;
}
})());
var s_SINGLEQUOTE_ = cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(s,new cljs.core.Keyword(null,"t","t",-1397832519),t_SINGLEQUOTE_,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"used-auto?","used-auto?",1067059862),used_auto_SINGLEQUOTE_,new cljs.core.Keyword(null,"assist?","assist?",343291089),assist_on_QMARK_,new cljs.core.Keyword(null,"burn","burn",-458179293),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"up?","up?",77854972),up_QMARK_,new cljs.core.Keyword(null,"left?","left?",1009526930),left_QMARK_,new cljs.core.Keyword(null,"right?","right?",380310444),right_QMARK_], null)], 0));
if((!(touched))){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(s_SINGLEQUOTE_,new cljs.core.Keyword(null,"lander","lander",439860228),cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(lander,new cljs.core.Keyword(null,"x","x",2099068185),x_SINGLEQUOTE_,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"y","y",-1757859776),y_SINGLEQUOTE_,new cljs.core.Keyword(null,"vx","vx",-1685168462),vx_SINGLEQUOTE_,new cljs.core.Keyword(null,"vy","vy",-2018509997),vy_SINGLEQUOTE_,new cljs.core.Keyword(null,"angle","angle",1622094254),angle_SINGLEQUOTE_,new cljs.core.Keyword(null,"spin","spin",-869832076),spin_SINGLEQUOTE_,new cljs.core.Keyword(null,"fuel","fuel",10405485),fuel_SINGLEQUOTE_], 0)));
} else {
var safe_QMARK_ = ((moonlander.core.on_pad_QMARK_(terrain,x_SINGLEQUOTE_)) && ((((Math.abs(vy_SINGLEQUOTE_) <= safe_vy)) && ((((Math.abs(vx_SINGLEQUOTE_) <= safe_vx)) && ((Math.abs(angle_SINGLEQUOTE_) <= safe_angle)))))));
var lander_SINGLEQUOTE_ = cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(lander,new cljs.core.Keyword(null,"x","x",2099068185),x_SINGLEQUOTE_,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"y","y",-1757859776),(g_row - (1)),new cljs.core.Keyword(null,"vx","vx",-1685168462),0.0,new cljs.core.Keyword(null,"vy","vy",-2018509997),0.0,new cljs.core.Keyword(null,"angle","angle",1622094254),0.0,new cljs.core.Keyword(null,"spin","spin",-869832076),0.0,new cljs.core.Keyword(null,"fuel","fuel",10405485),fuel_SINGLEQUOTE_,new cljs.core.Keyword(null,"up?","up?",77854972),false,new cljs.core.Keyword(null,"left?","left?",1009526930),false,new cljs.core.Keyword(null,"right?","right?",380310444),false], 0));
var level = new cljs.core.Keyword(null,"level","level",1290497552).cljs$core$IFn$_invoke$arity$1(s);
var mode = (cljs.core.truth_(used_auto_SINGLEQUOTE_)?new cljs.core.Keyword(null,"auto","auto",-566279492):new cljs.core.Keyword(null,"manual","manual",-237370608));
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(s_SINGLEQUOTE_,new cljs.core.Keyword(null,"lander","lander",439860228),lander_SINGLEQUOTE_,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221),mode,new cljs.core.Keyword(null,"explosion","explosion",-1564989537),((safe_QMARK_)?null:new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"x","x",2099068185),(x_SINGLEQUOTE_ | (0)),new cljs.core.Keyword(null,"y","y",-1757859776),(g_row - (1)),new cljs.core.Keyword(null,"t0","t0",2120162535),t_SINGLEQUOTE_], null)),new cljs.core.Keyword(null,"status","status",-1997798413),((safe_QMARK_)?new cljs.core.Keyword(null,"landed","landed",-1056197628):new cljs.core.Keyword(null,"crashed","crashed",-194307569)),new cljs.core.Keyword(null,"message","message",-406056002),moonlander.core.touchdown_message(level,safe_QMARK_,mode)], 0));
}
}
});
/**
 * ASCII rendering of one frame, as a single string. Thin delegate to
 * moonlander.render.ascii/render (the headless test oracle).
 */
moonlander.core.render = (function moonlander$core$render(s){
return moonlander.render.ascii.render(moonlander.core.config,s);
});
/**
 * ASCII glyph cells for the lander at a given angle; thin alias of
 * moonlander.render.ascii/lander-cells.
 */
moonlander.core.lander_cells = moonlander.render.ascii.lander_cells;
moonlander.core.el = (function moonlander$core$el(id){
return document.getElementById(id);
});
moonlander.core.pad2 = (function moonlander$core$pad2(v){
if((v < (10))){
return ["0",cljs.core.str.cljs$core$IFn$_invoke$arity$1(v)].join('');
} else {
return cljs.core.str.cljs$core$IFn$_invoke$arity$1(v);
}
});
/**
 * Mission-control style HUD readout as pure data (testable headlessly).
 * Fixed labels and units: ALT 0380 M, VS +11 M/S, HS +02 M/S, PROP 74%,
 * plus the level, the target pad designation, and the guidance mode
 * (GUID: AUTO while hold-A autoland flies, ASSIST while the landing assist
 * is dampening, MAN otherwise; the latched AUTO/MANUAL flag once down).
 */
moonlander.core.hud_readout = (function moonlander$core$hud_readout(p__10809){
var map__10810 = p__10809;
var map__10810__$1 = cljs.core.__destructure_map(map__10810);
var lander = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"lander","lander",439860228));
var terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"terrain","terrain",704966005));
var params = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"params","params",710516235));
var level = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"level","level",1290497552));
var status = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"status","status",-1997798413));
var auto_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"auto?","auto?",1295579150));
var assist_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"assist?","assist?",343291089));
var landing_mode = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10810__$1,new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221));
var map__10811 = moonlander.core.config;
var map__10811__$1 = cljs.core.__destructure_map(map__10811);
var alt_scale = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10811__$1,new cljs.core.Keyword(null,"alt-scale","alt-scale",257752941));
var vel_scale = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10811__$1,new cljs.core.Keyword(null,"vel-scale","vel-scale",-689525211));
var g_row = moonlander.core.ground_row(moonlander.core.config,new cljs.core.Keyword(null,"heights","heights",-1501719023).cljs$core$IFn$_invoke$arity$1(terrain),new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander));
var alt = (alt_scale * (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = (g_row - (new cljs.core.Keyword(null,"y","y",-1757859776).cljs$core$IFn$_invoke$arity$1(lander) + (1)));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})());
var vs = (vel_scale * new cljs.core.Keyword(null,"vy","vy",-2018509997).cljs$core$IFn$_invoke$arity$1(lander));
var hs = (vel_scale * new cljs.core.Keyword(null,"vx","vx",-1685168462).cljs$core$IFn$_invoke$arity$1(lander));
var fmt_v = (function (v){
return [(((v < (0)))?"-":"+"),moonlander.core.pad2(((function (){var x__5090__auto__ = (99);
var y__5091__auto__ = Math.abs(v);
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})() | (0)))].join('');
});
return new cljs.core.PersistentArrayMap(null, 8, [new cljs.core.Keyword(null,"level","level",1290497552),cljs.core.str.cljs$core$IFn$_invoke$arity$1(level),new cljs.core.Keyword(null,"alt","alt",-3214426),[cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,cljs.core.repeat.cljs$core$IFn$_invoke$arity$2((function (){var x__5087__auto__ = (0);
var y__5088__auto__ = ((4) - ((cljs.core.str.cljs$core$IFn$_invoke$arity$1((alt | (0)))).length));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})(),"0"))),cljs.core.str.cljs$core$IFn$_invoke$arity$1((alt | (0)))," M"].join(''),new cljs.core.Keyword(null,"vs","vs",-2022097090),[fmt_v(vs)," M/S"].join(''),new cljs.core.Keyword(null,"hs","hs",-788788955),[fmt_v(hs)," M/S"].join(''),new cljs.core.Keyword(null,"tilt","tilt",-828681332),[fmt_v(new cljs.core.Keyword(null,"angle","angle",1622094254).cljs$core$IFn$_invoke$arity$1(lander))," DEG"].join(''),new cljs.core.Keyword(null,"prop","prop",-515168332),[cljs.core.str.cljs$core$IFn$_invoke$arity$1(((100.0 * (new cljs.core.Keyword(null,"fuel","fuel",10405485).cljs$core$IFn$_invoke$arity$1(lander) / new cljs.core.Keyword(null,"fuel-start","fuel-start",-1733243178).cljs$core$IFn$_invoke$arity$1(params))) | (0)))," %"].join(''),new cljs.core.Keyword(null,"pad","pad",-36734541),moonlander.levels.pad_name(level),new cljs.core.Keyword(null,"auto","auto",-566279492),(cljs.core.truth_((function (){var fexpr__10812 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__10812.cljs$core$IFn$_invoke$arity$1 ? fexpr__10812.cljs$core$IFn$_invoke$arity$1(status) : fexpr__10812.call(null,status));
})())?((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"auto","auto",-566279492),landing_mode))?"AUTO":"MANUAL"):(cljs.core.truth_(auto_QMARK_)?"AUTO":(cljs.core.truth_(assist_QMARK_)?"ASSIST":"MAN"
)))], null);
});
moonlander.core.update_hud_BANG_ = (function moonlander$core$update_hud_BANG_(s){
var map__10813 = moonlander.core.hud_readout(s);
var map__10813__$1 = cljs.core.__destructure_map(map__10813);
var level = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"level","level",1290497552));
var alt = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"alt","alt",-3214426));
var vs = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"vs","vs",-2022097090));
var hs = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"hs","hs",-788788955));
var tilt = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"tilt","tilt",-828681332));
var prop = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"prop","prop",-515168332));
var pad = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"pad","pad",-36734541));
var auto = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10813__$1,new cljs.core.Keyword(null,"auto","auto",-566279492));
(moonlander.core.el("hud-level").textContent = level);

(moonlander.core.el("hud-alt").textContent = alt);

(moonlander.core.el("hud-vvel").textContent = vs);

(moonlander.core.el("hud-hvel").textContent = hs);

(moonlander.core.el("hud-tilt").textContent = tilt);

(moonlander.core.el("hud-fuel").textContent = prop);

(moonlander.core.el("hud-pad").textContent = pad);

return (moonlander.core.el("hud-auto").textContent = auto);
});
/**
 * Build the playback state for a parsed flight log (see
 * moonlander.leaderboard/replay-log-from-row). A nil log (legacy or
 * corrupt row) yields the :unavailable state - never a crash.
 */
moonlander.core.replay_start = (function moonlander$core$replay_start(log){
if((log == null)){
return new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"unavailable","unavailable",1529915531)], null);
} else {
return new cljs.core.PersistentArrayMap(null, 7, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"ready","ready",1086465795),new cljs.core.Keyword(null,"log","log",-1595516004),log,new cljs.core.Keyword(null,"frames","frames",1765687497),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [moonlander.core.new_round.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"seed","seed",68613327).cljs$core$IFn$_invoke$arity$1(log),new cljs.core.Keyword(null,"level","level",1290497552).cljs$core$IFn$_invoke$arity$1(log))], null),new cljs.core.Keyword(null,"idx","idx",1053688473),(0),new cljs.core.Keyword(null,"acc","acc",838566312),0.0,new cljs.core.Keyword(null,"speed","speed",1257663751),(1),new cljs.core.Keyword(null,"playing?","playing?",-1884542863),true], null);
}
});
/**
 * Simulate one logged tick from the previous frame: the recorded effective
 * flags applied as raw stick input, then one deterministic `step`. This is
 * exactly the server verifier's replay path (the recorded burn already
 * contains the autopilot/assist output).
 */
moonlander.core.replay_frame_after = (function moonlander$core$replay_frame_after(frame,p__10814){
var map__10815 = p__10814;
var map__10815__$1 = cljs.core.__destructure_map(map__10815);
var dt = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10815__$1,new cljs.core.Keyword(null,"dt","dt",-368444759));
var up = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10815__$1,new cljs.core.Keyword(null,"up","up",-269712113));
var left = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10815__$1,new cljs.core.Keyword(null,"left","left",-399115937));
var right = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10815__$1,new cljs.core.Keyword(null,"right","right",-452581833));
return moonlander.core.step(cljs.core.assoc_in(cljs.core.assoc_in(cljs.core.assoc_in(frame,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"lander","lander",439860228),new cljs.core.Keyword(null,"up?","up?",77854972)], null),up),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"lander","lander",439860228),new cljs.core.Keyword(null,"left?","left?",1009526930)], null),left),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"lander","lander",439860228),new cljs.core.Keyword(null,"right?","right?",380310444)], null),right),dt);
});
/**
 * Override a just-landed/crashed replay frame's displayed AUTO/MANUAL flag
 * with the mode recorded at verification time. Replaying the recorded
 * *effective* thrust flags alone can't tell whether hold-A autoland was
 * engaged (the server only stores the merged burn, not the raw `:auto?`
 * stick), so the real flag has to ride along with the log instead.
 */
moonlander.core.apply_recorded_landing_mode = (function moonlander$core$apply_recorded_landing_mode(frame,recorded_mode){
if(cljs.core.truth_((function (){var and__5000__auto__ = recorded_mode;
if(cljs.core.truth_(and__5000__auto__)){
var G__10821 = new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(frame);
var fexpr__10820 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__10820.cljs$core$IFn$_invoke$arity$1 ? fexpr__10820.cljs$core$IFn$_invoke$arity$1(G__10821) : fexpr__10820.call(null,G__10821));
} else {
return and__5000__auto__;
}
})())){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(frame,new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221),recorded_mode,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"message","message",-406056002),moonlander.core.touchdown_message(new cljs.core.Keyword(null,"level","level",1290497552).cljs$core$IFn$_invoke$arity$1(frame),cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"landed","landed",-1056197628),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(frame)),recorded_mode)], 0));
} else {
return frame;
}
});
/**
 * Pure playback step: advance through the log by `wall-dt` seconds of real
 * time, consuming logged ticks at their recorded pace scaled by :speed.
 * Frames are extended lazily (frame i is the state after i ticks). At the
 * end of the log the playback parks on the final frame with :playing?
 * false. A paused or finished playback returns unchanged.
 */
moonlander.core.replay_advance = (function moonlander$core$replay_advance(rp,wall_dt){
var ticks = new cljs.core.Keyword(null,"ticks","ticks",-406190313).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"log","log",-1595516004).cljs$core$IFn$_invoke$arity$1(rp));
var total = cljs.core.count(ticks);
var recorded_mode = new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"log","log",-1595516004).cljs$core$IFn$_invoke$arity$1(rp));
if(((cljs.core.not(new cljs.core.Keyword(null,"playing?","playing?",-1884542863).cljs$core$IFn$_invoke$arity$1(rp))) || ((new cljs.core.Keyword(null,"idx","idx",1053688473).cljs$core$IFn$_invoke$arity$1(rp) >= total)))){
return rp;
} else {
var budget = (new cljs.core.Keyword(null,"acc","acc",838566312).cljs$core$IFn$_invoke$arity$1(rp) + (wall_dt * new cljs.core.Keyword(null,"speed","speed",1257663751).cljs$core$IFn$_invoke$arity$1(rp)));
var idx = new cljs.core.Keyword(null,"idx","idx",1053688473).cljs$core$IFn$_invoke$arity$1(rp);
var frames = new cljs.core.Keyword(null,"frames","frames",1765687497).cljs$core$IFn$_invoke$arity$1(rp);
var acc = budget;
while(true){
if((((idx < total)) && ((acc >= new cljs.core.Keyword(null,"dt","dt",-368444759).cljs$core$IFn$_invoke$arity$1(cljs.core.nth.cljs$core$IFn$_invoke$arity$2(ticks,idx)))))){
var G__10888 = (idx + (1));
var G__10889 = cljs.core.conj.cljs$core$IFn$_invoke$arity$2(frames,moonlander.core.apply_recorded_landing_mode(moonlander.core.replay_frame_after(cljs.core.nth.cljs$core$IFn$_invoke$arity$2(frames,idx),cljs.core.nth.cljs$core$IFn$_invoke$arity$2(ticks,idx)),recorded_mode));
var G__10890 = (acc - new cljs.core.Keyword(null,"dt","dt",-368444759).cljs$core$IFn$_invoke$arity$1(cljs.core.nth.cljs$core$IFn$_invoke$arity$2(ticks,idx)));
idx = G__10888;
frames = G__10889;
acc = G__10890;
continue;
} else {
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(rp,new cljs.core.Keyword(null,"idx","idx",1053688473),idx,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"frames","frames",1765687497),frames,new cljs.core.Keyword(null,"acc","acc",838566312),acc,new cljs.core.Keyword(null,"playing?","playing?",-1884542863),(idx < total)], 0));
}
break;
}
}
});
moonlander.core.key_map = new cljs.core.PersistentArrayMap(null, 7, ["ArrowUp",new cljs.core.Keyword(null,"up?","up?",77854972),"w",new cljs.core.Keyword(null,"up?","up?",77854972),"W",new cljs.core.Keyword(null,"up?","up?",77854972),"ArrowLeft",new cljs.core.Keyword(null,"left?","left?",1009526930),"ArrowRight",new cljs.core.Keyword(null,"right?","right?",380310444),"d",new cljs.core.Keyword(null,"right?","right?",380310444),"D",new cljs.core.Keyword(null,"right?","right?",380310444)], null);
/**
 * True when the event comes from the leaderboard callsign input, so game
 * keys (thrust, A, R, L) stay out of the way while typing a nickname.
 */
moonlander.core.typing_callsign_QMARK_ = (function moonlander$core$typing_callsign_QMARK_(e){
var t = e.target;
var and__5000__auto__ = t;
if(cljs.core.truth_(and__5000__auto__)){
return cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2("INPUT",t.tagName);
} else {
return and__5000__auto__;
}
});
moonlander.core.on_key_BANG_ = (function moonlander$core$on_key_BANG_(down_QMARK_,e){
if(cljs.core.truth_(moonlander.core.typing_callsign_QMARK_(e))){
return null;
} else {
var k = e.key;
if(cljs.core.truth_(new cljs.core.Keyword(null,"replay","replay",-681122389).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui)))){
if(cljs.core.truth_(down_QMARK_)){
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2("Escape",k)){
return moonlander.leaderboard.close_replay_BANG_();
} else {
if(cljs.core.truth_((function (){var fexpr__10832 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 3, ["p",null,"P",null," ",null], null), null);
return (fexpr__10832.cljs$core$IFn$_invoke$arity$1 ? fexpr__10832.cljs$core$IFn$_invoke$arity$1(k) : fexpr__10832.call(null,k));
})())){
e.preventDefault();

return moonlander.leaderboard.toggle_replay_play_BANG_();
} else {
if(cljs.core.truth_((function (){var fexpr__10833 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 4, ["s",null,"f",null,"S",null,"F",null], null), null);
return (fexpr__10833.cljs$core$IFn$_invoke$arity$1 ? fexpr__10833.cljs$core$IFn$_invoke$arity$1(k) : fexpr__10833.call(null,k));
})())){
return moonlander.leaderboard.cycle_replay_speed_BANG_();
} else {
return null;
}
}
}
} else {
return null;
}
} else {
if(cljs.core.contains_QMARK_(moonlander.core.key_map,k)){
e.preventDefault();

if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"flying","flying",-1854780019),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.core.state)))){
return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.core.state,cljs.core.assoc_in,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"lander","lander",439860228),(moonlander.core.key_map.cljs$core$IFn$_invoke$arity$1 ? moonlander.core.key_map.cljs$core$IFn$_invoke$arity$1(k) : moonlander.core.key_map.call(null,k))], null),down_QMARK_);
} else {
return null;
}
} else {
if(cljs.core.truth_((function (){var fexpr__10834 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, ["a",null,"A",null], null), null);
return (fexpr__10834.cljs$core$IFn$_invoke$arity$1 ? fexpr__10834.cljs$core$IFn$_invoke$arity$1(k) : fexpr__10834.call(null,k));
})())){
e.preventDefault();

if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"flying","flying",-1854780019),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.core.state)))){
return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.core.state,cljs.core.assoc,new cljs.core.Keyword(null,"auto?","auto?",1295579150),down_QMARK_);
} else {
return null;
}
} else {
if(cljs.core.truth_((function (){var and__5000__auto__ = down_QMARK_;
if(cljs.core.truth_(and__5000__auto__)){
var and__5000__auto____$1 = (function (){var fexpr__10835 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, ["R",null,"r",null], null), null);
return (fexpr__10835.cljs$core$IFn$_invoke$arity$1 ? fexpr__10835.cljs$core$IFn$_invoke$arity$1(k) : fexpr__10835.call(null,k));
})();
if(cljs.core.truth_(and__5000__auto____$1)){
var G__10837 = new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.core.state));
var fexpr__10836 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__10836.cljs$core$IFn$_invoke$arity$1 ? fexpr__10836.cljs$core$IFn$_invoke$arity$1(G__10837) : fexpr__10836.call(null,G__10837));
} else {
return and__5000__auto____$1;
}
} else {
return and__5000__auto__;
}
})())){
moonlander.leaderboard.on_new_round_BANG_();

return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$2(moonlander.core.state,((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"landed","landed",-1056197628),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.core.state))))?moonlander.core.next_level:moonlander.core.retry_level));
} else {
if(cljs.core.truth_((function (){var and__5000__auto__ = down_QMARK_;
if(cljs.core.truth_(and__5000__auto__)){
var and__5000__auto____$1 = (function (){var fexpr__10838 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, ["L",null,"l",null], null), null);
return (fexpr__10838.cljs$core$IFn$_invoke$arity$1 ? fexpr__10838.cljs$core$IFn$_invoke$arity$1(k) : fexpr__10838.call(null,k));
})();
if(cljs.core.truth_(and__5000__auto____$1)){
var G__10840 = new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.core.state));
var fexpr__10839 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__10839.cljs$core$IFn$_invoke$arity$1 ? fexpr__10839.cljs$core$IFn$_invoke$arity$1(G__10840) : fexpr__10839.call(null,G__10840));
} else {
return and__5000__auto____$1;
}
} else {
return and__5000__auto__;
}
})())){
return moonlander.leaderboard.toggle_boards_BANG_();
} else {
return null;
}
}
}
}
}
}
});
/**
 * Replay theater owns the screen: advance playback by the elapsed wall
 * time and render the current replay frame. The pilot's own round is
 * frozen (not stepped, not recorded) until the replay is closed.
 */
moonlander.core.replay_tick_BANG_ = (function moonlander$core$replay_tick_BANG_(rp,dt){
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"ready","ready",1086465795),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(rp))){
var rp__$1 = (cljs.core.truth_(new cljs.core.Keyword(null,"frames","frames",1765687497).cljs$core$IFn$_invoke$arity$1(rp))?rp:moonlander.core.replay_start(new cljs.core.Keyword(null,"log","log",-1595516004).cljs$core$IFn$_invoke$arity$1(rp)));
var rp_SINGLEQUOTE_ = moonlander.core.replay_advance(rp__$1,dt);
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"replay","replay",-681122389),rp_SINGLEQUOTE_);

if(cljs.core.truth_(new cljs.core.Keyword(null,"frames","frames",1765687497).cljs$core$IFn$_invoke$arity$1(rp__$1))){
} else {
moonlander.leaderboard.update_replay_bar_BANG_();
}

if(cljs.core.truth_((function (){var and__5000__auto__ = new cljs.core.Keyword(null,"playing?","playing?",-1884542863).cljs$core$IFn$_invoke$arity$1(rp__$1);
if(cljs.core.truth_(and__5000__auto__)){
return cljs.core.not(new cljs.core.Keyword(null,"playing?","playing?",-1884542863).cljs$core$IFn$_invoke$arity$1(rp_SINGLEQUOTE_));
} else {
return and__5000__auto__;
}
})())){
moonlander.leaderboard.replay_status_BANG_("REPLAY COMPLETE");
} else {
}

var frame = cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"frames","frames",1765687497).cljs$core$IFn$_invoke$arity$1(rp_SINGLEQUOTE_),new cljs.core.Keyword(null,"idx","idx",1053688473).cljs$core$IFn$_invoke$arity$1(rp_SINGLEQUOTE_));
moonlander.render.draw_BANG_(moonlander.core.config,frame);

return moonlander.core.update_hud_BANG_(frame);
} else {
return null;
}
});
moonlander.core.tick_BANG_ = (function moonlander$core$tick_BANG_(last_t){
var now = performance.now();
var dt = (function (){var x__5090__auto__ = 0.05;
var y__5091__auto__ = ((now - last_t) / 1000.0);
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var temp__5802__auto___10907 = new cljs.core.Keyword(null,"replay","replay",-681122389).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui));
if(cljs.core.truth_(temp__5802__auto___10907)){
var rp_10908 = temp__5802__auto___10907;
moonlander.core.replay_tick_BANG_(rp_10908,dt);
} else {
var s0_10909 = cljs.core.deref(moonlander.core.state);
var s1_10910 = cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$3(moonlander.core.state,moonlander.core.step,dt);
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"flying","flying",-1854780019),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(s0_10909))){
moonlander.leaderboard.record_BANG_(s0_10909,dt,new cljs.core.Keyword(null,"burn","burn",-458179293).cljs$core$IFn$_invoke$arity$1(s1_10910));

if(cljs.core.truth_((function (){var G__10848 = new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(s1_10910);
var fexpr__10847 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__10847.cljs$core$IFn$_invoke$arity$1 ? fexpr__10847.cljs$core$IFn$_invoke$arity$1(G__10848) : fexpr__10847.call(null,G__10848));
})())){
moonlander.leaderboard.on_round_ended_BANG_(s1_10910);
} else {
}
} else {
}

moonlander.render.draw_BANG_(moonlander.core.config,s1_10910);

moonlander.core.update_hud_BANG_(s1_10910);
}

return window.requestAnimationFrame((function (_){
return (moonlander.core.tick_BANG_.cljs$core$IFn$_invoke$arity$1 ? moonlander.core.tick_BANG_.cljs$core$IFn$_invoke$arity$1(now) : moonlander.core.tick_BANG_.call(null,now));
}));
});
moonlander.core.init_BANG_ = (function moonlander$core$init_BANG_(){
cljs.core.reset_BANG_(moonlander.core.state,moonlander.core.new_round.cljs$core$IFn$_invoke$arity$0());

moonlander.render.start_BANG_(moonlander.core.config);

window.addEventListener("keydown",(function (p1__10849_SHARP_){
return moonlander.core.on_key_BANG_(true,p1__10849_SHARP_);
}));

window.addEventListener("keyup",(function (p1__10850_SHARP_){
return moonlander.core.on_key_BANG_(false,p1__10850_SHARP_);
}));

var temp__5804__auto___10911 = moonlander.core.el("rp-play");
if(cljs.core.truth_(temp__5804__auto___10911)){
var b_10912 = temp__5804__auto___10911;
b_10912.addEventListener("click",(function (_){
return moonlander.leaderboard.toggle_replay_play_BANG_();
}));
} else {
}

var temp__5804__auto___10913 = moonlander.core.el("rp-speed");
if(cljs.core.truth_(temp__5804__auto___10913)){
var b_10914 = temp__5804__auto___10913;
b_10914.addEventListener("click",(function (_){
return moonlander.leaderboard.cycle_replay_speed_BANG_();
}));
} else {
}

var temp__5804__auto___10915 = moonlander.core.el("rp-close");
if(cljs.core.truth_(temp__5804__auto___10915)){
var b_10916 = temp__5804__auto___10915;
b_10916.addEventListener("click",(function (_){
return moonlander.leaderboard.close_replay_BANG_();
}));
} else {
}

moonlander.leaderboard.init_ui_BANG_();

return window.requestAnimationFrame((function (_){
return moonlander.core.tick_BANG_(performance.now());
}));
});
goog.exportSymbol('moonlander.core.init_BANG_', moonlander.core.init_BANG_);
moonlander.core.reload_BANG_ = (function moonlander$core$reload_BANG_(){
moonlander.render.draw_BANG_(moonlander.core.config,cljs.core.deref(moonlander.core.state));

return moonlander.core.update_hud_BANG_(cljs.core.deref(moonlander.core.state));
});

//# sourceMappingURL=moonlander.core.js.map
