Bio-Medical Image-Viewer

Shaohuan Li(Shao) Google Summer of Code 2012. HTML5 Large Bio-Medical Image Viewer Project.All Rights Reserved.
============

About
-----
GSOC Bio-medical Image Viewer Project is a HTML5 image viewer optimized for large bio-medical image data viewing. 

The Image Viewer server is based on the IIPImage server(http://iipimage.sourceforge.net/) which is an Fast CGI modeule written in C++ and IIPMooviewer-2.0(https://github.com/ruven/iipmooviewer) which is a HTML5 Ajax-based javascript image streaming client developed by Ruven.

This project forcuses on SVG annotation development, HTML5 canvas implementation and database design for viewing Bio-Medical image data.

Features
--------

*HTML5 Canvas Markup Drawing. Rectangle tool,Ellipse tool, Pencil tool,polyline tool and measurement tool have been developed.

*SVG Markup Displaying. The image markups are displayed as SVG(Scalable Vector Graphics) images which preserve good resolutions for different sizes of views

*Ajax Annotation/Markup data saving. The markups/annotations will be saved to the server using PHP scripts via Ajax calls.

Specifications
--------------

js/iipmooviewer-2.0.js is the Orignial IIPmooviewer with some customization. One big change is to add a displayAnnotation funciton in the requestImages function inside the class. Some small changes would be the size of the navigation window has been adjusted.

js/annotools.js is the main outcome of this project. It is an independent annotation module which can be added to other web services as well.
All the user needs to do is to create an annotools object and associate the tool tag id with the tag that needs to draw annotations on.
An example would be like http://170.140.138.125/view.html

The annotools.js can become an independent mootools plugin later. css/annotools.css and some svg imges in the images folder would need to be copied,too.

js/mootools-more.js and mootools-core.js would be the latest mootools framework.

js/main.js is the image meta data handler. js/moreImages.js is the bottom slider which will display the image meta data more conveniently.

api/annot.php is for saving and getting annotation meta data.
api/annot.txt is the file storing the annotation data. This file has to be set as readable/writable to the public.

api/image.php is the phpscript to get the image information from the database
api/annotation.php is the PHP script to get the annotation info from the database
api/state.php is to save the state of the viewer. The developers would be using zoomTo(zoom) and moveTo(left,top) to navigate to the saved state.

view.html is for the drawing without connecting to the database.You may test it here:http://170.140.138.125/view.html

index.html and viewer.html is for the image viewer which is connected to the database. You may test it here.http://170.140.138.125

schema.sql is the database schema

Database Module
---------------

One approach for saving annotations is to use databases. As the annotations will be associated with a particular image, the annotations will have to contain one foreign key referencing the image id.


Image MetaData Viewing Module
-----------------------------

The metadata is displayed as unsorted list on the button of the image viewer. This utilizes the tween function in Mootools. One example can be shown in viewer.html


