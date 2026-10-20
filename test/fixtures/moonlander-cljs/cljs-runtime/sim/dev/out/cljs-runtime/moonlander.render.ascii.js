goog.provide('moonlander.render.ascii');
/**
 * Top row index occupied by ground at `col`.
 */
moonlander.render.ascii.ground_row = (function moonlander$render$ascii$ground_row(p__7237,heights,col){
var map__7238 = p__7237;
var map__7238__$1 = cljs.core.__destructure_map(map__7238);
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7238__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7238__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var c = ((function (){var x__5090__auto__ = (function (){var x__5087__auto__ = col;
var y__5088__auto__ = (0);
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
var y__5091__auto__ = (cols - (1));
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})() | (0));
return ((rows - (1)) - cljs.core.nth.cljs$core$IFn$_invoke$arity$2(heights,c));
});
moonlander.render.ascii.blank_grid = (function moonlander$render$ascii$blank_grid(p__7240){
var map__7241 = p__7240;
var map__7241__$1 = cljs.core.__destructure_map(map__7241);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7241__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7241__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
return cljs.core.vec(cljs.core.repeat.cljs$core$IFn$_invoke$arity$2(rows,cljs.core.vec(cljs.core.repeat.cljs$core$IFn$_invoke$arity$2(cols," "))));
});
moonlander.render.ascii.assoc_grid = (function moonlander$render$ascii$assoc_grid(grid,r,c,ch){
if(((((0) <= r)) && ((((r < cljs.core.count(grid))) && (((((0) <= c)) && ((c < cljs.core.count(cljs.core.nth.cljs$core$IFn$_invoke$arity$2(grid,r)))))))))){
return cljs.core.assoc_in(grid,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [r,c], null),ch);
} else {
return grid;
}
});
/**
 * Far stars are static and twinkle slowly; near stars drift against the
 * lander's position (parallax) and twinkle faster. Drawn first, so terrain
 * and the lander always overwrite them.
 */
moonlander.render.ascii.draw_stars = (function moonlander$render$ascii$draw_stars(grid,config,stars,lander,t){
var map__7242 = config;
var map__7242__$1 = cljs.core.__destructure_map(map__7242);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7242__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7242__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var tw = cljs.core.long$((t * (3)));
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g,p__7243){
var map__7244 = p__7243;
var map__7244__$1 = cljs.core.__destructure_map(map__7244);
var x = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7244__$1,new cljs.core.Keyword(null,"x","x",2099068185));
var y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7244__$1,new cljs.core.Keyword(null,"y","y",-1757859776));
var layer = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7244__$1,new cljs.core.Keyword(null,"layer","layer",-1601820589));
if((layer === (0))){
return moonlander.render.ascii.assoc_grid(g,y,x,((cljs.core.even_QMARK_((tw + x)))?".":"'"));
} else {
var sx = cljs.core.mod((x - cljs.core.long$((new cljs.core.Keyword(null,"x","x",2099068185).cljs$core$IFn$_invoke$arity$1(lander) * 0.3))),cols);
var sy = cljs.core.mod((y - cljs.core.long$((new cljs.core.Keyword(null,"y","y",-1757859776).cljs$core$IFn$_invoke$arity$1(lander) * 0.2))),rows);
return moonlander.render.ascii.assoc_grid(g,sy,sx,((cljs.core.even_QMARK_(((tw + x) + y)))?"*":"+"));
}
}),grid,stars);
});
moonlander.render.ascii.draw_terrain = (function moonlander$render$ascii$draw_terrain(grid,config,p__7251){
var map__7252 = p__7251;
var map__7252__$1 = cljs.core.__destructure_map(map__7252);
var heights = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7252__$1,new cljs.core.Keyword(null,"heights","heights",-1501719023));
var pad = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7252__$1,new cljs.core.Keyword(null,"pad","pad",-36734541));
var map__7253 = config;
var map__7253__$1 = cljs.core.__destructure_map(map__7253);
var cols = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7253__$1,new cljs.core.Keyword(null,"cols","cols",-1914801295));
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7253__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var floor = (rows - (1));
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g,c){
var h = cljs.core.nth.cljs$core$IFn$_invoke$arity$2(heights,c);
var top = moonlander.render.ascii.ground_row(config,heights,c);
var pad_QMARK_ = (((new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad) <= c)) && ((c <= new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad))));
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g_SINGLEQUOTE_,r){
return moonlander.render.ascii.assoc_grid(g_SINGLEQUOTE_,r,c,((((pad_QMARK_) && (cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(r,top))))?"=":((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(r,top))?"/":"#"
)));
}),g,cljs.core.range.cljs$core$IFn$_invoke$arity$2(top,(floor + (1))));
}),grid,cljs.core.range.cljs$core$IFn$_invoke$arity$1(cols));
});
/**
 * Landing pad detail: support struts under the pad edges and a blinking
 * beacon above the pad center.
 */
