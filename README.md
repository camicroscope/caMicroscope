
caMicroscope - A Web Based Annotation and Visualization Platform for Digitized Whole Slide Images

Ameen Kazerouni <ameen.kazerouni@emory.edu>

Ashish Sharma <ashish.sharma@emory.edu>

[Ganesh Iyer](http://ganeshiyer.net) <ganesh.iyer@emory.edu>

[Ryan Birmingham](http://rbirm.us) <rbirmin@emory.edu>

Sanjay Agravat <sagrava@emory.edu>

Shaohuan Li <shaohuan.li@gmail.com>

============

About
-------
GSOC Bio-medical Image Viewer Project is a HTML5 image viewer optimized for large bio-medical image data viewing.

The Image Viewer server is based on the IIPImage server(http://iipimage.sourceforge.net/) which is an Fast CGI modeule written in C++ and IIPMooviewer-2.0(https://github.com/ruven/iipmooviewer) which is a HTML5 Ajax-based javascript image streaming client developed by Ruven.

This project forcuses on SVG annotation development, HTML5 canvas implementation and database design for viewing large Bio-Medical image data.

Usage
--------

This repository is best used through the [caMicroscope Distribution](https://github.com/camicroscope/Distro) on a server supporting docker.

Features
--------

*HTML5 Canvas Markup Drawing. Rectangle tool,ellipse tool, pencil tool, polyline tool, measurement tool and magnifying tool have been developed.

*SVG Markup Displaying. The image markups are displayed as SVG(Scalable Vector Graphics) images which preserve good resolutions for different sizes of views

*Annotation/Markup data saving. The markups/annotations will be saved to the database using PHP scripts via Ajax calls.

Specifications
--------------
