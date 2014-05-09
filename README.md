Ameen Kazerouni
<ameen.kazerouni@emory.edu>

Ashish Sharma
<ashish.sharma@emory.edu>

Directory Layout

Home:
api
    Configuration
	ConfigPath.txt --> Configuration for data table.
	config.php --> Object with all apis for PHP scripts.
    Data
	CamicUtils.php --> Utilities to retrieve different image details, create symlinks etc.
	deleteAnnot.php --> Deletes an annotations
	getAnnotNoSpatial --> Annotation POST and GET used by mooCamicroscope.
	getAnnotSpatial --> Annotation POST and GET used by osdCamiroscope.
	mooMetadataRetriever --> Retrieve image details for rendering in Moo.
	osdMetadataRetriever --> Retrieve image details for renderin in OSD.
	RestRequest.php --> Not ours, open source. Rest library.
	retreiveClinicalData.php --> Datatable backend server code.
	submitJobParameters --> Submit job to analysis engine.
js
    annotationtools
	annotools-openseajax-handler.js --> Openseadragon event handler overrides
	mooAnnotationTools.js --> Annotation tools for mooCamicroscope
	osdAnnotationTools.js --> Annotation tools for osdCamicroscope

    dependencies
	iipmooviewer-2.0.js --> mooCamicroscope viewer library
	jquery.js --> jquery
	MD5.js --> MD5 hashing for id generation.

    datatables
	paging.js --> Paging for table.
	queryBrowser.js --> JavaScript for Query Browser form

    mootools --> Mootools Library. Do not touch

    openseadragon --> Openseadragon and imaging helper libraries. Do not touch.

    imagemetadatatools
	mooImageMetadata.js --> Creates object from data received from mooMetaDataRetriever.
	osdImageMetadata.js --> Creates object from data received from osdMetaDataRetriever
