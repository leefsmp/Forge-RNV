(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk');

    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;
    var Private = Autodesk.Viewing.Private;

    /**
     *
     * @constructor
     */
    function Navigator(tool) {

        this.tool = tool;
        this.viewer = tool.viewer;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(0, 0, 0);
        this.configuration = {};
    }

    var proto = Navigator.prototype;
    
    /**
     *
     * @param configuration
     * @param value
     * @returns {boolean}
     */
    proto.set = function(configuration, value) {

        if(!this.configuration.hasOwnProperty(configuration)) {
            Private.logger.warn('err! configuration not defined for current navigator in BimWalk: ' + configuration);
            return false;
        }

        if(!value === null || value === undefined) {
            Private.logger.warn('err! configuration value should be a number: ' + value);
            return false;
        }

        this.configuration[configuration] = value;
        return true;
    };

    /**
     *
     * @param configuration
     * @returns {*}
     */
    proto.get = function(configuration) {

        if(!this.configuration.hasOwnProperty(configuration)) {
            Private.logger.warn('err! configuration not defined for current navigator in BimWalk: ' + configuration);
            return undefined;
        }

        return this.configuration[configuration];
    };

    /**
     *
     *
     */
    proto.activate = function() {

    };

    /**
     *
     *
     */
    proto.deactivate = function() {

    };

    /**
     *
     *
     */
    proto.getCursor = function() {

        // Default.
        return null;
    }

    /**
     *
     * @returns {THREE.Vector3}
     */
    proto.getVelocity = function() {

        return this.velocity;
    };

    /**
     *
     * @returns {THREE.Vector3}
     */
    proto.getAngularVelocity = function() {

        return this.angularVelocity;
    };

    /**
     * 
     * @returns {Number}
     */
    proto.getMinPitchLimit = function() {

        return THREE.Math.degToRad(5);
    }

    /**
     * 
     * @returns {Number}
     */
    proto.getMaxPitchLimit = function() {

        return THREE.Math.degToRad(85);
    }

    /**
     *
     * @param elapsed
     * @param camera
     * @param updateNumber
     * @param updatesCount
     */
    proto.update = function(elapsed, camera, updateNumber, updatesCount) {

    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleGesture = function(event) {

        return false;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleButtonDown = function(event, button) {

        return false;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleButtonUp = function(event, button) {

        return false;
    };
    
    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleMouseClick = function(event, button) {

        return false;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleMouseDoubleClick = function(event, button) {
        
        return false;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleMouseMove = function(event) {

        return false;
    };

    /**
     *
     * @param event
     * @param keyCode
     * @returns {boolean}
     */
    proto.handleKeyDown = function(event, keyCode) {

        return true;
    };

    /**
     *
     * @param event
     * @param keyCode
     * @returns {boolean}
     */
    proto.handleKeyUp = function(event, keyCode) {

        return true;
    };

    /**
     *
     * @param delta
     * @returns {boolean}
     */
    proto.handleWheelInput = function(delta) {

        return false;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleSingleTap = function(event) {

        return false;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleDoubleTap = function(event) {

        return false;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleBlur = function(event) {

        return false;
    };

    Autodesk.Viewing.Extensions.BimWalk.Navigator = Navigator;
}());

(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk');
    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;

    var EPSILON = 0.0001;
    var temporalMousePosition = {x: 0, y: 0};

    /**
     *
     * @constructor
     */
    function NavigatorSimple(tool) {

        BimWalk.Navigator.call(this, tool);

        // Set initial configurable values.
        this.configuration = {

            // Walk and run.
            minWalkSpeed: 2,
            maxWalkSpeed: 6,
            topWalkSpeed: 4,
            minRunSpeed: 4,
            maxRunSpeed: 12,
            runMultiplier: 2,

            // Walk with mouse.
            mouseWalkMaxTargetDistance: 2,
            mouseWalkStopDuration: 0.5,

            // Vertical movement with mouse.
            topVerticalSpeed: 2,
            topVerticalSpeedMultiplier: 1.5,
            allowVerticalSuspension: false,

            // Turning with keyboard.
            keyboardTopTurnSpeed: 1.5,
            keyboardTurnStopDuration: 0.75,

            // Turning with mouse.
            mouseTurnInverted: false,
            mouseTurnStopDuration: 0.2,
            mouseTurnMinPitchLimit: THREE.Math.degToRad(60), 
            mouseTurnMaxPitchLimit: THREE.Math.degToRad(120),

            // Teleport.
            teleportDuration: 0.5,
            teleportWallDistance: 1.0,

            cameraDistanceFromFloor: 1.8,
            minAllowedRoofDistance: 0.6,
            smallAllowedVerticalStep: 0.3,
            bigAllowedVerticalStep: 0.6,
            minFloorSidesLengthForBigVerticalStep: 5,

            gravityUpdatesBeforeFalling: 10,
            gravityAcceleration: 9.8,
            gravityTopFallSpeed: 10
        };

        this.modelToMeters = 1;
        this.metersToModel = 1;

        this.keys = Autodesk.Viewing.theHotkeyManager.KEYCODES;
        this.mousePosition = new THREE.Vector2(0, 0);

        // Keyboard displacement
        this.moveForward = 0;
        this.moveBackward = 0;
        this.moveLeft = 0;
        this.moveRight = 0;

        this.moveKeyboardVelocity = new THREE.Vector3();

        // Mouse displacement.
        this.moveMouseTargetDistance = 0;
        this.moveMouseLastWheelDelta = 0;
        this.moveMouseVelocity = new THREE.Vector3();
        this.moveMouseLastVelocity = new THREE.Vector3();

        // Turn with rotations.
        this.turningWithMouse = false;
        this.turnMouseDelta = new THREE.Vector3();
        this.turnMouseLastVelocity = new THREE.Vector3();

        // Turn with Keyboard.
        this.turnLeft = 0;
        this.turnRight = 0;

        this.angularKeyboardVelocity = new THREE.Vector3();
        this.angularMouseVelocity = new THREE.Vector3();

        // Between floors displacement.
        this.moveUp = 0;
        this.moveDown = 0;

        this.moveUpDownKeyboardVelocity = new THREE.Vector3();

        // Gravity displacement.
        this.gravityEnabled = true;

        this.userOverFloor = false;
        this.gravityVelocity = new THREE.Vector3();
        this.updatesToStartFalling = 0;

        // Teleport.
        this.teleporting = false;
        this.teleportInitial = new THREE.Vector3();
        this.teleportTarget = new THREE.Vector3();

        this.teleportTime = 0;
        this.teleportVelocity = new THREE.Vector3();
        this.teleportedDistance = 0;

        this.ui = new BimWalk.UI.NavigatorSimple(this);
    }

    NavigatorSimple.prototype = Object.create(BimWalk.Navigator.prototype);
    NavigatorSimple.prototype.constructor = BimWalk;

    var proto = NavigatorSimple.prototype;

    /**
     *
     * @param configuration
     * @param value
     * @returns {boolean}
     */
    proto.set = function(configuration, value) {

        var result = BimWalk.Navigator.prototype.set.call(this, configuration, value);
        
        // Ensure top walk speed stays in it's limits.
        var minWalkSpeed = this.get('minWalkSpeed');
        var maxWalkSpeed = this.get('maxWalkSpeed');

        this.configuration.topWalkSpeed = Math.min(Math.max(
            this.configuration.topWalkSpeed, minWalkSpeed), maxWalkSpeed);
        return result;
    }

    /**
     *
     * @param configuration
     * @param value
     * @returns {boolean}
     */
    proto.getTopRunSpeed = function() {

        var minRunSpeed = this.get('minRunSpeed');
        var maxRunSpeed = this.get('maxRunSpeed');

        var speed = this.get('topWalkSpeed') * this.get('runMultiplier');
        return Math.min(Math.max(speed, minRunSpeed, maxRunSpeed));
    };

    /**
     * 
     * @returns {Number}
     */
    proto.getMinPitchLimit = function() {

        return this.get('mouseTurnMinPitchLimit');
    }

    /**
     * 
     * @returns {Number}
     */
    proto.getMaxPitchLimit = function() {

        return this.get('mouseTurnMaxPitchLimit');
    }

    /**
     *
     *
     */
    proto.activate = function() {

        this.metersToModel = BimWalk.metersToModel(1, this.viewer);
        this.modelToMeters = 1 / this.metersToModel;
        this.userOverFloor = false;

        this.ui.activate();
    };

    /**
     *
     *
     */
    proto.deactivate = function() {

        this.ui.deactivate();
    };

    /**
     *
     *
     */
    proto.enableGravity = function(enable) {

        if (this.gravityEnabled === enable) {
            return;
        }

        this.gravityEnabled = enable;
        this.gravityVelocity.set(0,0,0);
        this.userOverFloor = false;
        this.updatesToStartFalling = Number.MAX_VALUE;
    }

    /**
     *
     * @param elapsed
     * @param camera
     * @param updateNumber
     * @param updatesCount
     */
    proto.update = function(elapsed, camera, updateNumber, updatesCount) {

        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);

        if (this.ui.isDialogOpen && this.ui.isDialogOpen()) {
            return;
        }

        if (this.viewer.autocam.currentlyAnimating) {
            this.userOverFloor = false;
            this.updatesToStartFalling = this.get('gravityUpdatesBeforeFalling')
            return;
        }

        if (this.teleporting) {

            // Update displacement velocity.
            this.updateTeleportDisplacement(elapsed);
            this.velocity.add(this.teleportVelocity);
         } else {

            // Update displacement velocity.
            this.updateKeyboardUpDownDisplacement(elapsed);
          
            this.updateGravityDisplacement(elapsed, camera, updateNumber, updatesCount);

            this.updateKeyboardDisplacement(elapsed);
            this.updateMouseDisplacement(elapsed);

            this.velocity.add(this.gravityVelocity);
            this.velocity.add(this.moveUpDownKeyboardVelocity);
            this.velocity.add(this.moveKeyboardVelocity);
            this.velocity.add(this.moveMouseVelocity);

            // Update angular velocity.
            this.updateKeyboardAngularVelocity(elapsed);
            this.updateMouseAngularVelocity(elapsed);

            this.angularVelocity.add(this.angularKeyboardVelocity);
            this.angularVelocity.add(this.angularMouseVelocity);
        }
    };

    /**
     *
     * @param elapsed
     */
    proto.updateTeleportDisplacement = function(elapsed) {

        var initial = this.teleportInitial;
        var target = this.teleportTarget;  
        var duration = this.get('teleportDuration');
        var velocity = this.teleportVelocity; 

        this.teleportTime = Math.min(duration, this.teleportTime + elapsed);
        var lerp = BimWalk.easeInOutQuad(this.teleportTime , 0, 1, duration);

        var newDisplacement = initial.distanceTo(target) * lerp;
        var oldDisplacement = this.teleportedDistance;

        this.teleportedDistance = newDisplacement;

        if (lerp === 1) {

            this.teleporting = false;
            this.teleportTime = 0; 
            this.teleportedDistance = 0;  
        }

        velocity.copy(target);
        velocity.sub(initial).normalize();
        velocity.multiplyScalar((newDisplacement - oldDisplacement) * this.modelToMeters / elapsed);
    }

    proto.updateGravityDisplacement = function(elapsed, camera, updateNumber, updatesCount) {

        var viewer = this.viewer;
        var worldDown = BimWalk.getTempVector(camera.worldup).multiplyScalar(-1);
        var velocity = this.gravityVelocity;
        var onFloor = this.userOverFloor;

        // It's assumed the user is still over a floor if it was during the previous frame and he didn't move.
        this.userOverFloor =
            this.userOverFloor &&
            this.moveMouseVelocity.lengthSq() === 0 &&
            this.moveKeyboardVelocity.lengthSq() === 0 &&
            this.moveUpDownKeyboardVelocity.lengthSq() === 0;

        if(!this.gravityEnabled) {
            return;
        }

        if (this.userOverFloor) {

            // Position is not updated by the navigator, we stop movement at the beginning of the next frame
            // the floor was found and the user was moved over it.
            velocity.set(0,0,0);
            return;
        }

        // Get floor candidates.
        var candidates = [];
        var obstacles = [];
        var metersToModel = this.metersToModel;
        var cameraDistanceFromFloor = this.get('cameraDistanceFromFloor');
        var minAllowedRoofDistance = this.get('minAllowedRoofDistance');
        var smallAllowedVerticalStep = this.get('smallAllowedVerticalStep');
        var bigAllowedVerticalStep = this.get('bigAllowedVerticalStep');
        var minFloorSidesLengthForBigVerticalStep = this.get('minFloorSidesLengthForBigVerticalStep');

        var bestCandidateIndex = BimWalk.getFloorCandidates(
            camera.position,
            cameraDistanceFromFloor * metersToModel,
            minAllowedRoofDistance * metersToModel,
            smallAllowedVerticalStep * metersToModel,
            bigAllowedVerticalStep * metersToModel,
            minFloorSidesLengthForBigVerticalStep * metersToModel,
            viewer,
            candidates,
            obstacles);

        // There is no floor, so there is no falling at all, keeping same camera height.
        if (bestCandidateIndex === -1 || obstacles.length > 0) {    
            velocity.set(0,0,0);
            return;
        }

        // Fall into the floor or stay over it if distance is less that epsilon.
        var candidate = candidates[bestCandidateIndex];
        var candidateDistance = candidate.point.distanceTo(camera.position) * this.modelToMeters;
        var deltaFeetToCandidate = candidateDistance - cameraDistanceFromFloor;

        if (deltaFeetToCandidate < EPSILON || Math.abs(deltaFeetToCandidate) < smallAllowedVerticalStep) {

            velocity.copy(worldDown).multiplyScalar(deltaFeetToCandidate/elapsed);
            this.userOverFloor = true;
            this.updatesToStartFalling = 0;
        } else {

            if (this.updatesToStartFalling++ < this.get('gravityUpdatesBeforeFalling')) {
                return;
            }

            var acceleration = this.get('gravityAcceleration');
            var topFallSpeed = this.get('gravityTopFallSpeed');
            var speed = Math.min(topFallSpeed, velocity.length() + acceleration * elapsed);

            velocity.copy(worldDown.multiplyScalar(speed));
        }
    }

    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardUpDownDisplacement = function(elapsed) {

        var tool = this.tool;
        var running = this.running;

        var moveUp = this.moveUp;
        var moveDown = this.moveDown;

        // Update acceleration.
        var topSpeed = this.get('topVerticalSpeed') * (running ? this.get('topVerticalSpeedMultiplier') : 1);
        var velocity = this.moveUpDownKeyboardVelocity;
        var acceleration = BimWalk.getTempVector();
        var accelerationModule = topSpeed / 1;

        var moving = moveUp !== 0 || moveDown !== 0;
        var suspendMoving = this.get('allowVerticalSuspension') && this.moveKeyboardVelocity.lengthSq() > 0;

        if (moving && !suspendMoving) {

            var upVector = tool.camera.worldup;
            var speed = velocity.length();

            var directionUp = BimWalk.getTempVector(upVector);
            var directionDown = BimWalk.getTempVector(upVector).multiplyScalar(-1);

            acceleration.add(directionUp.multiplyScalar(moveUp));
            acceleration.add(directionDown.multiplyScalar(moveDown));
            acceleration.normalize();

            velocity.copy(acceleration).multiplyScalar(speed);
            acceleration.multiplyScalar(accelerationModule);
        } else {

            velocity.set(0,0,0);
        }

        this.enableGravity(!moving);

        // Decelerate if stop running.
        var deceleration = BimWalk.getTempVector();
        if(!running && velocity.lengthSq() > topSpeed * topSpeed) {

            deceleration.copy(velocity).normalize();
            deceleration.multiplyScalar(-this.getTopRunSpeed()/ 1);

            acceleration.copy(deceleration);
        }

        // Update velocity.
        var frictionPresent = false;
        var clampToTopSpeed = deceleration.lengthSq() === 0;
        BimWalk.updateVelocity(elapsed, acceleration, topSpeed, clampToTopSpeed, frictionPresent, velocity);
    }

    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardDisplacement = function(elapsed) {

        var tool = this.tool;
        var running = this.running;

        var moveForward = this.moveForward;
        var moveBackward = this.moveBackward;
        var moveLeft = this.moveLeft;
        var moveRight = this.moveRight;

        // Update acceleration.
        var topSpeed = running ? this.getTopRunSpeed() : this.get('topWalkSpeed');
        var velocity = this.moveKeyboardVelocity;
        var acceleration = BimWalk.getTempVector();
        var accelerationModule = topSpeed / 1;

        var moving = (
            moveForward !== 0 ||
            moveBackward !== 0 ||
            moveLeft !== 0 ||
            moveRight !== 0);

        if (moving) {

            var camera = this.tool.camera;
            var upVector = camera.worldup;
            var speed = velocity.length();

            var directionForward = BimWalk.getForward(camera);
            var directionForwardXZ = BimWalk.getTempVector(directionForward);
            directionForwardXZ.sub(BimWalk.getTempVector(upVector).multiplyScalar(upVector.dot(directionForward)));
            directionForwardXZ.normalize();

            var directionRight = BimWalk.getTempVector(directionForward).cross(upVector).normalize();
            var directionRightXZ = BimWalk.getTempVector(directionRight);
            directionRightXZ.sub(BimWalk.getTempVector(upVector).multiplyScalar(upVector.dot(directionRight)));
            directionRightXZ.normalize();

            var directionBackwardXZ = BimWalk.getTempVector(directionForwardXZ).multiplyScalar(-1);
            var directionLeftXZ = BimWalk.getTempVector(directionRight).multiplyScalar(-1);

            acceleration.add(directionForwardXZ.multiplyScalar(moveForward));
            acceleration.add(directionBackwardXZ.multiplyScalar(moveBackward));
            acceleration.add(directionRightXZ.multiplyScalar(moveRight));
            acceleration.add(directionLeftXZ.multiplyScalar(moveLeft));
            acceleration.normalize();

            velocity.copy(acceleration).multiplyScalar(speed);
            acceleration.multiplyScalar(accelerationModule);
        }

        // Decelerate if stop running.
        var deceleration = BimWalk.getTempVector();
        if(!running && velocity.lengthSq() > topSpeed * topSpeed) {

            deceleration.copy(velocity).normalize();
            deceleration.multiplyScalar(-this.getTopRunSpeed()/ 1);

            acceleration.copy(deceleration);
        }

        // Update friction contribution.
        var frictionPresent = !moving && BimWalk.updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        var clampToTopSpeed = deceleration.lengthSq() === 0;
        BimWalk.updateVelocity(elapsed, acceleration, topSpeed, clampToTopSpeed, frictionPresent, velocity);
    }

    /**
     *
     * @param elapsed
     */
    proto.updateMouseDisplacement = function(elapsed) {

        var topSpeed = this.getTopRunSpeed();
        var target = this.moveMouseTargetDistance;
        var velocity = this.moveMouseVelocity;
        var acceleration = BimWalk.getTempVector();
        var moving = this.moveMouseTargetDistance !== 0;
        var accelerationModule =
            (moving ? topSpeed : this.moveMouseLastVelocity.length()) / this.get('mouseWalkStopDuration');

        // Update acceleration module.
        if (moving) {

            var camera = this.tool.camera;
            var upVector = camera.worldup;

            var direction = BimWalk.getTempVector(BimWalk.getForward(camera));
            direction.sub(BimWalk.getTempVector(upVector).multiplyScalar(upVector.dot(direction)));
            direction.normalize();

            if (target > 0) {
                direction.multiplyScalar(-1);
            }

            var speed = velocity.length() + accelerationModule * elapsed;
            velocity.copy(direction.multiplyScalar(speed));

            this.moveMouseLastVelocity.copy(velocity);
        }

        // Update friction contribution.
        var frictionPresent = !moving && BimWalk.updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        BimWalk.updateVelocity(elapsed, acceleration, topSpeed, true, frictionPresent, velocity);

        // Update distance traveled.
        if (moving) {
            var displacement = velocity.length() * elapsed;
            this.moveMouseTargetDistance += target < 0 ? displacement :-displacement;
            if (this.moveMouseTargetDistance * target < 0) {
                this.moveMouseTargetDistance = 0;
            }
        }
    }

    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardAngularVelocity = function(elapsed) {

        var topSpeed = this.get('keyboardTopTurnSpeed');
        var stopDuration = this.get('keyboardTurnStopDuration');
        var velocity = this.angularKeyboardVelocity;
        var acceleration = BimWalk.getTempVector();
        var accelerationModule = topSpeed / stopDuration;

        // Update angular acceleration.
        var turning = this.turnLeft !== 0 || this.turnRight !== 0;
        if (turning) {

            var speed = Math.min(topSpeed, velocity.length() + accelerationModule * elapsed);
    
            velocity.y = 0; 
            velocity.y -= this.turnLeft;
            velocity.y += this.turnRight;

            velocity.normalize().multiplyScalar(speed);
        }

        // Update friction contribution.
        var friction = !turning && BimWalk.updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        BimWalk.updateVelocity(elapsed, acceleration, topSpeed, true, friction, velocity);
    };

     /**
     *
     * @param elapsed
     */
    proto.updateMouseAngularVelocity = function(elapsed) {

        var stopDuration = this.get('mouseTurnStopDuration');
        var velocity = this.angularMouseVelocity;
        var acceleration = BimWalk.getTempVector();
        var accelerationModule = this.turnMouseLastVelocity.length() / stopDuration;

        // Update mouse angular acceleration.
        var camera = this.tool.camera;
        var delta = this.turnMouseDelta;
        var turning = delta.lengthSq() > 0;

        if (turning) {

            var MAGIC_NUMBER = 1 / (this.get('mouseTurnInverted') ? 800 : 200);

            var dx = -delta.y * MAGIC_NUMBER;
            var dy = -delta.x * MAGIC_NUMBER;

            delta.set(0,0,0);

            // Average velocity with previous one.
            velocity.add(BimWalk.getTempVector().set(dx/elapsed, dy/elapsed, 0));
            velocity.multiplyScalar(0.5);

            this.turnMouseLastVelocity.copy(velocity);
        }

        // Update friction contribution.
        var friction = !turning && BimWalk.updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        BimWalk.updateVelocity(elapsed, acceleration, 0, false, friction, velocity);
    }

    /**
     *
     *
     */
    proto.getCursor = function () {

        if (Autodesk.Viewing.isIE11) {
            return null; // Custom cursors don't work in MS platforms, so we set the default one.
        }

        if (this.get('mouseTurnInverted')) {

            if (this.turningWithMouse) {
                return 'url(data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAcAAAAHgAAABwAAAAJAAAAAQAAABQAAAAbAQEBBwEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8ACAgIfD4+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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////////////////////////wB///8Af//+AH///AB///gAP//4AB//8AAf//AAH//wAB//8AAf//wAH//8AB///AA//h+A//4f///+D////gf///4D///+A////wP///////////////////////////////////////8=), auto';
            } else {
                return 'url(data:image/x-icon;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////8AP///AD///wA///4AP//8AB///AAP//gAD//wAA//8AAP//AAB//wAAf/8AAH//wAB//4AAf/+AA//wwAf/8OQv//B+f//wP///8B////Af///4H//////////////////////////////////8=), auto';
            }
        } else {
            return "url(data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAP//////////////////////////////////////////////////////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////////////////////////8AAAD/AAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////+P////j////4////+P////j////4////+P////j////4////+P////j////4////////AA+ABwAPgAcAD4AH///////4////+P////j////4////+P////j////4////+P////j////4////+P////j////////////8=) 16 16, auto";
        }
    };

    proto.ignoreInput = function() {

        return this.teleporting;
    }

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleButtonDown = function(event, button) {

        BimWalk.getMousePosition(event, this.viewer, this.mousePosition);
        
        if (button === 0) {

            this.turningWithMouse = true;
            this.turnMouseDelta.set(0, 0, 0);
        }

        return true;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleButtonUp = function(event, button) {

        BimWalk.getMousePosition(event, this.viewer, this.mousePosition);

        if (button === 0) {
            this.turningWithMouse = false;
        }

        return true;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleMouseClick = function(event, button) {

        BimWalk.getMousePosition(event, this.viewer, this.mousePosition);
        return true;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleMouseDoubleClick = function(event, button) {

        var onFloorFound = function(intersection) {

            this.teleporting = true;
            this.teleportTime = 0;
        
            var camera = this.viewer.impl.camera;

            // Set intial position to current camera position.
            this.teleportInitial.copy(camera.position);

            // Set target position, collision plus camera's height.
            var cameraUp = BimWalk.getTempVector(camera.worldup);
            cameraUp.multiplyScalar(this.get('cameraDistanceFromFloor') * this.metersToModel);

            this.teleportTarget.copy(intersection.intersectPoint).add(cameraUp);

            // On floor teleport ends on the spot.
            this.teleportVelocity.set(0,0,0);
        }.bind(this);

        var onWallFound = function(intersection) {

            var viewer = this.viewer;
            var camera = this.viewer.impl.camera;
            var metersToModel = this.metersToModel;
            var cameraDistanceFromFloor = this.get('cameraDistanceFromFloor');
            var feetToCameraDelta = BimWalk.getTempVector(camera.worldup).multiplyScalar(cameraDistanceFromFloor * metersToModel);

            // Set intial position to current camera position.
            var initial = BimWalk.getTempVector(camera.position);

            // Set target position to collision displaced the teleport distance at floor level.
            var direction = BimWalk.getTempVector(intersection.intersectPoint);
            direction.sub(camera.position);
            BimWalk.setWorldUpComponent(camera, direction, 0).normalize();

            var target = BimWalk.getTempVector(intersection.intersectPoint);
            target.add(direction.multiplyScalar(this.get('teleportWallDistance') * metersToModel));
            target.add(feetToCameraDelta);

            // Get floor candidates.
            var candidates = [];
            var minAllowedRoofDistance = this.get('minAllowedRoofDistance');
            var bigAllowedVerticalStep = this.get('bigAllowedVerticalStep');
            var minFloorSidesLengthForBigVerticalStep = this.get('minFloorSidesLengthForBigVerticalStep');

            var bestCandidateIndex = BimWalk.getFloorCandidates(
                target,
                cameraDistanceFromFloor * metersToModel,
                minAllowedRoofDistance * metersToModel,
                0,
                bigAllowedVerticalStep * metersToModel,
                minFloorSidesLengthForBigVerticalStep * metersToModel,
                viewer,
                candidates);

            // There is no floor, so there is no falling at all, keeping same camera height.
            if (bestCandidateIndex === -1) {    
                return;
            }

            // Target is the best floor candidate displaced by the distance from floor.
            target.copy(candidates[bestCandidateIndex].point).add(feetToCameraDelta);

            this.teleporting = true;
            this.teleportTime = 0;
            this.teleportInitial.copy(initial);
            this.teleportTarget.copy(target);
        }.bind(this);

        var viewer = this.viewer;
        BimWalk.getMousePosition(event, viewer, this.mousePosition);

        var mousePosition = this.mousePosition;
        var viewerportPosition = viewer.impl.clientToViewport(mousePosition.x, mousePosition.y);
        var intersections = [];
        var camera = viewer.impl.camera;
        var worldUp = camera.worldup;

        // No intersection with geometry.
        var intersection = viewer.impl.castRayViewport(viewerportPosition, false, false, false);
        if (intersection && intersection.face) {

            var normal = intersection.face.normal.normalize();
            var cos = worldUp.dot(normal);

            if (BimWalk.isFloorIntersection(intersection, camera)) {
                onFloorFound(intersection);
            }

            if (BimWalk.isWallIntersection(intersection, camera)) {
                onWallFound(intersection);
            }
        }

        return true;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleMouseMove = function(event) {

        var prevMousePosition = this.mousePosition;
        var currMousePosition = temporalMousePosition;

        BimWalk.getMousePosition(event, this.viewer, currMousePosition);

        if (this.turningWithMouse) {

            if (this.get('mouseTurnInverted')) {
                this.turnMouseDelta.x += currMousePosition.x - prevMousePosition.x;
                this.turnMouseDelta.y += currMousePosition.y - prevMousePosition.y;
            } else {
                this.turnMouseDelta.x -= currMousePosition.x - prevMousePosition.x;
                this.turnMouseDelta.y -= currMousePosition.y - prevMousePosition.y;
            }
        }

        this.mousePosition.copy(currMousePosition);
        return true;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleGesture = function(event) {

        // Convert Hammer touch-event X,Y into mouse-event X,Y.
        if (event.pointers && event.pointers.length > 0) {
            event.pageX = event.pointers[0].pageX;
            event.pageY = event.pointers[0].pageY;
        }

        var handled = false;

        switch(event.type) {
            case "dragstart":
                // Single touch, fake the mouse for now...
                handled = this.handleButtonDown(event, 0);
                break;

            case "dragmove":
                handled = this.handleMouseMove(event);
                break;

            case "dragend":
                handled = this.handleButtonUp(event, 0);
                break;

            case "pinchstart":
                return true;
                
            case "pinchmove":
                return true;
                
            case "pinchend":
                return true;
        }

        return handled;
    };

    /**
     *
     * @param event
     * @param keyCode
     * @returns {boolean}
     */
    proto.handleKeyDown = function(event, keyCode) {

        var handled = true;        
        switch(keyCode) {
            case this.keys.SHIFT:
                this.running = true;
                break;

            case this.keys.DASH:
                var topSpeed = this.get('topWalkSpeed') - 1;
                this.tool.set('topWalkSpeed', topSpeed);
                break;

            case this.keys.EQUALS:
            case this.keys.PLUS:

            case this.keys.PLUSMOZ:
                var topSpeed = this.get('topWalkSpeed') + 1;
                this.tool.set('topWalkSpeed', topSpeed);
                break;

            case this.keys.CONTROL:
            case this.keys.ALT:
                break;

            case this.keys.SPACE:
                tool._isGravityEnabled = !tool._isGravityEnabled;
                break;

            case this.keys.UP:
            case this.keys.w:
                this.moveForward = 1.0;
                break;

            case this.keys.LEFT:
                this.turnLeft = 1.0;
                break;

            case this.keys.RIGHT:
                this.turnRight = 1.0;
                break;

            case this.keys.DOWN:
            case this.keys.s:
                this.moveBackward = 1.0;
                break;

            case this.keys.a:
                this.moveLeft = 1.0;
                break;

            case this.keys.d:
                this.moveRight = 1.0;
                break;

            case this.keys.e:
                this.moveUp = 1.0;
                break;

            case this.keys.q:
                this.moveDown = 1.0;
                break;

            default:
                handled = false;
                break;
        }

        this.running = event.shiftKey;
        if (this.ui.onKeyDown) {
            handled |= this.ui.onKeyDown(event, keyCode);

        }
        
        return handled;
    };

    /**
     *
     * @param event
     * @param keyCode
     * @returns {boolean}
     */
    proto.handleKeyUp = function(event, keyCode) {

        var moveToFloor = function() {
    
            var viewer = this.viewer;
            var camera = this.viewer.impl.camera;
            var metersToModel = this.metersToModel;
            var cameraDistanceFromFloor = this.get('cameraDistanceFromFloor');
            var feetToCameraDelta = BimWalk.getTempVector(camera.worldup).multiplyScalar(cameraDistanceFromFloor * metersToModel);

            // Set intial position to current camera position.
            var initial = BimWalk.getTempVector(camera.position);

            // Set target position to collision displaced the teleport distance at floor level.
            var direction = camera.worldup;

            var target = BimWalk.getTempVector(camera.position);
            target.add(BimWalk.getTempVector(camera.worldup).multiplyScalar(1.5 * metersToModel));

            // Get floor candidates.
            var candidates = [];
            var minAllowedRoofDistance = this.get('minAllowedRoofDistance');
            var bigAllowedVerticalStep = this.get('bigAllowedVerticalStep');
            var minFloorSidesLengthForBigVerticalStep = this.get('minFloorSidesLengthForBigVerticalStep');

            var bestCandidateIndex = BimWalk.getFloorCandidates(
                target,
                cameraDistanceFromFloor * metersToModel,
                Number.MAX_SAFE_INTEGER,
                0,
                0,
                minFloorSidesLengthForBigVerticalStep * metersToModel,
                viewer,
                candidates);

            // There is no floor, so there is no falling at all, keeping same camera height.
            if (bestCandidateIndex === -1) {    
                return;
            }

            // Target is the best floor candidate displaced by the distance from floor.
            target.copy(candidates[bestCandidateIndex].point).add(feetToCameraDelta);

            this.teleporting = true;
            this.teleportTime = 0;
            this.teleportInitial.copy(initial);
            this.teleportTarget.copy(target);
        }.bind(this);

        var handled = true;
        var moveUp = this.moveUp;
        var moveDown = this.moveDown;

        switch(keyCode) {

            case this.keys.SHIFT:
                this.running = false;
                break;

            case this.keys.CONTROL:
            case this.keys.ALT:
                break;

            case this.keys.SPACE:
                break;

            case this.keys.UP:
            case this.keys.w:
                this.moveForward = 0;
                break;

            case this.keys.LEFT:
                this.turnLeft = 0;
                break;

            case this.keys.RIGHT:
                this.turnRight = 0;
                break;

            case this.keys.DOWN:
            case this.keys.s:
                this.moveBackward = 0;
                break;

            case this.keys.a:
                this.moveLeft = 0;
                break;

            case this.keys.d:
                this.moveRight = 0;
                break;

            case this.keys.e:
                this.moveUp = 0;
                break;

            case this.keys.q:
                this.moveDown = 0;
                break;

            default:
                handled = false;
                break;
        }

        if (this.moveUp === 0 && this.moveDown === 0 && (this.moveUp !== moveUp || this.moveDown !== moveDown)) {
            moveToFloor();
        }

        this.running = event.shiftKey;
        return handled;
    };

    /**
     *
     * @param delta
     * @returns {boolean}
     */
    proto.handleWheelInput = function(delta) {

        // If user changes wheel direction, target distance switches directions.
        if (this.tool.navapi.getReverseZoomDirection()) {
            delta *= -1;
        }

        // Add delta to target distance until filling the maximum allowed.
        var curTargetDistance = this.moveMouseTargetDistance;
        var maxTargetDistance = this.get('mouseWalkMaxTargetDistance');
    
        var MAGIC_NUMBER = 0.5;
        var target = Math.min(maxTargetDistance, Math.abs(curTargetDistance + delta * MAGIC_NUMBER)) * (delta > 0 ? 1 : -1);

        this.moveMouseTargetDistance = target;
        return true;
    };

    /**
     *
     * @param event
     * @param button
     * @returns {boolean}
     */
    proto.handleSingleClick = function(event, button) {

        return true;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleSingleTap = function(event) {

        return true;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleDoubleTap = function(event) {

        return true;
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleBlur = function(event) {

        // Reset things when we lose focus...
        this.moveForward = this.moveBackward = 0;
        this.moveLeft = this.moveRight = 0;
        this.moveUp = this.moveDown = 0;

        return false;
    };

    BimWalk.NavigatorSimple = NavigatorSimple;
}());

(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk');

    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;
    var AutodeskViewing = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;

    /**
     * First Person navigation tool, similar to those found in videogames.
     *
     * It will also replace the default walk tool button when {@link Autodesk.Viewing.GuiViewer3D} is present.
     * @constructor
     * @extends {Autodesk.Viewing.Extension}
     * @param {Autodesk.Viewing.Viewer3D} viewer - Viewer instance.
     * @param {object} options - Not used.
     * @category Extensions
     */
    function BimWalkExtension(viewer, options) {

        Autodesk.Viewing.Extension.call(this, viewer, options);
        this.options = options;
    }

    BimWalkExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    BimWalkExtension.prototype.constructor = BimWalkExtension;

    var proto = BimWalkExtension.prototype;
    /**
     *
     * @returns {boolean}
     */
    proto.load = function() {

        var self = this;
        var viewer = this.viewer;
        var avu = Autodesk.Viewing.UI;

        // Register tool
        this.tool = new Autodesk.Viewing.Extensions.BimWalk.BimWalkTool(viewer, this.options);
        viewer.toolController.registerTool(this.tool);

        // Add the ui to the viewer.
        createUI(this);

        // Register listeners
        this.onToolChanged = function (e) {
            if (e.toolName.indexOf('bimwalk') === -1) {
                return;
            }
            if (self.bimWalkToolButton) {
                var state = e.active ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE;
                self.bimWalkToolButton.setState(state);
            }
        };

        viewer.addEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChanged);
        return true;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.unload = function() {

        var viewer = this.viewer;

        // Remove listeners
        viewer.removeEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChanged);
        this.onToolChanged = undefined;

        // Remove hotkey
        Autodesk.Viewing.theHotkeyManager.popHotkeys(this.HOTKEYS_ID);

        // Remove the UI
        if (this.bimWalkToolButton) {
            var toolbar = viewer.getToolbar(false);
            if (toolbar) {
                toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID).removeControl(this.bimWalkToolButton.getId());
            }
            this.bimWalkToolButton = null;
        }

        //Uh, why does the viewer need to keep track of this in addition to the tool stack?
        if (viewer.getActiveNavigationTool() == this.tool.getName())
            viewer.setActiveNavigationTool();

        // Deregister tool
        viewer.toolController.deregisterTool(this.tool);
        this.tool = null;

        return true;
    };

    proto.set = function(configuration, value) {

        if (this.tool.set(configuration, value)) {
            avp.logger.log('BimWalk ' + configuration + ' was set to: ' + this.tool.get(configuration));
        }
    };

    proto.get = function(configuration) {

        return this.tool.get(configuration);
    };

    proto.setJoystickPosition = function(x, y) {

        this.tool.setJoystickPosition(x, y);
    };

    proto.setJoystickSize = function(backgroundRadius, handleRadius) {
        
        this.tool.setJoystickSize(backgroundRadius, handleRadius);
    };

    /**
     *
     * @param extension
     */
    function createUI(extension) {

        var viewer = extension.viewer;
        if (!viewer.getToolbar) {
            return; // Adds support for Viewer3D instance
        }

        var avu = Autodesk.Viewing.UI;
        var toolbar = viewer.getToolbar(true);
        var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);

        // Create a button for the tool.
        extension.bimWalkToolButton = new avu.Button('toolbar-BimWalkTool');
        extension.bimWalkToolButton.setToolTip('New First Person');
        extension.bimWalkToolButton.onClick = function(e) {
            var state = extension.bimWalkToolButton.getState();
            if (state === avu.Button.State.INACTIVE) {
                viewer.setActiveNavigationTool("bimwalk");
            } else if (state === avu.Button.State.ACTIVE) {
                viewer.setActiveNavigationTool();
            }
        };
        extension.bimWalkToolButton.setIcon("adsk-icon-first-person");

        var cameraSubmenuTool = navTools.getControl('toolbar-cameraSubmenuTool');
        if (cameraSubmenuTool) {
            navTools.addControl(extension.bimWalkToolButton, {index: navTools.indexOf(cameraSubmenuTool.getId())});
        } else {
            navTools.addControl(extension.bimWalkToolButton);
        }
    }

    Autodesk.Viewing.Extensions.BimWalk.BimWalkExtension = BimWalkExtension;
    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.BimWalk', BimWalkExtension);
})();

(function() {

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk');
    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;

    // Extension made lot of vector operations,
    // temporal vectors are created to not generate much garbage to be collected.

    var temporalVectorSize = 128;
    var temporalVectors = [];
    var temporalVectorsIndex = 0;
    var zero = {x: 0, y: 0, z: 0};

    /**
     * Gets a vector initialized with values or source using a simple pool of temporal intermediate math results objects.
     * Idea is to not make trash for garbage collection.
     * @param source
     * @returns {THREE.Vector3}
     */
    BimWalk.getTempVector = function(source) {

        // Initialize temporal vectors.
        for (var i = temporalVectors.length; i < temporalVectorSize; ++i) {
            temporalVectors.push(new THREE.Vector3());
        }

        source = source || zero;

        if (temporalVectorsIndex < temporalVectorSize) {
            return temporalVectors[temporalVectorsIndex++].copy(source);
        }

        Autodesk.Viewing.Private.logger.warn('Vector pool in Autodesk.Viewing.Extensions.BimWalk reached maximum size');
        return new THREE.Vector3().copy(source);
    }

    /**
     * Free vectors acquired from the pool with getTempVector.
     * @param vector
     */
    BimWalk.freeTempVectors = function() {

        temporalVectorsIndex = 0;
    }
})();
(function() {

    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;
    var AutodeskViewing = Autodesk.Viewing;

    AutodeskViewing.EVENT_BIMWALK_CONFIG_CHANGED = "EVENT_BIMWALK_CONFIG_CHANGED";

    /*
    * First Person View tool for LMV
    *
    * This tool provides a first person view with movement using the standard WASD keys
    * to forward/backward/left/right and the QE keys to move vertically.  The mouse or
    * cursor is used to orient the view.  Movement is always along or perpendicular to
    * the view direction.
    *
    * The SHIFT key may be used when moving to increase the speed.  Or the default
    * movement speed may be increased/decreased with the MINUS or EQUAL keys.  The
    * ZERO (0) will reset to the default speed values.
    *
    * @author Hans Kellner (Oct 2014)
    *
    */
    function BimWalkTool(viewer, options) {

        this.viewer = viewer;
        this.options = options || {};
        this.names = ["bimwalk"];
        this.navapi = viewer.navigation;
        this.camera = this.navapi.getCamera();
        this.active = false;
        this.clock = new THREE.Clock(true);
        this.restoreOthographic = false;

        Autodesk.Viewing.Private.injectCSS('extensions/BimWalk/BimWalk.css');
        this.navigator = Autodesk.Viewing.isMobileDevice() ? new BimWalk.NavigatorMobile(this) : new BimWalk.NavigatorSimple(this);
    };

    var proto = BimWalkTool.prototype;

    proto.set = function(configuration, value) {

        if(!this.navigator.set(configuration, value)) {
            return false;
        }

        // Value can differ from provided after navigation validations.
        value = this.navigator.get(configuration);
        
        // Fire config changed event.
        var event = {
            type: AutodeskViewing.EVENT_BIMWALK_CONFIG_CHANGED,
            data: {
                configuration: configuration,
                value: value
            }
        };
        
        this.viewer.fireEvent(event);
        return true;
    };

    proto.get = function(configuration) {

        if (configuration) {
            return this.navigator.get(configuration);
        }

        return this.navigator.configuration;
    };

    proto.isActive = function() {
    
        return this.active;
    };

    proto.activate = function(name) {

        this.active = true;

        this.clock.start();

        // Clear selection and rollover highlight.
        this.rolloverDisabled =  this.viewer.impl.rolloverDisabled;
        this.viewer.impl.disableRollover(true);
        this.viewer.clearSelection();

        // Switch to perspective
        this.restoreOthographic = !this.camera.isPerspective;
        this.navapi.toPerspective();

        // HACK: Place focus in canvas so we get key events.
        this.viewer.canvas.focus();
        this.navigator.activate();
    };

    proto.deactivate = function(name) {

        this.active = false;
        this.clock.stop();

        if (this.restoreOthographic) {
            this.navapi.toOrthographic();
        }

        if(!this.rolloverDisabled) {
            this.viewer.impl.disableRollover(false);
        }

        this.navigator.deactivate();
    };

    proto.update = function() {

        if(!this.active || !this.navapi.isActionEnabled('walk')) {
            return false;
        }

        // Returns delta time in seconds since previous call.
        var elapsed = this.clock.getDelta(); 

        // Update navigator using fixed time step (frame rate of viewer is very unpredictable).
        var FIX_DELTA = 1/30;
        var MAX_UPDATES = 15;

        var updateNumber = 0;
        var updatesCount = Math.min(Math.ceil(elapsed / FIX_DELTA) | 0, MAX_UPDATES);

        var navigator = this.navigator;
        var metersToModel = BimWalk.metersToModel(1, this.viewer);
        var localCam = this.camera.clone();
        var deltaPitch = 0;
        var deltaYaw = 0;

        for (var i = 0; i < updatesCount; ++i) {

            var delta = Math.min(elapsed, FIX_DELTA);
            elapsed -= FIX_DELTA;

            BimWalk.freeTempVectors();
            navigator.update(delta, localCam, updateNumber++, updatesCount);

            // Handle displacement changes.
            var deltaPosition = BimWalk.getTempVector(navigator.getVelocity()).multiplyScalar(delta);
            localCam.position.add(deltaPosition.multiplyScalar(metersToModel));

            // Handle rotation changes.
            var deltaRotation = BimWalk.getTempVector(navigator.getAngularVelocity()).multiplyScalar(delta);
            deltaPitch += deltaRotation.x;
            deltaYaw += deltaRotation.y;
        }

        BimWalk.freeTempVectors();

        var posChanged = (localCam.position.distanceToSquared(this.camera.position) !== 0);
        var forward = BimWalk.getTempVector(this.camera.target).sub(this.camera.position);
        var newTarget = BimWalk.getTempVector(localCam.position).add(forward);
        var targetChanged = (newTarget.distanceToSquared(this.camera.target) !== 0);

        // If position or target changed then update camera.
        if (posChanged || targetChanged) {

            this.navapi.setView(localCam.position, newTarget);
            this.navapi.orientCameraUp();
        }

        // From the Collaboration extension:
        //the "go home" call may change the camera back to ortho... and we can't do ortho while walking...
        //HACK: Really, the home view should be set once when launch the extension, then set it back.
        if(!this.camera.isPerspective) {
            console.log("Lost perspective mode: resetting view.");
            this.navapi.toPerspective();
        }

        // Handle look changes
        var directionFwd = BimWalk.getTempVector(this.camera.target).sub(this.camera.position);
        var directionRight = BimWalk.getTempVector(directionFwd).cross(this.camera.worldup).normalize();
        var angularVelocity = this.navigator.getAngularVelocity();

        if (deltaPitch !== 0) {

            var pitchQ = new THREE.Quaternion();
            pitchQ.setFromAxisAngle(directionRight, - deltaPitch);

            var dirFwdTmp = BimWalk.getTempVector(directionFwd);
            dirFwdTmp.applyQuaternion(pitchQ);

            var vertical = BimWalk.getTempVector(this.camera.worldup);
            var verticalAngle = dirFwdTmp.angleTo(vertical);

            // If new angle is within limits then update values; otherwise ignore
            var minPitchLimit = navigator.getMinPitchLimit();
            var maxPitchLimit = navigator.getMaxPitchLimit();

            if (verticalAngle >= minPitchLimit &&
                verticalAngle <= maxPitchLimit) {
                directionFwd.applyQuaternion(pitchQ);
                localCam.up.applyQuaternion(pitchQ);
            }
        }

        if (deltaYaw !== 0) {
     
            var yawQ = new THREE.Quaternion();
            yawQ.setFromAxisAngle(this.camera.worldup, - deltaYaw);
            directionFwd.applyQuaternion(yawQ);
            localCam.up.applyQuaternion(yawQ);
        }

        // Now calc new target location and if it changed.
        var newPosition = localCam.position;
        var posChanged = (newPosition.distanceToSquared(this.camera.position) !== 0);
        var newTarget = BimWalk.getTempVector(newPosition).add(directionFwd);

        //now fix newPosition for lockInPlane
        var targetChanged = (newTarget.distanceToSquared(this.camera.target) !== 0);
        // If position or target changed then update camera.
        if (posChanged || targetChanged) {
            this.navapi.setView(newPosition, newTarget);
            this.navapi.orientCameraUp();
        }

        return this.camera.dirty;
    };

    proto.getNames = function() {

        return this.names;
    };

    proto.getName = function() {

        return this.names[0];
    };

    proto.getCursor = function() {

        return this.navigator.getCursor();
    };

    proto.handleButtonDown = function(event, button) {

        return this.navigator.handleButtonDown(event, button);
    };

    proto.handleButtonUp = function(event, button) {

        return this.navigator.handleButtonUp(event, button);
    };

    proto.handleMouseMove = function(event) {

        return this.navigator.handleMouseMove(event);
    };

    proto.handleGesture = function(event) {

        return this.navigator.handleGesture(event);
    };

    proto.handleSingleClick = function(event, button) {

        return this.navigator.handleMouseClick(event, button);
    };

    proto.handleDoubleClick = function(event, button) {

        return this.navigator.handleMouseDoubleClick(event, button);
    };

    proto.handleKeyDown = function(event, keyCode) {

        return this.navigator.handleKeyDown(event, keyCode);
    };

    proto.handleKeyUp = function(event, keyCode) {

        return this.navigator.handleKeyUp(event, keyCode);
    };

    proto.handleWheelInput = function(delta) {

        return this.navigator.handleWheelInput(delta);
    };

    proto.handleSingleTap = function(event) {

        return this.handleSingleClick(event, 0);
    };

    proto.handleDoubleTap = function(event) {

        return this.navigator.handleMouseDoubleClick(event);
    };

    proto.handleBlur = function(event) {

        return this.navigator.handleBlur(event);
    };

    proto.setJoystickPosition = function(x, y) {

        if (this.joystick) {
            this.joystick.setJoystickPosition(x, y);    
        }
    };

    proto.setJoystickSize = function(backgroundRadius, handleRadius) {
    
        if (this.joystick) {
            this.joystick.setJoystickSize(backgroundRadius, handleRadius);
        }
    };

    BimWalk.BimWalkTool = BimWalkTool
})();
(function() {

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk');

    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;
    var tempBoundingBox = new Float32Array(6);
    var EPSILON = 0.0001;

    BimWalk.metersToModel = function(meters, viewer) {

        return Autodesk.Viewing.Private.convertUnits('meters', viewer.model.getUnitString(), 1, meters, 'default');
    };

    BimWalk.getMousePosition = function(event, viewer, position) {
 
        position.x = event.canvasX;
        position.y = event.canvasY;
    };

    BimWalk.getWorldPosition = function(x, y, viewer) {
        
        viewport = viewer.navigation.getScreenViewport();

        x /= viewport.width;
        y /= viewport.height;

        return viewer.navigation.getWorldPoint(x, y);
    };

    BimWalk.getWorldUpComponent = function(camera, vector) {

        // Assume up vector can be perfectly aligned to y or z axes.
        if (camera.worldup.y > camera.worldup.z) {
            return vector.y;
        } else {
            return vector.z;
        }
    }

    BimWalk.setWorldUpComponent = function(camera, vector, value) {

        // Assume up vector can be perfectly aligned to y or z axes.
        if (camera.worldup.y > camera.worldup.z) {
            vector.y = value;
        } else {
            vector.z = value;
        }

        return vector;
    }

    BimWalk.getSmallestFloorSide = function(intersection, camera, instanceTree) {

        var w = 0;
        var l = 0;

        instanceTree.getNodeBox(intersection.dbId, tempBoundingBox);
 
        // Assume up vector can be perfectly aligned to y or z axes.
        if (camera.worldup.y > camera.worldup.z) {
            w = Math.abs(tempBoundingBox[0] - tempBoundingBox[3]);
            l = Math.abs(tempBoundingBox[2] - tempBoundingBox[5]);
        } else {
            w = Math.abs(tempBoundingBox[0] - tempBoundingBox[3]);
            l = Math.abs(tempBoundingBox[1] - tempBoundingBox[4]);
        }

        return Math.min(w, l);
    }

    BimWalk.isFloorIntersection = function(intersection, camera) {

        if(!intersection.face) {
            return false;
        }

        var normal = intersection.face.normal;
        if (normal.lengthSq() > 1 + EPSILON) {
            normal.normalize();
        }

        var cos = camera.worldup.dot(normal);
        return cos >= 0.5;
    }

    BimWalk.isWallIntersection = function(intersection, camera) {

        if(!intersection.face) {
            return false;
        }

        var normal = intersection.face.normal;
        if (normal.lengthSq() > 1 + EPSILON) {
            normal.normalize();
        }

        var cos = camera.worldup.dot(normal);
        return cos >= 0.0 && cos <= 0.1;
    }

    BimWalk.getFloorCandidates = function(
        position,
        cameraDistanceFromFloor,
        minAllowedRoofDistance,
        smallAllowedVerticalStep,
        bigAllowedVerticalStep,
        minFloorSidesLengthForBigVerticalStep,
        viewer,
        candidates,
        obstacles) {

        var camera = viewer.impl.camera;
        var upVector = BimWalk.getTempVector(camera.worldup);

        // Search new floors with a ray downwards starting above the camera position at the maximum allowed roof distance.
        var rayOrigin = BimWalk.getTempVector(position).add(upVector.multiplyScalar(minAllowedRoofDistance));
        var rayDirection = BimWalk.getTempVector(upVector).multiplyScalar(-1);

        viewer.impl.rayIntersect(new THREE.Ray(rayOrigin, rayDirection), false, false, false, candidates);
        var candidatesCount = candidates.length;

        // If there are not collisions then return -1 (no best candidate index).
        if (candidatesCount === 0) {

            return -1;
        }

        // If we have just one candidate we take it as a floor only if it has the correct normal and it's below the previous camera position.
        if (candidatesCount === 1) {

            if(!BimWalk.isFloorIntersection(candidates[0], camera)) {
                
                return -1;
            }

            var allowedRoofDistanceSquared = minAllowedRoofDistance * minAllowedRoofDistance;
            if (candidates[0].point.distanceToSquared(position) < allowedRoofDistanceSquared) {

                return -1;
            }

            return 0;
        }

        // Search for the best candidate.
        var floorDistance = minAllowedRoofDistance + cameraDistanceFromFloor;
        var smallVerticalStepDistance = floorDistance - smallAllowedVerticalStep;
        var bigVerticalStepDistance = floorDistance - bigAllowedVerticalStep;

        var bestCandidate = -1;
        var feetDistanceSqured = cameraDistanceFromFloor + minAllowedRoofDistance;
        feetDistanceSqured *= feetDistanceSqured;

        var minDistance = Number.MAX_VALUE;
        var instanceTree = viewer.impl.model.getData().instanceTree;

        for (var i = 0; i < candidatesCount; ++i) {

            var candidate = candidates[i];

            // Walls are ignored completely, user goes through them, they are not roofs nor floors.
            if (BimWalk.isWallIntersection(candidate, camera)) {
                continue;
            }

            // Obstacles are geometries between the minimum roof distance and the big vertical step.
            if (obstacles &&
                candidate.distance > minAllowedRoofDistance &&
                candidate.distance < bigAllowedVerticalStep) {
                obstacles.push(candidate);
                continue;
            }

            // Geometry at maximum vertical step or lower is considered a roof if its slope is too steep to be considered a floor.
            if(!BimWalk.isFloorIntersection(candidate, camera)) {
                continue;
            }

            // Choose vertical step.
            var verticalStepDistance = smallVerticalStepDistance;

             // If the instance tree is still loading we use the bigger step (it's better to climb on a table than fall though a floor).
            if(!instanceTree) {
                verticalStepDistance = bigVerticalStepDistance;
            } else {
                
                var side = BimWalk.getSmallestFloorSide(candidate, camera, instanceTree);
                if (side > minFloorSidesLengthForBigVerticalStep) {
                    verticalStepDistance = bigVerticalStepDistance;
                }
            }

            // Check if candidate can be climbed.
            if (candidate.distance < verticalStepDistance) {
                continue;
            }

            // Best candidate is the one closer along the world up vector to the currenct camera position.
            var distance = Math.abs(
                BimWalk.getWorldUpComponent(camera, position),
                BimWalk.getWorldUpComponent(camera, candidate.point)
            );

            if (minDistance > distance) {
                minDistance = distance;
                bestCandidate = i;
            }
        }

        return bestCandidate;
    };

    BimWalk.easeInOutQuad = function(t, b, c, d) {

	    t /= d / 2;
	    if (t < 1){
            return c / 2 * t * t + b;
        } 
	    t--;
	    return -c / 2 * (t * (t- 2) - 1) + b;
    };

    BimWalk.easeInQuad = function (t, b, c, d) {

        t /= d;
	    return c*t*t + b;
    };

    // Calculate friction contribution to final accelerator vector.
    BimWalk.updateFriction = function(accelerationModule, velocity, acceleration) {

        var speedSquared = velocity.lengthSq();
        if (speedSquared > 0) {

            var friction = BimWalk.getTempVector();
            friction.copy(velocity).normalize().multiplyScalar(-1);

            // Hack friction factor.
            friction.multiplyScalar(accelerationModule * accelerationModule);
            acceleration.add(friction);
        }
        return speedSquared > 0;
    };

    // Calculate velocity contribution to velocity vector.
    BimWalk.updateVelocity = function(elapsed, acceleration, topSpeed, clampSpeed, friction, velocity) {

        var current = BimWalk.getTempVector(velocity);
        current.add(acceleration.multiplyScalar(elapsed));

        if (clampSpeed) {

            if (current.lengthSq() > topSpeed * topSpeed) {
                current.normalize();
                current.multiplyScalar(topSpeed);
            }
        }

        if (friction) {

            if (current.lengthSq() < EPSILON || current.dot(velocity) < 0) {
                current.set(0,0,0);
            }
        }

        velocity.copy(current);
    };

    BimWalk.getForward = function(camera) {

        return BimWalk.getTempVector(camera.target).sub(camera.position).normalize();
    };

})();
(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk');
    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;

    var temporalMousePosition = {x: 0, y: 0};
    var MOBILE_SPEED_FACTOR = 15.0;

    /**
     *
     * @constructor
     */
    function NavigatorMobile(tool) {

        BimWalk.NavigatorSimple.call(this, tool);

        this.configuration.keyboardTopTurnSpeed = 0.5;
        this.configuration.keyboardTurnStopDuration = 0.4;

        this.ui = new BimWalk.UI.NavigatorMobileJoystick(this.viewer, this, tool.options.joystickOptions);
    }

    NavigatorMobile.prototype = Object.create(BimWalk.NavigatorSimple.prototype);
    NavigatorMobile.prototype.constructor = BimWalk;

    var proto = NavigatorMobile.prototype;

    /**
     *
     */
    proto.activate = function() {

        this.ui.show();
    }

    /**
     *
     */
    proto.deactivate = function() {

        this.ui.hide();
    }

    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardDisplacement = function(elapsed) {

        var running = this.running;
        var moveForward = this.moveForward;
        var moveBackward = this.moveBackward;

        // Update acceleration.
        var topSpeed = running ? this.getTopRunSpeed() : this.get('topWalkSpeed');
        var velocity = this.moveKeyboardVelocity;
        var acceleration = BimWalk.getTempVector();
        var accelerationModule = topSpeed * MOBILE_SPEED_FACTOR;

        var moving = (
            moveForward !== 0 ||
            moveBackward !== 0);

        if (moving) {

            var camera = this.tool.camera;
            var upVector = camera.worldup;
            var speed = Math.max(this.moveForward, this.moveBackward);

            var directionForward = BimWalk.getForward(camera);
            var directionForwardXZ = BimWalk.getTempVector(directionForward);
            directionForwardXZ.sub(BimWalk.getTempVector(upVector).multiplyScalar(upVector.dot(directionForward)));
            directionForwardXZ.normalize();

            var directionBackwardXZ = BimWalk.getTempVector(directionForwardXZ).multiplyScalar(-1);

            acceleration.add(directionForwardXZ.multiplyScalar(moveForward));
            acceleration.add(directionBackwardXZ.multiplyScalar(moveBackward));
            acceleration.normalize();

            velocity.copy(acceleration).multiplyScalar(speed);
            acceleration.multiplyScalar(accelerationModule * Math.max(this.moveForward, this.moveBackward));
        }

        // Decelerate if stop running.
        var deceleration = BimWalk.getTempVector();
        if(!running && velocity.lengthSq() > topSpeed * topSpeed) {

            deceleration.copy(velocity).normalize();
            deceleration.multiplyScalar(-this.getTopRunSpeed()/ 1);

            acceleration.copy(deceleration);
        }

        // Update friction contribution.
        var frictionPresent = !moving && BimWalk.updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        var clampToTopSpeed = deceleration.lengthSq() === 0;
        BimWalk.updateVelocity(elapsed, acceleration, topSpeed, clampToTopSpeed, frictionPresent, velocity);
    }


    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardAngularVelocity = function(elapsed) {

        var topSpeed = this.get('keyboardTopTurnSpeed');
        var stopDuration = this.get('keyboardTurnStopDuration');
        var velocity = this.angularKeyboardVelocity;
        var acceleration = BimWalk.getTempVector();
        var accelerationModule = topSpeed / stopDuration;
        var turning = this.turningWithKeyboard;


        // Update angular acceleration.
        if (turning) {

            var speed = Math.min(topSpeed, Math.max(this.moveLeft, this.moveRight) + accelerationModule * elapsed);
    
            velocity.y = 0; 
            velocity.y -= this.moveLeft;
            velocity.y += this.moveRight;

            velocity.normalize().multiplyScalar(speed);
        }

        // Update friction contribution.
        var friction = !turning && BimWalk.updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        BimWalk.updateVelocity(elapsed, acceleration, topSpeed, true, friction, velocity);
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleMouseMove = function(event) {

        var prevMousePosition = this.mousePosition;
        var currMousePosition = temporalMousePosition;

        BimWalk.getMousePosition(event, this.viewer, currMousePosition);

        if (this.turningWithMouse) {

            this.turnMouseDelta.x -= (currMousePosition.x - prevMousePosition.x);
            this.turnMouseDelta.y -= (currMousePosition.y - prevMousePosition.y);
        }

        this.mousePosition.copy(currMousePosition);
        return true;
    };

    BimWalk.NavigatorMobile = NavigatorMobile;
}());

(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk.UI');
    Autodesk.Viewing.Extensions.BimWalk.UI.NavigatorMobileJoystick = function(viewer, navigator, options) {

        var _viewer = viewer;
        var _navigator = navigator;
        var _options = options || {};

        var _joystickContainer = null;
        var _joystickHandle = null;
        var _joystickBackCircle = null;
        
        var _backCircleRadius = _options.backCircleRadius || 72;
        var _frontCircleRadius = _options.frontCircleRadius || 36;
        var _offsetFromCornerRatio = _options.offsetFromCornerRatio || 8;
        var _threshold = _options.threshold || 0.1;
        var _joystickCenter = null;
        
        var _isDragging = false;

        _navigator.reverseDrag = -1;

        this.updateJoystickHandlePosition = function(x, y) {
            var v = new THREE.Vector2(x - _joystickCenter.x, y - _joystickCenter.y);
            var length = Math.min(v.length(), _backCircleRadius);
            v.normalize();
            v.multiplyScalar(length);
            v.add(_joystickCenter);

            _joystickHandle.style.left = v.x - _frontCircleRadius + 'px';
            _joystickHandle.style.top = v.y - _frontCircleRadius + 'px';

            return v;
        };

        this.changeJoystickColor = function(isFocused) {
            if (isFocused) {
                _joystickHandle.classList.toggle('focus', true);
                _joystickBackCircle.classList.toggle('focus', true);
            } else {
                _joystickHandle.classList.remove('focus');
                _joystickBackCircle.classList.remove('focus');
            }
        };

        this.updateNavigator = function(pos) {
            var horizontalDelta = (_joystickCenter.x - pos.x) / _backCircleRadius;
            var verticalDelta = (_joystickCenter.y - pos.y) / _backCircleRadius;

            _navigator.moveForward = 0;
            _navigator.moveBackward = 0;
            _navigator.moveLeft = 0;
            _navigator.moveRight = 0;
            _navigator.turningWithKeyboard = false;

            if (verticalDelta > _threshold) {
                _navigator.moveForward = verticalDelta;
            } 
            else if (verticalDelta < -_threshold) {
                _navigator.moveBackward = -verticalDelta;
            }

            if (horizontalDelta > _threshold) {
                _navigator.moveLeft = horizontalDelta;
                _navigator.turningWithKeyboard = true;
            } 
            else if (horizontalDelta < -_threshold) {
                _navigator.moveRight = -horizontalDelta;
                _navigator.turningWithKeyboard = true;
            }
        };

        this.handleGesture = function(event) {
            var pos = null;

            switch( event.type )
            {
                case "dragstart":
                    _isDragging = true;
                    this.changeJoystickColor(true);
                    pos = this.updateJoystickHandlePosition(event.center.x, event.center.y);
                    break;

                case "dragmove":
                    if (_isDragging) {
                        this.changeJoystickColor(true);
                        pos = this.updateJoystickHandlePosition(event.center.x, event.center.y);
                    }
                    break;

                case "dragend":
                    if (_isDragging) {
                        this.changeJoystickColor(false);
                        pos = this.updateJoystickHandlePosition(_joystickCenter.x, _joystickCenter.y);
                        _isDragging = false;    
                    }
                    break;
            }

            this.updateNavigator(pos);
            event.preventDefault();
        };

        this.setJoystickPosition = function(x, y) {
            _joystickCenter = new THREE.Vector2(x, y);
            _joystickHandle.style.left =  (_joystickCenter.x - _frontCircleRadius) + 'px';
            _joystickHandle.style.top = (_joystickCenter.y - _frontCircleRadius) + 'px';
            _joystickContainer.style.left = (_joystickCenter.x - _backCircleRadius) + 'px';
            _joystickContainer.style.top = (_joystickCenter.y - _backCircleRadius) + 'px';
        };

        this.setJoystickPositionRelativeToCorner = function() {
            var xOffsetFromCorner = _viewer.container.clientWidth / _offsetFromCornerRatio;
            var yOffsetFromCorner = _viewer.container.clientHeight / _offsetFromCornerRatio;
            var centerX = xOffsetFromCorner + _backCircleRadius;
            var centerY = _viewer.container.clientHeight - _backCircleRadius - yOffsetFromCorner;
            this.setJoystickPosition(centerX, centerY);
        };

        this.setJoystickSize = function(backgroundRadius, handleRadius) {
            _backCircleRadius = backgroundRadius;
            _joystickBackCircle.style.width = (_backCircleRadius * 2) + 'px';
            _joystickBackCircle.style.height = (_backCircleRadius * 2) + 'px';

            _frontCircleRadius = handleRadius;
            _joystickHandle.style.width = (_frontCircleRadius * 2) + 'px';
            _joystickHandle.style.height = (_frontCircleRadius * 2) + 'px';

            if (_joystickCenter) {
                this.setJoystickPosition(_joystickCenter.x, _joystickCenter.y);    
            }
        };

        this.init = function() {
            if (!_joystickContainer) {
                // joystick container
                _joystickContainer = document.createElement('div');
                _joystickContainer.className = 'mobile-joystick';
                _viewer.container.appendChild(_joystickContainer);

                // joystick background circle
                _joystickBackCircle = document.createElement('div');
                _joystickBackCircle.className = 'mobile-joystick mobile-joystick-back-circle';
                _joystickContainer.appendChild(_joystickBackCircle);

                // joystick handle
                _joystickHandle = document.createElement('div');
                _joystickHandle.className = 'mobile-joystick mobile-joystick-handle';
                this.changeJoystickColor(false);
                _joystickContainer.appendChild(_joystickHandle);

                this.setJoystickSize(_backCircleRadius, _frontCircleRadius);
                this.setJoystickPositionRelativeToCorner();

                this.hammer = new Hammer.Manager(_joystickHandle, {
                    recognizers: [
                        Autodesk.Viewing.GestureRecognizers.drag
                    ],
                    inputClass: Hammer.TouchInput
                });

                this.hammer.on("dragstart dragmove dragend", this.handleGesture.bind(this));   

                this.onOrientationChanged = this.setJoystickPositionRelativeToCorner.bind(this);
            }
        };

        this.init();

        
        this.show = function() {
            this.updateJoystickHandlePosition(_joystickCenter.x, _joystickCenter.y);
            _joystickContainer.classList.toggle('visible', true);
            window.addEventListener('resize', this.onOrientationChanged);
        };

        this.hide = function() {
            _joystickContainer.classList.remove('visible');
            _isDragging = false;
            window.removeEventListener('resize', this.onOrientationChanged);
        };
    };
})();
(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk.UI');

    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;
    var AutodeskViewing = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;

    function NavigatorSimple(navigator) {
        this.viewer = navigator.viewer;
        this.tool = navigator.tool;
        this.opened = false;
        this.hideTimeoutID;
        this.dontRemindAgain_Message = false;
        this.tooltip = new BimWalk.UI.NavigatorSimpleGuide(this);

        var html =
            '<div class="bimwalk">'+
                '<div id  = "tooltip-info" class= "tooltip-info">' +
                    '<div id = "info-icon" class = "info-icon">' +
                    '</div>' +
                '</div>'+
                '<div id = "speed" class= "speed">' +
                    '<div id = "speedText" class = "speed-text"></div>' +
                '</div>'+
            '</div>';

        var div = document.createElement('div');
        div.innerHTML = html;

        this.div = div.childNodes[0];
        this.onSpeedChange = this.onSpeedChange.bind(this);
    }

    var proto = NavigatorSimple.prototype;

    //Info guide and speedUI gets activated
    proto.activate = function() {

        this.viewer.container.appendChild(this.div);
        this.viewer.addEventListener(AutodeskViewing.EVENT_BIMWALK_CONFIG_CHANGED,this.onSpeedChange);

        //Hide viewCube, home, and info button
        this.viewer.displayViewCube(false);
        this.viewer.displayHomeandInfoButton && this.viewer.displayHomeandInfoButton(false);

        if(!AutodeskViewing.isMobileDevice()) {
            var infoButton = this.div.querySelector('#tooltip-info');
            infoButton.classList.add('open');

            var self = this;
            infoButton.addEventListener('click', function () {
                self.tooltip.showToolTipUI(true);
            });    
        }

        //Check if don't show remind message is set or not
        if (this.viewer.getBimWalkToolPopup()) {
            this.tooltip.showToolTipUI(false);            
        }
    };

    //Info guide and speedUI gets deactivated
    proto.deactivate = function() {
        this.viewer.removeEventListener(AutodeskViewing.EVENT_BIMWALK_CONFIG_CHANGED,this.onSpeedChange);
        this.speedHide();

        var target = this.div.querySelector('#speed');
            target.classList.remove('open');

        if (!AutodeskViewing.isMobileDevice()) {
            //Hide Navigation information
            var target1 = this.div.querySelector('#tooltip-info');
                target1.classList.remove('open');

            this.tooltip.hideToolTipUI();
        }

        //show viewCube, home, and info button
        this.viewer.displayViewCube(true);
        this.viewer.displayHomeandInfoButton && this.viewer.displayHomeandInfoButton(true);
    };

    proto.isDialogOpen = function() {
        return this.tooltip.opened;
    }

    proto.onKeyDown = function() {
        if (this.tooltip.opened) {
            this.tooltip.hideToolTipUI();
            return true;
        }
        return false;
    }

    proto.onSpeedChange = function (event) {
        if (event.data.configuration !== 'topWalkSpeed') {
            return;
        }

        var self = this;
        var loc = Autodesk.Viewing.i18n.translate;

        var speedPanel = this.div.querySelector('#speed');
        speedPanel.classList.add('open');

        var speedContent = this.div.querySelector('#speedText');
        speedContent.textContent = (loc("Walk Speed: ") + event.data.value);

        this.hideTimeoutID = setTimeout(function () {
            self.speedHide();
        }, 5000);
        self.opened = true;
    };

    proto.speedHide = function() {
        var self = this;
        if (self.opened) {
            var target = this.div.querySelector('#speed');
            target.classList.remove('open');

            self.opened = false;
            clearTimeout(this.hideTimeoutID);
        }
    };

    BimWalk.UI.NavigatorSimple = NavigatorSimple;
})();

(function() { 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.BimWalk.UI');

    var BimWalk = Autodesk.Viewing.Extensions.BimWalk;
    var avp = Autodesk.Viewing.Private;
    var HTML_TEMPLATE = null;

    function NavigatorSimpleGuide(navigator) {
        this.viewer = navigator.viewer;
        this.tool = navigator.tool;
        this.onTemplate = this.onTemplate.bind(this);
        this.div = document.createElement('div'); // Div that holds all content
        this.opened = false;

        // TODO: Consider downloading on first usage.
        if (HTML_TEMPLATE) {
            this.onTemplate(null, HTML_TEMPLATE);
        } else {
            // TODO: Separate the images from `guide.html`
            avp.getHtmlTemplate('extensions/BimWalk/res/guide.html', this.onTemplate);
        }
    }

    var proto = NavigatorSimpleGuide.prototype;

    proto.showToolTipUI = function (openedByUser) {
        this.viewer.container.appendChild(this.div);

        // Avoid showing panel when preference prevents us.
        var dontRemind = this.div.querySelector('#dontRemind');
        dontRemind.style.display = openedByUser ? "none" : "";

        var tooltipPanel = this.div.querySelector('#tooltipPanel');
        tooltipPanel.classList.add('c-bimwalk-tooltip--open');

        this.opened = true;
    };

    proto.hideToolTipUI = function () {
        var tooltipPanel = this.div.querySelector('#tooltipPanel');
        tooltipPanel.classList.remove('c-bimwalk-tooltip--open');

        this.opened = false;
    };

    proto.onTemplate = function(err, content) {
        if (err) {
            avp.logger.error('Failed to show BimWalk guide.');
            return;
        }

        // Keep a reference so that it doesn't have to get downloaded again.
        HTML_TEMPLATE = content;
        
        var tmp = document.createElement('div');
        tmp.innerHTML = HTML_TEMPLATE;
        this.div.appendChild(tmp.childNodes[0]); // Assumes template has only 1 root node.

        var tooltipOK = this.div.querySelector('#tooltipOk');
        tooltipOK.addEventListener('click', this.hideToolTipUI.bind(this));

        var dontRemind = this.div.querySelector('#dontRemind');
        dontRemind.addEventListener('click', function() {
            this.viewer.setBimWalkToolPopup(false);
            this.hideToolTipUI.bind(this);
        }.bind(this));

        this.div.addEventListener('click', function() {
            this.hideToolTipUI();
        }.bind(this));

        // Localize only strings from the newly added DOM
        Autodesk.Viewing.i18n.localize(this.div);
    };

    BimWalk.UI.NavigatorSimpleGuide = NavigatorSimpleGuide;
})();
