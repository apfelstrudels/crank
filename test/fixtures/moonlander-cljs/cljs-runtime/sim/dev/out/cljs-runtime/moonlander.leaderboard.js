goog.provide('moonlander.leaderboard');
moonlander.leaderboard.max_ticks = (20000);
moonlander.leaderboard.max_dt = 0.05;
moonlander.leaderboard.board_limit = (20);
/**
 * The leaderboard config value, or nil when not configured. Reads
 * window.MOONLANDER_CONFIG (public/config.js) and requires both values.
 */
moonlander.leaderboard.config = (function moonlander$leaderboard$config(){
if((typeof window !== 'undefined')){
var c = window.MOONLANDER_CONFIG;
if(cljs.core.truth_((function (){var and__5000__auto__ = c;
if(cljs.core.truth_(and__5000__auto__)){
return ((cljs.core.seq(c.SUPABASE_URL)) && (cljs.core.seq(c.SUPABASE_ANON_KEY)));
} else {
return and__5000__auto__;
}
})())){
return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"url","url",276297046),c.SUPABASE_URL,new cljs.core.Keyword(null,"anon-key","anon-key",973144115),c.SUPABASE_ANON_KEY], null);
} else {
return null;
}
} else {
return null;
}
});
moonlander.leaderboard.configured_QMARK_ = (function moonlander$leaderboard$configured_QMARK_(){
return cljs.core.boolean$(moonlander.leaderboard.config());
});
moonlander.leaderboard.new_recording = (function moonlander$leaderboard$new_recording(seed,level){
return new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"seed","seed",68613327),seed,new cljs.core.Keyword(null,"level","level",1290497552),level,new cljs.core.Keyword(null,"seen-t","seen-t",-1459230814),0.0,new cljs.core.Keyword(null,"ticks","ticks",-406190313),cljs.core.PersistentVector.EMPTY,new cljs.core.Keyword(null,"capped?","capped?",-65680820),false], null);
});
/**
 * Append one frame to the recording. `burn` is the effective thrust applied
 * by `step` this tick ({:up? :left? :right?}). Frames with dt outside the
 * server's accepted range are dropped (a zero-dt frame changes no physics);
 * past the server's tick cap the recording stops and is flagged :capped?.
 */
moonlander.leaderboard.record_tick = (function moonlander$leaderboard$record_tick(rec,dt,p__7314){
var map__7315 = p__7314;
var map__7315__$1 = cljs.core.__destructure_map(map__7315);
var up_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7315__$1,new cljs.core.Keyword(null,"up?","up?",77854972));
var left_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7315__$1,new cljs.core.Keyword(null,"left?","left?",1009526930));
var right_QMARK_ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7315__$1,new cljs.core.Keyword(null,"right?","right?",380310444));
if((((dt <= 0.0)) || ((dt > moonlander.leaderboard.max_dt)))){
return rec;
} else {
if((cljs.core.count(new cljs.core.Keyword(null,"ticks","ticks",-406190313).cljs$core$IFn$_invoke$arity$1(rec)) >= moonlander.leaderboard.max_ticks)){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(rec,new cljs.core.Keyword(null,"capped?","capped?",-65680820),true);
} else {
return cljs.core.update.cljs$core$IFn$_invoke$arity$4(rec,new cljs.core.Keyword(null,"ticks","ticks",-406190313),cljs.core.conj,new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"dt","dt",-368444759),dt,new cljs.core.Keyword(null,"up","up",-269712113),cljs.core.boolean$(up_QMARK_),new cljs.core.Keyword(null,"left","left",-399115937),cljs.core.boolean$(left_QMARK_),new cljs.core.Keyword(null,"right","right",-452581833),cljs.core.boolean$(right_QMARK_)], null));

}
}
});
/**
 * Server-side rule (submit-score): 1-16 chars of [A-Za-z0-9 _.-], starting
 * alphanumeric.
 */
moonlander.leaderboard.callsign_pattern = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,15}$/;
moonlander.leaderboard.valid_callsign_QMARK_ = (function moonlander$leaderboard$valid_callsign_QMARK_(s){
return cljs.core.boolean$((function (){var and__5000__auto__ = typeof s === 'string';
if(and__5000__auto__){
return cljs.core.re_matches(moonlander.leaderboard.callsign_pattern,s);
} else {
return and__5000__auto__;
}
})());
});
/**
 * Wire value for the AUTO/MANUAL flag: "auto" | "manual" | nil.
 */
moonlander.leaderboard.landing_flag = (function moonlander$leaderboard$landing_flag(landing_mode){
var G__7316 = landing_mode;
var G__7316__$1 = (((G__7316 instanceof cljs.core.Keyword))?G__7316.fqn:null);
switch (G__7316__$1) {
case "auto":
return "auto";

break;
case "manual":
return "manual";

break;
default:
return null;

}
});
/**
 * Inverse of `landing-flag`: a board row's wire value back to :auto/:manual/
 * nil. Used to seed replay playback with the mode recorded at verification
 * time (see moonlander.core/apply-recorded-landing-mode).
 */
moonlander.leaderboard.landing_mode_from_flag = (function moonlander$leaderboard$landing_mode_from_flag(flag){
var G__7317 = flag;
switch (G__7317) {
case "auto":
return new cljs.core.Keyword(null,"auto","auto",-566279492);

break;
case "manual":
return new cljs.core.Keyword(null,"manual","manual",-237370608);

break;
default:
return null;

}
});
/**
 * Submit body for POST {SUPABASE_URL}/functions/v1/submit-score:
 * {callsign, seed, level, landing_flag, ticks[{dt,up,left,right}]}.
 * The score itself is derived server-side from the verified replay; the
 * client never claims one.
 */
