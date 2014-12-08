//https://w3g.jp/blog/tools/js_browser_sniffing

var _ua = (function(){
	return {
		ltIE6:typeof window.addEventListener == "undefined" && typeof document.documentElement.style.maxHeight == "undefined",
		ltIE7:typeof window.addEventListener == "undefined" && typeof document.querySelectorAll == "undefined",
		ltIE8:typeof window.addEventListener == "undefined" && typeof document.getElementsByClassName == "undefined",
		ltIE9:document.uniqueID && typeof window.matchMedia == "undefined",
		gtIE10:document.uniqueID && window.matchMedia,
		Trident:document.uniqueID,
		Gecko:'MozAppearance' in document.documentElement.style,
		Presto:window.opera,
		Blink:window.chrome,
		Webkit:typeof window.chrome == "undefined" && 'WebkitAppearance' in document.documentElement.style,
		Touch:typeof document.ontouchstart != "undefined",
		Mobile:typeof window.orientation != "undefined",
		ltAd4_4:typeof window.orientation != "undefined" && typeof(EventSource) == "undefined",
		Pointer:window.navigator.pointerEnabled,
		MSPoniter:window.navigator.msPointerEnabled
	}
})();