moonlander.render.ascii.draw_pad = (function moonlander$render$ascii$draw_pad(grid,config,p__7256,t){
var map__7257 = p__7256;
var map__7257__$1 = cljs.core.__destructure_map(map__7257);
var heights = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7257__$1,new cljs.core.Keyword(null,"heights","heights",-1501719023));
var pad = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7257__$1,new cljs.core.Keyword(null,"pad","pad",-36734541));
var map__7258 = config;
var map__7258__$1 = cljs.core.__destructure_map(map__7258);
var rows = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7258__$1,new cljs.core.Keyword(null,"rows","rows",850049680));
var floor = (rows - (1));
var top = moonlander.render.ascii.ground_row(config,heights,new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad));
var cx = cljs.core.quot((new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad) + new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad)),(2));
var blink = cljs.core.even_QMARK_(cljs.core.long$((t * (2))));
return moonlander.render.ascii.assoc_grid(cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g,c){
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g_SINGLEQUOTE_,r){
return moonlander.render.ascii.assoc_grid(g_SINGLEQUOTE_,r,c,"|");
}),g,cljs.core.range.cljs$core$IFn$_invoke$arity$2((top + (1)),floor));
}),grid,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"start","start",-355208981).cljs$core$IFn$_invoke$arity$1(pad),new cljs.core.Keyword(null,"end","end",-268185958).cljs$core$IFn$_invoke$arity$1(pad)], null)),(top - (1)),cx,((blink)?"i":"."));
});
/**
 * ASCII glyph cells [drow dcol char] for the lander at `angle` degrees
 * (positive = top tips right). A few angle buckets get visibly rotated
 * glyphs: level within 7.5 deg, a lean bucket to 20 deg, and past that a
 * hard-lean bucket that folds the leading leg.
 */
moonlander.render.ascii.lander_cells = (function moonlander$render$ascii$lander_cells(angle){
if((angle > 20.0)){
return new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(1),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(1),"\\"], null)], null);
} else {
if((angle > 7.5)){
return new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(1),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(-1),"/"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(1),"\\"], null)], null);
} else {
if((angle < -20.0)){
return new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(-1),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(-1),"/"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),"A"], null)], null);
} else {
if((angle < -7.5)){
return new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(-1),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(-1),"/"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(1),"\\"], null)], null);
} else {
return new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(0),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(-1),"/"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0),"A"], null),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(1),"\\"], null)], null);

}
}
}
}
});
/**
 * The lander, with animated flame while engines burn (flying, fuel left).
 */