moonlander.leaderboard.payload = (function moonlander$leaderboard$payload(callsign,p__7318,landing_mode){
var map__7319 = p__7318;
var map__7319__$1 = cljs.core.__destructure_map(map__7319);
var seed = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7319__$1,new cljs.core.Keyword(null,"seed","seed",68613327));
var level = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7319__$1,new cljs.core.Keyword(null,"level","level",1290497552));
var ticks = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7319__$1,new cljs.core.Keyword(null,"ticks","ticks",-406190313));
return new cljs.core.PersistentArrayMap(null, 5, ["callsign",callsign,"seed",seed,"level",level,"landing_flag",moonlander.leaderboard.landing_flag(landing_mode),"ticks",cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (p__7323){
var map__7324 = p__7323;
var map__7324__$1 = cljs.core.__destructure_map(map__7324);
var dt = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7324__$1,new cljs.core.Keyword(null,"dt","dt",-368444759));
var up = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7324__$1,new cljs.core.Keyword(null,"up","up",-269712113));
var left = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7324__$1,new cljs.core.Keyword(null,"left","left",-399115937));
var right = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7324__$1,new cljs.core.Keyword(null,"right","right",-452581833));
return new cljs.core.PersistentArrayMap(null, 4, ["dt",dt,"up",up,"left",left,"right",right], null);
}),ticks)], null);
});
/**
 * Display label for a board row's landing flag.
 */
moonlander.leaderboard.flag_label = (function moonlander$leaderboard$flag_label(f){
var G__7325 = f;
switch (G__7325) {
case "auto":
return "AUTO";

break;
case "manual":
return "MANUAL";

break;
default:
return "--";

}
});
/**
 * Fit `s` into exactly `n` chars: truncate or pad on the right.
 */
moonlander.leaderboard.fit = (function moonlander$leaderboard$fit(s,n){
var s__$1 = cljs.core.str.cljs$core$IFn$_invoke$arity$1(s);
if((((s__$1).length) >= n)){
return cljs.core.subs.cljs$core$IFn$_invoke$arity$3(s__$1,(0),n);
} else {
return [s__$1,cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,cljs.core.repeat.cljs$core$IFn$_invoke$arity$2((n - ((s__$1).length))," ")))].join('');
}
});
/**
 * Fit `s` into exactly `n` chars: truncate or pad on the left.
 */
moonlander.leaderboard.fit_left = (function moonlander$leaderboard$fit_left(s,n){
var s__$1 = cljs.core.str.cljs$core$IFn$_invoke$arity$1(s);
if((((s__$1).length) >= n)){
return cljs.core.subs.cljs$core$IFn$_invoke$arity$3(s__$1,(0),n);
} else {
return [cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,cljs.core.repeat.cljs$core$IFn$_invoke$arity$2((n - ((s__$1).length))," "))),s__$1].join('');
}
});
moonlander.leaderboard.board_header = [moonlander.leaderboard.fit_left("RK",(2)),"  ",moonlander.leaderboard.fit("CALLSIGN",(16)),"  ",moonlander.leaderboard.fit_left("SCORE",(6)),"  ",moonlander.leaderboard.fit_left("LVL",(3)),"  ",moonlander.leaderboard.fit("FLAG",(6)),"  ",moonlander.leaderboard.fit_left("FUEL",(5))].join('');
/**
 * One board line from a PostgREST row (string keys): rank, callsign,
 * score, level, AUTO/MANUAL flag, fuel remaining.
 */
moonlander.leaderboard.board_row_text = (function moonlander$leaderboard$board_row_text(i,row){
return [moonlander.leaderboard.fit_left((i + (1)),(2)),"  ",moonlander.leaderboard.fit(cljs.core.get.cljs$core$IFn$_invoke$arity$3(row,"callsign","?"),(16)),"  ",moonlander.leaderboard.fit_left((function (){var or__5002__auto__ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"score");
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return (0);
}
})(),(6)),"  ",moonlander.leaderboard.fit_left((function (){var or__5002__auto__ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"level");
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return (0);
}
})(),(3)),"  ",moonlander.leaderboard.fit(moonlander.leaderboard.flag_label(cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"landing_flag")),(6)),"  ",moonlander.leaderboard.fit_left(((function (){var or__5002__auto__ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"fuel_remaining");
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return (0);
}
})() | (0)),(5))].join('');
});
/**
 * Board title, rule, and column header - the fixed part above the rows.
 */
moonlander.leaderboard.board_head_text = (function moonlander$leaderboard$board_head_text(title){
var rule = cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,cljs.core.repeat.cljs$core$IFn$_invoke$arity$2(((moonlander.leaderboard.board_header).length),"-"));
return [cljs.core.str.cljs$core$IFn$_invoke$arity$1(title),"\n",cljs.core.str.cljs$core$IFn$_invoke$arity$1(rule),"\n",moonlander.leaderboard.board_header,"\n",cljs.core.str.cljs$core$IFn$_invoke$arity$1(rule)].join('');
});
/**
 * Full ASCII board with title, header, and one line per row; the
 * `empty-message` shows when the board has no entries (e.g. the daily board
 * right after the nightly reset).
 */
