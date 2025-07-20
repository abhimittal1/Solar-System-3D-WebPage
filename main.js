// Global variables
let scene, camera, renderer, clock;
let sun, planets = [];
let planetData = [];
let isPaused = false;
let isDarkTheme = true;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

// Planet configuration with realistic data
const planetConfig = [
    { 
        name: 'Mercury', 
        color: 0x8C7853, 
        size: 0.8, 
        distance: 8, 
        speed: 4.74, 
        info: 'Closest to the Sun - Extreme temperatures' 
    },
    { 
        name: 'Venus', 
        color: 0xFFC649, 
        size: 1.2, 
        distance: 12, 
        speed: 3.50, 
        info: 'Hottest planet - Thick toxic atmosphere' 
    },
    { 
        name: 'Earth', 
        color: 0x6B93D6, 
        size: 1.3, 
        distance: 16, 
        speed: 2.98, 
        info: 'Our home planet - Only known planet with life' 
    },
    { 
        name: 'Mars', 
        color: 0xC1440E, 
        size: 1.0, 
        distance: 20, 
        speed: 2.41, 
        info: 'The Red Planet - Has polar ice caps' 
    },
    { 
        name: 'Jupiter', 
        color: 0xD8CA9D, 
        size: 3.0, 
        distance: 28, 
        speed: 1.31, 
        info: 'Largest planet - Gas giant with Great Red Spot' 
    },
    { 
        name: 'Saturn', 
        color: 0xFAD5A5, 
        size: 2.5, 
        distance: 36, 
        speed: 0.97, 
        info: 'Has beautiful rings - Less dense than water' 
    },
    { 
        name: 'Uranus', 
        color: 0x4FD0E7, 
        size: 1.8, 
        distance: 44, 
        speed: 0.68, 
        info: 'Ice giant - Rotates on its side' 
    },
    { 
        name: 'Neptune', 
        color: 0x4B70DD, 
        size: 1.7, 
        distance: 52, 
        speed: 0.54, 
        info: 'Windiest planet - Furthest from the Sun' 
    }
];

/**
 * Initialize the entire 3D solar system
 */
function init() {
    console.log('Initializing Solar System...');
    
    // Create the main scene
    createScene();
    
    // Set up camera
    setupCamera();
    
    // Initialize renderer
    setupRenderer();
    
    // Create clock for animation timing
    clock = new THREE.Clock();
    
    // Add lighting to the scene
    addLights();
    
    // Create background stars
    createStars();
    
    // Create the sun
    createSun();
    
    // Create all planets
    createPlanets();
    
    // Create orbital rings for visual reference
    createOrbitRings();
    
    // Add mouse and keyboard controls
    addControls();
    
    // Generate the control panel UI
    generateControlPanel();
    
    // Set up all event listeners
    addEventListeners();
    
    // Start the animation loop
    animate();
    
    console.log('Solar System initialized successfully!');
}

/**
 * Create the main Three.js scene
 */
function createScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 50, 200);
}

/**
 * Set up the camera with proper positioning
 */
function setupCamera() {
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    
    // Position camera for optimal viewing
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);
}

/**
 * Initialize the WebGL renderer
 */
function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadows for realistic lighting
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add renderer to the DOM
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

/**
 * Add lighting to create realistic illumination
 */
function addLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Point light from the sun
    const sunLight = new THREE.PointLight(0xffffff, 2, 100);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    
    // Configure shadow properties for better quality
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    
    scene.add(sunLight);
}

/**
 * Create a starfield background
 */
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    // Generate random star positions
    for (let i = 0; i < starCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 400;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xFFFFFF, 
        size: Math.random() * 2 + 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

/**
 * Create the sun with glowing effect
 */
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.3
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { 
        name: 'Sun', 
        info: 'The center of our solar system - A massive ball of plasma' 
    };
    
    scene.add(sun);
}

/**
 * Create all planets based on configuration
 */
function createPlanets() {
    planetConfig.forEach((config, index) => {
        const geometry = new THREE.SphereGeometry(config.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: config.color,
            shininess: 10
        });
        
        const planet = new THREE.Mesh(geometry, material);
        
        // Enable shadows
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // Position planet at its orbital distance
        planet.position.x = config.distance;
        
        // Store planet data for animation and controls
        planet.userData = {
            name: config.name,
            info: config.info,
            distance: config.distance,
            baseSpeed: config.speed,
            currentSpeed: config.speed,
            angle: Math.random() * Math.PI * 2, // Random starting position
            rotationSpeed: 0.01 + Math.random() * 0.02 // Individual rotation speed
        };
        
        scene.add(planet);
        planets.push(planet);
        planetData.push({
            planet: planet,
            config: config
        });
    });
}

/**
 * Create orbital rings for visual reference
 */
function createOrbitRings() {
    planetConfig.forEach(config => {
        const ringGeometry = new THREE.RingGeometry(
            config.distance - 0.1, 
            config.distance + 0.1, 
            64
        );
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2; // Rotate to lie flat
        scene.add(ring);
    });
}

/**
 * Add mouse controls for camera movement
 */