moonlander.render.ascii.draw_lander = (function moonlander$render$ascii$draw_lander(grid,p__7263,status,t){
var map__7264 = p__7263;
var map__7264__$1 = cljs.core.__destructure_map(map__7264);
var x = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"x","x",2099068185));
var y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"y","y",-1757859776));
var fuel = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"fuel","fuel",10405485));
var up_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"up?","up?",77854972));
var left_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"left?","left?",1009526930));
var right_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"right?","right?",380310444));
var angle = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7264__$1,new cljs.core.Keyword(null,"angle","angle",1622094254));
var c = (x | (0));
var r = (y | (0));
var fr = cljs.core.long$((t * (12)));
var g_SINGLEQUOTE_ = cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g,p__7265){
var vec__7266 = p__7265;
var dr = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7266,(0),null);
var dc = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7266,(1),null);
var ch = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7266,(2),null);
return moonlander.render.ascii.assoc_grid(g,(r + dr),(c + dc),ch);
}),grid,moonlander.render.ascii.lander_cells((function (){var or__5002__auto__ = angle;
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return 0.0;
}
})()));
if(cljs.core.not_EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"flying","flying",-1854780019),status)){
return g_SINGLEQUOTE_;
} else {
var burning_QMARK_ = (fuel > (0));
var G__7271 = g_SINGLEQUOTE_;
var G__7271__$1 = (cljs.core.truth_((function (){var and__5000__auto__ = up_QMARK_;
if(cljs.core.truth_(and__5000__auto__)){
return burning_QMARK_;
} else {
return and__5000__auto__;
}
})())?moonlander.render.ascii.assoc_grid(moonlander.render.ascii.assoc_grid(G__7271,(r + (1)),c,cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, ["V","v","V"], null),cljs.core.mod(fr,(3)))),(r + (2)),c,cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, ["|","*",":","."], null),cljs.core.mod(fr,(4)))):G__7271);
var G__7271__$2 = (cljs.core.truth_((function (){var and__5000__auto__ = left_QMARK_;
if(cljs.core.truth_(and__5000__auto__)){
return burning_QMARK_;
} else {
return and__5000__auto__;
}
})())?moonlander.render.ascii.assoc_grid(G__7271__$1,r,(c + (2)),cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, ["<","=","-"], null),cljs.core.mod(fr,(3)))):G__7271__$1);
if(cljs.core.truth_((function (){var and__5000__auto__ = right_QMARK_;
if(cljs.core.truth_(and__5000__auto__)){
return burning_QMARK_;
} else {
return and__5000__auto__;
}
})())){
return moonlander.render.ascii.assoc_grid(G__7271__$2,r,(c - (2)),cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [">","=","-"], null),cljs.core.mod(fr,(3))));
} else {
return G__7271__$2;
}
}
});
moonlander.render.ascii.explosion_chars = new cljs.core.PersistentVector(null, 8, 5, cljs.core.PersistentVector.EMPTY_NODE, ["%","#","*","+","o",".",":"," "], null);
/**
 * Expanding blast of flickering characters at the crash site, fading to a
 * wisp of smoke. Frame is derived from the time since impact.
 */