moonlander.leaderboard.board_text = (function moonlander$leaderboard$board_text(title,rows,empty_message){
var body = ((cljs.core.seq(rows))?clojure.string.join.cljs$core$IFn$_invoke$arity$2("\n",cljs.core.map_indexed.cljs$core$IFn$_invoke$arity$2(moonlander.leaderboard.board_row_text,rows)):["  ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(empty_message)].join(''));
return [moonlander.leaderboard.board_head_text(title),"\n",body].join('');
});
/**
 * Parse a stored flight log from a `score_replays` read-path row
 * (string keys) into a replayable log {:id :seed :level :ticks}, or nil
 * when the row carries no usable log: legacy rows predate the ticks
 * column (NULL) and corrupt logs fail the same shape checks the server
 * applies at submit time. The watch action degrades to 'replay
 * unavailable' on nil - it must never crash the boards UI.
 */
moonlander.leaderboard.replay_log_from_row = (function moonlander$leaderboard$replay_log_from_row(row){
var ticks = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"ticks");
var seed = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"seed");
var level = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"level");
var tick_QMARK_ = (function (t){
var dt = cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"dt");
return ((typeof dt === 'number') && ((((dt > 0.0)) && ((((dt <= moonlander.leaderboard.max_dt)) && (((cljs.core.boolean_QMARK_(cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"up"))) && (((cljs.core.boolean_QMARK_(cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"left"))) && (cljs.core.boolean_QMARK_(cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"right"))))))))))));
});
if(((cljs.core.integer_QMARK_(seed)) && ((((seed >= (0))) && (((cljs.core.integer_QMARK_(level)) && ((((level >= (1))) && (((cljs.core.sequential_QMARK_(ticks)) && (((((((1) <= cljs.core.count(ticks))) && ((cljs.core.count(ticks) <= moonlander.leaderboard.max_ticks)))) && (cljs.core.every_QMARK_(tick_QMARK_,ticks)))))))))))))){
return new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"id","id",-1388402092),cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"id"),new cljs.core.Keyword(null,"seed","seed",68613327),seed,new cljs.core.Keyword(null,"level","level",1290497552),level,new cljs.core.Keyword(null,"ticks","ticks",-406190313),cljs.core.mapv.cljs$core$IFn$_invoke$arity$2((function (t){
return new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"dt","dt",-368444759),cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"dt"),new cljs.core.Keyword(null,"up","up",-269712113),cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"up"),new cljs.core.Keyword(null,"left","left",-399115937),cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"left"),new cljs.core.Keyword(null,"right","right",-452581833),cljs.core.get.cljs$core$IFn$_invoke$arity$2(t,"right")], null);
}),ticks)], null);
} else {
return null;
}
});
/**
 * Playback speed cycle for the SPEED toggle: 1x -> 2x -> 4x -> 1x.
 */
moonlander.leaderboard.replay_speeds = new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [(1),(2),(4)], null);
/**
 * Cycle a playback map's :speed through `replay-speeds`; a missing or
 * unrecognized speed (e.g. the :loading/:unavailable window, which has no
 * :speed key yet) resets to 1x rather than erroring.
 */
moonlander.leaderboard.cycle_replay_speed = (function moonlander$leaderboard$cycle_replay_speed(rp){
return cljs.core.update.cljs$core$IFn$_invoke$arity$3(rp,new cljs.core.Keyword(null,"speed","speed",1257663751),(function (p1__7327_SHARP_){
return cljs.core.get.cljs$core$IFn$_invoke$arity$3(new cljs.core.PersistentArrayMap(null, 2, [(1),(2),(2),(4)], null),p1__7327_SHARP_,(1));
}));
});
if((typeof moonlander !== 'undefined') && (typeof moonlander.leaderboard !== 'undefined') && (typeof moonlander.leaderboard.ui !== 'undefined')){
} else {
moonlander.leaderboard.ui = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(new cljs.core.PersistentArrayMap(null, 7, [new cljs.core.Keyword(null,"recording","recording",322996097),null,new cljs.core.Keyword(null,"ended-status","ended-status",-1435572656),null,new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221),null,new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"idle","idle",-2007156861),new cljs.core.Keyword(null,"boards","boards",1912049694),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"idle","idle",-2007156861),new cljs.core.Keyword(null,"all","all",892129742),null,new cljs.core.Keyword(null,"daily","daily",-697831483),null], null),new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112),false,new cljs.core.Keyword(null,"replay","replay",-681122389),null], null));
}
moonlander.leaderboard.el = (function moonlander$leaderboard$el(id){
if((typeof document !== 'undefined')){
return document.getElementById(id);
} else {
return null;
}
});
moonlander.leaderboard.set_text_BANG_ = (function moonlander$leaderboard$set_text_BANG_(id,s){
var temp__5804__auto__ = moonlander.leaderboard.el(id);
if(cljs.core.truth_(temp__5804__auto__)){
var e = temp__5804__auto__;
return (e.textContent = s);
} else {
return null;
}
});
moonlander.leaderboard.show_BANG_ = (function moonlander$leaderboard$show_BANG_(id,show_QMARK_){
var temp__5804__auto__ = moonlander.leaderboard.el(id);
if(cljs.core.truth_(temp__5804__auto__)){
var e = temp__5804__auto__;
return (e.hidden = cljs.core.not(show_QMARK_));
} else {
return null;
}
});
/**
 * Game-loop hook: record one simulated frame. `s` is the pre-step state,
 * `burn` the post-step effective thrust. Starts a fresh recording whenever
 * the round identity (seed, level) changes or the clock rewinds (retry or
 * new game reusing a seed).
 */
