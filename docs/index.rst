caMicroscope
============

A Web Based Annotation and Visualization Platform for Digitized Whole Slide Images
----------------------------------------------------------------------------------

Develop branch build status:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

|Build Status|

About
-----

caMicroscope is a HTML5 image viewer optimized for large bio-medical
image data viewing, with a strong emphasis on cancer pathology.

The Image Viewer server is based on `IIPImage server`_ which is a Fast
CGI module and `OpenSeaDragon`_ which is a deep zoom image viewer.

Usage
-----

caMicroscope should be deployed as part of a stack; for further
information see the `caMicroscope distribution repository`_.

To use caMicroscope as a standalone application, see `nanoborb`_.

Core Features
-------------

-  Variable resolution browser rendering of slide images of multiple
   formats

-  Segmentation analysis on user-selected regions

-  Annotation drawing and sharing

.. _IIPImage server: http://iipimage.sourceforge.net/
.. _OpenSeaDragon: https://openseadragon.github.io/
.. _caMicroscope distribution repository: https://github.com/camicroscope/Distro
.. _nanoborb: https://github.com/SBU-BMI/Nanoborb/releases

.. |Build Status| image:: https://travis-ci.org/camicroscope/caMicroscope.svg?branch=master
   :target: https://travis-ci.org/camicroscope/caMicroscope
