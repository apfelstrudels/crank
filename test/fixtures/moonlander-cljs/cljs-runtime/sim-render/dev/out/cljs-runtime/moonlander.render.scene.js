goog.provide('moonlander.render.scene');
moonlander.render.scene.cell_w = 10.0;
moonlander.render.scene.cell_h = 15.0;
moonlander.render.scene.field_width = (function moonlander$render$scene$field_width(p__10599){
var map__10600 = p__10599;
var map__10600__$1 = cljs.core.__destructure_map(map__10600);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10600__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
return (cols * moonlander.render.scene.cell_w);
});
moonlander.render.scene.field_height = (function moonlander$render$scene$field_height(p__10605){
var map__10609 = p__10605;
var map__10609__$1 = cljs.core.__destructure_map(map__10609);
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10609__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
return (rows * moonlander.render.scene.cell_h);
});
/**
 * Pixel x of the center of grid column `col`.
 */
moonlander.render.scene.col__GT_x = (function moonlander$render$scene$col__GT_x(col){
return ((0.5 + col) * moonlander.render.scene.cell_w);
});
/**
 * Pixel y of the center of grid row `row`.
 */
moonlander.render.scene.row__GT_y = (function moonlander$render$scene$row__GT_y(row){
return ((0.5 + row) * moonlander.render.scene.cell_h);
});
/**
 * Top row index occupied by ground at `col`. Same formula as the sim's
 * (moonlander.core) and the ASCII renderer's copies; `terrain` carries its
 * own :rows, so no config is needed here.
 */
moonlander.render.scene.ground_row = (function moonlander$render$scene$ground_row(p__10628,col){
var map__10629 = p__10628;
var map__10629__$1 = cljs.core.__destructure_map(map__10629);
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10629__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var heights = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10629__$1,new cljs.core.Keyword(null,"heights","heights",-1501719023));
var c = ((function (){var x__5090__auto__ = (function (){var x__5087__auto__ = col;
var y__5088__auto__ = (0);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = (cljs.core.count(heights) - (1));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})() | (0));
return ((rows - (1)) - cljs.core.nth.cljs$core$IFn$_invoke$arity$2(heights,c));
});
/**
 * Per-frame star field as [{:x :y :alpha :layer}] in logical pixels.
 * Positions mirror the ASCII renderer's math exactly (same lander-relative
 * parallax offsets and per-star screen wrap); the binary glyph twinkle is
 * smoothed into a per-star alpha oscillation, phase-shifted by the star's
 * coordinates so the field never pulses in lockstep. Pure function of :t.
 */
moonlander.render.scene.star_instances = (function moonlander$render$scene$star_instances(config,stars,lander,t){
var map__10630 = config;
var map__10630__$1 = cljs.core.__destructure_map(map__10630);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10630__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10630__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
return cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (p__10631){
var map__10632 = p__10631;
var map__10632__$1 = cljs.core.__destructure_map(map__10632);
var x = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10632__$1,new cljs.core.Keyword(null,"x","x",2099068185));
var y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10632__$1,new cljs.core.Keyword(null,"y","y",-1757859776));
var layer = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10632__$1,new cljs.core.Keyword(null,"layer","layer",-1601820589));
if((layer === (0))){
return new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.render.scene.col__GT_x(x),new cljs.core.Keyword(null,"y","y",-1757859776),moonlander.render.scene.row__GT_y(y),new cljs.core.Keyword(null,"alpha","alpha",-1574982441),(0.45 + (0.4 * (0.5 + (0.5 * Math.sin(((t * 1.5) + (x * 0.7))))))),new cljs.core.Keyword(null,"layer","layer",-1601820589),(0)], null);
} else {
var sx = cljs.core.mod((x - cljs.core.long$((new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander) * 0.3))),cols);
var sy = cljs.core.mod((y - cljs.core.long$((new cljs.core.Keyword(null,"y","y",-1757859776).cljs$core$IFn$_invoke$arity$1(lander) * 0.2))),rows);
return new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.render.scene.col__GT_x(sx),new cljs.core.Keyword(null,"y","y",-1757859776),moonlander.render.scene.row__GT_y(sy),new cljs.core.Keyword(null,"alpha","alpha",-1574982441),(0.55 + (0.45 * (0.5 + (0.5 * Math.sin(((t * 3.0) + ((x + y) * 0.5))))))),new cljs.core.Keyword(null,"layer","layer",-1601820589),(1)], null);
}
}),stars);
});
/**
 * Step outline of the ridge line as a flat sequence of [x y] pixel point
 * pairs, left to right: for each column the top edge of its ground cell,
 * stepped (the ASCII renderer's per-column `#`/`/` top made continuous).
 */