moonlander.leaderboard.record_BANG_ = (function moonlander$leaderboard$record_BANG_(s,dt,burn){
return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.update,new cljs.core.Keyword(null,"recording","recording",322996097),(function (rec){
var fresh_QMARK_ = cljs.core.not((function (){var and__5000__auto__ = rec;
if(cljs.core.truth_(and__5000__auto__)){
return ((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"seed","seed",68613327).cljs$core$IFn$_invoke$arity$1(rec),new cljs.core.Keyword(null,"seed","seed",68613327).cljs$core$IFn$_invoke$arity$1(s))) && (((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"level","level",1290497552).cljs$core$IFn$_invoke$arity$1(rec),new cljs.core.Keyword(null,"level","level",1290497552).cljs$core$IFn$_invoke$arity$1(s))) && ((new cljs.core.Keyword(null,"seen-t","seen-t",-1459230814).cljs$core$IFn$_invoke$arity$2(rec,0.0) <= new cljs.core.Keyword(null,"t","t",-1397832519).cljs$core$IFn$_invoke$arity$1(s))))));
} else {
return and__5000__auto__;
}
})());
return moonlander.leaderboard.record_tick(cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(((fresh_QMARK_)?moonlander.leaderboard.new_recording(new cljs.core.Keyword(null,"seed","seed",68613327).cljs$core$IFn$_invoke$arity$1(s),new cljs.core.Keyword(null,"level","level",1290497552).cljs$core$IFn$_invoke$arity$1(s)):rec),new cljs.core.Keyword(null,"seen-t","seen-t",-1459230814),new cljs.core.Keyword(null,"t","t",-1397832519).cljs$core$IFn$_invoke$arity$1(s)),dt,burn);
}));
});
/**
 * Build one board as DOM: the fixed header as a <pre>, then one line per
 * row with a WATCH action (replay theater) when the row carries its id.
 */
moonlander.leaderboard.append_board_BANG_ = (function moonlander$leaderboard$append_board_BANG_(id,title,rows,empty_message){
var temp__5804__auto__ = moonlander.leaderboard.el(id);
if(cljs.core.truth_(temp__5804__auto__)){
var e = temp__5804__auto__;
e.replaceChildren();

var head_7430 = document.createElement("pre");
(head_7430.textContent = moonlander.leaderboard.board_head_text(title));

e.appendChild(head_7430);

if(cljs.core.seq(rows)){
var seq__7329 = cljs.core.seq(cljs.core.map_indexed.cljs$core$IFn$_invoke$arity$2(cljs.core.vector,rows));
var chunk__7330 = null;
var count__7331 = (0);
var i__7332 = (0);
while(true){
if((i__7332 < count__7331)){
var vec__7349 = chunk__7330.cljs$core$IIndexed$_nth$arity$2(null,i__7332);
var i = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7349,(0),null);
var row = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7349,(1),null);
var div_7433 = document.createElement("div");
var span_7434 = document.createElement("span");
(div_7433.className = (((i < (3)))?"lb-row lb-top":"lb-row"));

(span_7434.textContent = moonlander.leaderboard.board_row_text(i,row));

div_7433.appendChild(span_7434);

var temp__5804__auto___7435__$1 = (function (){var and__5000__auto__ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"has_log");
if(cljs.core.truth_(and__5000__auto__)){
return cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"id");
} else {
return and__5000__auto__;
}
})();
if(cljs.core.truth_(temp__5804__auto___7435__$1)){
var rid_7436 = temp__5804__auto___7435__$1;
var b_7437 = document.createElement("button");
(b_7437.className = "lb-watch");

(b_7437.textContent = "WATCH");

b_7437.addEventListener("click",((function (seq__7329,chunk__7330,count__7331,i__7332,b_7437,rid_7436,temp__5804__auto___7435__$1,div_7433,span_7434,vec__7349,i,row,e,temp__5804__auto__){
return (function (_){
var G__7352 = rid_7436;
var G__7353 = cljs.core.get.cljs$core$IFn$_invoke$arity$3(row,"callsign","?");
var G__7354 = cljs.core.get.cljs$core$IFn$_invoke$arity$3(row,"level","?");
var G__7355 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"landing_flag");
return (moonlander.leaderboard.watch_BANG_.cljs$core$IFn$_invoke$arity$4 ? moonlander.leaderboard.watch_BANG_.cljs$core$IFn$_invoke$arity$4(G__7352,G__7353,G__7354,G__7355) : moonlander.leaderboard.watch_BANG_.call(null,G__7352,G__7353,G__7354,G__7355));
});})(seq__7329,chunk__7330,count__7331,i__7332,b_7437,rid_7436,temp__5804__auto___7435__$1,div_7433,span_7434,vec__7349,i,row,e,temp__5804__auto__))
);

div_7433.appendChild(b_7437);
} else {
}

e.appendChild(div_7433);


var G__7438 = seq__7329;
var G__7439 = chunk__7330;
var G__7440 = count__7331;
var G__7441 = (i__7332 + (1));
seq__7329 = G__7438;
chunk__7330 = G__7439;
count__7331 = G__7440;
i__7332 = G__7441;
continue;
} else {
var temp__5804__auto____$1 = cljs.core.seq(seq__7329);
if(temp__5804__auto____$1){
var seq__7329__$1 = temp__5804__auto____$1;
if(cljs.core.chunked_seq_QMARK_(seq__7329__$1)){
var c__5525__auto__ = cljs.core.chunk_first(seq__7329__$1);
var G__7442 = cljs.core.chunk_rest(seq__7329__$1);
var G__7443 = c__5525__auto__;
var G__7444 = cljs.core.count(c__5525__auto__);
var G__7445 = (0);
seq__7329 = G__7442;
chunk__7330 = G__7443;
count__7331 = G__7444;
i__7332 = G__7445;
continue;
} else {
var vec__7356 = cljs.core.first(seq__7329__$1);
var i = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7356,(0),null);
var row = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7356,(1),null);
var div_7446 = document.createElement("div");
var span_7447 = document.createElement("span");
(div_7446.className = (((i < (3)))?"lb-row lb-top":"lb-row"));

(span_7447.textContent = moonlander.leaderboard.board_row_text(i,row));

div_7446.appendChild(span_7447);

var temp__5804__auto___7448__$2 = (function (){var and__5000__auto__ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"has_log");
if(cljs.core.truth_(and__5000__auto__)){
return cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"id");
} else {
return and__5000__auto__;
}
})();
if(cljs.core.truth_(temp__5804__auto___7448__$2)){
var rid_7449 = temp__5804__auto___7448__$2;
var b_7450 = document.createElement("button");
(b_7450.className = "lb-watch");

(b_7450.textContent = "WATCH");

b_7450.addEventListener("click",((function (seq__7329,chunk__7330,count__7331,i__7332,b_7450,rid_7449,temp__5804__auto___7448__$2,div_7446,span_7447,vec__7356,i,row,seq__7329__$1,temp__5804__auto____$1,e,temp__5804__auto__){
return (function (_){
var G__7359 = rid_7449;
var G__7360 = cljs.core.get.cljs$core$IFn$_invoke$arity$3(row,"callsign","?");
var G__7361 = cljs.core.get.cljs$core$IFn$_invoke$arity$3(row,"level","?");
var G__7362 = cljs.core.get.cljs$core$IFn$_invoke$arity$2(row,"landing_flag");
return (moonlander.leaderboard.watch_BANG_.cljs$core$IFn$_invoke$arity$4 ? moonlander.leaderboard.watch_BANG_.cljs$core$IFn$_invoke$arity$4(G__7359,G__7360,G__7361,G__7362) : moonlander.leaderboard.watch_BANG_.call(null,G__7359,G__7360,G__7361,G__7362));
});})(seq__7329,chunk__7330,count__7331,i__7332,b_7450,rid_7449,temp__5804__auto___7448__$2,div_7446,span_7447,vec__7356,i,row,seq__7329__$1,temp__5804__auto____$1,e,temp__5804__auto__))
);

div_7446.appendChild(b_7450);
} else {
}

