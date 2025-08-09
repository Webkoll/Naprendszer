document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // ÚJ RÉSZ: Bolygók köré linkek elhelyezése az adatlapokhoz
    // =========================================================================
    const celestialObjects = document.querySelectorAll('.celestial-object.planet');

    celestialObjects.forEach(planet => {
        const planetId = planet.id;
        // Csak azokat az elemeket linkeljük, amiknek van ID-ja (pl. a kuiper-belt nem kap linket)
        if (planetId) {
            const link = document.createElement('a');
            link.href = `adatlap.html?bolygo=${planetId}`; // Paraméteres URL
            link.target = '_blank'; // Új lapon nyílik meg
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.cursor = 'pointer';

            // A bolygó elem elé szúrjuk be a linket, majd a bolygót beletesszük a linkbe
            planet.parentNode.insertBefore(link, planet);
            link.appendChild(planet);
        }
    });
    
    // =========================================================================
    // A TE MEGLÉVŐ KÓDOD INNENTŐL FOLYTATÓDIK, KIS MÓDOSÍTÁSSAL
    // =========================================================================

    const planets = Array.from(document.querySelectorAll('.celestial-object.planet'));
    const solarSystem = document.querySelector('.solar-system');
    const scrollingVoyager = document.getElementById('scrolling-voyager');
    const scrollingVoyager2 = document.getElementById('scrolling-voyager-2');
    const scrollSpacePerPlanet = window.innerHeight; 
    const totalScrollHeight = scrollSpacePerPlanet * (planets.length + 1);
    solarSystem.style.height = `${totalScrollHeight}px`;

    // Navigációs sáv létrehozása (változatlan)
    const nav = document.createElement('nav');
    document.body.appendChild(nav);

    planets.forEach((planet, index) => {
        // Mivel a bolygó most már egy 'a' tagen belül van, a .parentElement-et használjuk az ID-hoz
        const planetContainer = planet.parentElement.href ? planet : planet.parentElement;
        
        const navLink = document.createElement('a');
        navLink.href = `#${planet.id}`;
        
        const planetNameSpan = document.createElement('span');
        planetNameSpan.className = 'nav-planet-name';
        planetNameSpan.textContent = planet.dataset.name;
        
        navLink.appendChild(planetNameSpan);
        nav.appendChild(navLink);

        navLink.addEventListener('click', (e) => {
            e.preventDefault();
            const planetId = navLink.getAttribute('href').substring(1);
            const targetPlanet = document.getElementById(planetId);
            const planetIndex = planets.indexOf(targetPlanet);
            
            const planetCenterScroll = (scrollSpacePerPlanet * (planetIndex + 1)) - (scrollSpacePerPlanet / 2);

            window.scrollTo({
                top: planetCenterScroll,
                behavior: 'smooth'
            });
        });
    });

    const navLinks = nav.querySelectorAll('a');

    // Eseménykezelő az ISS gombhoz (MÓDOSÍTVA)
    const issButton = document.getElementById('iss-button');
    const earthDiv = document.getElementById('earth');
    issButton.addEventListener('click', (e) => {
        // ==== MÓDOSÍTÁS KEZDETE ====
        // Megakadályozzuk, hogy a gombkattintás a linkre is hasson (ne nyissa meg az adatlapot)
        e.preventDefault();
        e.stopPropagation();
        // ==== MÓDOSÍTÁS VÉGE ====

        earthDiv.classList.toggle('iss-active');
        if (earthDiv.classList.contains('iss-active')) {
            issButton.textContent = 'ISS elrejtése';
        } else {
            issButton.textContent = 'ISS aktiválása';
        }
    });

    // --- VOYAGER VEZÉRLŐPULT --- (VÁLTOZATLAN)
    const earthIndex = planets.findIndex(p => p.id === 'earth');
    const marsIndex = planets.findIndex(p => p.id === 'mars');

    function updateAnimation() {
        const scrollY = window.scrollY;
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        const scrollCenter = scrollY + screenHeight / 2;

        let activePlanetFound = false;

        let earthCenterX = 0;
        let earthCenterY = 0;

        // Bolygók animációja
        planets.forEach((planet, index) => {
            const planetTriggerPoint = scrollSpacePerPlanet * (index + 1);
            const distanceToCenter = scrollCenter - planetTriggerPoint;
            
            let progress = distanceToCenter / (screenHeight * 0.9);
            progress = Math.max(-1, Math.min(1, progress));

            let translateX = 0;
            let translateY = 0;
            let scale = 0;

            if (Math.abs(progress) <= 1) {
                const planetRadius = planet.offsetWidth / 2;
                const xStrength = (screenWidth / 2) + planetRadius;
                translateX = progress * xStrength;

                const yStrength = screenHeight * 0.4;
                const yOffset = screenHeight * 0.1;
                translateY = yOffset + yStrength * (1 - (progress * progress));

                scale = Math.max(0.05, 1 - Math.abs(progress) * 0.95);
                
                planet.style.transform = `translate(-50%, -50%) translate3d(${translateX}px, ${translateY}px, 0px) scale(${scale})`;

                const isCentered = Math.abs(progress) < 0.2;
                if (planet.id === 'earth') {
                    earthCenterX = translateX;
                    earthCenterY = translateY;
                }

                if (isCentered) {
                    planet.classList.add('visible');
                    if (!activePlanetFound) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        navLinks[index].classList.add('active');
                        activePlanetFound = true;
                    }
                } else {
                    planet.classList.remove('visible');
                }

                if (planet.id === 'jupiter' && isCentered) {
                    planet.classList.add('et-active');
                } else {
                    planet.classList.remove('et-active');
                }
            } else {
                planet.style.transform = `translate(-50%, -50%) scale(0)`;
                planet.classList.remove('visible');
            }
        });
        
        if (!activePlanetFound) {
             navLinks.forEach(link => link.classList.remove('active'));
        }

        const voyagerStartPoint = scrollSpacePerPlanet * (earthIndex + 1) - screenHeight * 0.1;
        const voyagerGrowthEndPoint = voyagerStartPoint + ((scrollSpacePerPlanet * (marsIndex + 1) - voyagerStartPoint) * 0.5);
        const voyagerExitPoint = scrollSpacePerPlanet * (planets.length + 0.5) ;

        let voyagerOpacity = 0;
        let voyagerScale = 0;
        let voyagerTranslateX = 0;
        let voyagerTranslateY = 0;

        if (scrollCenter > voyagerStartPoint && scrollCenter < voyagerExitPoint) {
            voyagerOpacity = 0;

            const overallProgress = (scrollCenter - voyagerStartPoint) / (voyagerExitPoint - voyagerStartPoint);
            const finalTargetX = -screenWidth * 0.5;
            const finalTargetY = -screenHeight * 0;

            voyagerTranslateX = earthCenterX + (finalTargetX - earthCenterX) * overallProgress;
            voyagerTranslateY = earthCenterY + (finalTargetY - earthCenterY) * overallProgress;

            if (scrollCenter < voyagerGrowthEndPoint) {
                const growthProgress = (scrollCenter - voyagerStartPoint) / (voyagerGrowthEndPoint - voyagerStartPoint);
                voyagerScale = 0.2 + (0.8 * growthProgress);
            } else {
                voyagerScale = 2;
            }
        } else {
            voyagerOpacity = 1;
            voyagerScale = 0;
            voyagerTranslateX = earthCenterX;
            voyagerTranslateY = earthCenterY;
        }

        scrollingVoyager.style.transform = `translate(-50%, -50%) translate(${voyagerTranslateX}px, ${voyagerTranslateY}px) scale(${voyagerScale})`;
    }

    // Eseményfigyelők (változatlanok)
    window.addEventListener('scroll', updateAnimation, { passive: true });
    window.addEventListener('resize', () => {
        const scrollSpacePerPlanet = window.innerHeight;
        const totalScrollHeight = scrollSpacePerPlanet * (planets.length + 1);
        solarSystem.style.height = `${totalScrollHeight}px`;
        updateAnimation();
    });

    updateAnimation();
    
    // --- FELÜLNÉZETI LOGIKA (VÁLTOZATLAN MARAD) ---
    // (A teljes felülnézeti kódod itt következik, változatlanul)
    const showOverviewBtn = document.getElementById('show-solar-system-view-btn');
    const closeOverviewBtn = document.getElementById('close-overview-btn');
    const overviewContainer = document.getElementById('solar-system-overview');
    const body = document.body;
    const earthInOrbit = document.querySelector('.earth-in-orbit');
    const overviewVoyager = document.getElementById('overview-voyager');
    let voyagerRestartInterval = null;

    function launchVoyagerAnimation() {
        overviewVoyager.classList.remove('voyager-launched');
        overviewVoyager.style.opacity = '1';
        const earthRect = earthInOrbit.getBoundingClientRect();
        const voyagerRect = overviewVoyager.getBoundingClientRect();
        const startX = earthRect.left + (earthRect.width / 2) - (voyagerRect.width / 2);
        const startY = earthRect.top + (earthRect.height / 2) - (voyagerRect.height / 2);
        overviewVoyager.style.left = `${startX}px`;
        overviewVoyager.style.top = `${startY}px`;
        setTimeout(() => {
            overviewVoyager.classList.add('voyager-launched');
        }, 1000);
    }

    showOverviewBtn.addEventListener('click', () => {
        body.classList.add('overview-active');
        overviewContainer.classList.add('visible');
        launchVoyagerAnimation();
        voyagerRestartInterval = setInterval(launchVoyagerAnimation, 35000);
    });

    closeOverviewBtn.addEventListener('click', () => {
        body.classList.remove('overview-active');
        overviewContainer.classList.remove('visible');
        if (voyagerRestartInterval) {
            clearInterval(voyagerRestartInterval);
        }
        overviewVoyager.classList.remove('voyager-launched');
        overviewVoyager.style.opacity = '0';
    });

    function createKuiperBelt() {
        const svg = document.getElementById('kuiper-belt-svg');
        const svgNS = "http://www.w3.org/2000/svg";
        const count = 4000;
        const minRadius = Math.min(window.innerWidth, window.innerHeight) * 0.5;
        const maxRadius = minRadius * 0.6;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', Math.random() * 1.5);
            circle.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
            svg.appendChild(circle);
        }
    }
    createKuiperBelt();
    // =========================================================================
    // ÚJ RÉSZ: Bolygópályák távolságának dinamikus állítása a felülnézetben
    // =========================================================================
    const distanceSlider = document.getElementById('distance-slider');
    const orbitPaths = document.querySelectorAll('.orbit-path');

    // Az eredeti, CSS-ben megadott méreteket egy objektumban tároljuk.
    // Így tudjuk, hogy mihez képest kell szorozni a csúszka értékével.
    const baseOrbitSizes = {
        'mercury-orbit-path': 20,
        'venus-orbit-path': 30,
        'earth-orbit-path': 40,
        'mars-orbit-path': 50,
        'jupiter-orbit-path': 60,
        'saturn-orbit-path': 70,
        'uranus-orbit-path': 80,
        'neptune-orbit-path': 90,
        'pluto-orbit-path': 100
    };

    // Ez a függvény frissíti a bolygópályák méretét a csúszka alapján
    function updateOrbitDistances() {
        const multiplier = distanceSlider.value; // A csúszka aktuális értéke (pl. 1.2)

        orbitPaths.forEach(path => {
            // Megkeressük a pályához tartozó classt a baseOrbitSizes objektumban
            const matchingClass = Array.from(path.classList).find(cls => baseOrbitSizes[cls]);
            
            if (matchingClass) {
                const baseSize = baseOrbitSizes[matchingClass]; // Az alapméret (pl. 40 a Földnél)
                const newSize = baseSize * multiplier; // Kiszámoljuk az új méretet
                
                // Beállítjuk a pálya új szélességét és magasságát
                path.style.width = `${newSize}vmin`;
                path.style.height = `${newSize}vmin`;
            }
        });
    }

    // Eseményfigyelőt adunk a csúszkához.
    // Az 'input' esemény minden változáskor lefut (ahogy húzzuk a csúszkát).
    distanceSlider.addEventListener('input', updateOrbitDistances);

    // Amikor a felülnézet megjelenik, visszaállítjuk a csúszkát az alapértelmezett 1-es értékre,
    // és frissítjük a pályákat, hogy az előző beállítás ne maradjon meg.
    showOverviewBtn.addEventListener('click', () => {
        distanceSlider.value = 1;
        updateOrbitDistances();
    });

});