moonlander.render.scene.terrain_ridge = (function moonlander$render$scene$terrain_ridge(p__10648){
var map__10649 = p__10648;
var map__10649__$1 = cljs.core.__destructure_map(map__10649);
var terrain = map__10649__$1;
var heights = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10649__$1,new cljs.core.Keyword(null,"heights","heights",-1501719023));
return cljs.core.mapcat.cljs$core$IFn$_invoke$arity$variadic((function (c){
var y = (moonlander.render.scene.ground_row(terrain,c) * moonlander.render.scene.cell_h);
return new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(c * moonlander.render.scene.cell_w),y], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [((c + (1)) * moonlander.render.scene.cell_w),y], null)], null);
}),cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([cljs.core.range.cljs$core$IFn$_invoke$arity$1(cljs.core.count(heights))], 0));
});
/**
 * Pad geometry in pixels: the surface line span, the two support struts
 * under the pad edges, and the beacon anchor above the pad center.
 */
moonlander.render.scene.pad_geometry = (function moonlander$render$scene$pad_geometry(config,p__10655){
var map__10656 = p__10655;
var map__10656__$1 = cljs.core.__destructure_map(map__10656);
var terrain = map__10656__$1;
var pad = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10656__$1,new cljs.core.Keyword(null,"pad","pad",-36734541));
var top = moonlander.render.scene.ground_row(terrain,new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad));
var floor_y = ((new cljs.core.Keyword(null,"rows","rows",850049680).cljs$core$IFn$_invoke$arity$1(config) - (1)) * moonlander.render.scene.cell_h);
var cx = cljs.core.quot((new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad) + new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad)),(2));
return new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"surface-y","surface-y",-1091006623),(top * moonlander.render.scene.cell_h),new cljs.core.Keyword(null,"x0","x0",410843387),(new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad) * moonlander.render.scene.cell_w),new cljs.core.Keyword(null,"x1","x1",-1863922247),((new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad) + (1)) * moonlander.render.scene.cell_w),new cljs.core.Keyword(null,"struts","struts",-1133567643),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.render.scene.col__GT_x(new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad)),new cljs.core.Keyword(null,"y0","y0",111454807),((top + (1)) * moonlander.render.scene.cell_h),new cljs.core.Keyword(null,"y1","y1",589123466),floor_y], null),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.render.scene.col__GT_x(new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad)),new cljs.core.Keyword(null,"y0","y0",111454807),((top + (1)) * moonlander.render.scene.cell_h),new cljs.core.Keyword(null,"y1","y1",589123466),floor_y], null)], null),new cljs.core.Keyword(null,"beacon","beacon",830759079),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.render.scene.col__GT_x(cx),new cljs.core.Keyword(null,"y","y",-1757859776),moonlander.render.scene.row__GT_y((top - (1)))], null)], null);
});
/**
 * Beacon lamp brightness: the ASCII beacon's 2 Hz on/off blink smoothed
 * into a sine pulse. Pure function of :t.
 */
moonlander.render.scene.beacon_alpha = (function moonlander$render$scene$beacon_alpha(t){
return (0.25 + (0.75 * (0.5 + (0.5 * Math.sin((((t * (2)) * Math.PI) * (2)))))));
});
/**
 * Lander sprite transform: pixel position and rotation in radians. x maps
 * the float grid position straight to pixels, so the sprite sits inside
 * the screen column of `(int x)` - the column the sim tests for pad and
 * ground contact; y is the row center, so the feet meet the ground. `angle` is
 * degrees from level, positive = top tips right; with the canvas y axis
 * pointing down that is a positive (clockwise) Pixi rotation.
 */
moonlander.render.scene.lander_transform = (function moonlander$render$scene$lander_transform(p__10664){
var map__10665 = p__10664;
var map__10665__$1 = cljs.core.__destructure_map(map__10665);
var x = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10665__$1,new cljs.core.Keyword(null,"x","x",2099068185));
var y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10665__$1,new cljs.core.Keyword(null,"y","y",-1757859776));
var angle = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10665__$1,new cljs.core.Keyword(null,"angle","angle",1622094254));
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"x","x",2099068185),(x * moonlander.render.scene.cell_w),new cljs.core.Keyword(null,"y","y",-1757859776),moonlander.render.scene.row__GT_y(y),new cljs.core.Keyword(null,"rotation","rotation",-1728051644),((function (){var or__5002__auto__ = angle;
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return 0.0;
}
})() * (Math.PI / 180.0))], null);
});
/**
 * Per-frame flame visibility and animation frame for the three engines,
 * from the same inputs the ASCII flames consume: the effective :burn
 * flags, fuel, and flight status (flames only while flying with fuel).
 * `fr` is the 12 Hz animation frame the ASCII flame glyphs use.
 */