e.appendChild(div_7446);


var G__7451 = cljs.core.next(seq__7329__$1);
var G__7452 = null;
var G__7453 = (0);
var G__7454 = (0);
seq__7329 = G__7451;
chunk__7330 = G__7452;
count__7331 = G__7453;
i__7332 = G__7454;
continue;
}
} else {
return null;
}
}
break;
}
} else {
var div = document.createElement("div");
(div.className = "lb-row");

(div.textContent = ["  ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(empty_message)].join(''));

return e.appendChild(div);
}
} else {
return null;
}
});
moonlander.leaderboard.render_boards_BANG_ = (function moonlander$leaderboard$render_boards_BANG_(){
var map__7363 = new cljs.core.Keyword(null,"boards","boards",1912049694).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui));
var map__7363__$1 = cljs.core.__destructure_map(map__7363);
var status = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7363__$1,new cljs.core.Keyword(null,"status","status",-1997798413));
var all = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7363__$1,new cljs.core.Keyword(null,"all","all",892129742));
var daily = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7363__$1,new cljs.core.Keyword(null,"daily","daily",-697831483));
var G__7364 = status;
var G__7364__$1 = (((G__7364 instanceof cljs.core.Keyword))?G__7364.fqn:null);
switch (G__7364__$1) {
case "loading":
moonlander.leaderboard.set_text_BANG_("lb-all","ACQUIRING TELEMETRY...");

return moonlander.leaderboard.set_text_BANG_("lb-daily","");

break;
case "error":
moonlander.leaderboard.set_text_BANG_("lb-all","TELEMETRY OFFLINE - UPLINK UNREACHABLE");

return moonlander.leaderboard.set_text_BANG_("lb-daily","");

break;
default:
moonlander.leaderboard.append_board_BANG_("lb-all","ALL-TIME BOARD",all,"NO TELEMETRY LOGGED YET");

return moonlander.leaderboard.append_board_BANG_("lb-daily","DAILY BOARD (RESETS NIGHTLY UTC)",daily,"NO TELEMETRY TODAY");

}
});
moonlander.leaderboard.get_json_BANG_ = (function moonlander$leaderboard$get_json_BANG_(url,anon_key,path){
return fetch([cljs.core.str.cljs$core$IFn$_invoke$arity$1(url),cljs.core.str.cljs$core$IFn$_invoke$arity$1(path)].join(''),({"headers": ({"apikey": anon_key, "Authorization": ["Bearer ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(anon_key)].join('')})})).then((function (r){
if(cljs.core.truth_(r.ok)){
return r.json();
} else {
throw (new Error(["board read failed: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(r.status)].join('')));
}
})).then((function (j){
return cljs.core.js__GT_clj.cljs$core$IFn$_invoke$arity$1(j);
}));
});
moonlander.leaderboard.fetch_boards_BANG_ = (function moonlander$leaderboard$fetch_boards_BANG_(){
var temp__5804__auto__ = moonlander.leaderboard.config();
if(cljs.core.truth_(temp__5804__auto__)){
var map__7365 = temp__5804__auto__;
var map__7365__$1 = cljs.core.__destructure_map(map__7365);
var url = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7365__$1,new cljs.core.Keyword(null,"url","url",276297046));
var anon_key = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7365__$1,new cljs.core.Keyword(null,"anon-key","anon-key",973144115));
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc_in,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"boards","boards",1912049694),new cljs.core.Keyword(null,"status","status",-1997798413)], null),new cljs.core.Keyword(null,"loading","loading",-737050189));

moonlander.leaderboard.render_boards_BANG_();

return Promise.all([moonlander.leaderboard.get_json_BANG_(url,anon_key,["/rest/v1/leaderboard_all_time?order=score.desc,fuel_remaining.desc&limit=",cljs.core.str.cljs$core$IFn$_invoke$arity$1(moonlander.leaderboard.board_limit)].join('')),moonlander.leaderboard.get_json_BANG_(url,anon_key,["/rest/v1/leaderboard_daily?order=score.desc,fuel_remaining.desc&limit=",cljs.core.str.cljs$core$IFn$_invoke$arity$1(moonlander.leaderboard.board_limit)].join(''))]).then((function (p__7366){
var vec__7367 = p__7366;
var all = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7367,(0),null);
var daily = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__7367,(1),null);
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"boards","boards",1912049694),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"ok","ok",967785236),new cljs.core.Keyword(null,"all","all",892129742),all,new cljs.core.Keyword(null,"daily","daily",-697831483),daily], null));

