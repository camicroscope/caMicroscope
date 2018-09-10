//StateManager.js

class StatesHelper{
 //
 static getStatesFromURL(url){

 }
 //
 static getStatesObjectFromURL(){

 }
 //
 static getCurrentStates(){
 	if(!$D.params.slideId){
 		console.warn('No slide Id');
 		return null;
 	}
 	if(!$CAMIC || !$CAMIC.viewer){
 		console.warn('No CaMicroscope Core');
 		return null;
 	}
 	const states = {};
 	// get current center position in the image corrdinates
 	const pos = $CAMIC.viewer.viewport.getCenter(true);
 	states.x = pos.x;
 	states.y = pos.y;
 	// get current zoom
 	states.z = $CAMIC.viewer.viewport.getZoom(true);
 	if($CAMIC.viewer.omanager){
 		const lays =  $CAMIC.viewer.omanager.overlays.reduce(function(rs,lay){
 			if(lay.isShow)rs.push(lay.id);
 			return rs;
 		},[]);
 		if(lays.length > 0) states.l = lays;
 	}
 	return states;
 }

 static getCurrentStatesURL(baseURL){
 	let states = StatesHelper.getCurrentStates();
 	if(!states)return;
 	states = StatesHelper.encodeStates(states);
 	return `${location.origin}${location.pathname}?slideId=${$D.params.slideId}&states=${states}`
 }

 static encodeStates(states) {
    /* encoding for state into url
     * @param state_object - the object to encode
     * uses base64 encoding
     * "exotic" objects likely won't work correctly without a way to convert to and from string
     */
    return encodeURIComponent(btoa(JSON.stringify(states)));
 }

 static decodeStates(str) {
    /* decoding for state from url
     * @param encoded_string - the encoded string
     * uses base64 decoding
     * "exotic" objects likely won't work correctly without a way to convert to and from string
     */
    return JSON.parse(atob(decodeURIComponent(str)));
 }
}