moonlander.render.scene.flame_state = (function moonlander$render$scene$flame_state(burn,fuel,status,t){
var fr = cljs.core.long$((t * (12)));
var burning_QMARK_ = ((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"flying","flying",-1854780019),status)) && ((fuel > (0))));
return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"main","main",-2117802661),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"visible?","visible?",2129863715),(function (){var and__5000__auto__ = burning_QMARK_;
if(and__5000__auto__){
return new cljs.core.Keyword(null,"up?","up?",77854972).cljs$core$IFn$_invoke$arity$1(burn);
} else {
return and__5000__auto__;
}
})(),new cljs.core.Keyword(null,"frame","frame",-1711082588),fr], null),new cljs.core.Keyword(null,"left","left",-399115937),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"visible?","visible?",2129863715),(function (){var and__5000__auto__ = burning_QMARK_;
if(and__5000__auto__){
return new cljs.core.Keyword(null,"left?","left?",1009526930).cljs$core$IFn$_invoke$arity$1(burn);
} else {
return and__5000__auto__;
}
})(),new cljs.core.Keyword(null,"frame","frame",-1711082588),fr], null),new cljs.core.Keyword(null,"right","right",-452581833),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"visible?","visible?",2129863715),(function (){var and__5000__auto__ = burning_QMARK_;
if(and__5000__auto__){
return new cljs.core.Keyword(null,"right?","right?",380310444).cljs$core$IFn$_invoke$arity$1(burn);
} else {
return and__5000__auto__;
}
})(),new cljs.core.Keyword(null,"frame","frame",-1711082588),fr], null)], null);
});
/**
 * Main flame length/brightness flicker: the ASCII flame's two glyph rows
 * cycle at 12 Hz (3 and 4 glyphs); folded into a scale pulse.
 */
moonlander.render.scene.main_flame_scale = (function moonlander$render$scene$main_flame_scale(frame){
return cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [1.0,0.72,1.0,1.18], null),cljs.core.mod(frame,(4)));
});
/**
 * Side thruster puff brightness flicker (the ASCII side flames' 3-glyph
 * cycle folded into alpha).
 */
moonlander.render.scene.side_flame_alpha = (function moonlander$render$scene$side_flame_alpha(frame){
return cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [1.0,0.7,0.45], null),cljs.core.mod(frame,(3)));
});
moonlander.render.scene.explosion_particle_count = (20);
moonlander.render.scene.particle_angle = (function moonlander$render$scene$particle_angle(i){
return (i * 2.399963);
});
moonlander.render.scene.particle_speed = (function moonlander$render$scene$particle_speed(i){
return (24.0 + cljs.core.mod((i * (37)),(41)));
});
/**
 * Ceiling (px) on the smoke's upward drift: two rows above the wreck.
 */
moonlander.render.scene.smoke_max_drift = 30.0;
/**
 * Explosion visuals for state `:explosion {:x :y :t0}` at time `t`.
 * Returns {:phase :fireball | :smoke :particles [{:x :y :r :alpha :hot?}]}
 * in pixels. Fireball for the first 1.5 s (the ASCII renderer's filled
 * disc): particles fly out from the impact point and fade. Then the same
 * lingering smoke as the ASCII renderer (its fixed cell offsets), drifting
 * slowly upward up to `smoke-max-drift` px so it stays over the wreck,
 * flickering on the same 10 Hz clock.
 */