return moonlander.leaderboard.render_boards_BANG_();
})).catch((function (_){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc_in,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"boards","boards",1912049694),new cljs.core.Keyword(null,"status","status",-1997798413)], null),new cljs.core.Keyword(null,"error","error",-978969032));

return moonlander.leaderboard.render_boards_BANG_();
}));
} else {
return null;
}
});
/**
 * Set the replay bar's status line (also used by the playback driver).
 */
moonlander.leaderboard.replay_status_BANG_ = (function moonlander$leaderboard$replay_status_BANG_(s){
return moonlander.leaderboard.set_text_BANG_("rp-status",s);
});
moonlander.leaderboard.update_replay_bar_BANG_ = (function moonlander$leaderboard$update_replay_bar_BANG_(){
var temp__5804__auto__ = new cljs.core.Keyword(null,"replay","replay",-681122389).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui));
if(cljs.core.truth_(temp__5804__auto__)){
var rp = temp__5804__auto__;
moonlander.leaderboard.set_text_BANG_("rp-play",(cljs.core.truth_(new cljs.core.Keyword(null,"playing?","playing?",-1884542863).cljs$core$IFn$_invoke$arity$1(rp))?"PAUSE":"PLAY"));

return moonlander.leaderboard.set_text_BANG_("rp-speed",["SPEED x",cljs.core.str.cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"speed","speed",1257663751).cljs$core$IFn$_invoke$arity$2(rp,(1)))].join(''));
} else {
return null;
}
});
moonlander.leaderboard.replay_unavailable_BANG_ = (function moonlander$leaderboard$replay_unavailable_BANG_(){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"replay","replay",-681122389),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"unavailable","unavailable",1529915531)], null));

moonlander.leaderboard.replay_status_BANG_("REPLAY UNAVAILABLE - FLIGHT LOG NOT ARCHIVED");

return moonlander.leaderboard.update_replay_bar_BANG_();
});
if((typeof moonlander !== 'undefined') && (typeof moonlander.leaderboard !== 'undefined') && (typeof moonlander.leaderboard.watch_token !== 'undefined')){
} else {
moonlander.leaderboard.watch_token = cljs.core.atom.cljs$core$IFn$_invoke$arity$1((0));
}
/**
 * WATCH action on a board row: fetch the run's archived flight log via
 * the anon read path and open the replay bar. The playback driver in
 * moonlander.core picks the log up from (:replay @ui). A legacy row (log
 * predates the ticks column) or a malformed log degrades to a clear
 * 'replay unavailable' state - the boards UI keeps working.
 */
moonlander.leaderboard.watch_BANG_ = (function moonlander$leaderboard$watch_BANG_(id,callsign,level,landing_flag){
var temp__5804__auto__ = moonlander.leaderboard.config();
if(cljs.core.truth_(temp__5804__auto__)){
var map__7370 = temp__5804__auto__;
var map__7370__$1 = cljs.core.__destructure_map(map__7370);
var url = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7370__$1,new cljs.core.Keyword(null,"url","url",276297046));
var anon_key = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7370__$1,new cljs.core.Keyword(null,"anon-key","anon-key",973144115));
var token = cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$2(moonlander.leaderboard.watch_token,cljs.core.inc);
var current_QMARK_ = (function (){
return cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(token,cljs.core.deref(moonlander.leaderboard.watch_token));
});
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"replay","replay",-681122389),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"loading","loading",-737050189)], null));

moonlander.leaderboard.set_text_BANG_("rp-title",["REPLAY: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(callsign)," - LEVEL ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(level)].join(''));

moonlander.leaderboard.replay_status_BANG_("FETCHING FLIGHT LOG...");

moonlander.leaderboard.show_BANG_("replay-bar",true);

return moonlander.leaderboard.get_json_BANG_(url,anon_key,["/rest/v1/score_replays?id=eq.",cljs.core.str.cljs$core$IFn$_invoke$arity$1(id),"&limit=1"].join('')).then((function (rows){
if(current_QMARK_()){
var temp__5802__auto__ = moonlander.leaderboard.replay_log_from_row(cljs.core.first(rows));
if(cljs.core.truth_(temp__5802__auto__)){
var log = temp__5802__auto__;
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"replay","replay",-681122389),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"status","status",-1997798413),new cljs.core.Keyword(null,"ready","ready",1086465795),new cljs.core.Keyword(null,"log","log",-1595516004),cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(log,new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221),moonlander.leaderboard.landing_mode_from_flag(landing_flag))], null));

moonlander.leaderboard.replay_status_BANG_("");

