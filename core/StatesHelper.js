//StatesHelper.js

class StatesHelper{
    
    //
    static getStatesFromURL(url){

    }
    
    //
    static getStatesObjectFromURL(){

    }

    //
    static getCurrentStates(isImageCoordinate = false){
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
        const center = $CAMIC.viewer.viewport.viewportToImageCoordinates($CAMIC.viewer.viewport.getCenter(true));  
        center.x = Math.round(center.x);
        center.y = Math.round(center.y);
        if(isImageCoordinate){ // return image coordinate system
            states.x = center.x;
            states.y = center.y;
            states.coordinate = 'image';
        }else{
            const size = $CAMIC.viewer.world.getItemAt(0).source.dimensions;
            states.x = center.x/size.x;
            states.y = center.y/size.y;
        }
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

    static getCurrentStatesURL(isImageCoordinate=false){
        let states = StatesHelper.getCurrentStates(isImageCoordinate);
        if(!states)return;
        console.log(states);
        states = StatesHelper.encodeStates(states);
        return `${location.origin}${location.pathname}?slideId=${$D.params.slideId}&states=${states}`
    }
    /* encoding for state into url
    * @param state_object - the object to encode
    * uses base64 encoding
    * "exotic" objects likely won't work correctly without a way to convert to and from string
    */
    static encodeStates(states) {
        return encodeURIComponent(btoa(JSON.stringify(states)));
    }
    /* decoding for state from url
    * @param encoded_string - the encoded string
    * uses base64 decoding
    * "exotic" objects likely won't work correctly without a way to convert to and from string
    */
    static decodeStates(str) {

        return JSON.parse(atob(decodeURIComponent(str)));
    }
}
