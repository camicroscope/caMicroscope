Bio-Medical Image-Viewer
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

js/tool.js is for displaying drawing tools when a showTool function is triggered.

js/annotation.js contains mainly three functions:1.DrawMarkups 2.CreateAnnotations 3. Save Annotations.

js/annotation-edit.js is for editing annotations. 

api/annot2.php is for saving and getting annotation meta data.
api/annot2.txt is the file storing the annotation data. This file has to be set as readable/writable to the public.

view.html is for the drawing testings. You may test it here:http://170.140.138.125/bio/view.html

api/annotation.php is for saving the annotation data to the database.
api/image.php is for getting the image meta data from the database.

index.html and viewer.html is for the image viewer which is connected to the database. You may test it here.http://170.140.138.125/bio

schema.sql is the database schema

Database Module
---------------

One approach for saving annotations is to use databases. As the annotations will be associated with a particular image, the annotations will have to contain one foreign key referencing the image id.


Image MetaData Viewing Module
-----------------------------

The metadata is displayed as unsorted list on the button of the image viewer. This utilizes the tween function in Mootools. One example can be shown in viewer.html