return moonlander.leaderboard.update_replay_bar_BANG_();
} else {
return moonlander.leaderboard.replay_unavailable_BANG_();
}
} else {
return null;
}
})).catch((function (_){
if(current_QMARK_()){
return moonlander.leaderboard.replay_unavailable_BANG_();
} else {
return null;
}
}));
} else {
return null;
}
});
moonlander.leaderboard.toggle_replay_play_BANG_ = (function moonlander$leaderboard$toggle_replay_play_BANG_(){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.update_in,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"replay","replay",-681122389),new cljs.core.Keyword(null,"playing?","playing?",-1884542863)], null),cljs.core.not);

return moonlander.leaderboard.update_replay_bar_BANG_();
});
moonlander.leaderboard.cycle_replay_speed_BANG_ = (function moonlander$leaderboard$cycle_replay_speed_BANG_(){
if(cljs.core.truth_(new cljs.core.Keyword(null,"speed","speed",1257663751).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"replay","replay",-681122389).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui))))){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.update,new cljs.core.Keyword(null,"replay","replay",-681122389),moonlander.leaderboard.cycle_replay_speed);

return moonlander.leaderboard.update_replay_bar_BANG_();
} else {
return null;
}
});
moonlander.leaderboard.close_replay_BANG_ = (function moonlander$leaderboard$close_replay_BANG_(){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$3(moonlander.leaderboard.ui,cljs.core.dissoc,new cljs.core.Keyword(null,"replay","replay",-681122389));

return moonlander.leaderboard.show_BANG_("replay-bar",false);
});
moonlander.leaderboard.update_submit_visibility_BANG_ = (function moonlander$leaderboard$update_submit_visibility_BANG_(){
var show_submit_QMARK_ = ((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"landed","landed",-1056197628),new cljs.core.Keyword(null,"ended-status","ended-status",-1435572656).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui)))) && (cljs.core.not_EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"done","done",-889844188),new cljs.core.Keyword(null,"submission","submission",749424120).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui)))));
moonlander.leaderboard.show_BANG_("lb-callsign-label",show_submit_QMARK_);

moonlander.leaderboard.show_BANG_("lb-callsign",show_submit_QMARK_);

return moonlander.leaderboard.show_BANG_("lb-transmit",show_submit_QMARK_);
});
/**
 * Round ended (landed or crashed): with config, bring up the telemetry
 * panel. The callsign prompt appears only for a safe landing - submit time
 * is the only moment a nickname is asked for.
 */
moonlander.leaderboard.on_round_ended_BANG_ = (function moonlander$leaderboard$on_round_ended_BANG_(s){
if(moonlander.leaderboard.configured_QMARK_()){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$variadic(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"ended-status","ended-status",-1435572656),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(s),cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221),new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221).cljs$core$IFn$_invoke$arity$1(s),new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"idle","idle",-2007156861)], 0));

moonlander.leaderboard.show_BANG_("leaderboard",true);

moonlander.leaderboard.set_text_BANG_("lb-status",((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"landed","landed",-1056197628),new cljs.core.Keyword(null,"status","status",-1997798413).cljs$core$IFn$_invoke$arity$1(s)))?"UPLINK READY - ENTER CALLSIGN TO LOG SCORE":"NO SCORE TO LOG - [L] BOARDS"));

moonlander.leaderboard.update_submit_visibility_BANG_();

moonlander.leaderboard.show_BANG_("lb-boards",new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui)));

if(cljs.core.truth_(new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui)))){
return moonlander.leaderboard.fetch_boards_BANG_();
} else {
return null;
}
} else {
return null;
}
});
/**
 * A fresh round started (next level, retry, new game): put the panel away.
 */
moonlander.leaderboard.on_new_round_BANG_ = (function moonlander$leaderboard$on_new_round_BANG_(){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$variadic(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"idle","idle",-2007156861),cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"ended-status","ended-status",-1435572656),null,new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112),false], 0));

moonlander.leaderboard.close_replay_BANG_();

return moonlander.leaderboard.show_BANG_("leaderboard",false);
});
/**
 * Toggle the boards from the end-of-round screen ([L] key / BOARDS button).
 */
moonlander.leaderboard.toggle_boards_BANG_ = (function moonlander$leaderboard$toggle_boards_BANG_(){
if(moonlander.leaderboard.configured_QMARK_()){
var open_QMARK_ = cljs.core.not(new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112).cljs$core$IFn$_invoke$arity$1(cljs.core.deref(moonlander.leaderboard.ui)));
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112),open_QMARK_);

moonlander.leaderboard.show_BANG_("leaderboard",true);

moonlander.leaderboard.show_BANG_("lb-boards",open_QMARK_);

if(open_QMARK_){
return moonlander.leaderboard.fetch_boards_BANG_();
} else {
return null;
}
} else {
return null;
}
});
/**
 * Transmit the recorded run for server verification. Validates the callsign
 * against the server rule before sending; the score comes back from the
 * verified replay.
 */