function addControls() {
    let mouseDown = false;
    let mouseX = 0, mouseY = 0;
    
    // Mouse down event
    renderer.domElement.addEventListener('mousedown', (event) => {
        mouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        renderer.domElement.style.cursor = 'grabbing';
    });
    
    // Mouse up event
    renderer.domElement.addEventListener('mouseup', () => {
        mouseDown = false;
        renderer.domElement.style.cursor = 'grab';
    });
    
    // Mouse move for camera rotation
    renderer.domElement.addEventListener('mousemove', (event) => {
        if (mouseDown) {
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Convert camera position to spherical coordinates
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            
            // Update spherical coordinates based on mouse movement
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            
            // Clamp phi to prevent camera from flipping
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            // Update camera position
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
        
        // Update mouse position for raycasting (tooltips)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Mouse wheel for zooming
    renderer.domElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(scale);
        
        // Clamp zoom to reasonable limits
        const distance = camera.position.length();
        if (distance < 10) camera.position.normalize().multiplyScalar(10);
        if (distance > 200) camera.position.normalize().multiplyScalar(200);
    });
    
    // Set initial cursor style
    renderer.domElement.style.cursor = 'grab';
}

/**
 * Generate the control panel UI dynamically
 */
function generateControlPanel() {
    const controlsContainer = document.getElementById('planet-controls');
    
    planetData.forEach((data, index) => {
        // Create control group container
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        
        // Create label with planet name
        const label = document.createElement('label');
        label.textContent = data.config.name;
        label.style.color = `#${data.config.color.toString(16).padStart(6, '0')}`;
        
        // Create speed control container
        const speedControl = document.createElement('div');
        speedControl.className = 'speed-control';
        
        // Create speed slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '10';
        slider.step = '0.1';
        slider.value = data.config.speed;
        slider.className = 'speed-slider';
        slider.id = `speed-${index}`;
        
        // Create value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'speed-value';
        valueDisplay.textContent = data.config.speed.toFixed(1);
        
        // Add slider event listener
        slider.addEventListener('input', (e) => {
            const newSpeed = parseFloat(e.target.value);
            data.planet.userData.currentSpeed = newSpeed;
            valueDisplay.textContent = newSpeed.toFixed(1);
        });
        
        // Assemble the control group
        speedControl.appendChild(slider);
        speedControl.appendChild(valueDisplay);
        controlGroup.appendChild(label);
        controlGroup.appendChild(speedControl);
        controlsContainer.appendChild(controlGroup);
    });
}

/**
 * Add all event listeners for UI interactions
 */
function addEventListeners() {
    // Pause/Resume button
    document.getElementById('pauseBtn').addEventListener('click', () => {
        isPaused = !isPaused;
        const btn = document.getElementById('pauseBtn');
        btn.textContent = isPaused ? 'Resume' : 'Pause';
        btn.style.background = isPaused ? 
            'linear-gradient(45deg, #4CAF50, #45a049)' : 
            'linear-gradient(45deg, #f44336, #da190b)';
    });
    
    // Theme toggle button
    document.getElementById('themeBtn').addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        document.body.className = isDarkTheme ? '' : 'light-theme';
        
        // Update scene background
        if (isDarkTheme) {
            scene.background = null;
        } else {
            scene.background = new THREE.Color(0x87CEEB);
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
        // Update camera aspect ratio
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer size
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Tooltip functionality
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (event) => {
        switch(event.key) {
            case ' ': // Spacebar to pause/resume
                event.preventDefault();
                document.getElementById('pauseBtn').click();
                break;
            case 't': // T key to toggle theme
            case 'T':
                event.preventDefault();
                document.getElementById('themeBtn').click();
                break;
        }
    });
}

/**
 * Handle mouse movement for tooltips
 */
function handleMouseMove(event) {
    // Update mouse coordinates for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Cast ray from camera through mouse position
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sun, ...planets]);
    
    const tooltip = document.getElementById('tooltip');
    
    if (intersects.length > 0) {
        // Show tooltip for intersected object
        const object = intersects[0].object;
        const userData = object.userData;
        
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 15 + 'px';
        tooltip.style.top = event.clientY - 10 + 'px';
        tooltip.innerHTML = `<strong>${userData.name}</strong><br>${userData.info}`;
    } else {
        // Hide tooltip when not hovering over objects
        tooltip.style.display = 'none';
    }
}

/**
 * Main animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (!isPaused) {
        const deltaTime = clock.getDelta();
        
        // Rotate the sun
        sun.rotation.y += 0.005;
        
        // Animate all planets
        planets.forEach((planet) => {
            const userData = planet.userData;
            
            // Update orbital position
            userData.angle += userData.currentSpeed * deltaTime * 0.1;
            
            // Calculate new position based on orbital angle
            planet.position.x = Math.cos(userData.angle) * userData.distance;
            planet.position.z = Math.sin(userData.angle) * userData.distance;
            
            // Rotate planet on its axis
            planet.rotation.y += userData.rotationSpeed;
        });
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

/**
 * Handle any errors that might occur
 */
window.addEventListener('error', (event) => {
    console.error('Solar System Error:', event.error);
});

// Initialize the solar system when the page loads
document.addEventListener('DOMContentLoaded', init);

// Export functions for potential external use
window.SolarSystem = {
    init,
    togglePause: () => document.getElementById('pauseBtn').click(),
    toggleTheme: () => document.getElementById('themeBtn').click(),
    setPlanetSpeed: (planetIndex, speed) => {
        if (planetData[planetIndex]) {
            planetData[planetIndex].planet.userData.currentSpeed = speed;
            const slider = document.getElementById(`speed-${planetIndex}`);
            if (slider) {
                slider.value = speed;
                slider.nextElementSibling.textContent = speed.toFixed(1);
            }
        }
    }
};