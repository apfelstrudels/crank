goog.provide('moonlander.levels');
moonlander.levels.modulus = (4294967296);
/**
 * Returns a deterministic PRNG (linear congruential generator) as a
 * zero-arg fn yielding doubles in [0, 1).
 */
moonlander.levels.make_rng = (function moonlander$levels$make_rng(seed){
var s = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(cljs.core.mod(cljs.core.long$(seed),(4294967296)));
return (function (){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$2(s,(function (p1__10473_SHARP_){
return cljs.core.mod(((p1__10473_SHARP_ * (1664525)) + (1013904223)),(4294967296));
}));

return (cljs.core.deref(s) / (4294967296));
});
});
moonlander.levels.rand_int_STAR_ = (function moonlander$levels$rand_int_STAR_(rng,n){
return cljs.core.long$((n * (rng.cljs$core$IFn$_invoke$arity$0 ? rng.cljs$core$IFn$_invoke$arity$0() : rng.call(null))));
});
/**
 * Level-1 physics and tuning; `params-for-level` escalates from here.
 * Scaled for the display grid in moonlander.core/config (120x43).
 * Gravity is deliberately gentler than the classic 9.0: the whole curve
 * is scaled by 0.9 so descents are a touch more forgiving.
 */
moonlander.levels.base_params = cljs.core.PersistentHashMap.fromArrays([new cljs.core.Keyword(null,"max-terrain","max-terrain",-1269498748),new cljs.core.Keyword(null,"pad-width","pad-width",1427138022),new cljs.core.Keyword(null,"roughness","roughness",1590413194),new cljs.core.Keyword(null,"safe-vy","safe-vy",-27798355),new cljs.core.Keyword(null,"gravity","gravity",-1815198225),new cljs.core.Keyword(null,"burn-side","burn-side",1169603762),new cljs.core.Keyword(null,"ang-damp","ang-damp",-1847060811),new cljs.core.Keyword(null,"fuel-start","fuel-start",-1733243178),new cljs.core.Keyword(null,"burn-main","burn-main",1646634457),new cljs.core.Keyword(null,"ang-torque","ang-torque",-71137542),new cljs.core.Keyword(null,"main-thrust","main-thrust",943519674),new cljs.core.Keyword(null,"assist-alt","assist-alt",-1658236226),new cljs.core.Keyword(null,"safe-angle","safe-angle",-1495036034),new cljs.core.Keyword(null,"safe-vx","safe-vx",-977480865)],[(8),(8),1.0,3.0,8.1,6.0,3.0,180.0,13.5,120.0,18.0,8.0,8.0,1.5]);
/**
 * Difficulty escalates with level: stronger gravity, less fuel, narrower
 * pads, and rougher terrain. (The moon is an airless body: the old
 * cross-wind parameter was removed outright, not replaced - the
 * remaining four escalation axes still steepen the curve on their own.)
 */
moonlander.levels.params_for_level = (function moonlander$levels$params_for_level(level){
var l = (level - (1));
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$variadic(moonlander.levels.base_params,new cljs.core.Keyword(null,"gravity","gravity",-1815198225),(0.9 * (function (){var x__5090__auto__ = 13.5;
var y__5091__auto__ = (9.0 + (0.75 * l));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})()),cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"fuel-start","fuel-start",-1733243178),(function (){var x__5087__auto__ = 105.0;
var y__5088__auto__ = (180.0 - (12.0 * l));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})(),new cljs.core.Keyword(null,"pad-width","pad-width",1427138022),(function (){var x__5087__auto__ = (4);
var y__5088__auto__ = ((8) - cljs.core.quot(l,(2)));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})(),new cljs.core.Keyword(null,"max-terrain","max-terrain",-1269498748),(function (){var x__5090__auto__ = (12);
var y__5091__auto__ = ((8) + cljs.core.quot(l,(2)));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})(),new cljs.core.Keyword(null,"roughness","roughness",1590413194),(function (){var x__5090__auto__ = 2.5;
var y__5091__auto__ = (1.0 + (0.25 * l));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})()], 0));
});
moonlander.levels.pad_names = new cljs.core.PersistentVector(null, 12, 5, cljs.core.PersistentVector.EMPTY_NODE, ["TRANQUILITY","FRA MAURO","HADLEY","DESCARTES","TAURUS-LITTROW","OCEANUS","COPERNICUS","KEPLER","ARISTARCHUS","SURVEYOR","ALPHONSUS","TYCHO"], null);
/**
 * Apollo-era designation for the landing pad on `level`, e.g.
 * "TRANQUILITY PAD 03". The name cycles through `pad-names`; the pad
 * number is the level number (zero-padded).
 */
moonlander.levels.pad_name = (function moonlander$levels$pad_name(level){
var nm = cljs.core.nth.cljs$core$IFn$_invoke$arity$2(moonlander.levels.pad_names,cljs.core.mod((level - (1)),cljs.core.count(moonlander.levels.pad_names)));
return [cljs.core.str.cljs$core$IFn$_invoke$arity$1(nm)," PAD ",(((level < (10)))?"0":""),cljs.core.str.cljs$core$IFn$_invoke$arity$1(level)].join('');
});
/**
 * Derives the generation seed for `level` from the game's base seed.
 */