moonlander.leaderboard.submit_BANG_ = (function moonlander$leaderboard$submit_BANG_(callsign){
var temp__5804__auto__ = moonlander.leaderboard.config();
if(cljs.core.truth_(temp__5804__auto__)){
var map__7400 = temp__5804__auto__;
var map__7400__$1 = cljs.core.__destructure_map(map__7400);
var url = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7400__$1,new cljs.core.Keyword(null,"url","url",276297046));
var anon_key = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7400__$1,new cljs.core.Keyword(null,"anon-key","anon-key",973144115));
var map__7401 = cljs.core.deref(moonlander.leaderboard.ui);
var map__7401__$1 = cljs.core.__destructure_map(map__7401);
var recording = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7401__$1,new cljs.core.Keyword(null,"recording","recording",322996097));
var landing_mode = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7401__$1,new cljs.core.Keyword(null,"landing-mode","landing-mode",-1037452221));
var submission = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7401__$1,new cljs.core.Keyword(null,"submission","submission",749424120));
if((!(moonlander.leaderboard.valid_callsign_QMARK_(callsign)))){
return moonlander.leaderboard.set_text_BANG_("lb-status","CALLSIGN: 1-16 CHARS [A-Z0-9 _.-], START ALNUM");
} else {
if((((recording == null)) || (cljs.core.empty_QMARK_(new cljs.core.Keyword(null,"ticks","ticks",-406190313).cljs$core$IFn$_invoke$arity$1(recording))))){
return moonlander.leaderboard.set_text_BANG_("lb-status","NO TELEMETRY RECORDED");
} else {
if(cljs.core.truth_(new cljs.core.Keyword(null,"capped?","capped?",-65680820).cljs$core$IFn$_invoke$arity$1(recording))){
return moonlander.leaderboard.set_text_BANG_("lb-status","RUN TOO LONG FOR UPLINK - SCORE NOT LOGGED");
} else {
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"sending","sending",-1806704862),submission)){
return null;
} else {
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"sending","sending",-1806704862));

moonlander.leaderboard.set_text_BANG_("lb-status","TRANSMITTING...");

return fetch([cljs.core.str.cljs$core$IFn$_invoke$arity$1(url),"/functions/v1/submit-score"].join(''),({"method": "POST", "headers": ({"content-type": "application/json", "apikey": anon_key, "Authorization": ["Bearer ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(anon_key)].join('')}), "body": JSON.stringify(cljs.core.clj__GT_js(moonlander.leaderboard.payload(callsign,recording,landing_mode)))})).then((function (r){
return r.json().then((function (j){
return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"status","status",-1997798413),r.status,new cljs.core.Keyword(null,"body","body",-2049205669),cljs.core.js__GT_clj.cljs$core$IFn$_invoke$arity$1(j)], null);
}));
})).then((function (p__7406){
var map__7407 = p__7406;
var map__7407__$1 = cljs.core.__destructure_map(map__7407);
var status = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7407__$1,new cljs.core.Keyword(null,"status","status",-1997798413));
var body = cljs.core.get.cljs$core$IFn$_invoke$arity$2(map__7407__$1,new cljs.core.Keyword(null,"body","body",-2049205669));
if(cljs.core.truth_((function (){var and__5000__auto__ = cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2((200),status);
if(and__5000__auto__){
return cljs.core.get.cljs$core$IFn$_invoke$arity$2(body,"ok");
} else {
return and__5000__auto__;
}
})())){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$variadic(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"done","done",-889844188),cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"boards-open?","boards-open?",743810112),true], 0));

moonlander.leaderboard.set_text_BANG_("lb-status",["SCORE VERIFIED: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.get.cljs$core$IFn$_invoke$arity$2(body,"score"))," - TELEMETRY LOGGED"].join(''));

moonlander.leaderboard.update_submit_visibility_BANG_();

moonlander.leaderboard.show_BANG_("lb-boards",true);

return moonlander.leaderboard.fetch_boards_BANG_();
} else {
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"error","error",-978969032));

return moonlander.leaderboard.set_text_BANG_("lb-status",["REJECTED: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1((function (){var or__5002__auto__ = cljs.core.get.cljs$core$IFn$_invoke$arity$2(body,"reason");
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
return ["HTTP ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(status)].join('');
}
})())].join(''));
}
})).catch((function (_){
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.leaderboard.ui,cljs.core.assoc,new cljs.core.Keyword(null,"submission","submission",749424120),new cljs.core.Keyword(null,"error","error",-978969032));

return moonlander.leaderboard.set_text_BANG_("lb-status","UPLINK FAILED - CHECK CONNECTION");
}));

}
}
}
}
} else {
return null;
}
});
/**
 * Wire the telemetry panel controls once at game start. With no config the
 * panel stays hidden and the page is exactly as before.
 */
moonlander.leaderboard.init_ui_BANG_ = (function moonlander$leaderboard$init_ui_BANG_(){
if(moonlander.leaderboard.configured_QMARK_()){
var temp__5804__auto___7471 = moonlander.leaderboard.el("lb-transmit");
if(cljs.core.truth_(temp__5804__auto___7471)){
var b_7472 = temp__5804__auto___7471;
b_7472.addEventListener("click",(function (_){
return moonlander.leaderboard.submit_BANG_(moonlander.leaderboard.el("lb-callsign").value);
}));
} else {
}

var temp__5804__auto___7473 = moonlander.leaderboard.el("lb-callsign");
if(cljs.core.truth_(temp__5804__auto___7473)){
var input_7474 = temp__5804__auto___7473;
input_7474.addEventListener("keydown",(function (e){
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2("Enter",e.key)){
return moonlander.leaderboard.submit_BANG_(input_7474.value);
} else {
return null;
}
}));
} else {
}

var temp__5804__auto___7475 = moonlander.leaderboard.el("lb-boards-toggle");
if(cljs.core.truth_(temp__5804__auto___7475)){
var b_7476 = temp__5804__auto___7475;
b_7476.addEventListener("click",(function (_){
return moonlander.leaderboard.toggle_boards_BANG_();
}));
} else {
}

var temp__5804__auto__ = moonlander.leaderboard.el("help");
if(cljs.core.truth_(temp__5804__auto__)){
var help = temp__5804__auto__;
return (help.innerHTML = [cljs.core.str.cljs$core$IFn$_invoke$arity$1(help.innerHTML)," &nbsp; [L] BOARDS"].join(''));
} else {
return null;
}
} else {
return null;
}
});

//# sourceMappingURL=moonlander.leaderboard.js.map
