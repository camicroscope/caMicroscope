#camicroscope's file/directory structure

    .
    ├── iconfont                                    # Google Material icons
    ├── package                                     # Packaged Extensions for caMicroscope
    ├── dist                                        # package/packages.js is built to dist/packages.js in the container build step 
    │                                               # (or with parcel build package/packages.js)
    │
    ├── css                                         # the common style sheets for system
    │
    ├── common                                      # all common/utility *.js that will be used by the entire system go there
    │   ├── ...
    │   ├── path.js                                 # common example file: a polyfill for Path2D
    │   ├── simplify.js                             # common example file: simplify the polygon and line
    │   └── ...
    ├── core                                        # camicroscope core directory. All files that are associated with the core go there
    │   ├── Camic.js                                # camicscope class
    │   ├── openseadragon                           # openSeadragon lib folder
    │   ├── openseadragon-XXX.js                    # osd plugin file that provided by other developer
    │   ├── ...
    │   └── extension                               # all extension file that provided by us
    │      ├── osd-labeling                         # labeling extension folder
    │      ├── osd-heatmap-overlay.js               # heatmap overlay .js file
    │      └── ...
    ├── components                                  # UI components folder: all ui component files 
    │   ├── ...
    │   ├── component_name                          # a component folder
    │   │   ├── dependencies                        # the dependencies are used by a component
    │   │   │   ├── ...
    │   │   │   ├── dependency_file/folder          # a dependency file
    │   │   │   └── ...
    │   │   ├── component_name.js                   # a component .js file
    │   │   └── component_name.css                  # a component .css file
    │   └── ...
    ├── apps                                        # all applications files go there.
    │   ├── Viewer                                  # a specific application. etc. Viewer
    │   │   ├── xxx.js                              # Any file that associated with the `Viewer` application
    │   │   ├── xxx.html                            # enter point page for viewer.
    │   │   └── ...                         
    │   ├── Heatmap                                 # a specific application. etc. Heatmap
    │   │   ├── xxx.js                              # Any file that associated with the `Heatmap` application
    │   │   └── ...
    ├── test                                        # Test files
    │   ├── ui                                      # ui tests
    │   ├── core                                    # core tests
    │   └── extension                               # extension tests
    ├── demo                                        # all demos code go there
    │   ├── xxx_demo                                # a demo code in there file
    │   └── ...
    └── docs                                        # jsdoc, api doc and other documentation go there.