moonlander.levels.level_seed = (function moonlander$levels$level_seed(base_seed,level){
return cljs.core.mod((cljs.core.long$(base_seed) + (cljs.core.long$(level) * (2654435761))),(4294967296));
});
/**
 * Random-walk ridge heights with one flat landing pad segment.
 * Returns {:heights [int per column] :pad {:start :end} :rows rows};
 * :rows rides along so consumers (e.g. the autopilot) can locate the
 * ground without mirroring the display config.
 */
moonlander.levels.gen_terrain = (function moonlander$levels$gen_terrain(p__10481,p__10482,seed){
var map__10483 = p__10481;
var map__10483__$1 = cljs.core.__destructure_map(map__10483);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10483__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10483__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var map__10484 = p__10482;
var map__10484__$1 = cljs.core.__destructure_map(map__10484);
var pad_width = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10484__$1,new cljs.core.Keyword(null,"pad-width","pad-width",1427138022));
var max_terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10484__$1,new cljs.core.Keyword(null,"max-terrain","max-terrain",-1269498748));
var roughness = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10484__$1,new cljs.core.Keyword(null,"roughness","roughness",1590413194));
var rng = moonlander.levels.make_rng(seed);
var pad_start = ((2) + moonlander.levels.rand_int_STAR_(rng,((cols - pad_width) - (4))));
var pad_end = ((pad_start + pad_width) + (-1));
var pad_h = ((1) + moonlander.levels.rand_int_STAR_(rng,(2)));
var step = (1.5 * roughness);
var raw = (function (){var c = (0);
var h = (moonlander.levels.rand_int_STAR_(rng,max_terrain) + (1));
var acc = cljs.core.transient$(cljs.core.PersistentVector.EMPTY);
while(true){
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(c,cols)){
return cljs.core.persistent_BANG_(acc);
} else {
var h_SINGLEQUOTE_ = (function (){var x__5090__auto__ = (function (){var x__5087__auto__ = (h + (step * (rng() - 0.5)));
var y__5088__auto__ = 1.0;
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = max_terrain;
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var G__10492 = (c + (1));
var G__10493 = h_SINGLEQUOTE_;
var G__10494 = cljs.core.conj_BANG_.cljs$core$IFn$_invoke$arity$2(acc,h_SINGLEQUOTE_);
c = G__10492;
h = G__10493;
acc = G__10494;
continue;
}
break;
}
})();
var heights = cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (c){
if((((pad_start <= c)) && ((c <= pad_end)))){
return pad_h;
} else {
return cljs.core.long$(Math.round(cljs.core.nth.cljs$core$IFn$_invoke$arity$2(raw,c)));
}
}),cljs.core.range.cljs$core$IFn$_invoke$arity$1(cols));
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"heights","heights",-1501719023),heights,new cljs.core.Keyword(null,"pad","pad",-36734541),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"start","start",-355208981),pad_start,new cljs.core.Keyword(null,"end","end",-268185958),pad_end], null),new cljs.core.Keyword(null,"rows","rows",850049680),rows], null);
});
/**
 * Background star field: a vector of {:x :y :layer}. Layer 0 stars are far
 * (static), layer 1 stars are near (they drift against the lander's motion
 * for a parallax effect). Stars stay above the terrain band: the y range
 * respects the level's max-terrain relief, so no star ever spawns inside
 * the ground even on the roughest high levels.
 */
moonlander.levels.gen_stars = (function moonlander$levels$gen_stars(p__10485,p__10486,seed){
var map__10487 = p__10485;
var map__10487__$1 = cljs.core.__destructure_map(map__10487);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10487__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10487__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var map__10488 = p__10486;
var map__10488__$1 = cljs.core.__destructure_map(map__10488);
var max_terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10488__$1,new cljs.core.Keyword(null,"max-terrain","max-terrain",-1269498748));
var rng = moonlander.levels.make_rng(cljs.core.mod((cljs.core.long$(seed) ^ (1540483477)),(4294967296)));
var n = (function (){var x__5087__auto__ = (12);
var y__5088__auto__ = cljs.core.quot((cols * rows),(16));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var max_y = (function (){var x__5087__auto__ = (1);
var y__5088__auto__ = ((rows - (1)) - max_terrain);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
return cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (_){
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.levels.rand_int_STAR_(rng,cols),new cljs.core.Keyword(null,"y","y",-1757859776),moonlander.levels.rand_int_STAR_(rng,max_y),new cljs.core.Keyword(null,"layer","layer",-1601820589),moonlander.levels.rand_int_STAR_(rng,(2))], null);
}),cljs.core.range.cljs$core$IFn$_invoke$arity$1(n));
});

//# sourceMappingURL=moonlander.levels.js.map
