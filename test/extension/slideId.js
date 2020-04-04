/**
 * Cannot use Store in this directory due to relative links. So...
 * @param slide
 * @returns {Promise<any | never>}
 */
getSlideId = async function (slide) {
    let url = '/data/Slide/find?slide=' + slide;
    return (await fetch(url)).json().then(info => info[0]['_id']['$oid'])
};