moonlander.render.ascii.draw_explosion = (function moonlander$render$ascii$draw_explosion(grid,p__7275,t){
var map__7276 = p__7275;
var map__7276__$1 = cljs.core.__destructure_map(map__7276);
var x = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7276__$1,new cljs.core.Keyword(null,"x","x",2099068185));
var y = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7276__$1,new cljs.core.Keyword(null,"y","y",-1757859776));
var t0 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7276__$1,new cljs.core.Keyword(null,"t0","t0",2120162535));
var dt = (t - t0);
var radius = (function (){var x__5090__auto__ = 4.0;
var y__5091__auto__ = (dt * 6.0);
return ((x__5090__auto__ < y__5091__auto__) ? x__5090__auto__ : y__5091__auto__);
})();
var fr = cljs.core.long$((dt * (10)));
if((dt > 1.5)){
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g,p__7279){
var vec__7285 = p__7279;
var dx = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7285,(0),null);
var dy = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7285,(1),null);
return moonlander.render.ascii.assoc_grid(g,(y + dy),(x + dx),cljs.core.nth.cljs$core$IFn$_invoke$arity$2(new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [".",",","'"], null),cljs.core.mod(((dx + dy) + fr),(3))));
}),grid,new cljs.core.PersistentVector(null, 6, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(0)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(1),(-1)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-1),(-1)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(2),(-2)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(-2),(-2)], null),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [(0),(-3)], null)], null));
} else {
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g,dy){
return cljs.core.reduce.cljs$core$IFn$_invoke$arity$3((function (g_SINGLEQUOTE_,dx){
if((((dx * dx) + (dy * dy)) <= (radius * radius))){
return moonlander.render.ascii.assoc_grid(g_SINGLEQUOTE_,(y + dy),(x + dx),cljs.core.nth.cljs$core$IFn$_invoke$arity$2(moonlander.render.ascii.explosion_chars,cljs.core.mod((((dx * (7)) + (dy * (13))) + fr),cljs.core.count(moonlander.render.ascii.explosion_chars))));
} else {
return g_SINGLEQUOTE_;
}
}),g,cljs.core.range.cljs$core$IFn$_invoke$arity$2((-4),(5)));
}),grid,cljs.core.range.cljs$core$IFn$_invoke$arity$2((-4),(5)));
}
});
moonlander.render.ascii.draw_overlay = (function moonlander$render$ascii$draw_overlay(grid,config,p__7288){
var map__7289 = p__7288;
var map__7289__$1 = cljs.core.__destructure_map(map__7289);
var status = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7289__$1,new cljs.core.Keyword(null,"status","status",-1997798413));
var message = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7289__$1,new cljs.core.Keyword(null,"message","message",-406056002));
if(cljs.core.truth_((function (){var and__5000__auto__ = message;
if(cljs.core.truth_(and__5000__auto__)){
var fexpr__7290 = new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"landed","landed",-1056197628),null,new cljs.core.Keyword(null,"crashed","crashed",-194307569),null], null), null);
return (fexpr__7290.cljs$core$IFn$_invoke$arity$1 ? fexpr__7290.cljs$core$IFn$_invoke$arity$1(status) : fexpr__7290.call(null,status));
} else {
return and__5000__auto__;
}
})())){
var r = cljs.core.quot(new cljs.core.Keyword(null,"rows","rows",850049680).cljs$core$IFn$_invoke$arity$1(config),(2));
var cols = new cljs.core.Keyword(null,"cols","cols",-1914801295).cljs$core$IFn$_invoke$arity$1(config);
var len = cljs.core.count(message);
var c0 = (function (){var x__5087__auto__ = (0);
var y__5088__auto__ = cljs.core.quot((cols - len),(2));
return ((x__5087__auto__ > y__5088__auto__) ? x__5087__auto__ : y__5088__auto__);
})();
return cljs.core.reduce_kv((function (g,i,ch){
return moonlander.render.ascii.assoc_grid(g,r,(c0 + i),ch);
}),grid,cljs.core.vec(message));
} else {
return grid;
}
});
/**
 * Returns the full screen as a single string.
 */
moonlander.render.ascii.render = (function moonlander$render$ascii$render(config,p__7291){
var map__7292 = p__7291;
var map__7292__$1 = cljs.core.__destructure_map(map__7292);
var s = map__7292__$1;
var terrain = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7292__$1,new cljs.core.Keyword(null,"terrain","terrain",704966005));
var lander = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7292__$1,new cljs.core.Keyword(null,"lander","lander",439860228));
var stars = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7292__$1,new cljs.core.Keyword(null,"stars","stars",-556837771));
var t = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7292__$1,new cljs.core.Keyword(null,"t","t",-1397832519));
var status = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7292__$1,new cljs.core.Keyword(null,"status","status",-1997798413));
var explosion = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7292__$1,new cljs.core.Keyword(null,"explosion","explosion",-1564989537));
var base = moonlander.render.ascii.draw_pad(moonlander.render.ascii.draw_terrain(moonlander.render.ascii.draw_stars(moonlander.render.ascii.blank_grid(config),config,stars,lander,t),config,terrain),config,terrain,t);
var grid = (cljs.core.truth_((function (){var and__5000__auto__ = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"crashed","crashed",-194307569),status);
if(and__5000__auto__){
return explosion;
} else {
return and__5000__auto__;
}
})())?moonlander.render.ascii.draw_explosion(base,explosion,t):moonlander.render.ascii.draw_lander(base,cljs.core.merge.cljs$core$IFn$_invoke$arity$variadic(cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([lander,new cljs.core.Keyword(null,"burn","burn",-458179293).cljs$core$IFn$_invoke$arity$1(s)], 0)),status,t));
return cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,cljs.core.map.cljs$core$IFn$_invoke$arity$2((function (row){
return [cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,row)),"\n"].join('');
}),moonlander.render.ascii.draw_overlay(grid,config,s)));
});

//# sourceMappingURL=moonlander.render.ascii.js.map