moonlander.render.scene.explosion_scene = (function moonlander$render$scene$explosion_scene(p__10681,t){
var map__10682 = p__10681;
var map__10682__$1 = cljs.core.__destructure_map(map__10682);
var x = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10682__$1,new cljs.core.Keyword(null,"x","x",2099068185));
var y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10682__$1,new cljs.core.Keyword(null,"y","y",-1757859776));
var t0 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10682__$1,new cljs.core.Keyword(null,"t0","t0",2120162535));
var dt = (t - t0);
var ox = moonlander.render.scene.col__GT_x(x);
var oy = moonlander.render.scene.row__GT_y(y);
var fr = cljs.core.long$((dt * (10)));
if((dt <= 1.5)){
return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"phase","phase",575722892),new cljs.core.Keyword(null,"fireball","fireball",1548086264),new cljs.core.Keyword(null,"particles","particles",801881788),cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (i){
var a = moonlander.render.scene.particle_angle(i);
var spd = moonlander.render.scene.particle_speed(i);
var dist = (spd * dt);
var alpha = (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = (1.0 - (dt * 0.65));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
return new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"x","x",2099068185),(ox + (Math.cos(a) * dist)),new cljs.core.Keyword(null,"y","y",-1757859776),(oy + (Math.sin(a) * dist)),new cljs.core.Keyword(null,"r","r",-471384190),(2.0 + (3.0 * (function (){var x__5087__auto__ = 0.0;
var y__5088__auto__ = (1.0 - (dt * 0.7));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})())),new cljs.core.Keyword(null,"alpha","alpha",-1574982441),alpha,new cljs.core.Keyword(null,"hot?","hot?",2031763833),cljs.core.even_QMARK_((i + fr))], null);
}),cljs.core.range.cljs$core$IFn$_invoke$arity$1(moonlander.render.scene.explosion_particle_count))], null);
} else {
return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"phase","phase",575722892),new cljs.core.Keyword(null,"smoke","smoke",1634119064),new cljs.core.Keyword(null,"particles","particles",801881788),cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (p__10685){
var vec__10686 = p__10685;
var dx = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__10686,(0),null);
var dy = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__10686,(1),null);
var drift = (function (){var x__5090__auto__ = moonlander.render.scene.smoke_max_drift;
var y__5091__auto__ = ((dt - 1.5) * 8.0);
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var flick = cljs.core.mod(((dx + dy) + fr),(3));
return new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"x","x",2099068185),moonlander.render.scene.col__GT_x((x + dx)),new cljs.core.Keyword(null,"y","y",-1757859776),(moonlander.render.scene.row__GT_y((y + dy)) - drift),new cljs.core.Keyword(null,"r","r",-471384190),4.5,new cljs.core.Keyword(null,"alpha","alpha",-1574982441),(function (){var x__5087__auto__ = 0.15;
var y__5088__auto__ = (0.55 - (flick * 0.15));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})(),new cljs.core.Keyword(null,"hot?","hot?",2031763833),false], null);
}),new cljs.core.PersistentVector(null, 6, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(1),(-1)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(-1)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(2),(-2)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-2),(-2)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(-3)], null)], null))], null);
}
});
/**
 * The end-of-round overlay text, or nil while flying / mid-round. Same
 * condition the ASCII overlay uses.
 */
moonlander.render.scene.overlay_message = (function moonlander$render$scene$overlay_message(p__10690){
var map__10691 = p__10690;
var map__10691__$1 = cljs.core.__destructure_map(map__10691);
var status = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10691__$1,new cljs.core.Keyword(null,"status","status",-1997798413));
var message = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__10691__$1,new cljs.core.Keyword(null,"message","message",-406056002));
if(cljs.core.truth_((function (){var and__5000__auto__ = message;
if(cljs.core.truth_(and__5000__auto__)){
var fexpr__10692 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__10692.cljs$core$IFn$_invoke$arity$1 ? fexpr__10692.cljs$core$IFn$_invoke$arity$1(status) : fexpr__10692.call(null,status));
} else {
return and__5000__auto__;
}
})())){
return message;
} else {
return null;
}
});
moonlander.render.scene.palette = cljs.core.PersistentHashMap.fromArrays([new cljs.core.Keyword(null,"edge","edge",919909153),new cljs.core.Keyword(null,"primary","primary",817773892),new cljs.core.Keyword(null,"terrain-lo","terrain-lo",1188693444),new cljs.core.Keyword(null,"beacon","beacon",830759079),new cljs.core.Keyword(null,"flame","flame",-813204755),new cljs.core.Keyword(null,"panel","panel",-558637456),new cljs.core.Keyword(null,"danger","danger",-624338030),new cljs.core.Keyword(null,"pad","pad",-36734541),new cljs.core.Keyword(null,"flame-hot","flame-hot",442169781),new cljs.core.Keyword(null,"smoke","smoke",1634119064),new cljs.core.Keyword(null,"bg","bg",-206688421),new cljs.core.Keyword(null,"glow","glow",216329469),new cljs.core.Keyword(null,"bright","bright",-1876684577)],[(9418984),(13625599),(529186),(16767119),(16757596),(198417),(16748395),(9433288),(16774102),(7309224),(330260),(3963080),(15398399)]);

//# sourceMappingURL=moonlander.render.scene.js.map
