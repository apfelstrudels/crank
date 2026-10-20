goog.provide('moonlander.render');
if((typeof moonlander !== 'undefined') && (typeof moonlander.render !== 'undefined') && (typeof moonlander.render.registry !== 'undefined')){
} else {
moonlander.render.registry = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(cljs.core.PersistentArrayMap.EMPTY);
}
if((typeof moonlander !== 'undefined') && (typeof moonlander.render !== 'undefined') && (typeof moonlander.render.active !== 'undefined')){
} else {
moonlander.render.active = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(null);
}
/**
 * Register a renderer implementation's start fn under `id`. Called at
 * namespace load by renderer implementations (e.g. moonlander.render.pixi).
 */
moonlander.render.register_BANG_ = (function moonlander$render$register_BANG_(id,start_fn){
return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(moonlander.render.registry,cljs.core.assoc,id,start_fn);
});
moonlander.render.default_renderer = new cljs.core.Keyword(null,"pixi","pixi",808009198);
moonlander.render.el = (function moonlander$render$el(id){
if((typeof document !== 'undefined')){
return document.getElementById(id);
} else {
return null;
}
});
/**
 * The always-available renderer: writes the ASCII frame into <pre
 * id="screen">. `config` rides along per call so hot reload picks up
 * display-config changes.
 */
moonlander.render.ascii_renderer = (function moonlander$render$ascii_renderer(){
return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"id","id",-1388402092),new cljs.core.Keyword(null,"ascii","ascii",-1923131294),new cljs.core.Keyword(null,"draw!","draw!",-781339504),(function (config,s){
var temp__5804__auto__ = moonlander.render.el("screen");
if(cljs.core.truth_(temp__5804__auto__)){
var screen__$1 = temp__5804__auto__;
return (screen__$1.textContent = moonlander.render.ascii.render(config,s));
} else {
return null;
}
})], null);
});
/**
 * The renderer the environment asks for: `?renderer=<id>` in the page URL
 * wins over `window.MOONLANDER_CONFIG.RENDERER`; both are optional and
 * parse to a keyword (nil when unset/unparseable). Kept separate from
 * `start!` so selection is auditable and cheap to test.
 */
moonlander.render.requested_renderer = (function moonlander$render$requested_renderer(){
if((typeof window !== 'undefined')){
var from_url = (function (){var G__7295 = window;
var G__7295__$1 = (((G__7295 == null))?null:G__7295.location);
var G__7295__$2 = (((G__7295__$1 == null))?null:G__7295__$1.search);
var G__7295__$3 = (((G__7295__$2 == null))?null:(new URLSearchParams(G__7295__$2)));
if((G__7295__$3 == null)){
return null;
} else {
return G__7295__$3.get("renderer");
}
})();
var from_cfg = (function (){var G__7297 = window;
var G__7297__$1 = (((G__7297 == null))?null:G__7297.MOONLANDER_CONFIG);
if((G__7297__$1 == null)){
return null;
} else {
return G__7297__$1.RENDERER;
}
})();
var or__5002__auto__ = (function (){var G__7298 = from_url;
var G__7298__$1 = (((G__7298 == null))?null:cljs.core.not_empty(G__7298));
if((G__7298__$1 == null)){
return null;
} else {
return cljs.core.keyword.cljs$core$IFn$_invoke$arity$1(G__7298__$1);
}
})();
if(cljs.core.truth_(or__5002__auto__)){
return or__5002__auto__;
} else {
var or__5002__auto____$1 = (function (){var G__7299 = from_cfg;
var G__7299__$1 = (((G__7299 == null))?null:cljs.core.not_empty(G__7299));
if((G__7299__$1 == null)){
return null;
} else {
return cljs.core.keyword.cljs$core$IFn$_invoke$arity$1(G__7299__$1);
}
})();
if(cljs.core.truth_(or__5002__auto____$1)){
return or__5002__auto____$1;
} else {
return moonlander.render.default_renderer;
}
}
} else {
return null;
}
});
/**
 * Resolve and start the renderer for this session. Always installs the
 * ASCII renderer first so every frame has a working draw path; when a
 * different renderer was requested and is registered, starts it and swaps
 * it in once ready. A start failure (rejected promise or thrown error)
 * leaves ASCII active - the automatic fallback for WebGL-less browsers.
 */
moonlander.render.start_BANG_ = (function moonlander$render$start_BANG_(config){
cljs.core.reset_BANG_(moonlander.render.active,moonlander.render.ascii_renderer());

var want_7309 = moonlander.render.requested_renderer();
var temp__5804__auto___7310 = (function (){var and__5000__auto__ = (!((want_7309 == null)));
if(and__5000__auto__){
var and__5000__auto____$1 = cljs.core.not_EQ_.cljs$core$IFn$_invoke$arity$2(new cljs.core.Keyword(null,"ascii","ascii",-1923131294),want_7309);
if(and__5000__auto____$1){
return cljs.core.get.cljs$core$IFn$_invoke$arity$2(cljs.core.deref(moonlander.render.registry),want_7309);
} else {
return and__5000__auto____$1;
}
} else {
return and__5000__auto__;
}
})();
if(cljs.core.truth_(temp__5804__auto___7310)){
var start_7311 = temp__5804__auto___7310;
try{Promise.resolve((start_7311.cljs$core$IFn$_invoke$arity$1 ? start_7311.cljs$core$IFn$_invoke$arity$1(config) : start_7311.call(null,config))).then((function (impl){
if(cljs.core.truth_((function (){var and__5000__auto__ = impl;
if(cljs.core.truth_(and__5000__auto__)){
return new cljs.core.Keyword(null,"draw!","draw!",-781339504).cljs$core$IFn$_invoke$arity$1(impl);
} else {
return and__5000__auto__;
}
})())){
return cljs.core.reset_BANG_(moonlander.render.active,impl);
} else {
return null;
}
})).catch((function (err){
return console.warn(["moonlander: renderer ",cljs.core.name(want_7309)," failed to start, staying on ASCII: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(err.message)].join(''));
}));
}catch (e7300){var err_7312 = e7300;
console.warn(["moonlander: renderer ",cljs.core.name(want_7309)," failed to start, staying on ASCII: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(err_7312.message)].join(''));
}} else {
}

return null;
});
/**
 * Render one frame of `state` through the active renderer. No-op before
 * `start!` (and headlessly, where no renderer is ever started).
 */
moonlander.render.draw_BANG_ = (function moonlander$render$draw_BANG_(config,s){
var temp__5804__auto__ = cljs.core.deref(moonlander.render.active);
if(cljs.core.truth_(temp__5804__auto__)){
var r = temp__5804__auto__;
var fexpr__7304 = new cljs.core.Keyword(null,"draw!","draw!",-781339504).cljs$core$IFn$_invoke$arity$1(r);
return (fexpr__7304.cljs$core$IFn$_invoke$arity$2 ? fexpr__7304.cljs$core$IFn$_invoke$arity$2(config,s) : fexpr__7304.call(null,config,s));
} else {
return null;
}
});
/**
 * The id of the live renderer (:ascii, :pixi, ...). Diagnostic for the
 * review console and future telemetry.
 */
moonlander.render.active_renderer_id = (function moonlander$render$active_renderer_id(){
var G__7305 = cljs.core.deref(moonlander.render.active);
if((G__7305 == null)){
return null;
} else {
return new cljs.core.Keyword(null,"id","id",-1388402092).cljs$core$IFn$_invoke$arity$1(G__7305);
}
});

//# sourceMappingURL=moonlander.render.js.map
