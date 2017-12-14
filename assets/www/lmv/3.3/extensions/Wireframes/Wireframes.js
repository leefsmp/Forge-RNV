(function(){ 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.Wireframes');

    function WireframesExtension(viewer, options) {

        Autodesk.Viewing.Extension.call(this, viewer, options);

        this.active = false;
        this.groups = [];
        this.geometries = [];
        this.materials = [];
        this.lines = [];

        this.lightPreset = 4; //"Photo Booth";
        this.viewerLightPreset = 4;

        this.showingSolidMaterials = true;
        this.showingLines = true;

        this.linesMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(0x00000000),
            opacity: 0.03,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });

        this.solidMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFCFCFCF,
            specular: 0x00000000,
            emissive: 0xFFCFCFCF,
            ambient: 0,
            opacity: 1.0,
            transparent: false,
            polygonOffset: true,
            polygonOffsetFactor: 1.0,
            polygonOffsetUnits: 5
        });
        this.solidMaterial.packedNormals = true;
    }

    WireframesExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    WireframesExtension.prototype.constructor = WireframesExtension;

    var proto = WireframesExtension.prototype;

    proto.load = function () {
      
        var togglePolygonOffset = function() {
            // Functionality available in Viewer 2.15 and up, to make wireframe lines
            // look better.
            // However, wirelines may still work (though not as good) when the function is not present.
            var matManager = this.viewer.impl.getMaterials();
            if (matManager && matManager.togglePolygonOffset) {
                matManager.togglePolygonOffset(true, 1.0, 5.0);
            }
        }.bind(this);

        // Create and add wireframe geometry.
        var createAndAddWireframes = function() {

            var viewer = this.viewer;
            var models = viewer.impl.modelQueue().getModels();
            var modelsCount = models.length;

            for (var i = 0; i < modelsCount; ++i) {

                if(!models[i].getData().instanceTree) {
                    continue;
                }

                // Create group with all lines obtained for the model.
                var group = createWireframes(models[i], this.geometries, this.lines, this.materials, this.linesMaterial);
                group.model = models[i];
                this.groups.push(group);

                // Set solid material to new fragments only when tool is activated.
                if (this.active) {
                    addWireframes(this.viewer, this.groups);
                    this.setSolidMaterial(this.solidMaterial);
                }

            }

            togglePolygonOffset();
            viewer.impl.invalidate(true, true, true);
        }.bind(this);

        createAndAddWireframes();

        // Keep adding wireframes if model is still loading.
        this.viewer.addEventListener(Autodesk.Viewing.PROGRESS_UPDATE_EVENT,
            function(event) {
                if (event.state === Autodesk.Viewing.ProgressState.LOADING) {

                    // Add wireframes for newly loaded fragments.
                    createAndAddWireframes();
                }
            });

        // Enable line offset.
        togglePolygonOffset();

        return true;
    };

    proto.unload = function() {

        this.active = false;

        revertSolidMaterials(this.viewer, this.materials);
        revertWireframes(this.viewer, this.groups);

        this.geometries = [];
        this.materials = [];
        this.lines = [];
        this.groups = [];

        return true;
    };

    /**
     *
     */
    proto.activate = function () {

        this.active = true;

        this.viewerLightPreset = this.viewer.prefs.get('lightPreset');
        this.viewer.setLightPreset(this.lightPreset);

        this.setSolidMaterial(this.solidMaterial);
        this.setLinesMaterial(this.linesMaterial);

        addWireframes(this.viewer, this.groups);

        this.showSolidMaterial(this.showingSolidMaterials);
        this.showLines(this.showingLines);
    };

    /**
     *
     */
    proto.deactivate = function () {

        this.active = false;
        this.viewer.setLightPreset(this.viewerLightPreset);
        revertWireframes(this.viewer, this.groups);
        revertSolidMaterials(this.viewer, this.materials);
    };

    /**
     *
     * @param show
     */
    proto.showSolidMaterial = function(show) {

        this.showingSolidMaterials = show;

        if(!this.active) {
            return;
        }

        if (this.showingSolidMaterials) {
            this.setSolidMaterial(this.solidMaterial);
        } else {
            revertSolidMaterials(this.viewer, this.materials);
        }
    };

    /**
     *
     * @param show
     */
    proto.showLines = function(show) {

        this.showingLines = show;

        if(!this.active) {
            return;
        }

        var lines = this.lines;
        var linesCount = lines.length;

        for (var i = 0; i < linesCount; ++i) {

            var line = lines[i];
            line.visible = show;
        }

        this.viewer.impl.invalidate(true, true, true);
    };

    /**
     *
     */
    proto.setSolidMaterial = function(material) {

        this.solidMaterial = material;

        // Replace all fragments materials if extension active and showing solid materials.
        if(!this.active || !this.showingSolidMaterials) {
            return;
        }

        var materials = this.materials;
        var materialsCount = materials.length;

        for (var i = 0; i < materialsCount; ++i) {

            var material = materials[i];
            material.fragments.setMaterial(material.fragment, this.solidMaterial);
        }

        this.viewer.impl.invalidate(true, true, true);
    };

    /**
     *
     */
    proto.setLinesMaterial = function(material) {

        this.linesMaterial = material;

        // Replace all lines materials if extension is active and showing lines.
        if(!this.active || !this.showingLines) {
            return;
        }

        var lines = this.lines;
        var linesCount = lines.length;

        for (var i = 0; i < linesCount; ++i) {

            var line = lines[i];
            line.material = this.linesMaterial;
        }

        this.viewer.impl.invalidate(true, true, true);
    };

    /**
     *
     * @param name
     */
    proto.setLightPreset = function(name) {

        this.lightPreset = name;
        if (this.active) {
            this.viewer.setLightPreset(name);
        }
    };

    /**
     *
     * @param model
     * @param geometries
     * @param lines
     * @param materials
     * @param linesMaterial
     * @returns {THREE.Group}
     */
    function createWireframes(model, geometries, lines, materials, linesMaterial) {

        // Get Meshes in the model.
        var tree = model.getData().instanceTree;
        var fragments = model.getFragmentList();
        var newGeometries = [];

        tree.enumNodeChildren(model.getRootId(), function(dbId) {

            if (tree.isNodeHidden(dbId) || tree.isNodeOff(dbId)) {
                return;
            }

            //All fragments that belong to the same node make part of the
            //same object so we have to accumulate all their intersections into one list
            tree.enumNodeFragments(dbId, function(fragmentId) {

                var mesh = fragments.getVizmesh(fragmentId);

                if (!mesh.geometry) {
                    return;
                }

                if (mesh.geometry.is2d || mesh.geometry.isLines) {
                    return;
                }

                if (!mesh.material.cutplanes) {
                    return;
                }

                // Save materials to restore later.
                materials.push({fragment: fragmentId, fragments: fragments, material: fragments.getMaterial(fragmentId)});

                // Add geometry if not already present.
                var geometry = fragments.getGeometry(fragmentId);
                if(!find(geometry, fragmentId, geometries)) {

                    var world = new THREE.Matrix4();
                    fragments.getWorldMatrix(fragmentId, world);
                    newGeometries.push({geometry: geometry, world: world, fragment: fragmentId});
                }
            }.bind(this), false);
        }, true);

        // Create wire lines.
        var group = new THREE.Group();
        var newGeometriesCount = newGeometries.length;
        var position = new THREE.Vector3(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3();

        for (var i = 0; i < newGeometriesCount; ++i) {

            var geometry = new THREE.Geometry();
            var geometryVertices = geometry.vertices;

            var srcWorld = newGeometries[i].world;
            var srcGeometry = newGeometries[i].geometry;

            var srcVertices = srcGeometry.vb;
            var srcIndices = srcGeometry.ib;
            var srcStride = srcGeometry.vbstride;

            for (var j = 0; j < srcIndices.length;) {

                var indexA = srcIndices[j++] * srcStride;
                var indexB = srcIndices[j++] * srcStride;
                var indexC = srcIndices[j++] * srcStride;

                var vertexA = new THREE.Vector3(srcVertices[indexA++], srcVertices[indexA++], srcVertices[indexA]);
                var vertexB = new THREE.Vector3(srcVertices[indexB++], srcVertices[indexB++], srcVertices[indexB]);
                var vertexC = new THREE.Vector3(srcVertices[indexC++], srcVertices[indexC++], srcVertices[indexC]);

                geometryVertices.push(vertexA);
                geometryVertices.push(vertexB);

                geometryVertices.push(vertexB);
                geometryVertices.push(vertexC);

                geometryVertices.push(vertexC);
                geometryVertices.push(vertexA);
            }

            var line = new THREE.Line(geometry, linesMaterial, THREE.LinePieces);

            srcWorld.decompose(position, quaternion, scale);
            line.position.copy(position);
            line.quaternion.copy(quaternion);
            line.scale.copy(scale);
            lines.push(line);

            group.add(line);
            geometries.push(newGeometries[i]);
        }

        return group;
    }

    function addWireframes(viewer, groups) {

        var groupsCount = groups.length;
        for (var i = 0; i < groupsCount; ++i) {

            viewer.impl.sceneAfter.add(groups[i]);
        }
        viewer.impl.invalidate(true, true, true);
    }

    function revertSolidMaterials(viewer, materials) {

        var materialsLength = materials.length;
        for (var i = 0; i < materialsLength; ++i) {

            var material = materials[i];
            material.fragments.setMaterial(material.fragment, material.material);
        }
        viewer.impl.invalidate(true, true, true);
    }

    function revertWireframes(viewer, groups) {

        var groupsCount = groups.length;
        for (var i = 0; i < groupsCount; ++i) {

            viewer.impl.sceneAfter.remove(groups[i]);
        }
        viewer.impl.invalidate(true, true, true);
    }

    function find(geometry, fragment, geometries) {

        var geometryCount = geometries.length;
        for (var i = 0; i < geometryCount; ++i) {

            if (geometries[i].geometry === geometry && geometries[i].fragment === fragment) {
                return geometries[i];
            }
        }

        return null;
    }

    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Viewing.Wireframes', WireframesExtension);
})();
