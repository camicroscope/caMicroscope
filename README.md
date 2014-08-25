caMicroscope - A Web Based Annotation and Visualization Platform for Digitized Whole Slide Images

Ameen Kazerouni <ameen.kazerouni@emory.edu>

Ashish Sharma <ashish.sharma@emory.edu>

Sanjay Agravat <sagrava@emory.edu>

Shaohuan Li <shaohuan.li@gmail.com> 

============

About
-------
GSOC Bio-medical Image Viewer Project is a HTML5 image viewer optimized for large bio-medical image data viewing. 

The Image Viewer server is based on the IIPImage server(http://iipimage.sourceforge.net/) which is an Fast CGI modeule written in C++ and IIPMooviewer-2.0(https://github.com/ruven/iipmooviewer) which is a HTML5 Ajax-based javascript image streaming client developed by Ruven.

This project forcuses on SVG annotation development, HTML5 canvas implementation and database design for viewing large Bio-Medical image data.

Prerequisite
--------
The IIPImage server(http://iipimage.sourceforge.net/) will have to be installed in the server. 

Apache or lighttpd web server will need to be installed as well.

PHP5 will be needed to handle the annotation saving function.

Features
--------

*HTML5 Canvas Markup Drawing. Rectangle tool,ellipse tool, pencil tool, polyline tool, measurement tool and magnifying tool have been developed.

*SVG Markup Displaying. The image markups are displayed as SVG(Scalable Vector Graphics) images which preserve good resolutions for different sizes of views

*Annotation/Markup data saving. The markups/annotations will be saved to the database using PHP scripts via Ajax calls.

Specifications
--------------

js/annotools.js is the main outcome of this project. It is an independent annotation module which allows users to draw markups/annotations on the image viewer.The annotation annotools object will need to be associated with a div tag id and a container id to run the tools smoothly. 
An example would be like http://170.140.138.125/view.html. The annotools only work for HTML5 enabled browsers. 

css/annotools.css and the svg imges in the images folder are associated with the annotools.js.

js/iipmooviewer-2.0.js is the orignial IIPMooViewer with some customization. One big change is to add a displayAnnotation funciton in the requestImages function inside the IIPMooViewer class. Some small changes would be like the adjustment of the navigation window size.

js/mootools-more.js and mootools-core.js would be the latest mootools framework.

js/main.js is the image meta data handler. js/moreImages.js is the bottom slider which will display the image meta data more conveniently.

api/annot.php is for saving and getting annotation meta.
api/annot.txt is the file storing the annotation data. This file has to be set as readable/writable to the public.

api/image.php is the php script to get the image information from the database
api/annotation.php is the PHP script to get the annotation info from the database
api/state.php is to save the state of the viewer. The developers would be using zoomTo(zoom) and moveTo(left,top) to navigate to the saved state.

view.html is for annotation saving without connecting to the database.You may test it here:http://170.140.138.125/view.html

index.html and viewer.html is for the image viewer which is connected to the database. You may test it here.http://170.140.138.125

schema.sql is the database schema

Database Module
---------------

One approach for saving annotations is to use databases. As the annotations will be associated with a particular image, the annotations will have to contain one foreign key referencing the image id.


Image MetaData Viewing Module
-----------------------------

The metadata is displayed as unsorted list on the bottom of the image viewer. This utilizes the tween function in Mootools. One example can be shown in viewer.html

Image Uploading Module
-----------------------------
This is handled by uploader.html and uploader.php. The images will by default be saved to the /usr/share/iip folder.

